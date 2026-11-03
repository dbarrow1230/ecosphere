import {legacyJournalFields,repairLegacyJournalCopies} from "./legacyJournalMapping.js";
import mongoose from 'mongoose';
import {legacyCycleStatus,repairLegacyCycleStatuses} from './legacyCycleStatus.js';
import {normalizeLegacySeed} from './normalizeLegacySeed.js';
import {normalizeLegacySpecies,normalizeLegacyPlant,normalizeLegacyTask,fillMissing} from './legacyRecordFields.js';

const text=value=>typeof value==='string'?value:'';
const id=value=>mongoose.isValidObjectId(value)?new mongoose.Types.ObjectId(String(value)):null;
const list=value=>Array.isArray(value)?value:value==null?[]:[value];
const temperatureRange=value=>{const numbers=String(value||'').match(/-?\d+(?:\.\d+)?/g)?.map(Number)||[];return numbers.length>=2?{min:numbers[0],max:numbers[1]}:undefined;};
const date=value=>value&&!Number.isNaN(new Date(value).getTime())?new Date(value):null;

// Copy records into current model collections with the SAME IDs. Original
// collections remain intact, and reruns never overwrite current or edited rows.
export const legacyCollectionRules=[
 ['species_families','families',r=>({name:r.name})],
 ['species_genera','genus',r=>({name:r.name,family:id(r.familyId)})],
 ['life_cycle','life_cycles',r=>({name:r.cycle_type})],
 ['plant_spacing','plant_spacings',r=>({label:r.space})],
 ['plant_waterings','watering_requirements',r=>({name:r.habit,frequency:r.frequency})],
 ['plant_soil','soil_types',r=>({name:r.soil})],
 ['plant_lighting','lighting',r=>({name:r.lightingtype})],
 ['sunlight','sunlight_requirements',r=>({name:r.name||r.sunlight||r.sunlight_type})],
 ['plant_pests','pests',r=>({name:r.pestName})],
 ['plant_pest_controls','pest_ref_treatments',r=>({name:r.pest_control_solution})],
 ['plant_fertilizer_types','fertilizer_types',r=>({name:r.fertilizer_type,description:r.fertilizer_category})],
 ['hardiness_zones','usda_zones',r=>({zone:r.zone,region:r.region,states:r.states,temperatureRange:{fahrenheit:temperatureRange(r.tempF),celsius:temperatureRange(r.tempC)},description:[r.tempF,r.tempC].filter(Boolean).join(' / ')})],
 ['plant_equipment_vendors','equipment_vendors',r=>({name:r.name,contactName:r.contactperson||'',address1:r.address||'',postalCode:r.zip||'',state:id(r.state_id),country:id(r.country)})],
 ['plant_equipment','equipment',r=>({name:r.name||r.brand||r.description,description:r.description,vendor:id(r.vendorid),purchasePrice:r.price,purchaseDate:date(r.purchaseDate)})],
 ['garden_overview','gardens',r=>({name:r.name,notes:[...list(r.description),...list(r.purpose),...list(r.reason),...list(r.notes)].filter(Boolean).map(note=>({note:String(note)}))})],
 ['budgets','garden_budgets',r=>({name:r.description,description:r.description,year:date(r.date)?.getUTCFullYear()??null,quantity:1,unitCost:r.amount,totalCost:r.amount})],
 ['planting_log','plantings',r=>({instanceName:r.plant_name,sourceName:r.plant_name,seed:id(r.seed_id),sourceType:r.seed_id?'seed':'',plantedDate:date(r.date),notes:text(r.notes)?[{note:r.notes}]:[]})],
 ['plant_harvest','harvests',r=>({planting:id(r.plant_instance_id),harvestDate:date(r.harvest_date),harvestQuantity:r.quantity,quantityUnit:r.unit,storeUnitValue:r.price_per_unit,pricingSnapshot:r.total_value!=null?{totalValue:r.total_value}:undefined})],
 ['plant_monitoring','observations',r=>({name:r.growth_stage||r.health_status,planting:id(r.plant_instance_id),observedAt:date(r.date),observationType:'growth',details:[r.health_status,r.height_cm!=null?`Height: ${r.height_cm} cm`:'',r.leaves_count!=null?`Leaves: ${r.leaves_count}`:'',r.notes].filter(Boolean).join('\n'),notes:[]})],
 ['maintenance_log','journal_entries',r=>({title:r.title,entry:r.notes||'',entryType:'maintenance',maintenanceType:r.type,entryDate:date(r.date),followUpDate:date(r.nextDueDate),outcome:r.completed?'completed':'planned',notes:[]})],
 ['plant_journals','journal_entries',r=>({...legacyJournalFields(r),planting:id(r.plant_instance_id),legacyJournalMappingVersion:3})]
];

export async function migrateLegacyJournalData(db=mongoose.connection){
 const results=[];
 // Each legacy growing instance can contain multiple cycles. Keep the source ID
 // for its first cycle so existing references remain resolvable; Mongo supplies
 // IDs for subsequent cycles, keyed by source and index for safe reruns.
 let runsCopied=0;
 for await(const instance of db.collection('plant_instances').find({})){
  const cycles=Array.isArray(instance.plantings)?instance.plantings:[];
  const sourceCollection=instance.sourceModel==='Plant'||instance.sourceModel==='Plants'?'plants':'seeds';
  const source=id(instance.source_id)?await db.collection(sourceCollection).findOne({_id:id(instance.source_id)}):null;
  const sourceName=source?.plantName||source?.name||source?.plant_name||'';
  for(const [index,cycle] of cycles.entries()){
   const sourceType=sourceCollection==='plants'?'plant':'seed';
   const location=id(cycle.location_id)?await db.collection('locations').findOne({_id:id(cycle.location_id)}):null;
   const status=legacyCycleStatus(cycle.status);
   const query=index===0?{_id:instance._id}:{legacyInstanceId:instance._id,legacyCycleIndex:index};
   const document={legacyInstanceId:instance._id,legacyCycleIndex:index,sourceName,instanceName:sourceName,sourceType,[sourceType]:id(instance.source_id),
    plantedDate:date(cycle.date_planted),deathDate:date(cycle.untimely_death_date),endDate:date(cycle.untimely_death_date),
    status,
    location:location?.name||location?.location_name||'',isActive:true,createdAt:instance.createdAt,updatedAt:instance.updatedAt};
   const result=await db.collection('plantings').updateOne(query,{$setOnInsert:document},{upsert:true});
   runsCopied+=result.upsertedCount||0;
  }
 }
 results.push({source:'plant_instances',target:'plantings',copied:runsCopied});
 await repairLegacyCycleStatuses(db);
 for(const [source,target,convert] of legacyCollectionRules){
  let copied=0;
  for await(const record of db.collection(source).find({})){
   const fields=convert(record);
   const document={...record,...Object.fromEntries(Object.entries(fields).filter(([,value])=>value!==undefined))};
   const result=await db.collection(target).updateOne({_id:record._id},{$setOnInsert:document},{upsert:true});
   copied+=result.upsertedCount||0;
  }
  results.push({source,target,copied});
 }
 // Canonical fields must also be stored for lean queries and DB-side filters.
 // Each write is conditional on that field still being absent, including races.
 const sameCollection=[['seeds',normalizeLegacySeed],['species',normalizeLegacySpecies],['plants',normalizeLegacyPlant],['tasks',normalizeLegacyTask],
  ['plant_types',r=>fillMissing(r,{name:r.type_name})],['growth_rates',r=>fillMissing(r,{name:r.growth_rate})],
  ['planting_depths',r=>fillMissing(r,{label:r.depth||r.description})],
  ['seed_vendors',r=>fillMissing(r,{address1:r.address,state:id(r.state_id),postalCode:r.zip||r.postal_code,phone:r.retail_customer_service_phone||r.wholesale_customer_service_phone,email:r.email_retail||r.email_customer_service})]
 ];
 for(const [collection,normalize] of sameCollection){
  for await(const record of db.collection(collection).find({})){
   const existingKeys=new Set(Object.keys(record));
   normalize(record);
   for(const [key,value] of Object.entries(record)){
    if(existingKeys.has(key)||value===undefined)continue;
    await db.collection(collection).updateOne({_id:record._id,[key]:{$exists:false}},{$set:{[key]:value}});
   }
  }
 }
 const journalRepair=await repairLegacyJournalCopies(db);
 if(journalRepair.repaired)console.log(`Recovered original content and dates for ${journalRepair.repaired} journal entries`);
 const count=results.reduce((total,result)=>total+result.copied,0);
 if(count)console.log(`Restored ${count} legacy gardening records into current model collections`);
 return results;
}
