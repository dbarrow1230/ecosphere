const headingLabels=[
  "Flavor Profile",
  "Species Name and Classification",
  "Lifecycle Information",
  "Growth Information",
  "Growing Conditions and Requirements",
  "Stress Risk",
  "Planting Information",
  "Pest Management",
  "Disease Management",
  "Propagation Methods",
  "Pollination Information",
  "Harvesting Techniques",
  "Storage Tips",
  "Uses and Benefits",
  "Nutritional Information",
  "Environmental Impact",
  "Special Features",
  "Historical Information",
  "Cultural Information",
  "Resources and Links"
];

const normalizeText=value=>String(value||"")
  .replace(/\r/g,"\n")
  .replace(/:contentReference\[[^\]]+\]\{[^}]+\}/g,"")
  .replace(/[•·]/g,"*")
  .replace(/[–—]/g,"-");

const cleanValue=value=>String(value||"")
  .replace(/^[-*o□§]\s*/,"")
  .replace(/\s+/g," ")
  .trim();

const normalizeKey=value=>String(value||"")
  .toLowerCase()
  .replace(/['"]/g,"")
  .replace(/[^a-z0-9]+/g," ")
  .trim();

const escapeRegExp=value=>String(value||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&");

const unique=list=>[...new Set((list||[]).map(cleanValue).filter(Boolean))];

const splitList=value=>unique(
  String(value||"")
    .split(/\n|;|,/)
    .flatMap(item=>item.split(/\s+\*\s+/))
);

const splitBulletLines=value=>{
  const lines=String(value||"")
    .split("\n")
    .map(line=>cleanValue(line))
    .filter(Boolean)
    .filter(line=>!line.endsWith(":"));

  return unique(lines);
};

const splitSentences=value=>{
  const bulletLines=splitBulletLines(value);
  const source=bulletLines.length>1 ? bulletLines : [cleanValue(value)];

  return unique(
    source.flatMap(item=>String(item||"")
      .replace(/([.!?])\s+/g,"$1\n")
      .split("\n"))
  );
};

const splitStepList=value=>{
  const bulletLines=splitBulletLines(value);
  if(bulletLines.length>1)return bulletLines;

  return unique(
    String(value||"")
      .split(/\n|;|,/)
      .map(item=>item.replace(/^and\s+/i,""))
  );
};

const splitSemicolonSentences=value=>{
  const bulletLines=splitBulletLines(value);
  if(bulletLines.length>1)return bulletLines;

  return unique(
    String(value||"")
      .replace(/([.!?])\s+/g,"$1\n")
      .split(/\n|;/)
  );
};

const splitNarrativeList=value=>{
  const bulletLines=splitBulletLines(value);
  if(bulletLines.length>1)return bulletLines;
  return splitSentences(value);
};

const firstRawMatch=(text,patterns)=>{
  for(const pattern of patterns){
    const match=text.match(pattern);
    if(match?.[1])return String(match[1]).trim();
  }
  return "";
};

const lineValue=(text,label)=>{
  const escaped=escapeRegExp(label);
  const match=text.match(new RegExp(`(?:^|\\n)\\s*(?:[-*o□§]\\s*)?${escaped}\\s*:\\s*([^\\n]+)`,"i"));
  return match?.[1] ? cleanValue(match[1]) : "";
};

const firstLineValue=(texts,label)=>{
  for(const text of texts){
    const value=lineValue(text,label);
    if(value)return value;
  }
  return "";
};

const sectionText=(text,heading)=>{
  const escaped=escapeRegExp(heading);
  const startMatch=text.match(new RegExp(`(?:^|\\n)[ \\t]*${escaped}[ \\t]*:?.*(?:\\n|$)`,"i"));
  if(!startMatch)return "";

  const rest=text.slice((startMatch.index || 0)+startMatch[0].length);
  const nextIndexes=headingLabels
    .filter(label=>label!==heading)
    .map(label=>rest.search(new RegExp(`(?:^|\\n)[ \\t]*${escapeRegExp(label)}[ \\t]*:?.*(?:\\n|$)`,"i")))
    .filter(index=>index>=0);
  const end=nextIndexes.length ? Math.min(...nextIndexes) : rest.length;

  return rest.slice(0,end).trim();
};

const getOptionId=option=>{
  if(!option)return "";
  if(typeof option==="string")return option;
  return option._id || option.id || option.value || option._id?.$oid || option.id?.$oid || "";
};

const optionText=option=>[
  option?.name,
  option?.label,
  option?.title,
  option?.commonName,
  option?.botanicalName,
  option?.species,
  option?.description,
  option?.type,
  option?.zone
].filter(Boolean).join(" ");

const matchOption=(value,options=[])=>{
  const wanted=normalizeKey(value);
  if(!wanted)return "";

  const exact=options.find(option=>normalizeKey(optionText(option))===wanted);
  if(exact)return getOptionId(exact);

  const contained=options.find(option=>{
    const candidate=normalizeKey(optionText(option));
    return candidate && (candidate.includes(wanted) || wanted.includes(candidate));
  });

  return getOptionId(contained);
};

const matchSpecies=(values={},speciesOptions=[])=>{
  const wanted=[
    values.botanicalName,
    values.commonName,
    values.family,
    values.genus,
    values.species
  ].map(normalizeKey).filter(Boolean);

  if(wanted.length===0)return "";

  const found=speciesOptions.find(option=>{
    const candidate=[
      option?.botanicalName,
      option?.commonName,
      option?.family?.name,
      option?.family,
      option?.genus?.name,
      option?.genus,
      option?.species,
      option?.name
    ].map(normalizeKey).filter(Boolean);

    return wanted.some(value=>candidate.some(item=>item===value || item.includes(value) || value.includes(item)));
  });

  return getOptionId(found);
};

const parseRange=value=>{
  const numbers=[...String(value||"").matchAll(/(\d+(?:\.\d+)?)/g)].map(match=>Number(match[1]));
  return {
    min:numbers[0] || 0,
    max:numbers[1] || numbers[0] || 0
  };
};

const parseInCmRange=value=>{
  const parts=String(value||"").split("/");
  const inch=parseRange(parts[0]||"");
  const cm=parseRange(parts[1]||"");
  return {
    minIn:inch.min,
    maxIn:inch.max,
    minCm:cm.min,
    maxCm:cm.max
  };
};

const parseTableRows=(section,headerLabels)=>{
  const lines=section.split("\n").map(line=>line.trim()).filter(Boolean);
  const headerIndex=lines.findIndex(line=>headerLabels.every(label=>line.toLowerCase().includes(label.toLowerCase())));
  if(headerIndex<0)return [];

  return lines.slice(headerIndex+1)
    .map(line=>line.includes("\t") ? line.split(/\t+/).map(cleanValue) : line.split(/\s{2,}/).map(cleanValue))
    .filter(parts=>parts.length>=headerLabels.length);
};

const parseLinks=section=>{
  return splitBulletLines(section)
    .filter(line=>/^https?:\/\//i.test(line) || /https?:\/\//i.test(line));
};

const addManualReviewLine=(lines,label,value)=>{
  if(!value)return;
  lines.push(`${label}: ${value}`);
};

export function parseSeedImportText(input,references={}){
  const text=normalizeText(input);
  const speciesSection=sectionText(text,"Species Name and Classification");
  const growthSection=sectionText(text,"Growth Information");
  const conditionsSection=sectionText(text,"Growing Conditions and Requirements");
  const stressSection=sectionText(text,"Stress Risk");
  const plantingSection=sectionText(text,"Planting Information");
  const pestSection=sectionText(text,"Pest Management");
  const diseaseSection=sectionText(text,"Disease Management");
  const usesSection=sectionText(text,"Uses and Benefits");
  const historySection=sectionText(text,"Historical Information");

  const speciesValues={
    family:lineValue(speciesSection,"Family"),
    genus:lineValue(speciesSection,"Genus"),
    species:lineValue(speciesSection,"Species"),
    botanicalName:lineValue(speciesSection,"Botanical Name"),
    commonName:lineValue(speciesSection,"Common Name")
  };

  const height=parseInCmRange(lineValue(growthSection,"Height"));
  const width=parseInCmRange(lineValue(growthSection,"Width"));
  const germination=parseRange(firstLineValue([growthSection,text],"Germination Time") || firstLineValue([growthSection,text],"Germination"));
  const stressMitigation=firstRawMatch(stressSection,[/Stress Mitigation Tips:\s*([\s\S]*?)$/i]);
  const growingFromScraps=firstRawMatch(plantingSection,[/Growing from Scraps:\s*(?:\n\s*o\s*Steps:\s*)?([\s\S]*?)(?:\n\s*Apartment Gardening:|$)/i]);
  const resourceNotable=firstRawMatch(text,[/Notable Reference Links:\s*([\s\S]*?)(?:Suggested Seed Links:|$)/i]);
  const resourceSeeds=firstRawMatch(text,[/Suggested Seed Links:\s*([\s\S]*)/i]);
  const sunlightRequirementsValue=lineValue(growthSection,"Sunlight Requirements") || lineValue(growthSection,"Sunlight Requirement");
  const sunlightRequirementsMatch=matchOption(sunlightRequirementsValue,references.sunlightRequirements);

  const seed={
    plantName:lineValue(text,"Plant Name"),
    description:lineValue(text,"Description"),
    context:lineValue(text,"Context"),
    taste:splitList(lineValue(text,"Taste")),
    aroma:splitList(lineValue(text,"Aroma")),
    mouthfeel:splitList(lineValue(text,"Mouthfeel")),
    species:matchSpecies(speciesValues,references.speciesOptions),
    plantType:matchOption(lineValue(text,"Plant Type"),references.plantTypes),
    lifecycleInformation:{
      lifecycleType:matchOption(lineValue(text,"Lifecycle Type"),references.lifecycleTypes),
      lifespan:matchOption(lineValue(text,"Lifespan"),references.lifespans),
      hardiness:lineValue(growthSection,"Hardiness")
    },
    growthInformation:{
      germinationTime:{
        min:germination.min ? String(germination.min) : "",
        max:germination.max ? String(germination.max) : ""
      },
      growthRate:matchOption(lineValue(growthSection,"Growth Rate"),references.growthRates),
      bulbSize:lineValue(growthSection,"Bulb Size"),
      matureSize:{height,width},
      plantingDepth:matchOption(lineValue(growthSection,"Planting Depth"),references.plantingDepths),
      plantSpacing:matchOption(lineValue(growthSection,"Plant Spacing"),references.plantSpacings),
      sunlightRequirements:sunlightRequirementsMatch || sunlightRequirementsValue,
      usdaZoneRange:lineValue(text,"USDA Zones"),
      hardinessZonesWithCorrespondingRegionsStates:parseTableRows(growthSection,["Zone","Regions/States"]).map(parts=>({
        zone:parts[0],
        regionsStates:parts.slice(1).join(" ")
      }))
    },
    growingConditionsAndRequirements:{
      soilType:matchOption(lineValue(conditionsSection,"Soil Type"),references.soilTypes),
      plantSoilTemp:matchOption(lineValue(conditionsSection,"Soil Temp"),references.plantSoilTemps),
      phRequirements:lineValue(conditionsSection,"pH Requirements"),
      climateTolerance:lineValue(conditionsSection,"Climate Tolerance"),
      wateringRequirements:matchOption(lineValue(conditionsSection,"Watering Requirements"),references.wateringRequirements),
      lightRequirements:matchOption(lineValue(conditionsSection,"Light Requirements"),references.lightRequirements),
      watering:lineValue(conditionsSection,"Watering"),
      seasonalCareTips:{
        pruning:splitBulletLines(lineValue(conditionsSection,"Pruning")),
        fertilizing:splitBulletLines(lineValue(conditionsSection,"Fertilizing")),
        protection:splitBulletLines(lineValue(conditionsSection,"Protection"))
      }
    },
    sustainableGrowingPractices:{
      organicMethods:splitStepList(lineValue(conditionsSection,"Organic Methods")),
      waterConservation:splitStepList(lineValue(conditionsSection,"Water Conservation")),
      soilHealthImprovement:splitStepList(lineValue(conditionsSection,"Soil Health Improvement")),
      encouragingBiodiversity:splitStepList(lineValue(conditionsSection,"Encouraging Biodiversity"))
    },
    stressRisk:{
      title:lineValue(stressSection,"Stress Risk Title"),
      overview:lineValue(stressSection,"Stress Risk Overview"),
      temperatureStress:{
        above:lineValue(stressSection,"Above"),
        below:lineValue(stressSection,"Below")
      },
      waterStress:{
        overwatering:lineValue(stressSection,"Overwatering"),
        underwatering:lineValue(stressSection,"Underwatering")
      },
      nutrientStress:{
        deficiency:lineValue(stressSection,"Deficiency"),
        excess:lineValue(stressSection,"Excess")
      },
      lightStress:{
        lowLight:lineValue(stressSection,"Low Light"),
        excessLight:lineValue(stressSection,"Excess Light")
      },
      transplantShock:lineValue(stressSection,"Transplant Shock"),
      mitigationTips:splitBulletLines(stressMitigation)
    },
    plantingInformation:{
      plantingSeasons:matchOption(lineValue(plantingSection,"Planting Seasons"),references.plantingSeasons),
      startIndoors:{
        timing:lineValue(plantingSection,"Timing"),
        materialsNeeded:splitList(lineValue(plantingSection,"Materials Needed")),
        careTips:splitStepList(lineValue(plantingSection,"Care Tips"))
      },
      companionPlants:[],
      coverCrops:[],
      trapCrops:[],
      directSowOutdoors:{
        guidelines:splitSentences(lineValue(plantingSection,"Guidelines"))
      },
      hydroponicGrowth:/hydroponic/i.test(lineValue(plantingSection,"Hydroponic Growth")),
      growingFromScraps:splitBulletLines(growingFromScraps),
      apartmentGardening:splitSentences(lineValue(plantingSection,"Apartment Gardening"))
    },
    pestManagement:parseTableRows(pestSection,["Pest Name","Pest Type","Pest Category","Description","Treatment","Prevention"]).map(parts=>({
      name:parts[0],
      type:parts[1],
      category:parts[2],
      description:parts[3],
      treatment:parts[4],
      prevention:parts[5],
      isNew:true
    })),
    diseaseManagement:parseTableRows(diseaseSection,["Disease Name","Disease Type","Disease Category","Description","Treatment","Prevention"]).map(parts=>({
      diseaseName:parts[0],
      name:parts[0],
      diseaseType:parts[1],
      type:parts[1],
      category:parts[2],
      description:parts[3],
      treatments:parts[4],
      prevention:parts[5],
      isNew:true
    })),
    propagationMethods:{
      method:[],
      notes:splitList(lineValue(text,"Propagation Methods"))
    },
    pollinationInformation:splitNarrativeList(lineValue(text,"Pollination Information")),
    attractingPollinators:splitNarrativeList(lineValue(text,"Attracting Pollinators")),
    harvestingInformation:{
      harvestTime:lineValue(growthSection,"Harvest Time"),
      harvestTimeAfterGermination:lineValue(growthSection,"Harvest Time After Germination"),
      techniques:splitSentences(lineValue(text,"Harvesting Techniques"))
    },
    storageTips:splitBulletLines(firstRawMatch(text,[/Storage Tips:\s*([\s\S]*?)(?:\n\s*Uses and Benefits|$)/i])),
    usesAndBenefits:{
      edibility:firstLineValue([usesSection,text],"Edibility"),
      medicinal:/^yes$/i.test(lineValue(usesSection,"Medicinal")),
      medicinalUses:{
        pros:splitSemicolonSentences(lineValue(usesSection,"Pros")),
        cons:splitSemicolonSentences(lineValue(usesSection,"Cons"))
      },
      toxicity:lineValue(usesSection,"Toxicity")
    },
    nutritionalInformation:splitBulletLines(sectionText(text,"Nutritional Information")),
    environmentalImpact:{
      impact:splitSentences(lineValue(text,"Environmental Impact"))
    },
    specialFeatures:splitList(lineValue(text,"Special Features")),
    historicalInformation:{
      foodOrigin:firstLineValue([historySection,text],"Food Origin"),
      events:parseTableRows(historySection,["Date","Time Period","Event"]).map(parts=>({
        date:parts[0],
        timePeriod:parts[1],
        event:parts.slice(2).join(" ")
      }))
    },
    culturalInformation:splitSentences(lineValue(text,"Cultural Information")),
    resourcesAndLinks:{
      notableReferenceLinks:parseLinks(resourceNotable),
      suggestedSeedLinks:parseLinks(resourceSeeds)
    }
  };

  const manualReviewLines=[];
  const plantTypeValue=lineValue(text,"Plant Type");
  const lifecycleTypeValue=lineValue(text,"Lifecycle Type");
  const lifespanValue=lineValue(text,"Lifespan");
  const growthRateValue=lineValue(growthSection,"Growth Rate");
  const plantingDepthValue=lineValue(growthSection,"Planting Depth");
  const plantSpacingValue=lineValue(growthSection,"Plant Spacing");
  const soilTypeValue=lineValue(conditionsSection,"Soil Type");
  const soilTempValue=lineValue(conditionsSection,"Soil Temp");
  const wateringRequirementsValue=lineValue(conditionsSection,"Watering Requirements");
  const lightRequirementsValue=lineValue(conditionsSection,"Light Requirements");
  const plantingSeasonsValue=lineValue(plantingSection,"Planting Seasons");

  if(Object.values(speciesValues).some(Boolean) && !seed.species){
    addManualReviewLine(manualReviewLines,"Species reference",[
      speciesValues.commonName,
      speciesValues.botanicalName,
      speciesValues.family,
      speciesValues.genus,
      speciesValues.species
    ].filter(Boolean).join(" | "));
  }

  if(plantTypeValue && !seed.plantType)addManualReviewLine(manualReviewLines,"Plant type reference",plantTypeValue);
  if(lifecycleTypeValue && !seed.lifecycleInformation.lifecycleType)addManualReviewLine(manualReviewLines,"Lifecycle type reference",lifecycleTypeValue);
  if(lifespanValue && !seed.lifecycleInformation.lifespan)addManualReviewLine(manualReviewLines,"Lifespan reference",lifespanValue);
  if(growthRateValue && !seed.growthInformation.growthRate)addManualReviewLine(manualReviewLines,"Growth rate reference",growthRateValue);
  if(plantingDepthValue && !seed.growthInformation.plantingDepth)addManualReviewLine(manualReviewLines,"Planting depth reference",plantingDepthValue);
  if(plantSpacingValue && !seed.growthInformation.plantSpacing)addManualReviewLine(manualReviewLines,"Plant spacing reference",plantSpacingValue);
  if(soilTypeValue && !seed.growingConditionsAndRequirements.soilType)addManualReviewLine(manualReviewLines,"Soil type reference",soilTypeValue);
  if(soilTempValue && !seed.growingConditionsAndRequirements.plantSoilTemp)addManualReviewLine(manualReviewLines,"Soil temperature reference",soilTempValue);
  if(wateringRequirementsValue && !seed.growingConditionsAndRequirements.wateringRequirements)addManualReviewLine(manualReviewLines,"Watering requirement reference",wateringRequirementsValue);
  if(lightRequirementsValue && !seed.growingConditionsAndRequirements.lightRequirements)addManualReviewLine(manualReviewLines,"Light requirement reference",lightRequirementsValue);
  if(plantingSeasonsValue && !seed.plantingInformation.plantingSeasons)addManualReviewLine(manualReviewLines,"Planting season reference",plantingSeasonsValue);
  addManualReviewLine(manualReviewLines,"Companion plants",lineValue(plantingSection,"Companion Plants"));
  addManualReviewLine(manualReviewLines,"Cover crops",lineValue(plantingSection,"Cover Crops"));
  addManualReviewLine(manualReviewLines,"Trap crops",lineValue(plantingSection,"Trap Crops"));

  Object.defineProperty(seed,"unmappedText",{
    value:manualReviewLines.length ? `Manual review - not mapped automatically:\n${manualReviewLines.join("\n")}` : "",
    enumerable:false
  });

  return seed;
}
