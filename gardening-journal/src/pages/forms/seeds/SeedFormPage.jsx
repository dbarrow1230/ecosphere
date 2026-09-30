// src/pages/forms/seeds/SeedFormPage.jsx
import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { Save, Sprout, Leaf, Bug, BookOpen, History, Link as LinkIcon, Apple, ShieldAlert, Flower2, Archive, Image, Tags } from "lucide-react";
import "./seedForm.css";
import { parseSeedImportText } from "./utils/parseSeedImportText";
import SeedHeaderTab from "./tabs/SeedHeaderTab";
import SeedFlavorTab from "./tabs/SeedFlavorTab";
import SpeciesTab from "./tabs/SpeciesTab";
import SeedLifecycleTab from "./tabs/SeedLifecycleTab";
import SeedGrowthTab from "./tabs/SeedGrowthTab";
import SeedGrowingConditionsTab from "./tabs/SeedGrowingConditionsTab";
import SeedStressTab from "./tabs/SeedStressTab";
import SeedPlantingTab from "./tabs/SeedPlantingTab";
import SeedPestDiseaseTab from "./tabs/SeedPestDiseaseTab";
import SeedPropagationTab from "./tabs/SeedPropagationTab";
import SeedPollinationTab from "./tabs/SeedPollinationTab";
import SeedHarvestingTab from "./tabs/SeedHarvestingTab";
import SeedStorageTab from "./tabs/SeedStorageTab";
import SeedUsesTab from "./tabs/SeedUsesTab";
import SeedNutritionTab from "./tabs/SeedNutritionTab";
import SeedEnvironmentalTab from "./tabs/SeedEnvironmentalTab";
import SeedSpecialFeaturesTab from "./tabs/SeedSpecialFeaturesTab";
import SeedHistoryTab from "./tabs/SeedHistoryTab";
import SeedCulturalTab from "./tabs/SeedCulturalTab";
import SeedResourcesTab from "./tabs/SeedResourcesTab";
import SeedAdminTab from "./tabs/SeedAdminTab";

const tabs = [
  { key: "header", label: "Basic Information", icon: Sprout },
  { key: "flavor", label: "Flavor Profile", icon: Apple },
  { key: "species", label: "Species", icon: Leaf },
  { key: "lifecycle", label: "Lifecycle", icon: History },
  { key: "growth", label: "Growth", icon: Sprout },
  { key: "conditions", label: "Conditions", icon: Leaf },
  { key: "stress", label: "Stress", icon: ShieldAlert },
  { key: "planting", label: "Planting", icon: Sprout },
  { key: "pestDisease", label: "Pest/Disease", icon: Bug },
  { key: "propagation", label: "Propagation", icon: Flower2 },
  { key: "pollination", label: "Pollination", icon: Flower2 },
  { key: "harvesting", label: "Harvesting", icon: Sprout },
  { key: "storage", label: "Storage", icon: Archive },
  { key: "uses", label: "Uses/Benefits", icon: BookOpen },
  { key: "nutrition", label: "Nutrition", icon: Apple },
  { key: "environmental", label: "Environmental", icon: Leaf },
  { key: "features", label: "Features", icon: Tags },
  { key: "history", label: "History", icon: History },
  { key: "cultural", label: "Culture", icon: BookOpen },
  { key: "resources", label: "Resources", icon: LinkIcon },
  { key: "admin", label: "Admin Details", icon: Image }
];

const emptySeed = {
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
      height: { minIn: 0, maxIn: 0, minCm: 0, maxCm: 0 },
      width: { minIn: 0, maxIn: 0, minCm: 0, maxCm: 0 }
    },
    plantingDepth: "",
    plantSpacing: "",
    sunlightRequirements: "",
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

export default function SeedFormPage({
  mode = "add",
  initialSeed = null,
  embedded = false,
  onSaved,
  onCancel,
  user = null
}) {
  const [activeTab, setActiveTab] = useState("header");
  const [formData, setFormData] = useState(emptySeed);
  const [loading, setLoading] = useState(false);
  const [referenceLoading, setReferenceLoading] = useState(true);
  const [formMessage, setFormMessage] = useState(null);
  const [importText, setImportText] = useState("");

  const [seedVendors, setSeedVendors] = useState([]);
  const [speciesOptions, setSpeciesOptions] = useState([]);
  const [plantTypes, setPlantTypes] = useState([]);
  const [lifecycleTypes, setLifecycleTypes] = useState([]);
  const [lifespans, setLifespans] = useState([]);
  const [growthRates, setGrowthRates] = useState([]);
  const [plantingDepths, setPlantingDepths] = useState([]);
  const [plantSpacings, setPlantSpacings] = useState([]);
  const [sunlightRequirements, setSunlightRequirements] = useState([]);
  const [usdaZones, setUsdaZones] = useState([]);
  const [soilTypes, setSoilTypes] = useState([]);
  const [plantSoilTemps, setPlantSoilTemps] = useState([]);
  const [wateringRequirements, setWateringRequirements] = useState([]);
  const [lightRequirements, setLightRequirements] = useState([]);
  const [plantingSeasons, setPlantingSeasons] = useState([]);
  const [propagationMethods, setPropagationMethods] = useState([]);
  const [seedOptions, setSeedOptions] = useState([]);
  const [pests, setPests] = useState([]);
  const [diseases, setDiseases] = useState([]);

  const getId = (value) => {
    if(!value)return "";
    if(typeof value === "string")return value;
    if(typeof value === "object"){
      if(typeof value.$oid === "string")return value.$oid;
      if(typeof value._id === "string")return value._id;
      if(typeof value.id === "string")return value.id;
      if(typeof value._id?.$oid === "string")return value._id.$oid;
      if(typeof value.id?.$oid === "string")return value.id.$oid;
    }
    return "";
  };

  const getCurrentUserId = () => {
    return getId(user);
  };

  const getIdArray = (value) => {
    if(!Array.isArray(value))return [];
    return value.map(item=>getId(item)).filter(Boolean);
  };

  const getStringArray = (value) => {
    if(Array.isArray(value))return value;
    if(typeof value === "string" && value.trim())return [value];
    return [];
  };

  const getDateInputValue = (value) => {
    if(!value)return "";
    const date = new Date(value);
    if(Number.isNaN(date.getTime()))return "";
    return date.toISOString().slice(0,10);
  };

  const hasImportValue = (value) => {
    if(Array.isArray(value))return value.length > 0;
    if(value && typeof value === "object")return Object.values(value).some(hasImportValue);
    if(typeof value === "boolean")return value;
    if(typeof value === "number")return value !== 0;
    return value !== undefined && value !== null && String(value).trim() !== "";
  };

  const mergeImportedSeed = (current, imported, onlyMissing = false) => {
    if(!imported || typeof imported !== "object")return current;

    const merged = Array.isArray(current) ? [...current] : {...current};

    Object.entries(imported).forEach(([key, value]) => {
      if(!hasImportValue(value))return;

      if(
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        current?.[key] &&
        typeof current[key] === "object" &&
        !Array.isArray(current[key])
      ){
        merged[key] = mergeImportedSeed(current[key], value, onlyMissing);
        return;
      }

      if(onlyMissing && hasImportValue(current?.[key]))return;

      merged[key] = value;
    });

    return merged;
  };

  const reloadSpeciesOptions = async () => {
    const res = await fetch("/api/species");
    const data = await res.json();
    const rows = Array.isArray(data) ? data : [];

    setSpeciesOptions(rows);
    return rows;
  };

  const handleSpeciesSaved = async (species) => {
    const rows = await reloadSpeciesOptions();
    const speciesId = getId(species);

    if(speciesId){
      updateField("species",speciesId);
    }

    return rows;
  };

  const getEmptySeedForUser = () => {
    return {
      ...structuredClone(emptySeed),
      user: getCurrentUserId()
    };
  };

  const normalizeSeedForForm = (seed) => {
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
        lifecycleType: getId(seed?.lifecycleInformation?.lifecycleType),
        lifespan: getId(seed?.lifecycleInformation?.lifespan),
        hardiness: seed?.lifecycleInformation?.hardiness || ""
      },
      growthInformation: {
        germinationTime: {
          min: growthInformation.germinationTime?.min || "",
          max: growthInformation.germinationTime?.max || ""
        },
        growthRate: getId(growthInformation.growthRate),
        bulbSize: growthInformation.bulbSize || "",
        matureSize: {
          height: {
            minIn: matureSize.height?.minIn ?? 0,
            maxIn: matureSize.height?.maxIn ?? 0,
            minCm: matureSize.height?.minCm ?? 0,
            maxCm: matureSize.height?.maxCm ?? 0
          },
          width: {
            minIn: matureSize.width?.minIn ?? 0,
            maxIn: matureSize.width?.maxIn ?? 0,
            minCm: matureSize.width?.minCm ?? 0,
            maxCm: matureSize.width?.maxCm ?? 0
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
      user: getId(seed?.user) || getCurrentUserId()
    };
  };

  useEffect(() => {
    async function fetchReferences() {
      try {
        const requests = await Promise.allSettled([
          fetch("/api/seed-vendors").then(res=>res.json()),
          fetch("/api/species").then(res=>res.json()),
          fetch("/api/plant-types").then(res=>res.json()),
          fetch("/api/reference/lifecycles").then(res=>res.json()),
          fetch("/api/reference/lifespans").then(res=>res.json()),
          fetch("/api/growth-rates").then(res=>res.json()),
          fetch("/api/planting-depths").then(res=>res.json()),
          fetch("/api/reference/plant-spacings").then(res=>res.json()),
          fetch("/api/reference/sunlight-requirements").then(res=>res.json()),
          fetch("/api/reference/usda-zones").then(res=>res.json()),
          fetch("/api/soil-types").then(res=>res.json()),
          fetch("/api/reference/plant-soil-temps").then(res=>res.json()),
          fetch("/api/reference/watering-requirements").then(res=>res.json()),
          fetch("/api/lighting").then(res=>res.json()),
          fetch("/api/reference/planting-seasons").then(res=>res.json()),
          fetch("/api/reference/propagation-methods").then(res=>res.json()),
          fetch("/api/seeds").then(res=>res.json()),
          fetch("/api/pests").then(res=>res.json()),
          fetch("/api/diseases").then(res=>res.json())
        ]);

        const getData = (index) => {
          return requests[index].status === "fulfilled" && Array.isArray(requests[index].value)
            ? requests[index].value
            : [];
        };

        setSeedVendors(getData(0));
        setSpeciesOptions(getData(1));
        setPlantTypes(getData(2));
        setLifecycleTypes(getData(3));
        setLifespans(getData(4));
        setGrowthRates(getData(5));
        setPlantingDepths(getData(6));
        setPlantSpacings(getData(7));
        setSunlightRequirements(getData(8));
        setUsdaZones(getData(9));
        setSoilTypes(getData(10));
        setPlantSoilTemps(getData(11));
        setWateringRequirements(getData(12));
        setLightRequirements(getData(13));
        setPlantingSeasons(getData(14));
        setPropagationMethods(getData(15));
        setSeedOptions(getData(16));
        setPests(getData(17));
        setDiseases(getData(18));
      } catch (error) {
        setFormMessage({variant:"danger", text:error.message || "Failed to load form references."});
      } finally {
        setReferenceLoading(false);
      }
    }

    fetchReferences();
  }, []);

  useEffect(() => {
    setFormMessage(null);

    if(mode === "edit" && initialSeed){
      setFormData(normalizeSeedForForm(initialSeed));
      setActiveTab("header");
      return;
    }

    setFormData(getEmptySeedForUser());
    setActiveTab("header");
  }, [mode, initialSeed, user]);

  const updateField = (path, value) => {
    setFormData((prev) => {
      const copy = structuredClone(prev);
      const keys = path.split(".");
      let current = copy;

      keys.slice(0, -1).forEach((key) => {
        if (!current[key] || typeof current[key] !== "object") {
          current[key] = {};
        }

        current = current[key];
      });

      current[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  const handleImportText = () => {
    if(!importText.trim()){
      setFormMessage({variant:"warning", text:"Paste seed reference text before parsing."});
      return;
    }

    const importedSeed = parseSeedImportText(importText,{
      speciesOptions,
      plantTypes,
      lifecycleTypes,
      lifespans,
      growthRates,
      plantingDepths,
      plantSpacings,
      sunlightRequirements,
      usdaZones,
      soilTypes,
      plantSoilTemps,
      wateringRequirements,
      lightRequirements,
      plantingSeasons,
      propagationMethods,
      seedOptions,
      pests,
      diseases
    });

    setFormData(prev=>mergeImportedSeed(prev,importedSeed,mode === "edit"));
    setImportText(importedSeed.unmappedText || "");
    setActiveTab("header");
    setFormMessage({
      variant:"success",
      text:importedSeed.unmappedText
        ? "Seed reference text parsed into the form. Items left in the parser box need manual review."
        : "Seed reference text parsed into the form. Review each tab before saving."
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormMessage(null);

    try {
      const isEdit = mode === "edit" && initialSeed?._id;
      const payload = {
        ...formData,
        user: formData.user || getCurrentUserId()
      };

      if(!payload.user){
        setFormMessage({variant:"danger", text:"Logged in user id is required to save this seed."});
        return;
      }

      const res = await fetch(isEdit ? `/api/seeds/${initialSeed._id}` : "/api/seeds", {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setFormMessage({variant:"danger", text:data.message || `Failed to ${isEdit ? "update" : "create"} seed.`});
        return;
      }

      setFormMessage({variant:"success", text:`Seed ${isEdit ? "updated" : "created"} successfully.`});

      if(onSaved){
        setTimeout(()=>{
          onSaved(data);
        },700);
        return;
      }

      setFormData(getEmptySeedForUser());
      setActiveTab("header");
    } catch (error) {
      setFormMessage({variant:"danger", text:error.message || "Server error while saving seed."});
    } finally {
      setLoading(false);
    }
  };

  const tabProps = {
    formData,
    updateField,
    seedVendors,
    speciesOptions,
    plantTypes,
    lifecycleTypes,
    lifespans,
    growthRates,
    plantingDepths,
    plantSpacings,
    sunlightRequirements,
    usdaZones,
    soilTypes,
    plantSoilTemps,
    wateringRequirements,
    lightRequirements,
    plantingSeasons,
    propagationMethods,
    seedOptions,
    seeds: seedOptions,
    pests,
    diseases,
    onSpeciesCreated: handleSpeciesSaved,
    onSpeciesUpdated: handleSpeciesSaved,
    user
  };

  const renderTab = () => {
    switch (activeTab) {
      case "header":
        return <SeedHeaderTab {...tabProps} />;
      case "flavor":
        return <SeedFlavorTab {...tabProps} />;
      case "species":
        return <SpeciesTab {...tabProps} />;
      case "lifecycle":
        return <SeedLifecycleTab {...tabProps} />;
      case "growth":
        return <SeedGrowthTab {...tabProps} />;
      case "conditions":
        return <SeedGrowingConditionsTab {...tabProps} />;
      case "stress":
        return <SeedStressTab {...tabProps} />;
      case "planting":
        return <SeedPlantingTab {...tabProps} />;
      case "pestDisease":
        return <SeedPestDiseaseTab {...tabProps} />;
      case "propagation":
        return <SeedPropagationTab {...tabProps} />;
      case "pollination":
        return <SeedPollinationTab {...tabProps} />;
      case "harvesting":
        return <SeedHarvestingTab {...tabProps} />;
      case "storage":
        return <SeedStorageTab {...tabProps} />;
      case "uses":
        return <SeedUsesTab {...tabProps} />;
      case "nutrition":
        return <SeedNutritionTab {...tabProps} />;
      case "environmental":
        return <SeedEnvironmentalTab {...tabProps} />;
      case "features":
        return <SeedSpecialFeaturesTab {...tabProps} />;
      case "history":
        return <SeedHistoryTab {...tabProps} />;
      case "cultural":
        return <SeedCulturalTab {...tabProps} />;
      case "resources":
        return <SeedResourcesTab {...tabProps} />;
      case "admin":
        return <SeedAdminTab {...tabProps} />;
      default:
        return <SeedHeaderTab {...tabProps} />;
    }
  };

  return (
    <div className={embedded ? "seed-form-shell seed-form-shell-embedded w-100" : "container-fluid py-4 seed-form-shell"}>
      {!embedded && (
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h1 className="h3 mb-1">{mode === "edit" ? "Edit Seed" : "Create Seed"}</h1>
            <p className="text-muted mb-0">
              {mode === "edit" ? "Update selected seed and plant reference data." : "Enter complete seed and plant reference data."}
            </p>
          </div>

          <div className="d-flex gap-2">
            {onCancel && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={loading || referenceLoading}
                onClick={onCancel}
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              form="seed-form"
              className="btn btn-success d-flex align-items-center gap-2"
              disabled={loading || referenceLoading}
            >
              <Save size={18} />
              {loading ? "Saving..." : mode === "edit" ? "Update Seed" : "Save Seed"}
            </button>
          </div>
        </div>
      )}

      {formMessage && (
        <Alert
          variant={formMessage.variant}
          dismissible
          onClose={()=>setFormMessage(null)}
          className="mb-3"
        >
          {formMessage.text}
        </Alert>
      )}

      <div className="seed-form-content-card w-100">
        <form id="seed-form" onSubmit={handleSubmit} className="seed-form-layout">
          <section className="seed-import-panel">
            <div className="seed-import-panel-header">
              <div>
                <h2>Parse Seed Reference Text</h2>
                <p>Paste GPT seed reference output here to fill matching form fields. The pasted text is not saved.</p>
              </div>

              <button
                type="button"
                className="btn btn-outline-success"
                disabled={referenceLoading || loading || !importText.trim()}
                onClick={handleImportText}
              >
                Parse to Form
              </button>
            </div>

            <textarea
              className="form-control"
              rows={5}
              value={importText}
              onChange={event=>setImportText(event.target.value)}
              placeholder="Paste seed reference text, then parse it into the form tabs."
            />
          </section>

          <div className="seed-form-tabs-wrap">
            <ul className="nav nav-tabs seed-form-tabs">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;

                return (
                  <li className="nav-item" key={tab.key}>
                    <button
                      type="button"
                      className={`nav-link d-flex align-items-center gap-2 ${
                        activeTab === tab.key ? "active" : ""
                      }`}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      <TabIcon size={16} />
                      <span>{tab.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <section className="seed-form-workspace">
            <div className="card-body">
              {referenceLoading ? (
                <div className="text-muted">Loading form references...</div>
              ) : (
                renderTab()
              )}
            </div>

            <div className="card-footer bg-white d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={tabs.findIndex(tab=>tab.key===activeTab) === 0}
                onClick={() => {
                  const index = tabs.findIndex(tab=>tab.key===activeTab);
                  if (index > 0) setActiveTab(tabs[index - 1].key);
                }}
              >
                Previous
              </button>

              <div className="d-flex gap-2">
                {tabs.findIndex(tab=>tab.key===activeTab) < tabs.length - 1 && (
                  <button
                    type="button"
                    className="btn btn-outline-success"
                    onClick={() => {
                      const index = tabs.findIndex(tab=>tab.key===activeTab);
                      if (index < tabs.length - 1) setActiveTab(tabs[index + 1].key);
                    }}
                  >
                    Next
                  </button>
                )}

                <button
                  type="submit"
                  className="btn btn-success d-flex align-items-center gap-2"
                  disabled={loading || referenceLoading}
                >
                  <Save size={18} />
                  {loading ? "Saving..." : mode === "edit" ? "Update Seed" : "Save Seed"}
                </button>
              </div>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}
