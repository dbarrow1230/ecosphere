// backend/controllers/seeds/seedController.js
import mongoose from "mongoose";
import "../../models/users/userModel.js";
import "../../models/species/speciesModel.js";
import "../../models/species/familyModel.js";
import "../../models/species/genusModel.js";
import "../../models/vendors/seedVendorModel.js";
import "../../models/reference/plantTypeModel.js";
import "../../models/reference/lifecycleModel.js";
import "../../models/reference/lifespansModel.js";
import "../../models/growth/growthRateModel.js";
import "../../models/growth/plantingDepthModel.js";
import "../../models/reference/plantSpacingModel.js";
import "../../models/reference/sunlightRequirementModel.js";
import "../../models/reference/usdaZonesModel.js";
import "../../models/reference/soiltypeModel.js";
import "../../models/reference/plantSoilTempModel.js";
import "../../models/reference/wateringRequirementModel.js";
import "../../models/reference/lightingModel.js";
import "../../models/reference/plantingSeasonModel.js";
import "../../models/reference/propagationMethodModel.js";
import "../../models/pests/pestmodel.js";
import "../../models/pests/pesttypemodel.js";
import "../../models/reference/pestRefTreatmentModel.js";
import "../../models/diseases/diseaseModel.js";

import Seed from "../../models/seeds/seedModel.js";

const seedStatuses=["active","inactive","archived"];

const cleanStatus=value=>{
	const status=String(value || "").trim().toLowerCase();
	return seedStatuses.includes(status) ? status : "active";
};

const populateSeed=query=>{
	return query
		.populate("user","username email")
		.populate({
			path:"species",
			populate:[
				{path:"family",model:"Family",select:"name description"},
				{path:"genus",model:"Genus",select:"name description"}
			]
		})
		.populate({path:"vendor",model:"SeedVendor"})
		.populate({path:"plantType",model:"PlantType"})
		.populate({path:"lifecycleInformation.lifecycleType",model:"Lifecycle"})
		.populate({path:"lifecycleInformation.lifespan",model:"Lifespan"})
		.populate({path:"growthInformation.growthRate",model:"GrowthRate"})
		.populate({path:"growthInformation.plantingDepth",model:"PlantingDepth"})
		.populate({path:"growthInformation.plantSpacing",model:"PlantSpacing"})
		.populate({path:"growthInformation.usdaZones",model:"USDAZones"})
		.populate({path:"growingConditionsAndRequirements.soilType",model:"SoilType"})
		.populate({path:"growingConditionsAndRequirements.plantSoilTemp",model:"PlantSoilTemp"})
		.populate({path:"growingConditionsAndRequirements.wateringRequirements",model:"WateringRequirement"})
		.populate({path:"growingConditionsAndRequirements.lightRequirements",model:"Lighting"})
		.populate({path:"plantingInformation.plantingSeasons",model:"PlantingSeason",populate:{path:"season",model:"Season"}})
		.populate({path:"plantingInformation.companionPlants",model:"Seed"})
		.populate({path:"plantingInformation.coverCrops",model:"Seed"})
		.populate({path:"plantingInformation.trapCrops",model:"Seed"})
		.populate({
	path:"pestManagement.pest",
	model:"Pest",
	populate:[
		{path:"type",model:"PestType"},
		{path:"treatment",model:"PestRefTreatment"}
	]
})
		.populate({path:"diseaseManagement.disease",model:"Disease"})
		.populate({path:"propagationMethods.method",model:"PropagationMethod"});
};

const cleanString=value=>{
        return value===undefined || value===null ? "" : String(value).trim();
};

const cleanFilename=value=>{
        const raw=cleanString(value);
        if(!raw)return "";

        const withoutQuery=raw.split(/[?#]/,1)[0].replace(/\\/g,"/");
        return withoutQuery.split("/").pop();
};

const cleanStringArray=value=>{
	if(!Array.isArray(value))return [];
	return value.map(item=>cleanString(item)).filter(Boolean);
};

const cleanObject=value=>{
	return value && typeof value==="object" && !Array.isArray(value) ? value : {};
};

const cleanObjectId=value=>{
	if(!value)return null;

	if(typeof value==="string")return mongoose.Types.ObjectId.isValid(value) ? value : null;

	if(typeof value==="object"){
		if(typeof value.$oid==="string")return mongoose.Types.ObjectId.isValid(value.$oid) ? value.$oid : null;
		if(typeof value._id==="string")return mongoose.Types.ObjectId.isValid(value._id) ? value._id : null;
		if(typeof value.id==="string")return mongoose.Types.ObjectId.isValid(value.id) ? value.id : null;
		if(typeof value._id?.$oid==="string")return mongoose.Types.ObjectId.isValid(value._id.$oid) ? value._id.$oid : null;
		if(typeof value.id?.$oid==="string")return mongoose.Types.ObjectId.isValid(value.id.$oid) ? value.id.$oid : null;
	}

	return null;
};

const cleanObjectIdArray=value=>{
	if(!Array.isArray(value))return [];

	return value
		.map(item=>cleanObjectId(item))
		.filter(Boolean);
};

const cleanNumber=value=>{
	if(value==="" || value===undefined || value===null)return 0;

	const number=Number(value);
	return Number.isFinite(number) ? number : 0;
};

const cleanDate=value=>{
	if(!value)return null;
	const date=new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
};

const cleanGerminationTime=value=>{
	if(!value)return {min:"",max:""};

	if(typeof value==="string"){
		return {min:cleanString(value),max:""};
	}

	if(typeof value==="object" && !Array.isArray(value)){
		return {
			min:cleanString(value.min),
			max:cleanString(value.max)
		};
	}

	return {min:"",max:""};
};

const cleanMatureSize=value=>{
	const size=cleanObject(value);
	const height=cleanObject(size.height);
	const width=cleanObject(size.width);

	return {
		height:{
			minIn:cleanNumber(height.minIn),
			maxIn:cleanNumber(height.maxIn),
			minCm:cleanNumber(height.minCm),
			maxCm:cleanNumber(height.maxCm)
		},
		width:{
			minIn:cleanNumber(width.minIn),
			maxIn:cleanNumber(width.maxIn),
			minCm:cleanNumber(width.minCm),
			maxCm:cleanNumber(width.maxCm)
		}
	};
};

const cleanHardinessZones=value=>{
	if(!Array.isArray(value))return [];

	return value.map(item=>{
		const current=cleanObject(item);
		const states=Array.isArray(current.states) ? current.states.join(", ") : "";
		const regionsStates=current.regionsStates || current.regionStates || current.correspondingRegionsStates || states;

		return {
			zone:cleanString(current.zone),
			regionsStates:cleanString(regionsStates || current.region)
		};
	}).filter(item=>item.zone || item.regionsStates);
};

const cleanPestManagement=value=>{
	if(!Array.isArray(value))return [];

	return value.map(item=>{
		const current=cleanObject(item);
		const pestId=cleanObjectId(current.pest);

		if(pestId){
			return {pest:pestId};
		}

		return {
			pest:null,
			type:cleanString(current.type || current.pest),
			category:cleanString(current.category),
			name:cleanString(current.name),
			description:cleanString(current.description),
			treatment:cleanString(current.treatment),
			prevention:cleanString(current.prevention)
		};
	}).filter(item=>item.pest || item.type || item.category || item.name || item.description || item.treatment || item.prevention);
};

const cleanDiseaseManagement=value=>{
	if(!Array.isArray(value))return [];

	return value.map(item=>{
		const current=cleanObject(item);
		const diseaseId=cleanObjectId(current.disease);

		if(diseaseId){
			return {disease:diseaseId};
		}

		return {
			disease:null,
			type:cleanString(current.type || current.disease || current.category),
			name:cleanString(current.name || current.diseaseName),
			diseaseName:cleanString(current.diseaseName || current.name),
			scientificName:cleanString(current.scientificName),
			diseaseType:cleanString(current.diseaseType || current.type),
			category:cleanString(current.category),
			description:cleanString(current.description),
			cause:cleanString(current.cause),
			symptoms:cleanString(current.symptoms),
			affectedParts:cleanString(current.affectedParts),
			spreadMethod:cleanString(current.spreadMethod),
			favorableConditions:cleanString(current.favorableConditions),
			treatment:cleanString(current.treatment || current.treatments),
			treatments:cleanString(current.treatments || current.treatment),
			prevention:cleanString(current.prevention),
			organicTreatment:cleanString(current.organicTreatment),
			chemicalTreatment:cleanString(current.chemicalTreatment),
			severity:cleanString(current.severity) || "moderate",
			isContagious:!!current.isContagious
		};
	}).filter(item=>item.disease || item.type || item.diseaseType || item.name || item.diseaseName || item.category || item.description || item.treatment || item.treatments || item.prevention);
};

const cleanImages=value=>{
	if(!Array.isArray(value))return [];

	return value.map(item=>{
		const current=cleanObject(item);

		return {
			stage:cleanString(current.stage),
			filename:cleanFilename(current.filename || current.url || current.relativePath),
			alt:cleanString(current.alt),
			caption:cleanString(current.caption)
		};
	}).filter(item=>item.stage || item.filename || item.alt || item.caption);
};

const cleanHistoricalEvents=value=>{
	if(!Array.isArray(value))return [];

	return value.map(item=>{
		const current=cleanObject(item);

		return {
			date:cleanString(current.date),
			timePeriod:cleanString(current.timePeriod),
			event:cleanString(current.event)
		};
	}).filter(item=>item.date || item.timePeriod || item.event);
};

const cleanSeedData=data=>{
	const lifecycleInformation=cleanObject(data.lifecycleInformation);
	const growthInformation=cleanObject(data.growthInformation);
	const growingConditionsAndRequirements=cleanObject(data.growingConditionsAndRequirements);
	const seasonalCareTips=cleanObject(growingConditionsAndRequirements.seasonalCareTips);
	const sustainableGrowingPractices=cleanObject(data.sustainableGrowingPractices);
	const stressRisk=cleanObject(data.stressRisk);
	const plantingInformation=cleanObject(data.plantingInformation);
	const startIndoors=cleanObject(plantingInformation.startIndoors);
	const directSowOutdoors=cleanObject(plantingInformation.directSowOutdoors);
	const propagationMethods=cleanObject(data.propagationMethods);
	const harvestingInformation=cleanObject(data.harvestingInformation);
	const usesAndBenefits=cleanObject(data.usesAndBenefits);
	const medicinalUses=cleanObject(usesAndBenefits.medicinalUses);
	const environmentalImpact=cleanObject(data.environmentalImpact);
	const historicalInformation=cleanObject(data.historicalInformation);
	const resourcesAndLinks=cleanObject(data.resourcesAndLinks);

	return {
		plantName:cleanString(data.plantName),
		description:cleanString(data.description),
		context:cleanString(data.context),
		coverImage:cleanFilename(data.coverImage),
		images:cleanImages(data.images),

		taste:cleanStringArray(data.taste),
		aroma:cleanStringArray(data.aroma),
		mouthfeel:cleanStringArray(data.mouthfeel),

		lotNumber:cleanString(data.lotNumber),
		dateCollected:cleanDate(data.dateCollected),
		packedFor:cleanString(data.packedFor),
		vendor:cleanObjectIdArray(data.vendor),

		species:cleanObjectId(data.species),
		plantType:cleanObjectId(data.plantType),

		lifecycleInformation:{
			lifecycleType:cleanObjectId(lifecycleInformation.lifecycleType),
			lifespan:cleanObjectId(lifecycleInformation.lifespan),
			hardiness:cleanString(lifecycleInformation.hardiness)
		},

		growthInformation:{
			germinationTime:cleanGerminationTime(growthInformation.germinationTime),
			growthRate:cleanObjectId(growthInformation.growthRate),
			bulbSize:cleanString(growthInformation.bulbSize),
			matureSize:cleanMatureSize(growthInformation.matureSize),
			plantingDepth:cleanObjectId(growthInformation.plantingDepth),
			plantSpacing:cleanObjectId(growthInformation.plantSpacing),
			sunlightRequirements:cleanString(growthInformation.sunlightRequirements),
			usdaZoneRange:cleanString(growthInformation.usdaZoneRange),
			usdaZones:cleanObjectIdArray(growthInformation.usdaZones),
			hardinessZonesWithCorrespondingRegionsStates:cleanHardinessZones(growthInformation.hardinessZonesWithCorrespondingRegionsStates)
		},

		growingConditionsAndRequirements:{
			soilType:cleanObjectId(growingConditionsAndRequirements.soilType),
			plantSoilTemp:cleanObjectId(growingConditionsAndRequirements.plantSoilTemp),
			phRequirements:cleanString(growingConditionsAndRequirements.phRequirements),
			climateTolerance:cleanString(growingConditionsAndRequirements.climateTolerance),
			wateringRequirements:cleanObjectId(growingConditionsAndRequirements.wateringRequirements),
			lightRequirements:cleanObjectId(growingConditionsAndRequirements.lightRequirements),
			watering:cleanString(growingConditionsAndRequirements.watering),
			seasonalCareTips:{
				pruning:cleanStringArray(seasonalCareTips.pruning),
				fertilizing:cleanStringArray(seasonalCareTips.fertilizing),
				protection:cleanStringArray(seasonalCareTips.protection)
			}
		},

		sustainableGrowingPractices:{
			organicMethods:cleanStringArray(sustainableGrowingPractices.organicMethods),
			waterConservation:cleanStringArray(sustainableGrowingPractices.waterConservation),
			soilHealthImprovement:cleanStringArray(sustainableGrowingPractices.soilHealthImprovement),
			encouragingBiodiversity:cleanStringArray(sustainableGrowingPractices.encouragingBiodiversity)
		},

		stressRisk:{
			title:cleanString(stressRisk.title),
			overview:cleanString(stressRisk.overview),
			temperatureStress:{
				above:cleanString(cleanObject(stressRisk.temperatureStress).above),
				below:cleanString(cleanObject(stressRisk.temperatureStress).below)
			},
			waterStress:{
				overwatering:cleanString(cleanObject(stressRisk.waterStress).overwatering),
				underwatering:cleanString(cleanObject(stressRisk.waterStress).underwatering)
			},
			nutrientStress:{
				deficiency:cleanString(cleanObject(stressRisk.nutrientStress).deficiency),
				excess:cleanString(cleanObject(stressRisk.nutrientStress).excess)
			},
			lightStress:{
				lowLight:cleanString(cleanObject(stressRisk.lightStress).lowLight),
				excessLight:cleanString(cleanObject(stressRisk.lightStress).excessLight)
			},
			transplantShock:cleanString(stressRisk.transplantShock),
			mitigationTips:cleanStringArray(stressRisk.mitigationTips)
		},

		plantingInformation:{
			plantingSeasons:cleanObjectId(plantingInformation.plantingSeasons),
			startIndoors:{
				timing:cleanString(startIndoors.timing),
				materialsNeeded:cleanStringArray(startIndoors.materialsNeeded),
				careTips:cleanStringArray(startIndoors.careTips)
			},
			directSowOutdoors:{
				guidelines:cleanStringArray(directSowOutdoors.guidelines)
			},
			companionPlants:cleanObjectIdArray(plantingInformation.companionPlants),
			coverCrops:cleanObjectIdArray(plantingInformation.coverCrops),
			trapCrops:cleanObjectIdArray(plantingInformation.trapCrops),
			hydroponicGrowth:!!plantingInformation.hydroponicGrowth,
			growingFromScraps:cleanStringArray(plantingInformation.growingFromScraps),
			apartmentGardening:cleanStringArray(plantingInformation.apartmentGardening)
		},

		pestManagement:cleanPestManagement(data.pestManagement),
		diseaseManagement:cleanDiseaseManagement(data.diseaseManagement),

		propagationMethods:{
			method:cleanObjectIdArray(propagationMethods.method),
			notes:cleanStringArray(propagationMethods.notes)
		},

		pollinationInformation:cleanStringArray(data.pollinationInformation),
		attractingPollinators:cleanStringArray(data.attractingPollinators),

		harvestingInformation:{
			harvestTime:cleanString(harvestingInformation.harvestTime),
			harvestTimeAfterGermination:cleanString(harvestingInformation.harvestTimeAfterGermination),
			techniques:cleanStringArray(harvestingInformation.techniques)
		},

		storageTips:cleanStringArray(data.storageTips),
		growingNotes:cleanString(data.growingNotes),

		usesAndBenefits:{
			edibility:cleanString(usesAndBenefits.edibility),
			medicinal:!!usesAndBenefits.medicinal,
			medicinalUses:{
				pros:cleanStringArray(medicinalUses.pros),
				cons:cleanStringArray(medicinalUses.cons)
			},
			toxicity:cleanString(usesAndBenefits.toxicity)
		},

		nutritionalInformation:cleanStringArray(data.nutritionalInformation),

		environmentalImpact:{
			impact:cleanStringArray(environmentalImpact.impact)
		},

		specialFeatures:cleanStringArray(data.specialFeatures),

		historicalInformation:{
			foodOrigin:cleanString(historicalInformation.foodOrigin),
			events:cleanHistoricalEvents(historicalInformation.events)
		},

		culturalInformation:cleanStringArray(data.culturalInformation),

		resourcesAndLinks:{
			notableReferenceLinks:cleanStringArray(resourcesAndLinks.notableReferenceLinks),
			suggestedSeedLinks:cleanStringArray(resourcesAndLinks.suggestedSeedLinks)
		},

		tags:cleanStringArray(data.tags),
		status:data.status !== undefined ? cleanStatus(data.status) : data.isActive === false ? "inactive" : "active",
		isActive:data.isActive !== undefined ? !!data.isActive : cleanStatus(data.status) === "active",
		isPublic:data.isPublic !== undefined ? !!data.isPublic : false
	};
};

export const createSeed=async(req,res)=>{
	try{
		const data=cleanSeedData(req.body);
		const userId=cleanObjectId(req.body.user || req.user?._id || req.user?.id);

		if(!userId){
			return res.status(400).json({message:"Valid user id is required"});
		}

		const seed=new Seed({
			...data,
			user:userId
		});

		const saved=await seed.save();
		const populated=await populateSeed(Seed.findById(saved._id));

		return res.status(201).json(populated);
	}catch(error){
		return res.status(500).json({message:error.message});
	}
};

export const getSeeds=async(req,res)=>{
	try{
		const query={};
		const userId=cleanObjectId(req.params.userId || req.query.user);

		if(req.params.userId || req.query.user){
			if(!userId){
				return res.status(400).json({message:"Invalid user id"});
			}

			query.user=userId;
		}

		if(req.query.isPublic !== undefined){
			query.isPublic=req.query.isPublic === "true";
		}

		if(req.query.status){
			query.status=cleanStatus(req.query.status);
		}

		if(req.query.isActive !== undefined){
			query.isActive=req.query.isActive === "true";
		}

		if(req.query.search){
			query.$or=[
				{plantName:{$regex:req.query.search,$options:"i"}},
				{description:{$regex:req.query.search,$options:"i"}},
				{context:{$regex:req.query.search,$options:"i"}},
				{taste:{$regex:req.query.search,$options:"i"}},
				{aroma:{$regex:req.query.search,$options:"i"}},
				{mouthfeel:{$regex:req.query.search,$options:"i"}},
				{lotNumber:{$regex:req.query.search,$options:"i"}},
				{packedFor:{$regex:req.query.search,$options:"i"}},
				{growingNotes:{$regex:req.query.search,$options:"i"}},
				{"growthInformation.germinationTime.min":{$regex:req.query.search,$options:"i"}},
				{"growthInformation.germinationTime.max":{$regex:req.query.search,$options:"i"}},
				{"growthInformation.bulbSize":{$regex:req.query.search,$options:"i"}},
				{"growthInformation.usdaZoneRange":{$regex:req.query.search,$options:"i"}},
				{"growthInformation.hardinessZonesWithCorrespondingRegionsStates.zone":{$regex:req.query.search,$options:"i"}},
				{"growthInformation.hardinessZonesWithCorrespondingRegionsStates.regionsStates":{$regex:req.query.search,$options:"i"}},
				{"growingConditionsAndRequirements.phRequirements":{$regex:req.query.search,$options:"i"}},
				{"growingConditionsAndRequirements.climateTolerance":{$regex:req.query.search,$options:"i"}},
				{"growingConditionsAndRequirements.watering":{$regex:req.query.search,$options:"i"}},
				{"growingConditionsAndRequirements.seasonalCareTips.pruning":{$regex:req.query.search,$options:"i"}},
				{"growingConditionsAndRequirements.seasonalCareTips.fertilizing":{$regex:req.query.search,$options:"i"}},
				{"growingConditionsAndRequirements.seasonalCareTips.protection":{$regex:req.query.search,$options:"i"}},
				{"sustainableGrowingPractices.organicMethods":{$regex:req.query.search,$options:"i"}},
				{"sustainableGrowingPractices.waterConservation":{$regex:req.query.search,$options:"i"}},
				{"sustainableGrowingPractices.soilHealthImprovement":{$regex:req.query.search,$options:"i"}},
				{"sustainableGrowingPractices.encouragingBiodiversity":{$regex:req.query.search,$options:"i"}},
				{"stressRisk.title":{$regex:req.query.search,$options:"i"}},
				{"stressRisk.overview":{$regex:req.query.search,$options:"i"}},
				{"stressRisk.mitigationTips":{$regex:req.query.search,$options:"i"}},
				{"harvestingInformation.harvestTime":{$regex:req.query.search,$options:"i"}},
				{"harvestingInformation.harvestTimeAfterGermination":{$regex:req.query.search,$options:"i"}},
				{"harvestingInformation.techniques":{$regex:req.query.search,$options:"i"}},
				{"usesAndBenefits.edibility":{$regex:req.query.search,$options:"i"}},
				{"usesAndBenefits.medicinalUses.pros":{$regex:req.query.search,$options:"i"}},
				{"usesAndBenefits.medicinalUses.cons":{$regex:req.query.search,$options:"i"}},
				{"usesAndBenefits.toxicity":{$regex:req.query.search,$options:"i"}},
				{"environmentalImpact.impact":{$regex:req.query.search,$options:"i"}},
				{nutritionalInformation:{$regex:req.query.search,$options:"i"}},
				{specialFeatures:{$regex:req.query.search,$options:"i"}},
				{culturalInformation:{$regex:req.query.search,$options:"i"}},
				{tags:{$regex:req.query.search,$options:"i"}}
			];
		}

		const seeds=await populateSeed(Seed.find(query)).sort({createdAt:-1});

		return res.status(200).json(seeds);
	}catch(error){
		return res.status(500).json({message:error.message});
	}
};

export const getSeedById=async(req,res)=>{
	try{
		const id=cleanObjectId(req.params.id);

		if(!id){
			return res.status(400).json({message:"Invalid seed id"});
		}

		const seed=await populateSeed(Seed.findById(id));

		if(!seed){
			return res.status(404).json({message:"Seed not found"});
		}

		return res.status(200).json(seed);
	}catch(error){
		return res.status(500).json({message:error.message});
	}
};

export const updateSeed=async(req,res)=>{
	try{
		const id=cleanObjectId(req.params.id);

		if(!id){
			return res.status(400).json({message:"Invalid seed id"});
		}

		const seed=await Seed.findById(id);

		if(!seed){
			return res.status(404).json({message:"Seed not found"});
		}

		const data=cleanSeedData(req.body);
		const userId=req.body.user !== undefined ? cleanObjectId(req.body.user) : null;

		if(req.body.user !== undefined && req.body.user && !userId){
			return res.status(400).json({message:"Invalid user id"});
		}

		if(req.body.status === undefined){
			data.status=seed.status || "active";
		}

		if(req.body.isActive === undefined){
			data.isActive=seed.isActive !== undefined ? seed.isActive : data.status === "active";
		}

		Object.keys(data).forEach(key=>{
			seed[key]=data[key];
		});

		if(req.body.user !== undefined && userId){
			seed.user=userId;
		}

		const updated=await seed.save();
		const populated=await populateSeed(Seed.findById(updated._id));

		return res.status(200).json(populated);
	}catch(error){
		return res.status(500).json({message:error.message});
	}
};

export const deleteSeed=async(req,res)=>{
	try{
		const id=cleanObjectId(req.params.id);

		if(!id){
			return res.status(400).json({message:"Invalid seed id"});
		}

		const seed=await Seed.findByIdAndDelete(id);

		if(!seed){
			return res.status(404).json({message:"Seed not found"});
		}

		return res.status(200).json({message:"Seed deleted successfully"});
	}catch(error){
		return res.status(500).json({message:error.message});
	}
};

