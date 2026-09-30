//backend/controllers/receiving/goodsReceiptLineController.js
import mongoose from "mongoose";
import GoodsReceiptLine from "../../models/receiving/goodsReceiptLineModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

export const createGoodsReceiptLine=async(req,res)=>{
 try{
  const item=await GoodsReceiptLine.create(req.body);
  return res.status(201).json({success:true,message:"Goods receipt line created successfully",data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to create goods receipt line",error:error.message});
 }
};

export const getGoodsReceiptLines=async(req,res)=>{
 try{
  const {business_id,goodsReceiptRef,purchaseOrderLineRef,beverageItemRef,conditionStatus,page=1,limit=20,sortBy="createdAt",sortOrder="desc"}=req.query;
  const query={};

  if(business_id){
   if(!isValidObjectId(business_id)) return res.status(400).json({success:false,message:"Invalid business_id"});
   query.business_id=business_id;
  }
  if(goodsReceiptRef){
   if(!isValidObjectId(goodsReceiptRef)) return res.status(400).json({success:false,message:"Invalid goodsReceiptRef"});
   query.goodsReceiptRef=goodsReceiptRef;
  }
  if(purchaseOrderLineRef){
   if(!isValidObjectId(purchaseOrderLineRef)) return res.status(400).json({success:false,message:"Invalid purchaseOrderLineRef"});
   query.purchaseOrderLineRef=purchaseOrderLineRef;
  }
  if(beverageItemRef){
   if(!isValidObjectId(beverageItemRef)) return res.status(400).json({success:false,message:"Invalid beverageItemRef"});
   query.beverageItemRef=beverageItemRef;
  }
  if(conditionStatus) query.conditionStatus=conditionStatus;

  const pageNum=Math.max(parseInt(page,10)||1,1);
  const limitNum=Math.max(parseInt(limit,10)||20,1);
  const skip=(pageNum-1)*limitNum;
  const sort={ [sortBy]:sortOrder==="asc"?1:-1 };

  const [items,total]=await Promise.all([
   GoodsReceiptLine.find(query)
    .populate("business_id")
    .populate("goodsReceiptRef")
    .populate("purchaseOrderLineRef")
    .populate("beverageItemRef")
    .populate("uomRef")
    .sort(sort)
    .skip(skip)
    .limit(limitNum),
   GoodsReceiptLine.countDocuments(query)
  ]);

  return res.status(200).json({success:true,count:items.length,total,page:pageNum,pages:Math.ceil(total/limitNum),data:items});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch goods receipt lines",error:error.message});
 }
};

export const getGoodsReceiptLineById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid goods receipt line id"});

  const item=await GoodsReceiptLine.findById(id)
   .populate("business_id")
   .populate("goodsReceiptRef")
   .populate("purchaseOrderLineRef")
   .populate("beverageItemRef")
   .populate("uomRef");

  if(!item) return res.status(404).json({success:false,message:"Goods receipt line not found"});

  return res.status(200).json({success:true,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch goods receipt line",error:error.message});
 }
};

export const updateGoodsReceiptLine=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid goods receipt line id"});

  const item=await GoodsReceiptLine.findByIdAndUpdate(id,req.body,{returnDocument:"after",runValidators:true})
   .populate("business_id")
   .populate("goodsReceiptRef")
   .populate("purchaseOrderLineRef")
   .populate("beverageItemRef")
   .populate("uomRef");

  if(!item) return res.status(404).json({success:false,message:"Goods receipt line not found"});

  return res.status(200).json({success:true,message:"Goods receipt line updated successfully",data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update goods receipt line",error:error.message});
 }
};

export const deleteGoodsReceiptLine=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid goods receipt line id"});

  const item=await GoodsReceiptLine.findByIdAndDelete(id);
  if(!item) return res.status(404).json({success:false,message:"Goods receipt line not found"});

  return res.status(200).json({success:true,message:"Goods receipt line deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete goods receipt line",error:error.message});
 }
};