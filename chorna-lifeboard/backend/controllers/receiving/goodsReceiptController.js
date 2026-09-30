//backend/controllers/receiving/goodsReceiptController.js
import mongoose from "mongoose";
import GoodsReceipt from "../../models/receiving/goodsReceiptModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

export const createGoodsReceipt=async(req,res)=>{
 try{
  const item=await GoodsReceipt.create(req.body);
  return res.status(201).json({success:true,message:"Goods receipt created successfully",data:item});
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Duplicate goods receipt",error:error.message});
  }
  return res.status(500).json({success:false,message:"Failed to create goods receipt",error:error.message});
 }
};

export const getGoodsReceipts=async(req,res)=>{
 try{
  const {business_id,vendorRef,locationRef,purchaseOrderRef,status,page=1,limit=20,sortBy="createdAt",sortOrder="desc"}=req.query;
  const query={};

  if(business_id){
   if(!isValidObjectId(business_id)) return res.status(400).json({success:false,message:"Invalid business_id"});
   query.business_id=business_id;
  }
  if(vendorRef){
   if(!isValidObjectId(vendorRef)) return res.status(400).json({success:false,message:"Invalid vendorRef"});
   query.vendorRef=vendorRef;
  }
  if(locationRef){
   if(!isValidObjectId(locationRef)) return res.status(400).json({success:false,message:"Invalid locationRef"});
   query.locationRef=locationRef;
  }
  if(purchaseOrderRef){
   if(!isValidObjectId(purchaseOrderRef)) return res.status(400).json({success:false,message:"Invalid purchaseOrderRef"});
   query.purchaseOrderRef=purchaseOrderRef;
  }
  if(status) query.status=status;

  const pageNum=Math.max(parseInt(page,10)||1,1);
  const limitNum=Math.max(parseInt(limit,10)||20,1);
  const skip=(pageNum-1)*limitNum;
  const sort={ [sortBy]:sortOrder==="asc"?1:-1 };

  const [items,total]=await Promise.all([
   GoodsReceipt.find(query)
    .populate("business_id")
    .populate("vendorRef")
    .populate("locationRef")
    .populate("purchaseOrderRef")
    .populate("receivedByRef")
    .populate("postedByRef")
    .sort(sort)
    .skip(skip)
    .limit(limitNum),
   GoodsReceipt.countDocuments(query)
  ]);

  return res.status(200).json({success:true,count:items.length,total,page:pageNum,pages:Math.ceil(total/limitNum),data:items});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch goods receipts",error:error.message});
 }
};

export const getGoodsReceiptById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid goods receipt id"});

  const item=await GoodsReceipt.findById(id)
   .populate("business_id")
   .populate("vendorRef")
   .populate("locationRef")
   .populate("purchaseOrderRef")
   .populate("receivedByRef")
   .populate("postedByRef");

  if(!item) return res.status(404).json({success:false,message:"Goods receipt not found"});

  return res.status(200).json({success:true,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch goods receipt",error:error.message});
 }
};

export const updateGoodsReceipt=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid goods receipt id"});

  const item=await GoodsReceipt.findByIdAndUpdate(id,req.body,{returnDocument:"after",runValidators:true})
   .populate("business_id")
   .populate("vendorRef")
   .populate("locationRef")
   .populate("purchaseOrderRef")
   .populate("receivedByRef")
   .populate("postedByRef");

  if(!item) return res.status(404).json({success:false,message:"Goods receipt not found"});

  return res.status(200).json({success:true,message:"Goods receipt updated successfully",data:item});
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Duplicate goods receipt",error:error.message});
  }
  return res.status(500).json({success:false,message:"Failed to update goods receipt",error:error.message});
 }
};

export const deleteGoodsReceipt=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid goods receipt id"});

  const item=await GoodsReceipt.findByIdAndDelete(id);
  if(!item) return res.status(404).json({success:false,message:"Goods receipt not found"});

  return res.status(200).json({success:true,message:"Goods receipt deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete goods receipt",error:error.message});
 }
};

export const updateGoodsReceiptStatus=async(req,res)=>{
 try{
  const {id}=req.params;
  const {status}=req.body;

  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid goods receipt id"});
  if(!["draft","posted","partial","disputed","voided"].includes(status)){
   return res.status(400).json({success:false,message:"Invalid status value"});
  }

  const item=await GoodsReceipt.findById(id);
  if(!item) return res.status(404).json({success:false,message:"Goods receipt not found"});

  item.status=status;

  if(status==="posted"){
   item.postedAt=new Date();
  }

  await item.save();

  return res.status(200).json({success:true,message:"Goods receipt status updated successfully",data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update goods receipt status",error:error.message});
 }
};