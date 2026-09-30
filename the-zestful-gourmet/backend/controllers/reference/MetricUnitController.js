// backend/controllers/reference/MetricUnitController.js
import MetricUnit from "../../models/reference/MetricUnitModel.js";

export const createMetricUnit=async(req,res)=>{
 try{
  const{name,symbol,type,description,isActive}=req.body;

  if(!name?.trim()||!symbol?.trim()||!type?.trim())return res.status(400).json({message:"Name, symbol, and type are required"});

  const existingName=await MetricUnit.findOne({name:name.trim()});
  if(existingName)return res.status(409).json({message:"Metric unit name already exists"});

  const existingSymbol=await MetricUnit.findOne({symbol:symbol.trim()});
  if(existingSymbol)return res.status(409).json({message:"Metric unit symbol already exists"});

  const unit=await MetricUnit.create({
   name:name.trim(),
   symbol:symbol.trim(),
   type:type.trim(),
   description:description?.trim()||"",
   isActive:isActive!==undefined?isActive:true
  });

  return res.status(201).json({message:"Metric unit created successfully",unit});
 }catch(error){
  return res.status(500).json({message:"Failed to create metric unit",error:error.message});
 }
};

export const getMetricUnits=async(req,res)=>{
 try{
  const filter={};
  if(req.query.isActive!==undefined)filter.isActive=req.query.isActive==="true";

  const units=await MetricUnit.find(filter).sort({name:1});
  return res.status(200).json(units);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch metric units",error:error.message});
 }
};

export const getMetricUnitById=async(req,res)=>{
 try{
  const unit=await MetricUnit.findById(req.params.id);
  if(!unit)return res.status(404).json({message:"Metric unit not found"});
  return res.status(200).json(unit);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch metric unit",error:error.message});
 }
};

export const updateMetricUnit=async(req,res)=>{
 try{
  const{name,symbol,type,description,isActive}=req.body;
  const unit=await MetricUnit.findById(req.params.id);
  if(!unit)return res.status(404).json({message:"Metric unit not found"});

  if(name!==undefined){
   if(!name?.trim())return res.status(400).json({message:"Name is required"});
   const existingName=await MetricUnit.findOne({_id:{$ne:req.params.id},name:name.trim()});
   if(existingName)return res.status(409).json({message:"Metric unit name already exists"});
   unit.name=name.trim();
  }

  if(symbol!==undefined){
   if(!symbol?.trim())return res.status(400).json({message:"Symbol is required"});
   const existingSymbol=await MetricUnit.findOne({_id:{$ne:req.params.id},symbol:symbol.trim()});
   if(existingSymbol)return res.status(409).json({message:"Metric unit symbol already exists"});
   unit.symbol=symbol.trim();
  }

  if(type!==undefined){
   if(!type?.trim())return res.status(400).json({message:"Type is required"});
   unit.type=type.trim();
  }

  if(description!==undefined)unit.description=description?.trim()||"";
  if(isActive!==undefined)unit.isActive=isActive;

  await unit.save();

  return res.status(200).json({message:"Metric unit updated successfully",unit});
 }catch(error){
  return res.status(500).json({message:"Failed to update metric unit",error:error.message});
 }
};

export const deleteMetricUnit=async(req,res)=>{
 try{
  const unit=await MetricUnit.findByIdAndDelete(req.params.id);
  if(!unit)return res.status(404).json({message:"Metric unit not found"});
  return res.status(200).json({message:"Metric unit deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete metric unit",error:error.message});
 }
};