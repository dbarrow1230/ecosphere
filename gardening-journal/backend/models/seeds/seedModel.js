import mongoose from "mongoose";

const {Schema}=mongoose;

const seedSchema=new Schema({

	// Basic seed identity
	plantName:{type:String,trim:true,default:""},
	description:{type:String,trim:true,default:""},
	context:{type:String,trim:true,default:""},
	coverImage:{type:String,trim:true,default:""},
	images:[{
		stage:{type:String,trim:true,default:""},
		filename:{type:String,trim:true,default:""},
		alt:{type:String,trim:true,default:""},
		caption:{type:String,trim:true,default:""}
	}],

	// Flavor profile
	taste:[{type:String,trim:true}],
	aroma:[{type:String,trim:true}],
	mouthfeel:[{type:String,trim:true}],

	// Seed packet and collection details
	lotNumber:{type:String,trim:true,default:""},
	dateCollected:{type:Date,default:null},
	packedFor:{type:String,trim:true,default:""},
	vendor:[{type:Schema.Types.ObjectId,ref:"SeedVendor"}],

	// Classification
	species:{type:Schema.Types.ObjectId,ref:"Species",default:null},
	plantType:{type:Schema.Types.ObjectId,ref:"PlantType",default:null},

	// Lifecycle
	lifecycleInformation:{
		lifecycleType:{type:Schema.Types.ObjectId,ref:"LifecycleType",default:null},
		lifespan:{type:Schema.Types.ObjectId,ref:"Lifespan",default:null},
		hardiness:{type:String,trim:true,default:""}
	},

	// Growth
	growthInformation:{
		germinationTime:{
			min:{type:String,trim:true,default:""},
			max:{type:String,trim:true,default:""}
		},
		growthRate:{type:Schema.Types.ObjectId,ref:"GrowthRate",default:null},
		bulbSize:{type:String,trim:true,default:""},

		matureSize:{
			height:{
				minIn:{type:Number,default:null},
				maxIn:{type:Number,default:null},
				minCm:{type:Number,default:null},
				maxCm:{type:Number,default:null}
			},
			width:{
				minIn:{type:Number,default:null},
				maxIn:{type:Number,default:null},
				minCm:{type:Number,default:null},
				maxCm:{type:Number,default:null}
			}
		},

		plantingDepth:{type:Schema.Types.ObjectId,ref:"PlantingDepth",default:null},
		plantSpacing:{type:Schema.Types.ObjectId,ref:"PlantSpacing",default:null},
		sunlightRequirements:{type:String,trim:true,default:""},
		usdaZoneRange:{type:String,trim:true,default:""},
		usdaZones:[{type:Schema.Types.ObjectId,ref:"USDAZones"}],

		hardinessZonesWithCorrespondingRegionsStates:[{
			zone:{type:String,trim:true,default:""},
			regionsStates:{type:String,trim:true,default:""}
		}]
	},

	// Growing conditions
	growingConditionsAndRequirements:{
		soilType:{type:Schema.Types.ObjectId,ref:"SoilType",default:null},
		plantSoilTemp:{type:Schema.Types.ObjectId,ref:"PlantSoilTemp",default:null},
		phRequirements:{type:String,trim:true,default:""},
		climateTolerance:{type:String,trim:true,default:""},
		wateringRequirements:{type:Schema.Types.ObjectId,ref:"WateringRequirement",default:null},
		lightRequirements:{type:Schema.Types.ObjectId,ref:"LightRequirement",default:null},
		watering:{type:String,trim:true,default:""},

		seasonalCareTips:{
			pruning:[{type:String,trim:true}],
			fertilizing:[{type:String,trim:true}],
			protection:[{type:String,trim:true}]
		}
	},

	// Sustainable practices
	sustainableGrowingPractices:{
		organicMethods:[{type:String,trim:true}],
		waterConservation:[{type:String,trim:true}],
		soilHealthImprovement:[{type:String,trim:true}],
		encouragingBiodiversity:[{type:String,trim:true}]
	},

	// Stress risk
	stressRisk:{
		title:{type:String,trim:true,default:""},
		overview:{type:String,trim:true,default:""},

		temperatureStress:{
			above:{type:String,trim:true,default:""},
			below:{type:String,trim:true,default:""}
		},

		waterStress:{
			overwatering:{type:String,trim:true,default:""},
			underwatering:{type:String,trim:true,default:""}
		},

		nutrientStress:{
			deficiency:{type:String,trim:true,default:""},
			excess:{type:String,trim:true,default:""}
		},

		lightStress:{
			lowLight:{type:String,trim:true,default:""},
			excessLight:{type:String,trim:true,default:""}
		},

		transplantShock:{type:String,trim:true,default:""},
		mitigationTips:[{type:String,trim:true}]
	},

	// Planting
	plantingInformation:{
		plantingSeasons:{type:Schema.Types.ObjectId,ref:"PlantingSeason",default:null},

		startIndoors:{
			timing:{type:String,trim:true,default:""},
			materialsNeeded:[{type:String,trim:true}],
			careTips:[{type:String,trim:true}]
		},

		directSowOutdoors:{
			guidelines:[{type:String,trim:true}]
		},

		companionPlants:[{type:Schema.Types.ObjectId,ref:"Seed"}],
		coverCrops:[{type:Schema.Types.ObjectId,ref:"Seed"}],
		trapCrops:[{type:Schema.Types.ObjectId,ref:"Seed"}],

		hydroponicGrowth:{type:Boolean,default:false},
		growingFromScraps:[{type:String,trim:true}],
		apartmentGardening:[{type:String,trim:true}]
	},

	// Pest and disease
	pestManagement:[{
		pest:{type:Schema.Types.ObjectId,ref:"Pest",default:null},
		type:{type:String,trim:true,default:""},
		category:{type:String,trim:true,default:""},
		name:{type:String,trim:true,default:""},
		description:{type:String,trim:true,default:""},
		treatment:{type:String,trim:true,default:""},
		prevention:{type:String,trim:true,default:""}
	}],

	diseaseManagement:[{
		disease:{type:Schema.Types.ObjectId,ref:"Disease",default:null},
		type:{type:String,trim:true,default:""},
		name:{type:String,trim:true,default:""},
		diseaseName:{type:String,trim:true,default:""},
		scientificName:{type:String,trim:true,default:""},
		diseaseType:{type:String,trim:true,default:""},
		category:{type:String,trim:true,default:""},
		description:{type:String,trim:true,default:""},
		cause:{type:String,trim:true,default:""},
		symptoms:{type:String,trim:true,default:""},
		affectedParts:{type:String,trim:true,default:""},
		spreadMethod:{type:String,trim:true,default:""},
		favorableConditions:{type:String,trim:true,default:""},
		treatment:{type:String,trim:true,default:""},
		treatments:{type:String,trim:true,default:""},
		prevention:{type:String,trim:true,default:""},
		organicTreatment:{type:String,trim:true,default:""},
		chemicalTreatment:{type:String,trim:true,default:""},
		severity:{type:String,trim:true,default:"moderate"},
		isContagious:{type:Boolean,default:false}
	}],

	// Propagation
	propagationMethods:{
		method:[{type:Schema.Types.ObjectId,ref:"PropagationMethod"}],
		notes:[{type:String,trim:true}]
	},

	// Pollination
	pollinationInformation:[{type:String,trim:true}],
	attractingPollinators:[{type:String,trim:true}],

	// Harvesting
	harvestingInformation:{
		harvestTime:{type:String,trim:true,default:""},
		harvestTimeAfterGermination:{type:String,trim:true,default:""},
		techniques:[{type:String,trim:true}]
	},

	// Storage and growing notes
	storageTips:[{type:String,trim:true}],
	growingNotes:{type:String,trim:true,default:""},

	// Uses and benefits
	usesAndBenefits:{
		edibility:{type:String,trim:true,default:""},
		medicinal:{type:Boolean,default:false},

		medicinalUses:{
			pros:[{type:String,trim:true}],
			cons:[{type:String,trim:true}]
		},

		toxicity:{type:String,trim:true,default:""}
	},

	// Nutrition
	nutritionalInformation:[{type:String,trim:true}],

	// Environmental
	environmentalImpact:{
		impact:[{type:String,trim:true}]
	},

	// Special features
	specialFeatures:[{type:String,trim:true}],

	// History
	historicalInformation:{
		foodOrigin:{type:String,trim:true,default:""},

		events:[{
			date:{type:String,trim:true,default:""},
			timePeriod:{type:String,trim:true,default:""},
			event:{type:String,trim:true,default:""}
		}]
	},

	// Culture
	culturalInformation:[{type:String,trim:true}],

	// Resources
	resourcesAndLinks:{
		notableReferenceLinks:[{type:String,trim:true}],
		suggestedSeedLinks:[{type:String,trim:true}]
	},

	// Metadata
	tags:[{type:String,trim:true}],
	status:{type:String,trim:true,enum:["active","inactive","archived"],default:"active",index:true},
	isActive:{type:Boolean,default:true},
	isPublic:{type:Boolean,default:false},
	user:{type:Schema.Types.ObjectId,ref:"User",required:true}

},{timestamps:true,collection:"seeds"});

const roundMeasurement=(value)=>Math.round((value + Number.EPSILON) * 100) / 100;

const syncImperialMetricPair=(target,inKey,cmKey)=>{
	if(!target) return;

	const inches=Number(target[inKey] || 0);
	const centimeters=Number(target[cmKey] || 0);

	if(inches && !centimeters){
		target[cmKey]=roundMeasurement(inches * 2.54);
	}

	if(centimeters && !inches){
		target[inKey]=roundMeasurement(centimeters / 2.54);
	}
};

seedSchema.pre("validate",function(){
	const matureSize=this.growthInformation?.matureSize;

	syncImperialMetricPair(matureSize?.height,"minIn","minCm");
	syncImperialMetricPair(matureSize?.height,"maxIn","maxCm");
	syncImperialMetricPair(matureSize?.width,"minIn","minCm");
	syncImperialMetricPair(matureSize?.width,"maxIn","maxCm");
});


const Seed=mongoose.models.Seed||mongoose.model("Seed",seedSchema);

export default Seed;
