// backend/controllers/production/productionCostingController.js
import ProductionCosting from "../../models/production/ProductionCostingModel.js";

export const createProductionCosting=async(req,res)=>{
 try{
  const {productionBatch,items,calculatedAt,version,notes,isActive}=req.body;

  if(!productionBatch) return res.status(400).json({message:"Production batch is required"});
  if(!Array.isArray(items)||items.length===0) return res.status(400).json({message:"Production costing must have items"});

  const productionCosting=await ProductionCosting.create({
   productionBatch,
   items,
   calculatedAt:calculatedAt||new Date(),
   version:version||1,
   notes:notes?.trim()||"",
   isActive:typeof isActive==="boolean"?isActive:true
  });

  const populatedProductionCosting=await ProductionCosting.findById(productionCosting._id)
   .populate("productionBatch")
   .populate("items.menuItem")
   .populate("items.recipe")
   .populate("items.costModel")
   .populate("items.ingredients.ingredient")
   .populate("items.ingredients.vendorItem")
   .populate("items.ingredients.vendorItemPrice");

  return res.status(201).json(populatedProductionCosting);
 }catch(error){
  return res.status(500).json({message:"Failed to create production costing",error:error.message});
 }
};

export const getProductionCostings=async(req,res)=>{
 try{
  const {productionBatch,version,isActive,costModel,menuItem,recipe}=req.query;

  const filter={};

  if(productionBatch) filter.productionBatch=productionBatch;
  if(version) filter.version=Number(version);
  if(isActive==="true") filter.isActive=true;
  if(isActive==="false") filter.isActive=false;
  if(costModel) filter["items.costModel"]=costModel;
  if(menuItem) filter["items.menuItem"]=menuItem;
  if(recipe) filter["items.recipe"]=recipe;

  const productionCostings=await ProductionCosting.find(filter)
   .populate("productionBatch")
   .populate("items.menuItem")
   .populate("items.recipe")
   .populate("items.costModel")
   .populate("items.ingredients.ingredient")
   .populate("items.ingredients.vendorItem")
   .populate("items.ingredients.vendorItemPrice")
   .sort({createdAt:-1,version:-1});

  return res.status(200).json(productionCostings);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch production costings",error:error.message});
 }
};

export const getProductionCostingById=async(req,res)=>{
 try{
  const productionCosting=await ProductionCosting.findById(req.params.id)
   .populate("productionBatch")
   .populate("items.menuItem")
   .populate("items.recipe")
   .populate("items.costModel")
   .populate("items.ingredients.ingredient")
   .populate("items.ingredients.vendorItem")
   .populate("items.ingredients.vendorItemPrice");

  if(!productionCosting) return res.status(404).json({message:"Production costing not found"});

  return res.status(200).json(productionCosting);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch production costing",error:error.message});
 }
};

export const updateProductionCosting=async(req,res)=>{
 try{
  const {productionBatch,items,calculatedAt,version,notes,isActive}=req.body;

  const updateData={};

  if(productionBatch!==undefined) updateData.productionBatch=productionBatch;

  if(items!==undefined){
   if(!Array.isArray(items)||items.length===0) return res.status(400).json({message:"Production costing must have items"});
   updateData.items=items;
  }

  if(calculatedAt!==undefined) updateData.calculatedAt=calculatedAt;
  if(version!==undefined) updateData.version=version;
  if(notes!==undefined) updateData.notes=notes?.trim()||"";
  if(isActive!==undefined) updateData.isActive=isActive;

  const productionCosting=await ProductionCosting.findByIdAndUpdate(
   req.params.id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
   .populate("productionBatch")
   .populate("items.menuItem")
   .populate("items.recipe")
   .populate("items.costModel")
   .populate("items.ingredients.ingredient")
   .populate("items.ingredients.vendorItem")
   .populate("items.ingredients.vendorItemPrice");

  if(!productionCosting) return res.status(404).json({message:"Production costing not found"});

  return res.status(200).json(productionCosting);
 }catch(error){
  return res.status(500).json({message:"Failed to update production costing",error:error.message});
 }
};

export const deleteProductionCosting=async(req,res)=>{
 try{
  const productionCosting=await ProductionCosting.findByIdAndDelete(req.params.id);

  if(!productionCosting) return res.status(404).json({message:"Production costing not found"});

  return res.status(200).json({message:"Production costing deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete production costing",error:error.message});
 }
};