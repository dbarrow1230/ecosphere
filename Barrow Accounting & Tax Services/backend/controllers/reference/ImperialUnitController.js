// backend/controllers/reference/ImperialUnitController.js
import ImperialUnit from "../../models/reference/ImperialUnitModel.js";

export const createImperialUnit=async(req,res)=>{
 try{
  const{name,symbol,type,description,isActive}=req.body;
  if(!name?.trim()||!symbol?.trim()||!type?.trim())return res.status(400).json({message:"Name, symbol, and type are required"});
  const unit=await ImperialUnit.create({
   name:name.trim(),
   symbol:symbol.trim(),
   type:type.trim(),
   description:description?.trim()||"",
   isActive:isActive!==undefined?isActive:true
  });
  return res.status(201).json({message:"Imperial unit created successfully",unit});
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"Imperial unit already exists"});
  return res.status(500).json({message:"Failed to create imperial unit",error:error.message});
 }
};

export const getImperialUnits=async(req,res)=>{
 try{
  const units=await ImperialUnit.find().sort({name:1});
  return res.status(200).json(units);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch imperial units",error:error.message});
 }
};

export const getImperialUnitById=async(req,res)=>{
 try{
  const unit=await ImperialUnit.findById(req.params.id);
  if(!unit)return res.status(404).json({message:"Imperial unit not found"});
  return res.status(200).json(unit);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch imperial unit",error:error.message});
 }
};

export const updateImperialUnit=async(req,res)=>{
 try{
  const unit=await ImperialUnit.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
  if(!unit)return res.status(404).json({message:"Imperial unit not found"});
  return res.status(200).json({message:"Imperial unit updated successfully",unit});
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"Imperial unit already exists"});
  return res.status(500).json({message:"Failed to update imperial unit",error:error.message});
 }
};

export const deleteImperialUnit=async(req,res)=>{
 try{
  const unit=await ImperialUnit.findByIdAndDelete(req.params.id);
  if(!unit)return res.status(404).json({message:"Imperial unit not found"});
  return res.status(200).json({message:"Imperial unit deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete imperial unit",error:error.message});
 }
};