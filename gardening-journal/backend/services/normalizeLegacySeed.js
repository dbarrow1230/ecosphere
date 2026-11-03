import {resolveSeedCover} from './resolveSeedCover.js';
// Adapt stored legacy fields before Mongoose applies defaults and populates refs.
// Existing current fields (including intentionally empty values) take precedence.
export function normalizeLegacySeed(record){
 const get=path=>path.split('.').reduce((value,key)=>value?.[key],record);
 const put=(path,value)=>{
  if(value===undefined || value===null || get(path)!==undefined)return;
  const keys=path.split('.');
  const key=keys.pop();
  let target=record;
  for(const part of keys)target=target[part]??={};
  target[key]=value;
 };
 const mappings={
  plantName:'name',coverImage:'image_path',species:'species_id',plantType:'plant_type_id',vendor:'vendor_id',lotNumber:'lot_number',
  taste:'flavor_profile.taste',aroma:'flavor_profile.aroma',mouthfeel:'flavor_profile.mouthfeel',
  'lifecycleInformation.lifespanDescription':'plant_life_span','lifecycleInformation.lifecycleType':'lifecycle_id','lifecycleInformation.hardiness':'hardiness',
  'growthInformation.germinationTime.min':'growth_info.min_days_germination','growthInformation.germinationTime.max':'growth_info.max_days_germination',
  'growthInformation.growthRate':'growth_info.growth_rate_id','growthInformation.bulbSize':'bulb_size',
  'growthInformation.plantingDepth':'growth_info.planting_depth_id','growthInformation.plantSpacing':'growth_info.plant_spacing_id',
  'growthInformation.sunlightRequirements':'growth_info.sunlight_requirements',
  'growingConditionsAndRequirements.soilType':'growing_conditions.soil_type_id',
  'growingConditionsAndRequirements.plantSoilTemp':'growing_conditions.soil_temp_id',
  'growingConditionsAndRequirements.phRequirements':'growing_conditions.ph_requirements',
  'growingConditionsAndRequirements.climateTolerance':'growing_conditions.climate_tolerance',
  'growingConditionsAndRequirements.wateringRequirements':'growth_info.watering_id',
  'growingConditionsAndRequirements.watering':'growing_conditions.watering_requirements',
  'growingConditionsAndRequirements.lightRequirements':'growing_conditions.light_id',
  'plantingInformation.startIndoors.timing':'start_indoors.timing',
  'plantingInformation.startIndoors.materialsNeeded':'start_indoors.materials_needed',
  'plantingInformation.startIndoors.careTips':'start_indoors.care_tips',
  'plantingInformation.directSowOutdoors.guidelines':'start_indoors.direct_sow_outdoors',
  'plantingInformation.companionPlants':'companion_plants','plantingInformation.coverCrops':'cover_crops','plantingInformation.trapCrops':'trap_crops',
  'plantingInformation.hydroponicGrowth':'hydroponic.growing','plantingInformation.growingFromScraps':'growing_from_scraps',
  'propagationMethods.method':'reproduction.propagation_methods',
  'harvestingInformation.harvestTime':'harvest_time','harvestingInformation.harvestTimeAfterGermination':'growth_info.harvest_time_after_germination',
  'harvestingInformation.techniques':'harvesting_techniques',storageTips:'storage_tips',
  'usesAndBenefits.edibility':'uses_and_benefits.edibility','usesAndBenefits.medicinal':'medicinal',
  'usesAndBenefits.medicinalUses.pros':'medicinal_uses.pros','usesAndBenefits.medicinalUses.cons':'medicinal_uses.cons','usesAndBenefits.toxicity':'medicinal_uses.toxicity',
  attractingPollinators:'attracting_pollinators',nutritionalInformation:'nutritional_info',
  'environmentalImpact.impact':'environmental_impact',specialFeatures:'special_features',culturalInformation:'cultural_info',
  'historicalInformation.foodOrigin':'food_origin'
 };
 for(const [current,legacy] of Object.entries(mappings))put(current,get(legacy));
 for(const axis of ['height','width']){
  const size=get(`growth_info.mature_size.${axis}`);
  if(!size)continue;
  for(const bound of ['min','max']){
   put(`growthInformation.matureSize.${axis}.${bound}In`,size.imperial_value??(size.unit==='in'?size.value:undefined));
   put(`growthInformation.matureSize.${axis}.${bound}Cm`,size.metric_value??(size.unit==='cm'?size.value:undefined));
  }
  for(const bound of ['min','max']){
   const base=`growthInformation.matureSize.${axis}`;
   const inches=get(`${base}.${bound}In`);
   const cm=get(`${base}.${bound}Cm`);
   if(inches!=null)put(`${base}.${bound}Cm`,Math.round(inches*2.54*100)/100);
   if(cm!=null)put(`${base}.${bound}In`,Math.round(cm/2.54*100)/100);
  }
 }
 const legacyZones=get('growth_info.usda_zones');
 if(Array.isArray(legacyZones))put('growthInformation.usdaZoneRange',legacyZones.join(', '));
 if(Array.isArray(record.planting_seasons))put('plantingInformation.seasonDescription',record.planting_seasons.join(', '));
 const zones=get('growth_info.hardiness_zones');
 if(Array.isArray(zones))put('growthInformation.hardinessZonesWithCorrespondingRegionsStates',zones.map(zone=>({zone:zone.zone,regionsStates:Array.isArray(zone.regions)?zone.regions.join(', '):zone.regions||''})));
 const events=get('historical_info');
 if(Array.isArray(events))put('historicalInformation.events',events.map(event=>({date:event.date,timePeriod:event.time_period,event:event.event})));
 for(const key of ['pruning','fertilizing','protection'])put(`growingConditionsAndRequirements.seasonalCareTips.${key}`,get(`seasonal_care.${key}`));
 for(const [current,legacy] of Object.entries({organicMethods:'organic_methods',waterConservation:'water_conservation',soilHealthImprovement:'soil_health_improvement',encouragingBiodiversity:'encouraging_biodiversity'}))put(`sustainableGrowingPractices.${current}`,get(`sustainable_practices.${legacy}`));
 for(const [current,legacy] of Object.entries({notableReferenceLinks:'notable_references',suggestedSeedLinks:'suggested_seed_links'})){
  const links=get(`resources_links.${legacy}`);
  if(Array.isArray(links))put(`resourcesAndLinks.${current}`,links.map(link=>typeof link==='string'?link:link?.url).filter(Boolean));
 }
 // Older seed records combined pest and disease notes in one list.
 const management=Array.isArray(record.pest_disease_management)?record.pest_disease_management:[];
 const legacyRows=(field,rows=management)=>rows.filter(item=>item&&typeof item[field]==='string'&&item[field].trim()).map(item=>({
  name:item[field].trim(),
  treatment:item.treatment||'',
  prevention:item.prevention||''
 }));
 put('pestManagement',legacyRows('pest',Array.isArray(record.pest_management)?record.pest_management:management));
 put('diseaseManagement',legacyRows('common_diseases',Array.isArray(record.disease_management)?record.disease_management:management));
 // Placeholder strings from old imports are not database references. Keep
 // the original legacy fields intact and pass only valid IDs to Mongoose.
 const validReference=value=>value!=null&&/^[a-f0-9]{24}$/i.test(String(value?._id??value));
 const referencePaths=['species','plantType','lifecycleInformation.lifecycleType','lifecycleInformation.lifespan','growthInformation.growthRate','growthInformation.plantingDepth','growthInformation.plantSpacing','growingConditionsAndRequirements.soilType','growingConditionsAndRequirements.plantSoilTemp','growingConditionsAndRequirements.wateringRequirements','growingConditionsAndRequirements.lightRequirements','plantingInformation.plantingSeasons'];
 for(const field of referencePaths){
  const parts=field.split('.');const key=parts.pop();const parent=parts.reduce((value,part)=>value?.[part],record);
  if(parent?.[key]!=null&&!validReference(parent[key]))parent[key]=null;
 }
 for(const field of ['vendor','growthInformation.usdaZones','plantingInformation.companionPlants','plantingInformation.coverCrops','plantingInformation.trapCrops','propagationMethods.method']){
  const parts=field.split('.');const key=parts.pop();const parent=parts.reduce((value,part)=>value?.[part],record);
  if(Array.isArray(parent?.[key]))parent[key]=parent[key].filter(validReference);
 }
 record.coverImage=resolveSeedCover(record);
 return record;
}
