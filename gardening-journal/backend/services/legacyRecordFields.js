// Map only fields absent from the current document; never replace user edits.
export function fillMissing(record, fields){
 for(const [key,value] of Object.entries(fields))if(record[key]===undefined&&value!==undefined)record[key]=value;
 return record;
}
export function normalizeLegacySpecies(record){
 return fillMissing(record,{family:record.familyId,genus:record.genusId,botanicalName:record.botanical_name,commonName:Array.isArray(record.common_names)?record.common_names.join(', '):record.common_names});
}
export function normalizeLegacyPlant(record){
 const hours=record.SunExposureTime==null||record.SunExposureTime===''?null:Number(record.SunExposureTime);
 fillMissing(record,{name:record.plant_name,seed:/^[a-f0-9]{24}$/i.test(String(record.SeedID||''))?record.SeedID:undefined,type:/^[a-f0-9]{24}$/i.test(String(record.plant_type_id||''))?record.plant_type_id:undefined,isActive:record.active,description:record.GrowthProblems,careCard:{lifespan:record.PlantLifespan||'',sunExposure:record.SunExposureTime?`${record.SunExposureTime} hours`:'',careNotes:record.GrowthProblems||''}});
 if(record.DatePlanted!==undefined||record.SunDirection!==undefined){
  fillMissing(record,{plantingRecord:{plantedDate:record.DatePlanted||null,deathDate:record.UntimelyDeathDate||null,indoors:record.indoors??null,outdoors:record.outdoors??null,sunDirection:record.SunDirection||'',sunExposureHours:Number.isFinite(hours)?hours:null,batchNumber:record.batch_number||'',location:record.location_name||''}});
  record.growingConditions??={};
  fillMissing(record.growingConditions,{sunlight:[record.SunDirection,Number.isFinite(hours)&&hours!==null?`${hours} hours`:''].filter(Boolean).join(' · ')});
 }
 return record;
}
export function normalizeLegacyTask(record){
 return fillMissing(record,{name:record.task_name,dueDate:record.due_date,status:record.is_completed===undefined?undefined:record.is_completed?'completed':'pending'});
}

export function normalizeLegacyJournalEntry(record){
 const notes=Array.isArray(record.notes)?record.notes:record.notes==null?[]:[record.notes];
 record.notes=notes.filter(note=>note!=null).map(note=>typeof note==='string'?{note,date:record.entryDate||record.journal_date}:({...note,date:note.date||note.note_date||record.entryDate||record.journal_date}));
 return record;
}
