// backend/controllers/product/productBatchController.js
import "../../models/admin/outcomeModel.js";
import "../../models/admin/statusModel.js";
import "../../models/inventory/storageLocationModel.js";
import "../../models/preservation/dehydration/dehydrationProcessModel.js";
import "../../models/preservation/preservationProjectModel.js";
import "../../models/pricing/containerTypeModel.js";
import ProductBatch from "../../models/product/productBatchModel.js";
import "../../models/product/productModel.js";

const buildQuery=query=>{
 const q={};

 if(query.product)
 {
  q.product=query.product;
 }

 if(query.preservationProject)
 {
  q.preservationProject=query.preservationProject;
 }

 if(query.batchNumber)
 {
  q.batchNumber={$regex:query.batchNumber,$options:"i"};
 }

 if(query.lotNumber)
 {
  q.lotNumber={$regex:query.lotNumber,$options:"i"};
 }

 if(query.status)
 {
  q.status=query.status;
 }

 if(query.sourceProcess)
 {
  q.sourceProcess=query.sourceProcess;
 }

 if(query.search)
 {
  q.$or=[
   {batchNumber:{$regex:query.search,$options:"i"}},
   {lotNumber:{$regex:query.search,$options:"i"}},
   {code:{$regex:query.search,$options:"i"}},
   {notes:{$regex:query.search,$options:"i"}}
  ];
 }

 return q;
};

export const getProductBatches=async(req,res)=>{
 try
 {
  const query=buildQuery(req.query);

  const batches=await ProductBatch.find(query)
   .populate("product")
   .populate("preservationProject")
   .populate("packaging.containerType")
   .populate("status")
   .populate("outcomes")
   .populate("storage.location")
   .populate("sourceProcess")
   .populate("sourceOutput")
   .sort({createdAt:-1});

  return res.status(200).json({success:true,count:batches.length,data:batches});
 }
 catch(err)
 {
  return res.status(500).json({success:false,message:err.message||"Failed to fetch product batches"});
 }
};

export const getProductBatchById=async(req,res)=>{
 try
 {
  const batch=await ProductBatch.findById(req.params.id)
   .populate("product")
   .populate("preservationProject")
   .populate("packaging.containerType")
   .populate("status")
   .populate("outcomes")
   .populate("storage.location")
   .populate("sourceProcess")
   .populate("sourceOutput");

  if(!batch)
  {
   return res.status(404).json({success:false,message:"Product batch not found"});
  }

  return res.status(200).json({success:true,data:batch});
 }
 catch(err)
 {
  return res.status(500).json({success:false,message:err.message||"Failed to fetch product batch"});
 }
};

export const createProductBatch=async(req,res)=>{
 try
 {
  const batch=await ProductBatch.create(req.body);

  const populated=await ProductBatch.findById(batch._id)
   .populate("product")
   .populate("preservationProject")
   .populate("packaging.containerType")
   .populate("status")
   .populate("outcomes")
   .populate("storage.location")
   .populate("sourceProcess")
   .populate("sourceOutput");

  return res.status(201).json({success:true,message:"Product batch created",data:populated});
 }
 catch(err)
 {
  return res.status(400).json({success:false,message:err.message||"Failed to create product batch"});
 }
};

export const updateProductBatch=async(req,res)=>{
 try
 {
  const batch=await ProductBatch.findByIdAndUpdate(
   req.params.id,
   req.body,
   {returnDocument:"after",runValidators:true}
  )
   .populate("product")
   .populate("preservationProject")
   .populate("packaging.containerType")
   .populate("status")
   .populate("outcomes")
   .populate("storage.location")
   .populate("sourceProcess")
   .populate("sourceOutput");

  if(!batch)
  {
   return res.status(404).json({success:false,message:"Product batch not found"});
  }

  return res.status(200).json({success:true,message:"Product batch updated",data:batch});
 }
 catch(err)
 {
  return res.status(400).json({success:false,message:err.message||"Failed to update product batch"});
 }
};

export const deleteProductBatch=async(req,res)=>{
 try
 {
  const batch=await ProductBatch.findByIdAndDelete(req.params.id);

  if(!batch)
  {
   return res.status(404).json({success:false,message:"Product batch not found"});
  }

  return res.status(200).json({success:true,message:"Product batch deleted"});
 }
 catch(err)
 {
  return res.status(500).json({success:false,message:err.message||"Failed to delete product batch"});
 }
};
