import mongoose from "mongoose";
import "../../models/equipment/equipmentModel.js";
import "../../models/vendors/equipmentVendorModel.js";
import "../../models/seeds/seedModel.js";
import "../../models/gardens/gardenModel.js";
import HydroSystem from "../../models/hydroponics/hydroSystemModel.js";

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
 return Math.max(0,Math.min(200,count));
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

 const incomingDevices=Array.isArray(data.devices)&&data.devices.length
  ?data.devices
  :[legacyDeviceFromSystem(data)];

 return incomingDevices
  .map(device=>{
   const deviceId=cleanObjectId(device._id);
   const existing=deviceId ? existingMap.get(String(deviceId)) : null;
   return cleanDevice(device,existing?.pods||[]);
  })
  .filter(device=>device.name&&device.podCount);
};

const cleanHydroSystemPayload=(data={},existingDevices=[],existingGarden=null)=>{
 const devices=cleanDevices(data,existingDevices);
 const primaryDevice=devices[0]||{};

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

const populateHydroSystem=query=>{
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
  return res.status(500).json({message:error.message});
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
  return res.status(500).json({message:error.message});
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
  return res.status(500).json({message:error.message});
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

  const data=cleanHydroSystemPayload(req.body,system.devices,system.garden);

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
  return res.status(500).json({message:error.message});
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

  const nextDevices=cleanDevices(req.body,system.devices);

  if(!nextDevices.length){
   return res.status(400).json({message:"At least one device with pods is required"});
  }

  system.devices=nextDevices;
  system.podCount=nextDevices.reduce((total,device)=>total+Number(device.podCount||0),0);
  system.pods=nextDevices[0]?.pods||[];
  system.lightType=normalizeLightType(system.lightType)||nextDevices[0]?.lightType||"";

  const updated=await system.save();
  const populated=await populateHydroSystem(HydroSystem.findById(updated._id));

  return res.status(200).json(populated);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const deleteHydroSystem=async(req,res)=>{
 try{
  const id=cleanObjectId(req.params.id);

  if(!id){
   return res.status(400).json({message:"Invalid hydro run id"});
  }

  const deleted=await HydroSystem.findByIdAndDelete(id);

  if(!deleted){
   return res.status(404).json({message:"Hydro run not found"});
  }

  return res.status(200).json({message:"Hydro run deleted successfully"});
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};
