import mongoose from "mongoose";
import "../../models/equipment/equipmentModel.js";
import "../../models/vendors/equipmentVendorModel.js";
import "../../models/seeds/seedModel.js";
import "../../models/gardens/gardenModel.js";
import HydroSystem from "../../models/hydroponics/hydroSystemModel.js";
import Seed from "../../models/seeds/seedModel.js";
import JournalEntry from "../../models/journal/journalEntryModel.js";
import {changeHydroPod,plantHydroPod,retainHydroHistory,locatePod,linkHydroRetry,hydroError} from "../../services/hydroHistory.js";
import {hydroPodActive} from "../../../src/utils/hydroHistory.js";
import {buildHydroReports} from "../../services/hydroReports.js";

const lightTypes=["","led","full-spectrum","white","red-blue","warm-white","cool-white","sunlike","none","other"];

const normalizeLightType=value=>{
 const lightType=cleanString(value).toLowerCase();

 if(lightType==="led")return "led";
 if(lightType==="full spectrum"||lightType==="full_spectrum")return "full-spectrum";
 if(lightType==="red/blue"||lightType==="red blue"||lightType==="red_blue")return "red-blue";
 if(lightType==="warm white"||lightType==="warm_white")return "warm-white";
 if(lightType==="cool white"||lightType==="cool_white")return "cool-white";

 return lightType;
};

const cleanString=value=>{
 return value===undefined||value===null ? "" : String(value).trim();
};

const cleanNumber=value=>{
 const number=Number(value);
 return Number.isFinite(number)&&number>0 ? number : 0;
};

const cleanReading=value=>{
 if(value===""||value===null||value===undefined)return null;
 const number=Number(value);
 return Number.isFinite(number)?number:null;
};

const cleanObjectId=value=>{
 if(!value)return null;
 if(typeof value==="string")return mongoose.Types.ObjectId.isValid(value) ? value : null;
 if(value instanceof mongoose.Types.ObjectId)return value;

 if(typeof value==="object"){
  if(typeof value.$oid==="string")return mongoose.Types.ObjectId.isValid(value.$oid) ? value.$oid : null;
  if(typeof value._id==="string")return mongoose.Types.ObjectId.isValid(value._id) ? value._id : null;
  if(typeof value.id==="string")return mongoose.Types.ObjectId.isValid(value.id) ? value.id : null;
  if(typeof value._id?.$oid==="string")return mongoose.Types.ObjectId.isValid(value._id.$oid) ? value._id.$oid : null;
  if(typeof value.id?.$oid==="string")return mongoose.Types.ObjectId.isValid(value.id.$oid) ? value.id.$oid : null;
  if(typeof value.toString==="function"&&mongoose.Types.ObjectId.isValid(value.toString()))return value.toString();
 }

 return null;
};

const cleanDate=value=>{
 if(!value)return null;
 const date=new Date(value);
 return Number.isNaN(date.getTime()) ? null : date;
};

const normalizePodCount=value=>{
 const count=cleanNumber(value);
 return Math.max(0,Math.min(200,Math.floor(count)));
};

const buildPods=(podCount,currentPods=[])=>{
 const currentMap=new Map(
  currentPods
   .filter(pod=>Number.isFinite(Number(pod.position)))
   .map(pod=>[Number(pod.position),pod])
 );

 return Array.from({length:podCount},(_,index)=>{
  const position=index+1;
  const current=currentMap.get(position)||{};

  return {
   position,
   label:cleanString(current.label)||`Pod ${position}`,
   seed:cleanObjectId(current.seed),
   plantedDate:cleanDate(current.plantedDate),
   notes:cleanString(current.notes)
  };
 });
};

const cleanDevice=(data={},existingPods=[])=>{
 const podCount=normalizePodCount(data.podCount);
 const lightType=normalizeLightType(data.lightType);

 return {
  _id:cleanObjectId(data._id)||new mongoose.Types.ObjectId(),
  equipment:cleanObjectId(data.equipment),
  name:cleanString(data.name),
  systemType:cleanString(data.systemType)||"hydroponic",
  brand:cleanString(data.brand),
  model:cleanString(data.model),
  serialNumber:cleanString(data.serialNumber),
  productUrl:cleanString(data.productUrl),
  location:cleanString(data.location),
  podCount,
  reservoirCapacity:cleanString(data.reservoirCapacity),
  lightType:lightTypes.includes(lightType) ? lightType : "",
  pumpType:cleanString(data.pumpType),
  waterLevel:cleanReading(data.waterLevel),
  phLevel:cleanReading(data.phLevel),
  temperature:cleanReading(data.temperature),
  nutrientsLevel:cleanReading(data.nutrientsLevel),
  lastReadingAt:cleanDate(data.lastReadingAt),
  notes:cleanString(data.notes),
  pods:buildPods(podCount,Array.isArray(data.pods)?data.pods:existingPods)
 };
};

const legacyDeviceFromSystem=data=>{
 return cleanDevice({
  name:data.deviceName||data.name,
  systemType:data.systemType,
  equipment:data.equipment,
  brand:data.brand,
  model:data.model,
  serialNumber:data.serialNumber,
  productUrl:data.productUrl,
  location:data.location,
  podCount:data.podCount,
  reservoirCapacity:data.reservoirCapacity,
  lightType:data.lightType,
  pumpType:data.pumpType,
  notes:data.deviceNotes||data.notes,
  pods:data.pods
 });
};

const cleanDevices=(data={},existingDevices=[])=>{
 const existingMap=new Map(
  existingDevices
   .filter(device=>cleanObjectId(device._id))
   .map(device=>[String(cleanObjectId(device._id)),device])
 );

 const incomingDevices=Array.isArray(data.devices)
  ?data.devices
  :existingDevices.length?existingDevices:[legacyDeviceFromSystem(data)];

 return incomingDevices
  .map(device=>{
   const deviceId=cleanObjectId(device._id);
   const existing=deviceId ? existingMap.get(String(deviceId)) : null;
   const saved=existing?.toObject?existing.toObject():existing||{};
   const merged={...saved,...device};
   if(Array.isArray(device.pods)&&device.pods.length){
    const byPosition=new Map((saved.pods||[]).map(pod=>[Number(pod.position),pod]));
    for(const pod of device.pods)byPosition.set(Number(pod.position),{...byPosition.get(Number(pod.position)),...pod});
    merged.pods=[...byPosition.values()];
   }
   return cleanDevice(merged,saved.pods||[]);
  })
  .filter(device=>device.name);
};

export const cleanHydroSystemPayload=(data={},existingDevices=[],existingGarden=null,existingSystem={})=>{
 const devices=cleanDevices(data,existingDevices);
 const primaryDevice=devices[0]||{};
 data={...existingSystem,...data};

 return {
 name:cleanString(data.name),
  garden:data.garden!==undefined?cleanObjectId(data.garden):cleanObjectId(existingGarden),
  systemType:cleanString(data.systemType)||primaryDevice.systemType||"hydroponic",
  brand:cleanString(data.brand)||primaryDevice.brand||"",
  model:cleanString(data.model)||primaryDevice.model||"",
  serialNumber:cleanString(data.serialNumber)||primaryDevice.serialNumber||"",
  productUrl:cleanString(data.productUrl)||primaryDevice.productUrl||"",
  location:cleanString(data.location)||primaryDevice.location||"",
  startedDate:cleanDate(data.startedDate),
  podCount:devices.reduce((total,device)=>total+Number(device.podCount||0),0),
  reservoirCapacity:cleanString(data.reservoirCapacity)||primaryDevice.reservoirCapacity||"",
  lightType:normalizeLightType(data.lightType)||primaryDevice.lightType||"",
  pumpType:cleanString(data.pumpType)||primaryDevice.pumpType||"",
  notes:cleanString(data.notes),
  pods:primaryDevice.pods||[],
  devices,
  isActive:data.isActive!==undefined ? !!data.isActive : true
 };
};

export const populateHydroSystem=query=>{
 return query
  .populate("pods.seed")
  .populate({
   path:"devices.equipment",
   populate:{path:"vendor",model:"EquipmentVendor"}
  })
 .populate("devices.pods.seed")
  .populate("garden","name gardenType isActive")
  .populate("createdBy","username email");
};

export const createHydroSystem=async(req,res)=>{
 try{
  const data=cleanHydroSystemPayload(req.body);
  if(data.devices.some(device=>device.pods.some(pod=>pod.seed)))throw hydroError("Create the run first, then plant pods with their seed quantities");

  if(!data.name){
   return res.status(400).json({message:"Hydro run name is required"});
  }

  if(!data.devices.length){
   return res.status(400).json({message:"At least one device with pods is required"});
  }

  const createdBy=cleanObjectId(req.body.createdBy||req.user?._id||req.user?.id);

  const system=new HydroSystem({
   ...data,
   createdBy
  });

  const saved=await system.save();
  const populated=await populateHydroSystem(HydroSystem.findById(saved._id));

  return res.status(201).json(populated);
 }catch(error){
  return historyError(res,error);
 }
};

export const getHydroSystems=async(req,res)=>{
 try{
  const query={};

  if(req.query.systemType)query.systemType=req.query.systemType;
  if(req.query.garden){
   const garden=cleanObjectId(req.query.garden);
   if(!garden)return res.status(400).json({message:"Invalid garden id"});
   query.garden=garden;
  }
  if(req.query.createdBy){
   const createdBy=cleanObjectId(req.query.createdBy);
   if(!createdBy)return res.status(400).json({message:"Invalid createdBy id"});
   query.createdBy=createdBy;
  }
  if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

  if(req.query.search){
   query.$or=[
    {name:{$regex:req.query.search,$options:"i"}},
    {brand:{$regex:req.query.search,$options:"i"}},
    {model:{$regex:req.query.search,$options:"i"}},
    {location:{$regex:req.query.search,$options:"i"}},
    {"devices.name":{$regex:req.query.search,$options:"i"}},
    {"devices.brand":{$regex:req.query.search,$options:"i"}},
    {"devices.model":{$regex:req.query.search,$options:"i"}}
   ];
  }

  const systems=await populateHydroSystem(HydroSystem.find(query)).sort({startedDate:-1,systemType:1,name:1});

  return res.status(200).json(systems);
 }catch(error){
  return historyError(res,error);
 }
};

export const getHydroSystemById=async(req,res)=>{
 try{
  const id=cleanObjectId(req.params.id);

  if(!id){
   return res.status(400).json({message:"Invalid hydro run id"});
  }

  const system=await populateHydroSystem(HydroSystem.findById(id));

  if(!system){
   return res.status(404).json({message:"Hydro run not found"});
  }

  return res.status(200).json(system);
 }catch(error){
  return historyError(res,error);
 }
};

export const updateHydroSystem=async(req,res)=>{
 try{
  const id=cleanObjectId(req.params.id);

  if(!id){
   return res.status(400).json({message:"Invalid hydro run id"});
  }

  const system=await HydroSystem.findById(id);

  if(!system){
   return res.status(404).json({message:"Hydro run not found"});
  }

  const data=cleanHydroSystemPayload(req.body,system.devices,system.garden,system.toObject());
  if(system.isActive===false)throw hydroError("Completed runs are read-only",409);
  data.devices=retainHydroHistory(system.toObject(),data.devices);
  data.pods=data.devices.find(device=>device.isActive!==false)?.pods||[];
  data.podCount=data.devices.filter(device=>device.isActive!==false).reduce((total,device)=>total+device.podCount,0);

  if(!data.name){
   return res.status(400).json({message:"Hydro run name is required"});
  }

  if(!data.devices.length){
   return res.status(400).json({message:"At least one device with pods is required"});
  }

  Object.keys(data).forEach(key=>{
   system[key]=data[key];
  });

  const updated=await system.save();
  const populated=await populateHydroSystem(HydroSystem.findById(updated._id));

  return res.status(200).json(populated);
 }catch(error){
  return historyError(res,error);
 }
};

export const updateHydroSystemPods=async(req,res)=>{
 try{
  const id=cleanObjectId(req.params.id);

  if(!id){
   return res.status(400).json({message:"Invalid hydro run id"});
  }

  const system=await HydroSystem.findById(id);

  if(!system){
   return res.status(404).json({message:"Hydro run not found"});
  }

  if(system.isActive===false)throw hydroError("Completed runs are read-only",409);
  const nextDevices=retainHydroHistory(system.toObject(),cleanDevices(req.body,system.devices));

  if(!nextDevices.length){
   return res.status(400).json({message:"At least one device with pods is required"});
  }

  system.devices=nextDevices;
  system.podCount=nextDevices.filter(device=>device.isActive!==false).reduce((total,device)=>total+Number(device.podCount||0),0);
  system.pods=nextDevices.find(device=>device.isActive!==false)?.pods||[];
  system.lightType=normalizeLightType(system.lightType)||nextDevices[0]?.lightType||"";

  const updated=await system.save();
  const populated=await populateHydroSystem(HydroSystem.findById(updated._id));

  return res.status(200).json(populated);
 }catch(error){
  return historyError(res,error);
 }
};

export const deleteHydroSystem=async(req,res)=>{
 try{
  const id=cleanObjectId(req.params.id);

  if(!id){
   return res.status(400).json({message:"Invalid hydro run id"});
  }

  const deleted=await HydroSystem.findById(id);

  if(!deleted){
   return res.status(404).json({message:"Hydro run not found"});
  }

  if(deleted.isActive!==false){deleted.isActive=false;deleted.completedAt=new Date();await deleted.save();}

  return res.status(200).json({message:"Run completed; historical records retained",id:String(deleted._id)});
 }catch(error){
  return historyError(res,error);
 }
};

const historyError=(res,error)=>res.status(error.name==="VersionError"||error.code===11000?409:error.status||(error.name==="ValidationError"?400:500)).json({message:error.name==="VersionError"?"The run changed. Reload it before trying again.":error.code===11000?"This failed planting has already been retried.":error.message});
const loadHistoryRun=async(id,version,session)=>{
 if(!mongoose.isValidObjectId(id))throw hydroError("Invalid run id");
 const run=await HydroSystem.findById(id).session(session||null);
 if(!run)throw hydroError("Run not found",404);
 if(version!==undefined&&Number(version)!==Number(run.__v||0))throw hydroError("The run changed. Reload it before trying again.",409);
 return run;
};
export const createHydroPod=async(req,res)=>{
 try{
  const run=await loadHistoryRun(req.params.id,req.body.version);
  if(!mongoose.isValidObjectId(req.body.seed))throw hydroError("A valid seed is required");
  const seed=await Seed.findById(req.body.seed);
  if(!seed)throw hydroError("Seed not found",404);
  const data=run.toObject();plantHydroPod(data,req.body,seed);
  run.devices=data.devices;run.pods=data.devices[0]?.pods||[];
  await run.save();
  res.status(201).json(await populateHydroSystem(HydroSystem.findById(run._id)));
 }catch(error){return historyError(res,error);}
};
export const changeHydroPodRecord=async(req,res)=>{
 try{
  const run=await loadHistoryRun(req.params.id,req.body.version);
  const data=run.toObject();
  if(req.params.podId==="all"&&req.params.action==="remove-all"){
   if(data.isActive===false)throw hydroError("Completed runs are read-only",409);
   const now=new Date();
   for(const device of data.devices)for(const pod of device.pods)if(hydroPodActive(pod))changeHydroPod(data,String(pod._id),"remove",{},now);
  }else changeHydroPod(data,req.params.podId,req.params.action,req.body);
  run.devices=data.devices;run.pods=data.devices[0]?.pods||[];
  await run.save();
  res.json(await populateHydroSystem(HydroSystem.findById(run._id)));
 }catch(error){return historyError(res,error);}
};
export const retryHydroPod=async(req,res)=>{
 try{
   if(String(req.body.originalRun)===req.params.id)throw hydroError("A retry requires a new run");
   const original=await loadHistoryRun(req.body.originalRun);
   const originalData=original.toObject();
   const {pod:failed}=locatePod(originalData,req.body.originalPod);
   if(failed.germinationStatus!=="failed"||!failed.failedAt)throw hydroError("Only confirmed failures can be retried",409);
   const target=await loadHistoryRun(req.params.id,req.body.version);
   const seed=await Seed.findById(failed.seed);
   if(!seed)throw hydroError("Original seed is unavailable",404);
   const targetData=target.toObject();
   linkHydroRetry(originalData,targetData,req.body,seed);
   target.devices=targetData.devices;target.pods=targetData.devices[0]?.pods||[];
   // Do not commit the retry unless its cross-run uniqueness constraint exists.
   // A single document stores both the new attempt and its indexed source link.
   await HydroSystem.collection.createIndex({retryClaims:1},{name:"unique_hydro_retry_source",unique:true,partialFilterExpression:{"retryClaims.0":{$exists:true}}});
   await target.save();
  res.status(201).json(await populateHydroSystem(HydroSystem.findById(req.params.id)));
 }catch(error){return historyError(res,error);}
};
export const getHydroReports=async(req,res)=>{
 try{
  const runs=await populateHydroSystem(HydroSystem.find({}));
  const entries=await JournalEntry.find({hydroSystem:{$in:runs.map(run=>run._id)}}).sort({entryDate:1}).lean();
  res.json(buildHydroReports(runs.map(run=>run.toObject()),entries,req.query));
 }catch(error){return historyError(res,error);}
};
