// backend/controllers/dashboard/dashboardSnapshotController.js
import mongoose from "mongoose";
import DashboardSnapshot from "../../models/dashboard/dashboardSnapshotModel.js";
import Planting from "../../models/plants/plantingModel.js";
import Garden from "../../models/gardens/gardenModel.js";
import GardenSection from "../../models/gardens/gardenSectionModel.js";
import Harvest from "../../models/harvest/harvestModel.js";
import "../../models/plants/plantModel.js";

const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const getObjectId=value=>{
	if(!value)return "";
	if(typeof value==="string")return value;
	if(typeof value==="object"){
		if(typeof value._id==="string")return value._id;
		if(typeof value.$oid==="string")return value.$oid;
		if(typeof value._id?.$oid==="string")return value._id.$oid;
	}
	return "";
};

const getText=value=>{
	if(!value)return "";
	if(typeof value==="string")return value;
	if(typeof value==="number")return String(value);
	if(Array.isArray(value))return value.map(getText).filter(Boolean).join(", ");
	if(typeof value==="object"){
		return value.name||
			value.plantName||
			value.instanceName||
			value.scientificName||
			value.varietyName||
			value.label||
			value.title||
			"";
	}
	return "";
};

const formatDate=value=>{
	if(!value)return "";
	const date=new Date(value);
	if(Number.isNaN(date.getTime()))return "";
	return date.toISOString().slice(0,10);
};

const hasRealDate=value=>!!formatDate(value);

const livePlantingStatuses=new Set(["active","germinating","seedling","transplanted"]);

const isLivePlanting=planting=>livePlantingStatuses.has(String(planting?.status||"").toLowerCase());

const formatMonth=value=>{
	if(!value)return "";
	const date=new Date(value);
	if(Number.isNaN(date.getTime()))return "";
	return months[date.getMonth()];
};

const normalizeImageUrl=(image,folder="")=>{
	if(!image)return "";
	if(typeof image==="object")image=image.url||image.relativePath||image.path||image.filename||"";
	if(!image)return "";
	if(String(image).startsWith("blob:"))return image;
	if(String(image).startsWith("http"))return image;
	if(String(image).startsWith("/"))return image;
	return folder ? `/${folder}/${image}` : image;
};

const firstImage=(images,folder="")=>{
	if(!Array.isArray(images)||!images.length)return "";
	return normalizeImageUrl(images[0],folder);
};

const getUserQuery=(userId,field="createdBy")=>{
	if(!userId||!mongoose.Types.ObjectId.isValid(userId))return {};
	return {[field]:userId};
};

const getWeightTotal=amount=>{
	if(!amount)return 0;
	return Number(amount.lb||0)+(Number(amount.oz||0)/16)+(Number(amount.g||0)/453.592);
};

const formatHarvestTotal=totalLb=>{
	if(!totalLb)return "0 lb";
	if(totalLb<1)return `${Math.round(totalLb*16*10)/10} oz`;
	return `${Math.round(totalLb*10)/10} lb`;
};

const mapSeedStart=planting=>{
	const seed=planting.seed||{};

	return {
	_id:planting._id,
	name:planting.instanceName||getText(seed)||"Seed start",
	variety:getText(seed.variety)||seed.variety||planting.location||"",
	source:planting.location||getText(planting.gardenSection)||getText(planting.garden)||"Growing instance",
	medium:getText(seed.plantingInformation?.plantingMedium)||getText(seed.plantingInformation?.plantingMethod)||"Not listed",
	started:formatDate(planting.plantedDate),
	germination:[
		seed.growthInformation?.germinationTime?.min,
		seed.growthInformation?.germinationTime?.max
	].filter(value=>value!==undefined&&value!==null&&value!=="").join("-")||"Not listed",
	status:planting.status||"active",
	image:normalizeImageUrl(seed.coverImage,"seed")||firstImage(seed.images,"seed")
	};
};

const mapPlanting=planting=>({
	_id:planting._id,
	name:planting.instanceName||getText(planting.plant)||getText(planting.seed)||"Growing instance",
	type:getText(planting.gardenSection)||getText(planting.garden)||planting.location||planting.sourceType||"Garden",
	stage:planting.status||getText(planting.currentStage)||"active",
	started:formatDate(planting.plantedDate),
	nextTask:planting.expectedHarvestDate?`Harvest around ${formatDate(planting.expectedHarvestDate)}`:"No next task logged",
	lastFed:"No feeding logged",
	image:firstImage(planting.plant?.images)||normalizeImageUrl(planting.seed?.coverImage,"seed")||firstImage(planting.seed?.images,"seed")
});

const buildHarvestItems=harvests=>{
	const byCrop=new Map();

	harvests.forEach(harvest=>{
		const planting=harvest.planting||{};
		const name=getText(planting.plant)||getText(planting.seed)||planting.instanceName||"Harvest";
		const key=getObjectId(planting)||name;
		const monthIndex=new Date(harvest.harvestDate||harvest.createdAt).getMonth();
		const total=getWeightTotal(harvest.harvestAmount)||getWeightTotal(harvest.usableAmount);

		if(!byCrop.has(key)){
			byCrop.set(key,{
				_id:key,
				name,
				source:planting.sourceType||"Planting",
				expectedStart:formatMonth(planting.plantedDate)||"",
				expectedEnd:formatMonth(planting.expectedHarvestDate)||"",
				totalLb:0,
				status:planting.status||"Harvested",
				monthly:new Array(12).fill(0)
			});
		}

		const row=byCrop.get(key);
		if(monthIndex>=0&&monthIndex<12)row.monthly[monthIndex]+=total;
		row.totalLb+=total;
	});

	return [...byCrop.values()].map(item=>({
		...item,
		totalHarvested:formatHarvestTotal(item.totalLb),
		monthly:item.monthly.map(value=>Math.round(value*10)/10)
	}));
};

const buildProgress=(plantings,year)=>{
	const progress=new Array(12).fill(0);
	const total=plantings.length||1;

	plantings.forEach(planting=>{
		const date=new Date(planting.plantedDate);
		if(Number.isNaN(date.getTime())||date.getFullYear()>year)return;
		const start=date.getFullYear()<year?0:date.getMonth();
		for(let index=start;index<12;index+=1)progress[index]+=1;
	});

	return progress.map(value=>Math.round((value/total)*100));
};

const buildGardenAreas=(gardens,sections)=>{
	return gardens.map(garden=>({
		_id:garden._id,
		name:garden.name||"Garden",
		photos:sections
			.filter(section=>String(section.garden?._id||section.garden)===String(garden._id))
			.map(section=>({
				_id:section._id,
				bedName:section.name||"Garden section",
				url:""
			}))
	}));
};

const calendarRow=(task,itemsByMonth)=>({
	task,
	months:months.map((month,index)=>itemsByMonth[index]||[])
});

const buildCalendars=(seedStarts,plantings,harvestItems)=>{
	const seedMonths={};
	const transplantMonths={};
	const harvestMonths={};

	seedStarts.forEach(planting=>{
		const date=new Date(planting.plantedDate);
		if(!Number.isNaN(date.getTime())){
			const label=planting.instanceName||getText(planting.seed)||"Seed start";
			seedMonths[date.getMonth()]=[...(seedMonths[date.getMonth()]||[]),label];
		}
	});

	plantings.forEach(planting=>{
		const date=new Date(planting.plantedDate);
		if(!Number.isNaN(date.getTime())){
			const label=planting.instanceName||getText(planting.plant)||getText(planting.seed)||"Planting";
			transplantMonths[date.getMonth()]=[...(transplantMonths[date.getMonth()]||[]),label];
		}
	});

	harvestItems.forEach(item=>{
		item.monthly.forEach((value,index)=>{
			if(value>0)harvestMonths[index]=[...(harvestMonths[index]||[]),item.name];
		});
	});

	const rows=[
		calendarRow("Start Seeds",seedMonths),
		calendarRow("Plant / Transplant",transplantMonths),
		calendarRow("Harvest Window",harvestMonths)
	];

	return {
		indoor:rows,
		outdoor:rows,
		hydroponic:rows,
		aeroponic:rows,
		aquaponic:rows
	};
};

export const getDashboardSnapshot=async(req,res)=>{
	try{
		const year=parseInt(req.query.year)||new Date().getFullYear();
		const userId=req.query.userId||req.query.user||req.user?._id||null;
		const createdByQuery=getUserQuery(userId);

		const [plantings,harvests,gardens,sections]=await Promise.all([
			Planting.find({...createdByQuery,isActive:{$ne:false}})
				.populate("seed")
				.populate("plant")
				.populate("garden")
				.populate("gardenSection")
				.populate("currentStage")
				.sort({plantedDate:-1,createdAt:-1})
				.limit(24)
				.lean(),
			Harvest.find({...createdByQuery,isActive:{$ne:false}})
				.populate({
					path:"planting",
					populate:[
						{path:"seed",model:"Seed"},
						{path:"plant",model:"Plant"}
					]
				})
				.sort({harvestDate:-1,createdAt:-1})
				.limit(100)
				.lean(),
			Garden.find({...createdByQuery,isActive:{$ne:false}}).sort({name:1}).lean(),
			GardenSection.find({...createdByQuery,isActive:{$ne:false}}).sort({name:1}).lean()
		]);

		const datedPlantings=plantings.filter(planting=>hasRealDate(planting.plantedDate));
		const livePlantings=datedPlantings.filter(isLivePlanting);
		const seedStarts=livePlantings.filter(planting=>planting.sourceType==="seed"&&planting.seed);
		const activePlants=livePlantings.filter(planting=>planting.sourceType==="plant"&&planting.plant);
		const harvestItems=buildHarvestItems(harvests);

		res.json({
			year,
			years:[year-2,year-1,year,year+1],
			months,
			progress:buildProgress(livePlantings,year),
			seeds:seedStarts.map(mapSeedStart),
			plants:activePlants.map(mapPlanting),
			harvestItems,
			gardenAreas:buildGardenAreas(gardens,sections),
			calendars:buildCalendars(seedStarts,activePlants,harvestItems)
		});
	}catch(err){
		console.error(err);
		res.status(500).json({error:err.message});
	}
};

export const createOrUpdateDashboardSnapshot=async(req,res)=>{
	try{
		const {user,garden,year,progress,plants,calendar,photos}=req.body;

		const snapshot=await DashboardSnapshot.findOneAndUpdate(
			{user,garden,year},
			{
				user,
				garden,
				year,
				progress,
				plants,
				calendar,
				photos,
				lastUpdated:new Date()
			},
			{returnDocument:"after",upsert:true}
		);

		res.json(snapshot);
	}catch(err){
		console.error(err);
		res.status(500).json({error:err.message});
	}
};

export const deleteDashboardSnapshot=async(req,res)=>{
	try{
		const year=parseInt(req.params.year);

		await DashboardSnapshot.deleteOne({year});

		res.json({message:"Dashboard snapshot deleted"});
	}catch(err){
		console.error(err);
		res.status(500).json({error:err.message});
	}
};
