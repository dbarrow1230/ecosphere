// backend/controllers/reference/businessTypeController.js
import BusinessType from "../../models/reference/businessTypeModel.js";

export const createBusinessType=async(req,res,next)=>{
 try{
  const payload={
   name:(req.body.name||"").trim(),
   code:req.body.code!==undefined?String(req.body.code).trim().toUpperCase():"",
   description:req.body.description!==undefined?String(req.body.description).trim():"",
   isActive:req.body.isActive!==undefined?!!req.body.isActive:true,
   notes:req.body.notes!==undefined?String(req.body.notes).trim():""
  };

  const businessType=await BusinessType.create(payload);

  res.status(201).json(businessType);
 }catch(error){
  next(error);
 }
};

export const getBusinessTypes=async(req,res,next)=>{
 try{
  const query={};

  if(req.query.isActive!==undefined)
   query.isActive=req.query.isActive==="true";

  if(req.query.code)
   query.code=String(req.query.code).trim().toUpperCase();

  const businessTypes=await BusinessType.find(query).sort({name:1});
  res.status(200).json(businessTypes);
 }catch(error){
  next(error);
 }
};

export const getBusinessTypeById=async(req,res,next)=>{
 try{
  const businessType=await BusinessType.findById(req.params.id);

  if(!businessType)return res.status(404).json({message:"Business type not found"});

  res.status(200).json(businessType);
 }catch(error){
  next(error);
 }
};

export const updateBusinessType=async(req,res,next)=>{
 try{
  const payload={};

  if(req.body.name!==undefined)payload.name=String(req.body.name).trim();
  if(req.body.code!==undefined)payload.code=String(req.body.code).trim().toUpperCase();
  if(req.body.description!==undefined)payload.description=String(req.body.description).trim();
  if(req.body.isActive!==undefined)payload.isActive=!!req.body.isActive;
  if(req.body.notes!==undefined)payload.notes=String(req.body.notes).trim();

  const updated=await BusinessType.findByIdAndUpdate(
   req.params.id,
   payload,
   {new:true,runValidators:true}
  );

  if(!updated)return res.status(404).json({message:"Business type not found"});

  res.status(200).json(updated);
 }catch(error){
  next(error);
 }
};

export const deleteBusinessType=async(req,res,next)=>{
 try{
  const businessType=await BusinessType.findByIdAndDelete(req.params.id);

  if(!businessType)return res.status(404).json({message:"Business type not found"});

  res.status(200).json({message:"Business type deleted successfully"});
 }catch(error){
  next(error);
 }
};