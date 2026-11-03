// backend/controllers/production/productionBatchController.js
import ProductionBatch from "../../models/production/ProductionBatchModel.js";

export const createProductionBatch=async(req,res)=>{
 try{
  const {
   batchNumber,productionDate,shift,items,costing,status,startedAt,completedAt,
   preparedBy,approvedBy,notes,isActive
  }=req.body;

  if(!batchNumber||!batchNumber.trim()) return res.status(400).json({message:"Batch number is required"});
  if(!productionDate) return res.status(400).json({message:"Production date is required"});
  if(!Array.isArray(items)||items.length===0) return res.status(400).json({message:"Production batch must have items"});

  const productionBatch=await ProductionBatch.create({
   batchNumber:batchNumber.trim(),
   productionDate,
   shift:shift?.trim()||"",
   items,
   costing:costing||null,
   status:status||"planned",
   startedAt:startedAt||null,
   completedAt:completedAt||null,
   preparedBy:Array.isArray(preparedBy)?preparedBy:[],
   approvedBy:approvedBy||null,
   notes:notes?.trim()||"",
   isActive:typeof isActive==="boolean"?isActive:true
  });

  return res.status(201).json(productionBatch);
 }catch(error){
  return res.status(500).json({message:"Failed to create production batch",error:error.message});
 }
};

export const getProductionBatches=async(req,res)=>{
 try{
  const {status,productionDate,isActive}=req.query;

  const filter={};

  if(status) filter.status=status;
  if(productionDate) filter.productionDate=productionDate;
  if(isActive==="true") filter.isActive=true;
  if(isActive==="false") filter.isActive=false;

  const productionBatches=await ProductionBatch.find(filter)
   .populate("items.menuItem")
   .populate("items.recipe")
   .populate("costing")
   .populate("preparedBy")
   .populate("approvedBy")
   .sort({productionDate:-1,createdAt:-1});

  return res.status(200).json(productionBatches);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch production batches",error:error.message});
 }
};

export const getProductionBatchById=async(req,res)=>{
 try{
  const productionBatch=await ProductionBatch.findById(req.params.id)
   .populate("items.menuItem")
   .populate("items.recipe")
   .populate("costing")
   .populate("preparedBy")
   .populate("approvedBy");

  if(!productionBatch) return res.status(404).json({message:"Production batch not found"});

  return res.status(200).json(productionBatch);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch production batch",error:error.message});
 }
};

export const updateProductionBatch=async(req,res)=>{
 try{
  const {
   productionDate,shift,items,costing,status,startedAt,completedAt,
   preparedBy,approvedBy,notes,isActive
  }=req.body;

  const updateData={};

  if(productionDate!==undefined) updateData.productionDate=productionDate;
  if(shift!==undefined) updateData.shift=shift?.trim()||"";

  if(items!==undefined){
   if(!Array.isArray(items)||items.length===0) return res.status(400).json({message:"Production batch must have items"});
   updateData.items=items;
  }

  if(costing!==undefined) updateData.costing=costing||null;
  if(startedAt!==undefined) updateData.startedAt=startedAt||null;
  if(completedAt!==undefined) updateData.completedAt=completedAt||null;
  if(preparedBy!==undefined) updateData.preparedBy=Array.isArray(preparedBy)?preparedBy:[];
  if(approvedBy!==undefined) updateData.approvedBy=approvedBy||null;
  if(notes!==undefined) updateData.notes=notes?.trim()||"";
  if(isActive!==undefined) updateData.isActive=isActive;

  if(status!==undefined){
   updateData.status=status;
   if(status==="in-progress"&&startedAt===undefined) updateData.startedAt=new Date();
   if(status==="completed"&&completedAt===undefined) updateData.completedAt=new Date();
   if(status==="cancelled"&&completedAt===undefined) updateData.completedAt=null;
  }

  const productionBatch=await ProductionBatch.findByIdAndUpdate(
   req.params.id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
   .populate("items.menuItem")
   .populate("items.recipe")
   .populate("costing")
   .populate("preparedBy")
   .populate("approvedBy");

  if(!productionBatch) return res.status(404).json({message:"Production batch not found"});

  return res.status(200).json(productionBatch);
 }catch(error){
  return res.status(500).json({message:"Failed to update production batch",error:error.message});
 }
};

export const deleteProductionBatch=async(req,res)=>{
 try{
  const productionBatch=await ProductionBatch.findByIdAndDelete(req.params.id);

  if(!productionBatch) return res.status(404).json({message:"Production batch not found"});

  return res.status(200).json({message:"Production batch deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete production batch",error:error.message});
 }
};