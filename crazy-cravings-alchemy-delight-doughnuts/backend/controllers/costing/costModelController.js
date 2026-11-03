// backend/controllers/costing/costModelController.js
import CostModel from "../../models/costing/CostModel.js";

export const createCostModel=async(req,res)=>{
 try{
  const {
   name,description,foodCostPercent,laborPercent,overheadPercent,profitPercent,
   markupPercent,isDefault,isActive,notes
  }=req.body;

  if(!name||!name.trim()) return res.status(400).json({message:"Name is required"});

  if(isDefault===true) await CostModel.updateMany({isDefault:true},{isDefault:false});

  const costModel=await CostModel.create({
   name:name.trim(),
   description:description?.trim()||"",
   foodCostPercent:foodCostPercent??0,
   laborPercent:laborPercent??0,
   overheadPercent:overheadPercent??0,
   profitPercent:profitPercent??0,
   markupPercent:markupPercent??0,
   isDefault:typeof isDefault==="boolean"?isDefault:false,
   isActive:typeof isActive==="boolean"?isActive:true,
   notes:notes?.trim()||""
  });

  return res.status(201).json(costModel);
 }catch(error){
  return res.status(500).json({message:"Failed to create cost model",error:error.message});
 }
};

export const getCostModels=async(req,res)=>{
 try{
  const {search,isActive,isDefault}=req.query;

  const filter={};

  if(search?.trim()){
   filter.$or=[
    {name:{$regex:search.trim(),$options:"i"}},
    {description:{$regex:search.trim(),$options:"i"}},
    {notes:{$regex:search.trim(),$options:"i"}}
   ];
  }

  if(isActive==="true") filter.isActive=true;
  if(isActive==="false") filter.isActive=false;
  if(isDefault==="true") filter.isDefault=true;
  if(isDefault==="false") filter.isDefault=false;

  const costModels=await CostModel.find(filter).sort({isDefault:-1,name:1});

  return res.status(200).json(costModels);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch cost models",error:error.message});
 }
};

export const getCostModelById=async(req,res)=>{
 try{
  const costModel=await CostModel.findById(req.params.id);

  if(!costModel) return res.status(404).json({message:"Cost model not found"});

  return res.status(200).json(costModel);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch cost model",error:error.message});
 }
};

export const updateCostModel=async(req,res)=>{
 try{
  const {
   name,description,foodCostPercent,laborPercent,overheadPercent,profitPercent,
   markupPercent,isDefault,isActive,notes
  }=req.body;

  const updateData={};

  if(name!==undefined){
   if(!name.trim()) return res.status(400).json({message:"Name is required"});
   updateData.name=name.trim();
  }

  if(description!==undefined) updateData.description=description?.trim()||"";
  if(foodCostPercent!==undefined) updateData.foodCostPercent=foodCostPercent;
  if(laborPercent!==undefined) updateData.laborPercent=laborPercent;
  if(overheadPercent!==undefined) updateData.overheadPercent=overheadPercent;
  if(profitPercent!==undefined) updateData.profitPercent=profitPercent;
  if(markupPercent!==undefined) updateData.markupPercent=markupPercent;
  if(isActive!==undefined) updateData.isActive=isActive;
  if(notes!==undefined) updateData.notes=notes?.trim()||"";

  if(isDefault!==undefined){
   updateData.isDefault=isDefault;
   if(isDefault===true) await CostModel.updateMany({_id:{$ne:req.params.id},isDefault:true},{isDefault:false});
  }

  const costModel=await CostModel.findByIdAndUpdate(
   req.params.id,
   updateData,
   {returnDocument:"after",runValidators:true}
  );

  if(!costModel) return res.status(404).json({message:"Cost model not found"});

  return res.status(200).json(costModel);
 }catch(error){
  return res.status(500).json({message:"Failed to update cost model",error:error.message});
 }
};

export const deleteCostModel=async(req,res)=>{
 try{
  const costModel=await CostModel.findByIdAndDelete(req.params.id);

  if(!costModel) return res.status(404).json({message:"Cost model not found"});

  return res.status(200).json({message:"Cost model deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete cost model",error:error.message});
 }
};