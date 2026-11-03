const canonical=new Set(['active','germinating','seedling','transplanted','harvested','failed','dead','archived']);
const sameDate=(a,b)=>!a&&!b||a&&b&&new Date(a).getTime()===new Date(b).getTime();
export function legacyCycleStatus(value){
 const status=String(value||'').trim().toLowerCase();
 if(canonical.has(status))return status;
 if(status==='death')return 'dead';
 if(status==='no germination')return 'failed';
 if(status==='inactive')return 'archived';
 return 'archived';
}
export function canRepairLegacyCycleStatus(record,instance,cycle){
 const originalStatus=cycle.status==='death'?'dead':cycle.status;
 const previousStatus=canonical.has(originalStatus)?originalStatus:'active';
 return String(record.legacyInstanceId)===String(instance._id)&&record.status===previousStatus&&sameDate(record.updatedAt,instance.updatedAt)&&!record.garden&&!record.gardenSection&&!record.notes?.length&&!record.failureReason&&!record.outcomeNotes&&record.instanceName===record.sourceName&&sameDate(record.plantedDate,cycle.date_planted)&&sameDate(record.deathDate,cycle.untimely_death_date);
}
export async function repairLegacyCycleStatuses(db){
 let repaired=0,skipped=0;
 for await(const record of db.collection('plantings').find({legacyInstanceId:{$exists:true}})){
  const instance=await db.collection('plant_instances').findOne({_id:record.legacyInstanceId});
  const cycle=instance?.plantings?.[record.legacyCycleIndex];
  if(!cycle||legacyCycleStatus(cycle.status)===record.status)continue;
  if(!canRepairLegacyCycleStatus(record,instance,cycle)){skipped++;continue;}
  const result=await db.collection('plantings').updateOne({_id:record._id,status:record.status,updatedAt:record.updatedAt},{$set:{status:legacyCycleStatus(cycle.status),...(cycle.status==='no germination'?{failureReason:cycle.status}:{})}});
  repaired+=result.modifiedCount;
 }
 return {repaired,skipped};
}
