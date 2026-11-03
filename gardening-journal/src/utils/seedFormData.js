const getId=value=>{if(!value)return '';if(typeof value==='string')return value;return value.$oid||value._id?.$oid||value._id||value.id?.$oid||value.id||'';};
const getIdArray=value=>Array.isArray(value)?value.map(getId).filter(Boolean):[];
const getStringArray=value=>Array.isArray(value)?value:typeof value==='string'&&value.trim()?[value]:[];
const getDateInputValue=value=>value&&!Number.isNaN(new Date(value).getTime())?new Date(value).toISOString().slice(0,10):'';

export const emptySeed = {
  plantName: "",
  description: "",
  context: "",
  coverImage: "",
  taste: [],
  aroma: [],
  mouthfeel: [],
  species: "",
  plantType: "",
  lifecycleInformation: {
    lifecycleType: "",
    lifespan: "",
    lifespanDescription: "",
    hardiness: ""
  },
  growthInformation: {
    germinationTime: {
      min: "",
      max: ""
    },
    growthRate: "",
    bulbSize: "",
    matureSize: {
      height: { minIn: "", maxIn: "", minCm: "", maxCm: "" },
      width: { minIn: "", maxIn: "", minCm: "", maxCm: "" }
    },
    plantingDepth: "",
    plantSpacing: "",
    sunlightRequirements: "",
    usdaZoneRange: "",
    usdaZones: [],
    hardinessZonesWithCorrespondingRegionsStates: []
  },
  growingConditionsAndRequirements: {
    soilType: "",
    plantSoilTemp: "",
    phRequirements: "",
    climateTolerance: "",
    wateringRequirements: "",
    lightRequirements: "",
    watering: "",
    seasonalCareTips: {
      pruning: [],
      fertilizing: [],
      protection: []
    }
  },
  sustainableGrowingPractices: {
    organicMethods: [],
    waterConservation: [],
    soilHealthImprovement: [],
    encouragingBiodiversity: []
  },
  stressRisk: {
    title: "",
    overview: "",
    temperatureStress: { above: "", below: "" },
    waterStress: { overwatering: "", underwatering: "" },
    nutrientStress: { deficiency: "", excess: "" },
    lightStress: { lowLight: "", excessLight: "" },
    transplantShock: "",
    mitigationTips: []
  },
  plantingInformation: {
    plantingSeasons: "",
    seasonDescription: "",
    startIndoors: {
      timing: "",
      materialsNeeded: [],
      careTips: []
    },
    companionPlants: [],
    coverCrops: [],
    trapCrops: [],
    directSowOutdoors: {
      guidelines: []
    },
    hydroponicGrowth: false,
    growingFromScraps: [],
    apartmentGardening: []
  },
  pestManagement: [],
  diseaseManagement: [],
  propagationMethods: {
    method: [],
    notes: []
  },
  pollinationInformation: [],
  attractingPollinators: [],
  harvestingInformation: {
    harvestTime: "",
    harvestTimeAfterGermination: "",
    techniques: []
  },
  storageTips: [],
  growingNotes: "",
  usesAndBenefits: {
    edibility: "",
    medicinal: false,
    medicinalUses: {
      pros: [],
      cons: []
    },
    toxicity: ""
  },
  nutritionalInformation: [],
  environmentalImpact: {
    impact: []
  },
  specialFeatures: [],
  historicalInformation: {
    foodOrigin: "",
    events: []
  },
  culturalInformation: [],
  resourcesAndLinks: {
    notableReferenceLinks: [],
    suggestedSeedLinks: []
  },
  vendor: [],
  lotNumber: "",
  dateCollected: "",
  packedFor: "",
  images: [],
  tags: [],
  isPublic: false,
  user: ""
};

export const seedFormValues = (seed,currentUserId="") => {
    const growthInformation = seed?.growthInformation || {};
    const matureSize = growthInformation.matureSize || {};
    const growingConditionsAndRequirements = seed?.growingConditionsAndRequirements || {};
    const seasonalCareTips = growingConditionsAndRequirements.seasonalCareTips || {};
    const sustainableGrowingPractices = seed?.sustainableGrowingPractices || {};
    const stressRisk = seed?.stressRisk || {};
    const plantingInformation = seed?.plantingInformation || {};
    const startIndoors = plantingInformation.startIndoors || {};
    const directSowOutdoors = plantingInformation.directSowOutdoors || {};
    const propagationMethodsData = seed?.propagationMethods || {};
    const harvestingInformation = seed?.harvestingInformation || {};
    const usesAndBenefits = seed?.usesAndBenefits || {};
    const medicinalUses = usesAndBenefits.medicinalUses || {};
    const environmentalImpact = seed?.environmentalImpact || {};
    const historicalInformation = seed?.historicalInformation || {};
    const resourcesAndLinks = seed?.resourcesAndLinks || {};

    return {
      ...structuredClone(emptySeed),
      ...seed,
      plantName: seed?.plantName || "",
      description: seed?.description || "",
      context: seed?.context || "",
      coverImage: seed?.coverImage || "",
      taste: getStringArray(seed?.taste),
      aroma: getStringArray(seed?.aroma),
      mouthfeel: getStringArray(seed?.mouthfeel),
      species: getId(seed?.species),
      plantType: getId(seed?.plantType),
      lifecycleInformation: {
        ...seed?.lifecycleInformation,
        lifecycleType: getId(seed?.lifecycleInformation?.lifecycleType),
        lifespan: getId(seed?.lifecycleInformation?.lifespan),
        hardiness: seed?.lifecycleInformation?.hardiness || ""
      },
      growthInformation: {
        ...growthInformation,
        germinationTime: {
          min: growthInformation.germinationTime?.min || "",
          max: growthInformation.germinationTime?.max || ""
        },
        growthRate: getId(growthInformation.growthRate),
        bulbSize: growthInformation.bulbSize || "",
        matureSize: {
          height: {
            minIn: matureSize.height?.minIn ?? "",
            maxIn: matureSize.height?.maxIn ?? "",
            minCm: matureSize.height?.minCm ?? "",
            maxCm: matureSize.height?.maxCm ?? ""
          },
          width: {
            minIn: matureSize.width?.minIn ?? "",
            maxIn: matureSize.width?.maxIn ?? "",
            minCm: matureSize.width?.minCm ?? "",
            maxCm: matureSize.width?.maxCm ?? ""
          }
        },
        plantingDepth: getId(growthInformation.plantingDepth),
        plantSpacing: getId(growthInformation.plantSpacing),
        sunlightRequirements: typeof growthInformation.sunlightRequirements === "string" ? growthInformation.sunlightRequirements : getId(growthInformation.sunlightRequirements),
        usdaZones: getIdArray(growthInformation.usdaZones),
        hardinessZonesWithCorrespondingRegionsStates: Array.isArray(growthInformation.hardinessZonesWithCorrespondingRegionsStates) ? growthInformation.hardinessZonesWithCorrespondingRegionsStates : []
      },
      growingConditionsAndRequirements: {
        soilType: getId(growingConditionsAndRequirements.soilType),
        plantSoilTemp: getId(growingConditionsAndRequirements.plantSoilTemp),
        phRequirements: growingConditionsAndRequirements.phRequirements || "",
        climateTolerance: growingConditionsAndRequirements.climateTolerance || "",
        wateringRequirements: getId(growingConditionsAndRequirements.wateringRequirements),
        lightRequirements: getId(growingConditionsAndRequirements.lightRequirements),
        watering: growingConditionsAndRequirements.watering || "",
        seasonalCareTips: {
          pruning: getStringArray(seasonalCareTips.pruning),
          fertilizing: getStringArray(seasonalCareTips.fertilizing),
          protection: getStringArray(seasonalCareTips.protection)
        }
      },
      sustainableGrowingPractices: {
        organicMethods: getStringArray(sustainableGrowingPractices.organicMethods),
        waterConservation: getStringArray(sustainableGrowingPractices.waterConservation),
        soilHealthImprovement: getStringArray(sustainableGrowingPractices.soilHealthImprovement),
        encouragingBiodiversity: getStringArray(sustainableGrowingPractices.encouragingBiodiversity)
      },
      stressRisk: {
        title: stressRisk.title || "",
        overview: stressRisk.overview || "",
        temperatureStress: {
          above: stressRisk.temperatureStress?.above || "",
          below: stressRisk.temperatureStress?.below || ""
        },
        waterStress: {
          overwatering: stressRisk.waterStress?.overwatering || "",
          underwatering: stressRisk.waterStress?.underwatering || ""
        },
        nutrientStress: {
          deficiency: stressRisk.nutrientStress?.deficiency || "",
          excess: stressRisk.nutrientStress?.excess || ""
        },
        lightStress: {
          lowLight: stressRisk.lightStress?.lowLight || "",
          excessLight: stressRisk.lightStress?.excessLight || ""
        },
        transplantShock: stressRisk.transplantShock || "",
        mitigationTips: getStringArray(stressRisk.mitigationTips)
      },
      plantingInformation: {
        ...plantingInformation,
        plantingSeasons: getId(plantingInformation.plantingSeasons),
        startIndoors: {
          timing: startIndoors.timing || "",
          materialsNeeded: getStringArray(startIndoors.materialsNeeded),
          careTips: getStringArray(startIndoors.careTips)
        },
        companionPlants: getIdArray(plantingInformation.companionPlants),
        coverCrops: getIdArray(plantingInformation.coverCrops),
        trapCrops: getIdArray(plantingInformation.trapCrops),
        directSowOutdoors: {
          guidelines: getStringArray(directSowOutdoors.guidelines)
        },
        hydroponicGrowth: !!plantingInformation.hydroponicGrowth,
        growingFromScraps: getStringArray(plantingInformation.growingFromScraps),
        apartmentGardening: getStringArray(plantingInformation.apartmentGardening)
      },
      pestManagement: Array.isArray(seed?.pestManagement) ? seed.pestManagement : [],
      diseaseManagement: Array.isArray(seed?.diseaseManagement) ? seed.diseaseManagement : [],
      propagationMethods: {
        method: getIdArray(propagationMethodsData.method),
        notes: getStringArray(propagationMethodsData.notes)
      },
      pollinationInformation: getStringArray(seed?.pollinationInformation),
      attractingPollinators: getStringArray(seed?.attractingPollinators),
      harvestingInformation: {
        harvestTime: harvestingInformation.harvestTime || "",
        harvestTimeAfterGermination: harvestingInformation.harvestTimeAfterGermination || "",
        techniques: getStringArray(harvestingInformation.techniques)
      },
      storageTips: getStringArray(seed?.storageTips),
      growingNotes: seed?.growingNotes || "",
      usesAndBenefits: {
        edibility: usesAndBenefits.edibility || "",
        medicinal: !!usesAndBenefits.medicinal,
        medicinalUses: {
          pros: getStringArray(medicinalUses.pros),
          cons: getStringArray(medicinalUses.cons)
        },
        toxicity: usesAndBenefits.toxicity || ""
      },
      nutritionalInformation: getStringArray(seed?.nutritionalInformation),
      environmentalImpact: {
        impact: getStringArray(environmentalImpact.impact)
      },
      specialFeatures: getStringArray(seed?.specialFeatures),
      historicalInformation: {
        foodOrigin: historicalInformation.foodOrigin || "",
        events: Array.isArray(historicalInformation.events) ? historicalInformation.events : []
      },
      culturalInformation: getStringArray(seed?.culturalInformation),
      resourcesAndLinks: {
        notableReferenceLinks: getStringArray(resourcesAndLinks.notableReferenceLinks),
        suggestedSeedLinks: getStringArray(resourcesAndLinks.suggestedSeedLinks)
      },
      vendor: getIdArray(seed?.vendor),
      lotNumber: seed?.lotNumber || "",
      dateCollected: getDateInputValue(seed?.dateCollected),
      packedFor: seed?.packedFor || "",
      images: Array.isArray(seed?.images) ? seed.images : [],
      tags: getStringArray(seed?.tags),
      isPublic: !!seed?.isPublic,
      user: getId(seed?.user) || currentUserId
    };
  };
