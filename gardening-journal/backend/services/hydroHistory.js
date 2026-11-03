import mongoose from "mongoose";
import {germinationDeadline,hydroPodActive} from "../../src/utils/hydroHistory.js";
const id=value=>String(value?._id||value||"");
export function hydroError(message,status=400){return Object.assign(new Error(message),{status});}
export function locatePod(run,podId){
 for(const device of run.devices||[]){const pod=(device.pods||[]).find(item=>id(item)===String(podId));if(pod)return {device,pod};}
 throw hydroError("Pod planting does not belong to this run",404);
}
export function vacantPosition(run,deviceId,position){
 const device=run.devices.find(item=>id(item)===String(deviceId)&&item.isActive!==false);
 position=Number(position);
 if(!device||!Number.isInteger(position)||position<1||position>device.podCount)throw hydroError("Destination is outside the device layout");
 if(device.pods.some(pod=>hydroPodActive(pod)&&pod.position===position))throw hydroError("Destination position is occupied",409);
 return device;
}
export function plantHydroPod(run,data,seed,now=new Date()){
 if(run.isActive===false)throw hydroError("Completed runs are read-only",409);
 const count=Number(data.seedCount);
 if(!Number.isInteger(count)||count<=0)throw hydroError("Seeds planted must be a positive integer");
 const plantedDate=new Date(data.plantedDate);
 if(!data.plantedDate||Number.isNaN(plantedDate.getTime())||plantedDate>now)throw hydroError("A valid planting start date, no later than now, is required");
 const maximum=data.maxGerminationDays==null||data.maxGerminationDays===""?seed?.growthInformation?.germinationTime?.max:Number(data.maxGerminationDays);
 if(maximum!=null&&(!Number.isInteger(Number(maximum))||Number(maximum)<0))throw hydroError("Maximum germination days must be a nonnegative integer");
 const device=vacantPosition(run,data.deviceId,data.position);
 const pod={_id:new mongoose.Types.ObjectId(),position:Number(data.position),label:String(data.label||`Pod ${data.position}`),seed:seed._id,seedCount:count,plantedDate,maxGerminationDays:maximum??null,germinationStatus:"awaiting",notes:String(data.notes||""),positionHistory:[]};
 device.pods.push(pod);
 pod.plantedItemName=String(seed.plantName||seed.name||"");
 return pod;
}
export function changeHydroPod(run,podId,action,data={},now=new Date()){
 if(run.isActive===false)throw hydroError("Completed runs are read-only",409);
 const {device,pod}=locatePod(run,podId);
 // A duplicate confirmation returns the original event, without a new timestamp.
 if(action==="fail"&&pod.germinationStatus==="failed")return pod;
 if(!hydroPodActive(pod))throw hydroError("This planting is no longer active",409);
 if(action==="move"){
  if(device.isActive===false)throw hydroError("Removed devices cannot supply active pod movements",409);
  const destination=vacantPosition(run,data.deviceId,data.position);
  pod.positionHistory??=[];
  pod.positionHistory.push({fromDevice:device._id,from:pod.position,toDevice:destination._id,to:Number(data.position),at:now});
  pod.position=Number(data.position);
  if(id(destination)!==id(device)){
   device.pods=device.pods.filter(item=>id(item)!==id(pod));
   destination.pods.push(pod);
  }
 }else if(action==="germinate"){
  if(pod.germinationStatus==="germinated")return pod;
  const at=data.germinatedAt?new Date(data.germinatedAt):now;
  if(Number.isNaN(at.getTime())||at<new Date(pod.plantedDate)||at>now)throw hydroError("Germination time must fall between planting and now");
  pod.germinationStatus="germinated";pod.germinatedAt=at;
 }else if(action==="fail"){
  const deadline=germinationDeadline(pod);
  if(pod.germinationStatus==="germinated"||!deadline||now<deadline)throw hydroError("Failure requires an overdue planting without recorded germination",409);
  pod.germinationStatus="failed";pod.failedAt=now;pod.removedAt=now;
 }else if(action==="remove"){
  pod.removedAt=now;
 }else if(action==="notes"){
  pod.notes=String(data.notes??pod.notes??"");pod.label=String(data.label??pod.label??"");
 }else throw hydroError("Unsupported pod action");
 return pod;
}

export function linkHydroRetry(original,target,data,seed,now=new Date()){
 if(id(original)===id(target))throw hydroError("A retry requires a new run");
 const {pod:failed}=locatePod(original,data.originalPod);
 if(failed.germinationStatus!=="failed"||!failed.failedAt)throw hydroError("Only confirmed failures can be retried",409);
 if(target.devices.some(device=>device.pods.some(pod=>id(pod.retryOf)===id(failed))))throw hydroError("This failed attempt has already been retried",409);
 const retry=plantHydroPod(target,data,seed,now);
 retry.retryOf=failed._id;retry.retryRun=original._id;
 return retry;
}

// Metadata forms cannot replace planting attempts or erase removed devices.
export function retainHydroHistory(previous,nextDevices){
 const priorDevices=previous.devices||[];
 const result=nextDevices.map(incoming=>{
  const saved=priorDevices.find(item=>id(item)===id(incoming));
  if(!saved){
   if(incoming.pods?.some(pod=>pod.seed))throw hydroError("Plant seeds using the pod planting action");
   return {...incoming,pods:[]};
  }
  for(const pod of incoming.pods||[]){
   const original=(saved.pods||[]).find(item=>(pod._id&&id(item)===id(pod))||(!pod._id&&item.position===pod.position&&hydroPodActive(item)));
   if(pod.seed&&(!original||id(pod.seed)!==id(original.seed)))throw hydroError("Change assignments using the pod planting actions");
  }
  if(saved.pods.some(pod=>hydroPodActive(pod)&&pod.position>incoming.podCount))throw hydroError("Move or remove occupied pods before reducing device capacity");
  const readings=[...(saved.readings||[])];
  if(!readings.length&&saved.lastReadingAt)readings.push({recordedAt:saved.lastReadingAt,...Object.fromEntries(["waterLevel","phLevel","temperature","nutrientsLevel"].map(key=>[key,saved[key]??null]))});
  if(incoming.lastReadingAt){
   const reading={recordedAt:new Date(incoming.lastReadingAt),...Object.fromEntries(["waterLevel","phLevel","temperature","nutrientsLevel"].map(key=>[key,incoming[key]??null]))};
   const latest=readings.at(-1);
   if(!latest||Object.keys(reading).some(key=>String(latest[key])!==String(reading[key])))readings.push(reading);
  }
  return {...incoming,isActive:saved.isActive,pods:saved.pods,readings};
 });
 for(const saved of priorDevices)if(!result.some(item=>id(item)===id(saved)))result.push({...saved,isActive:false});
 return result;
}
