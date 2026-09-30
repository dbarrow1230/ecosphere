// backend/controllers/reference/appKeyController.js
import AppKey from "../../models/reference/appKeyModel.js";

const getObjectId=value=>{
 if(!value)return undefined;
 if(typeof value==="string")return value.trim();
 if(typeof value==="object"){
  if(typeof value._id==="string")return value._id.trim();
  if(value._id?.$oid)return String(value._id.$oid).trim();
  if(typeof value.id==="string")return value.id.trim();
  if(value.id?.$oid)return String(value.id.$oid).trim();
 }
 return undefined;
};

export const createAppKey=async(req,res,next)=>{
 try{
  const payload={
   businessRef:getObjectId(req.body.businessRef),
   name:(req.body.name||"").trim(),
   appKey:(req.body.appKey||"").trim().toLowerCase(),
   isActive:req.body.isActive!==undefined?!!req.body.isActive:true
  };

  const appKey=await AppKey.create(payload);
  const createdAppKey=await AppKey.findById(appKey._id).populate("businessRef");

  res.status(201).json(createdAppKey);
 }catch(error){
  next(error);
 }
};

export const getAppKeys=async(req,res,next)=>{
 try{
  const query={};

  if(req.query.isActive!==undefined)
   query.isActive=req.query.isActive==="true";

  if(req.query.appKey)
   query.appKey=String(req.query.appKey).trim().toLowerCase();

  if(req.query.businessRef)
   query.businessRef=getObjectId(req.query.businessRef);

  const appKeys=await AppKey.find(query).populate("businessRef").sort({name:1});
  res.status(200).json(appKeys);
 }catch(error){
  next(error);
 }
};

export const getAppKeyById=async(req,res,next)=>{
 try{
  const appKey=await AppKey.findById(req.params.id).populate("businessRef");

  if(!appKey)return res.status(404).json({message:"App key not found"});

  res.status(200).json(appKey);
 }catch(error){
  next(error);
 }
};

export const updateAppKey=async(req,res,next)=>{
 try{
  const payload={};

  if(req.body.businessRef!==undefined)payload.businessRef=getObjectId(req.body.businessRef);
  if(req.body.name!==undefined)payload.name=String(req.body.name).trim();
  if(req.body.appKey!==undefined)payload.appKey=String(req.body.appKey).trim().toLowerCase();
  if(req.body.isActive!==undefined)payload.isActive=!!req.body.isActive;

  const updated=await AppKey.findByIdAndUpdate(
   req.params.id,
   payload,
   {returnDocument:"after",runValidators:true}
  ).populate("businessRef");

  if(!updated)return res.status(404).json({message:"App key not found"});

  res.status(200).json(updated);
 }catch(error){
  next(error);
 }
};

export const deleteAppKey=async(req,res,next)=>{
 try{
  const appKey=await AppKey.findByIdAndDelete(req.params.id);

  if(!appKey)return res.status(404).json({message:"App key not found"});

  res.status(200).json({message:"App key deleted successfully"});
 }catch(error){
  next(error);
 }
};
