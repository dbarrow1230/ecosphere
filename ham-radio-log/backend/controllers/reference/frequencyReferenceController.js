import FrequencyReference from "../../models/reference/frequencyReferenceModel.js";

const getBusiness=req=>req.query.business||req.body.business||req.params.business;

const cleanAliases=value=>{
 if(Array.isArray(value))return value.map(item=>String(item||"").trim()).filter(Boolean);
 return String(value||"").split(",").map(item=>item.trim()).filter(Boolean);
};

const toNumberOrUndefined=value=>{
 if(value===""||value===null||value===undefined)return undefined;
 const numberValue=Number(value);
 return Number.isFinite(numberValue)?numberValue:undefined;
};

const buildPayload=body=>({
 business:body.business,
 service:String(body.service||"").trim(),
 band:String(body.band||"").trim(),
 channel:String(body.channel||"").trim(),
 frequency:String(body.frequency||"").trim(),
 frequencyMHz:toNumberOrUndefined(body.frequencyMHz),
 frequencyRangeStartMHz:toNumberOrUndefined(body.frequencyRangeStartMHz),
 frequencyRangeEndMHz:toNumberOrUndefined(body.frequencyRangeEndMHz),
 mode:String(body.mode||"").trim(),
 bandwidth:String(body.bandwidth||"").trim(),
 usage:String(body.usage||"").trim(),
 description:String(body.description||"").trim(),
 licenseRequired:body.licenseRequired===true,
 powerLimit:String(body.powerLimit||"").trim(),
 region:String(body.region||"United States").trim(),
 notes:String(body.notes||"").trim(),
 sourceName:String(body.sourceName||"").trim(),
 sourceUrl:String(body.sourceUrl||"").trim(),
 aliases:cleanAliases(body.aliases),
 isSystem:body.isSystem===true,
 isActive:body.isActive!==false
});

export const getFrequencyReferences=async(req,res)=>{
 try{
  const business=getBusiness(req);
  if(!business)return res.status(400).json({message:"Business is required."});

  const filter={business};

  if(req.query.service&&req.query.service!=="all")filter.service=req.query.service;
  if(req.query.band&&req.query.band!=="all")filter.band=req.query.band;
  if(req.query.isActive==="true")filter.isActive=true;
  if(req.query.isActive==="false")filter.isActive=false;

  const records=await FrequencyReference.find(filter).sort({
   service:1,
   frequencyMHz:1,
   frequencyRangeStartMHz:1,
   channel:1,
   frequency:1
  });

  res.json({data:records});
 }catch(error){
  res.status(500).json({message:error.message||"Failed to load frequency references."});
 }
};

export const createFrequencyReference=async(req,res)=>{
 try{
  const business=getBusiness(req);
  if(!business)return res.status(400).json({message:"Business is required."});

  const payload=buildPayload({...req.body,business});

  if(!payload.service)return res.status(400).json({message:"Service is required."});
  if(!payload.frequency)return res.status(400).json({message:"Frequency is required."});

  const record=await FrequencyReference.create(payload);
  res.status(201).json({data:record});
 }catch(error){
  res.status(400).json({message:error.message||"Failed to create frequency reference."});
 }
};

export const updateFrequencyReference=async(req,res)=>{
 try{
  const business=getBusiness(req);
  if(!business)return res.status(400).json({message:"Business is required."});

  const payload=buildPayload({...req.body,business});

  if(!payload.service)return res.status(400).json({message:"Service is required."});
  if(!payload.frequency)return res.status(400).json({message:"Frequency is required."});

  const record=await FrequencyReference.findOneAndUpdate(
   {_id:req.params.id,business},
   payload,
   {returnDocument:"after",runValidators:true}
  );

  if(!record)return res.status(404).json({message:"Frequency reference not found."});

  res.json({data:record});
 }catch(error){
  res.status(400).json({message:error.message||"Failed to update frequency reference."});
 }
};

export const deleteFrequencyReference=async(req,res)=>{
 try{
  const business=getBusiness(req);
  if(!business)return res.status(400).json({message:"Business is required."});

  const record=await FrequencyReference.findOne({_id:req.params.id,business});
  if(!record)return res.status(404).json({message:"Frequency reference not found."});

  if(record.isSystem)return res.status(403).json({message:"System references cannot be deleted."});

  await record.deleteOne();

  res.json({message:"Frequency reference deleted."});
 }catch(error){
  res.status(400).json({message:error.message||"Failed to delete frequency reference."});
 }
};