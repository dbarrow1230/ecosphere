import {germinationState,germinationDeadline} from "../../src/utils/hydroHistory.js";
const id=value=>String(value?._id||value||"");
const name=value=>value?.plantName||value?.name||"Unknown or Unrecorded";
export function buildHydroReports(runs,entries=[],filters={},now=new Date()){
 const requested=String(filters.runs||"").split(",").filter(Boolean);
 const selected=runs.filter(run=>(!requested.length||requested.includes(id(run)))&&(!filters.from||String(run.startedDate instanceof Date?run.startedDate.toISOString():run.startedDate||"").slice(0,10)>=filters.from)&&(!filters.to||String(run.startedDate instanceof Date?run.startedDate.toISOString():run.startedDate||"").slice(0,10)<=filters.to));
 const rows=[],environment=[],movements=[],notes=[],pairings=[];
 const retryList=[];
 const retriedBy=new Map(runs.flatMap(run=>(run.devices||[]).flatMap(device=>(device.pods||[]).filter(pod=>pod.retryOf).map(pod=>[id(pod.retryOf),{pod:id(pod),run:id(run)}]))));
 for(const entry of entries.filter(entry=>selected.some(run=>id(run)===id(entry.hydroSystem)))){
  for(const note of entry.notes||[])if(note.readings&&Object.keys(note.readings).length)environment.push({run:id(entry.hydroSystem),runName:selected.find(run=>id(run)===id(entry.hydroSystem))?.name,device:id(entry.hydroDevice),pod:id(entry.hydroPod),recordedAt:note.date||null,...note.readings,phLevel:note.readings.ph??null,temperature:note.readings.airTemperature??null,source:`Journal observation ${id(entry)}`});
 }
 for(const run of selected){
  for(const device of run.devices||[]){
   for(const reading of device.readings||[])environment.push({run:id(run),runName:run.name,device:id(device),deviceName:device.name,...reading});
   // Existing current readings are observations, not an invented time series.
   if(!device.readings?.length&&["waterLevel","phLevel","temperature","nutrientsLevel"].some(key=>device[key]!=null))environment.push({run:id(run),runName:run.name,device:id(device),deviceName:device.name,recordedAt:device.lastReadingAt||null,waterLevel:device.waterLevel,phLevel:device.phLevel,temperature:device.temperature,nutrientsLevel:device.nutrientsLevel,source:"Saved latest reading; earlier history unavailable"});
   for(const pod of device.pods||[]){
    if(!pod.seed)continue;
    if(pod.failedAt&&!retriedBy.has(id(pod)))retryList.push({originalRun:id(run),originalPod:id(pod),runName:run.name,seed:id(pod.seed),item:pod.plantedItemName||name(pod.seed),seedCount:pod.seedCount??null,plantedDate:pod.plantedDate,failedAt:pod.failedAt,device:device.name,position:pod.position});
    if(filters.item&&id(pod.seed)!==filters.item)continue;
    if(filters.pod&&id(pod)!==filters.pod)continue;
    const state=germinationState(pod,now);
    if(filters.status&&state!==filters.status)continue;
    const row={run:id(run),runName:run.name,pod:id(pod),device:id(device),deviceName:device.name,seed:id(pod.seed),item:pod.plantedItemName||name(pod.seed),position:pod.position,seedCount:pod.seedCount??null,plantedDate:pod.plantedDate||null,maxGerminationDays:pod.maxGerminationDays??null,deadline:germinationDeadline(pod),state,germinatedAt:pod.germinatedAt||null,failedAt:pod.failedAt||null,removedAt:pod.removedAt||null,retryOf:id(pod.retryOf),retryRun:id(pod.retryRun),retryTo:retriedBy.get(id(pod))?.pod||"",retryTargetRun:retriedBy.get(id(pod))?.run||"",germinationDays:pod.germinatedAt&&pod.plantedDate?(new Date(pod.germinatedAt)-new Date(pod.plantedDate))/86400000:null};
    rows.push(row);
    if(pod.notes)notes.push({run:id(run),runName:run.name,pod:id(pod),device:id(device),position:pod.position,item:row.item,type:"Pod note",text:pod.notes,date:null});
    for(const move of pod.positionHistory||[])movements.push({run:id(run),runName:run.name,pod:id(pod),item:row.item,...move});
   }
  }
  if(run.notes)notes.push({run:id(run),runName:run.name,type:"Run note",text:run.notes,date:null});
  const items=[...new Map((run.devices||[]).flatMap(device=>(device.pods||[]).filter(pod=>pod.seed).map(pod=>[id(pod.seed),pod.plantedItemName||name(pod.seed)]))).values()];
  for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++)pairings.push({run:id(run),runName:run.name,first:items[i],second:items[j],observation:"Recorded in the same run; no causal effect inferred"});
 }
 let filteredRows=rows;
 const numericFilters=[["phMin","phLevel",true],["phMax","phLevel",false],["temperatureMin","temperature",true],["temperatureMax","temperature",false]];
 const environmentalRunIds=new Set(environment.filter(reading=>numericFilters.every(([query,key,min])=>filters[query]==null||filters[query]===""||(reading[key]!=null&&(min?reading[key]>=Number(filters[query]):reading[key]<=Number(filters[query]))))).map(reading=>reading.run));
 if(numericFilters.some(([query])=>filters[query]!=null&&filters[query]!==""))filteredRows=rows.filter(row=>environmentalRunIds.has(row.run));
 const includedRuns=selected.filter(run=>!numericFilters.some(([query])=>filters[query]!=null&&filters[query]!=="")||environmentalRunIds.has(id(run)));
 for(const entry of entries.filter(entry=>includedRuns.some(run=>id(run)===id(entry.hydroSystem)))){
  if(filters.pod&&id(entry.hydroPod)!==filters.pod)continue;
  if(filters.item&&id(entry.seed)!==filters.item)continue;
  notes.push({run:id(entry.hydroSystem),runName:includedRuns.find(run=>id(run)===id(entry.hydroSystem))?.name,pod:id(entry.hydroPod),device:id(entry.hydroDevice),position:entry.hydroPodPosition,journalEntry:id(entry),type:entry.entryType,text:[entry.title,entry.entry,...(entry.notes||[]).map(note=>note.note)].filter(Boolean).join("\n"),date:entry.entryDate,readings:(entry.notes||[]).filter(note=>note.readings).map(note=>({date:note.date,...note.readings})),association:entry.hydroPod?"Pod planting record":"Run-level or legacy position link; no attempt inferred"});
 }
 const summaries=includedRuns.map(run=>{const records=filteredRows.filter(row=>row.run===id(run));const germinated=records.filter(row=>row.state==="Germinated").length,failed=records.filter(row=>row.state==="Failed Germination").length;return {run:id(run),runName:run.name,startedDate:run.startedDate,completedAt:run.completedAt||null,state:run.isActive===false?"Completed":"Active",plantings:records.length,germinated,failed,unresolved:records.length-germinated-failed,confirmedSuccessPercent:germinated+failed?100*germinated/(germinated+failed):null};});
 return {generatedAt:now,filters,runs:summaries,plantings:filteredRows,environment:environment.filter(row=>includedRuns.some(run=>id(run)===row.run)),movements:movements.filter(move=>filteredRows.some(row=>row.pod===id(move.pod))),notes:notes.filter(note=>includedRuns.some(run=>id(run)===note.run)),pairings:pairings.filter(pair=>includedRuns.some(run=>id(run)===pair.run)),retries:retryList.filter(row=>includedRuns.some(run=>id(run)===row.originalRun)),integrity:"Measurements and observations are recorded values. Durations, deadlines, pairing lists and percentages are calculated comparisons. Success percentages use confirmed pod outcomes, not seed counts. Missing values remain unrecorded. No conclusions or causal effects are inferred."};
}
