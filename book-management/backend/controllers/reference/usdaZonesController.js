// backend/controllers/reference/usdaZonesController.js
import USDAZones from "../../models/reference/usdaZonesModel.js";

const cleanString=value=>{
	return value===undefined || value===null ? "" : String(value).trim();
};

const cleanStringArray=value=>{
	if(!Array.isArray(value))return [];
	return value.map(item=>cleanString(item)).filter(Boolean);
};

const cleanNumber=value=>{
	const number=Number(value);
	return Number.isFinite(number) ? number : null;
};

const hasValue=value=>{
	return value!==undefined && value!==null && value!=="";
};

const normalizeZone=value=>{
	return cleanString(value).toLowerCase();
};

const getZoneNumber=value=>{
	const match=normalizeZone(value).match(/^(\d+)/);
	return match ? Number(match[1]) : null;
};

const parseZoneRange=value=>{
	const text=cleanString(value);

	if(!text)return null;

	const rangeMatch=text.match(/^(\d+)\s*(?:-|–|—|to)\s*(\d+)$/i);

	if(rangeMatch){
		const start=Number(rangeMatch[1]);
		const end=Number(rangeMatch[2]);

		return {
			min:Math.min(start,end),
			max:Math.max(start,end)
		};
	}

	const singleZone=getZoneNumber(text);

	if(singleZone===null)return null;

	return {
		min:singleZone,
		max:singleZone
	};
};

const sortZones=(zones)=>{
	return zones.sort((a,b)=>{
		const zoneA=normalizeZone(a.zone);
		const zoneB=normalizeZone(b.zone);

		const numberA=getZoneNumber(zoneA);
		const numberB=getZoneNumber(zoneB);

		if(numberA!==numberB)return numberA-numberB;

		return zoneA.localeCompare(zoneB);
	});
};

const getZonesByRange=async rangeValue=>{
	const range=parseZoneRange(rangeValue);

	if(!range)return [];

	const zones=await USDAZones.find({}).lean();

	return sortZones(
		zones.filter(item=>{
			const zoneNumber=getZoneNumber(item.zone);
			return zoneNumber!==null && zoneNumber>=range.min && zoneNumber<=range.max;
		})
	);
};

const cleanTemperatureRange=temperatureRange=>{
	return {
		fahrenheit:{
			min:cleanNumber(temperatureRange?.fahrenheit?.min),
			max:cleanNumber(temperatureRange?.fahrenheit?.max)
		},
		celsius:{
			min:cleanNumber(temperatureRange?.celsius?.min),
			max:cleanNumber(temperatureRange?.celsius?.max)
		}
	};
};

const hasCompleteTemperatureRange=temperatureRange=>{
	const cleaned=cleanTemperatureRange(temperatureRange);

	return (
		cleaned.fahrenheit.min!==null &&
		cleaned.fahrenheit.max!==null &&
		cleaned.celsius.min!==null &&
		cleaned.celsius.max!==null
	);
};

export const getUSDAZoneByZone=async(req,res)=>{
	try{
		const {zone}=req.params;

		if(!zone){
			return res.status(400).json({message:"USDA zone is required."});
		}

		const usdaZone=await USDAZones.findOne({zone}).lean();

		if(!usdaZone){
			return res.status(404).json({message:"USDA zone not found."});
		}

		return res.status(200).json(usdaZone);
	}catch(error){
		return res.status(500).json({message:"Server error while fetching USDA zone.",error:error.message});
	}
};

export const getUSDAZonesByRange=async(req,res)=>{
	try{
		const range=req.params.range || req.query.range;

		if(!range){
			return res.status(400).json({message:"USDA zone range is required."});
		}

		const zones=await getZonesByRange(range);

		if(!zones.length){
			return res.status(404).json({message:"No USDA zones found for this range."});
		}

		return res.status(200).json(zones);
	}catch(error){
		return res.status(500).json({message:"Server error while fetching USDA zones by range.",error:error.message});
	}
};

export const createUSDAZone=async(req,res)=>{
	try{
		const {
			zone,
			region,
			states=[],
			temperatureRange,
			description="",
			avgFrostDates={},
			plantingWindows={}
		}=req.body;

		if(!cleanString(zone) || !cleanString(region) || !hasCompleteTemperatureRange(temperatureRange)){
			return res.status(400).json({message:"zone, region, temperatureRange.fahrenheit.min, temperatureRange.fahrenheit.max, temperatureRange.celsius.min, and temperatureRange.celsius.max are required."});
		}

		const existingZone=await USDAZones.findOne({zone:cleanString(zone)}).lean();

		if(existingZone){
			return res.status(409).json({message:"A USDA zone entry already exists for this zone."});
		}

		const cleanedTemperatureRange=cleanTemperatureRange(temperatureRange);

		const newZone=await USDAZones.create({
			zone:cleanString(zone),
			region:cleanString(region),
			states:cleanStringArray(states),
			temperatureRange:{
				fahrenheit:{
					min:cleanedTemperatureRange.fahrenheit.min,
					max:cleanedTemperatureRange.fahrenheit.max
				},
				celsius:{
					min:cleanedTemperatureRange.celsius.min,
					max:cleanedTemperatureRange.celsius.max
				}
			},
			description:cleanString(description),
			avgFrostDates:{
				lastSpringFrost:cleanString(avgFrostDates.lastSpringFrost),
				firstFallFrost:cleanString(avgFrostDates.firstFallFrost)
			},
			plantingWindows:{
				indoorStart:cleanString(plantingWindows.indoorStart),
				transplantOutside:cleanString(plantingWindows.transplantOutside),
				directSow:cleanString(plantingWindows.directSow),
				harvestWindow:cleanString(plantingWindows.harvestWindow)
			}
		});

		return res.status(201).json(newZone);
	}catch(error){
		return res.status(500).json({message:"Server error while creating USDA zone.",error:error.message});
	}
};

export const getAllUSDAZones=async(req,res)=>{
	try{
		const {range}=req.query;

		if(range){
			const zones=await getZonesByRange(range);
			return res.status(200).json(zones);
		}

		const zones=await USDAZones.find({}).lean();
		return res.status(200).json(sortZones(zones));
	}catch(error){
		return res.status(500).json({message:"Server error while fetching USDA zones.",error:error.message});
	}
};

export const updateUSDAZoneByZone=async(req,res)=>{
	try{
		const {zone}=req.params;
		const {
			region,
			states,
			temperatureRange,
			description,
			avgFrostDates,
			plantingWindows
		}=req.body;

		if(!zone){
			return res.status(400).json({message:"USDA zone is required."});
		}

		const updateData={
			...(region!==undefined&&{region:cleanString(region)}),
			...(states!==undefined&&{states:cleanStringArray(states)}),
			...(temperatureRange&&{
				temperatureRange:{
					...(temperatureRange.fahrenheit&&{
						fahrenheit:{
							...(hasValue(temperatureRange.fahrenheit.min)&&{min:Number(temperatureRange.fahrenheit.min)}),
							...(hasValue(temperatureRange.fahrenheit.max)&&{max:Number(temperatureRange.fahrenheit.max)})
						}
					}),
					...(temperatureRange.celsius&&{
						celsius:{
							...(hasValue(temperatureRange.celsius.min)&&{min:Number(temperatureRange.celsius.min)}),
							...(hasValue(temperatureRange.celsius.max)&&{max:Number(temperatureRange.celsius.max)})
						}
					})
				}
			}),
			...(description!==undefined&&{description:cleanString(description)}),
			...(avgFrostDates&&{
				avgFrostDates:{
					...(avgFrostDates.lastSpringFrost!==undefined&&{lastSpringFrost:cleanString(avgFrostDates.lastSpringFrost)}),
					...(avgFrostDates.firstFallFrost!==undefined&&{firstFallFrost:cleanString(avgFrostDates.firstFallFrost)})
				}
			}),
			...(plantingWindows&&{
				plantingWindows:{
					...(plantingWindows.indoorStart!==undefined&&{indoorStart:cleanString(plantingWindows.indoorStart)}),
					...(plantingWindows.transplantOutside!==undefined&&{transplantOutside:cleanString(plantingWindows.transplantOutside)}),
					...(plantingWindows.directSow!==undefined&&{directSow:cleanString(plantingWindows.directSow)}),
					...(plantingWindows.harvestWindow!==undefined&&{harvestWindow:cleanString(plantingWindows.harvestWindow)})
				}
			})
		};

		const updatedZone=await USDAZones.findOneAndUpdate(
			{zone},
			updateData,
			{new:true,runValidators:true}
		).lean();

		if(!updatedZone){
			return res.status(404).json({message:"USDA zone not found."});
		}

		return res.status(200).json(updatedZone);
	}catch(error){
		return res.status(500).json({message:"Server error while updating USDA zone.",error:error.message});
	}
};

export const deleteUSDAZoneByZone=async(req,res)=>{
	try{
		const {zone}=req.params;

		if(!zone){
			return res.status(400).json({message:"USDA zone is required."});
		}

		const deletedZone=await USDAZones.findOneAndDelete({zone}).lean();

		if(!deletedZone){
			return res.status(404).json({message:"USDA zone not found."});
		}

		return res.status(200).json({message:"USDA zone deleted successfully."});
	}catch(error){
		return res.status(500).json({message:"Server error while deleting USDA zone.",error:error.message});
	}
};
