import mongoose from "mongoose";
import ProductionBatch from "../../models/production/productionBatchModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

export const createProductionBatch=async(req,res)=>{
 try{
  const item=await ProductionBatch.create(req.body);
  return res.status(201).json({success:true,message:"Production batch created successfully",data:item});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"Duplicate production batch",error:error.message});
  return res.status(500).json({success:false,message:"Failed to create production batch",error:error.message});
 }
};

export const getProductionBatches=async(req,res)=>{
 try{
  const {business_id,productRef,recipeRef,locationRef,status,search,page=1,limit=20,sortBy="productionDate",sortOrder="desc"}=req.query;
  const query={};

  if(business_id){
   if(!isValidObjectId(business_id))return res.status(400).json({success:false,message:"Invalid business_id"});
   query.business_id=business_id;
  }
  if(productRef){
   if(!isValidObjectId(productRef))return res.status(400).json({success:false,message:"Invalid productRef"});
   query.productRef=productRef;
  }
  if(recipeRef){
   if(!isValidObjectId(recipeRef))return res.status(400).json({success:false,message:"Invalid recipeRef"});
   query.recipeRef=recipeRef;
  }
  if(locationRef){
   if(!isValidObjectId(locationRef))return res.status(400).json({success:false,message:"Invalid locationRef"});
   query.locationRef=locationRef;
  }
  if(status)query.status=status;
  if(search){
   query.$or=[
    {batchNumber:{$regex:search,$options:"i"}},
    {lotCode:{$regex:search,$options:"i"}},
    {notes:{$regex:search,$options:"i"}}
   ];
  }

  const pageNum=Math.max(parseInt(page,10)||1,1);
  const limitNum=Math.max(parseInt(limit,10)||20,1);
  const skip=(pageNum-1)*limitNum;
  const sort={[sortBy]:sortOrder==="asc"?1:-1};

  const [items,total]=await Promise.all([
   ProductionBatch.find(query)
    .populate("business_id")
    .populate("productRef")
    .populate("recipeRef")
    .populate("locationRef")
    .populate("createdByRef")
    .populate("approvedByRef")
    .sort(sort)
    .skip(skip)
    .limit(limitNum),
   ProductionBatch.countDocuments(query)
  ]);

  return res.status(200).json({success:true,count:items.length,total,page:pageNum,pages:Math.ceil(total/limitNum),data:items});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch production batches",error:error.message});
 }
};

export const getProductionBatchById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id))return res.status(400).json({success:false,message:"Invalid production batch id"});

  const item=await ProductionBatch.findById(id)
   .populate("business_id")
   .populate("productRef")
   .populate("recipeRef")
   .populate("locationRef")
   .populate("createdByRef")
   .populate("approvedByRef");

  if(!item)return res.status(404).json({success:false,message:"Production batch not found"});
  return res.status(200).json({success:true,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch production batch",error:error.message});
 }
};

export const updateProductionBatch=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id))return res.status(400).json({success:false,message:"Invalid production batch id"});

  const item=await ProductionBatch.findByIdAndUpdate(id,req.body,{returnDocument:"after",runValidators:true})
   .populate("business_id")
   .populate("productRef")
   .populate("recipeRef")
   .populate("locationRef")
   .populate("createdByRef")
   .populate("approvedByRef");

  if(!item)return res.status(404).json({success:false,message:"Production batch not found"});
  return res.status(200).json({success:true,message:"Production batch updated successfully",data:item});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"Duplicate production batch",error:error.message});
  return res.status(500).json({success:false,message:"Failed to update production batch",error:error.message});
 }
};

export const updateProductionBatchStatus=async(req,res)=>{
 try{
  const {id}=req.params;
  const {status}=req.body;
  const allowed=["planned","inProduction","cooling","packed","qaHold","released","closed","voided"];

  if(!isValidObjectId(id))return res.status(400).json({success:false,message:"Invalid production batch id"});
  if(!allowed.includes(status))return res.status(400).json({success:false,message:"Invalid status value"});

  const item=await ProductionBatch.findById(id);
  if(!item)return res.status(404).json({success:false,message:"Production batch not found"});

  item.status=status;
  if(status==="closed")item.completedAt=new Date();
  if(status==="released")item.releasedAt=new Date();
  await item.save();

  return res.status(200).json({success:true,message:"Production batch status updated successfully",data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update production batch status",error:error.message});
 }
};

export const deleteProductionBatch=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id))return res.status(400).json({success:false,message:"Invalid production batch id"});

  const item=await ProductionBatch.findByIdAndDelete(id);
  if(!item)return res.status(404).json({success:false,message:"Production batch not found"});

  return res.status(200).json({success:true,message:"Production batch deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete production batch",error:error.message});
 }
};
