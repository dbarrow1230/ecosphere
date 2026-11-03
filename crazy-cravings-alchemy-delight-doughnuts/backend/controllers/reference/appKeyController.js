// backend/controllers/reference/appKeyController.js
import AppKey from "../../models/reference/appKeyModel.js";

export const createAppKey=async(req,res,next)=>{
 try{
  const payload={
   name:(req.body.name||"").trim(),
   appKey:(req.body.appKey||"").trim().toLowerCase(),
   isActive:req.body.isActive!==undefined?!!req.body.isActive:true
  };

  const appKey=await AppKey.create(payload);

  res.status(201).json(appKey);
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

  const appKeys=await AppKey.find(query).sort({name:1});
  res.status(200).json(appKeys);
 }catch(error){
  next(error);
 }
};

export const getAppKeyById=async(req,res,next)=>{
 try{
  const appKey=await AppKey.findById(req.params.id);

  if(!appKey)return res.status(404).json({message:"App key not found"});

  res.status(200).json(appKey);
 }catch(error){
  next(error);
 }
};

export const updateAppKey=async(req,res,next)=>{
 try{
  const payload={};

  if(req.body.name!==undefined)payload.name=String(req.body.name).trim();
  if(req.body.appKey!==undefined)payload.appKey=String(req.body.appKey).trim().toLowerCase();
  if(req.body.isActive!==undefined)payload.isActive=!!req.body.isActive;

  const updated=await AppKey.findByIdAndUpdate(
   req.params.id,
   payload,
   {returnDocument:"after",runValidators:true}
  );

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