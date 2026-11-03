//backend/controllers/purchasing/purchaseOrderLineController.js
import mongoose from "mongoose";
import PurchaseOrderLine from "../../models/purchasing/purchaseOrderLineModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

export const createPurchaseOrderLine=async(req,res)=>{
 try{
  const item=await PurchaseOrderLine.create(req.body);
  return res.status(201).json({success:true,message:"Purchase order line created successfully",data:item});
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Duplicate purchase order line",error:error.message});
  }
  return res.status(500).json({success:false,message:"Failed to create purchase order line",error:error.message});
 }
};

export const getPurchaseOrderLines=async(req,res)=>{
 try{
  const {business_id,purchaseOrderRef,beverageItemRef,status,page=1,limit=20,sortBy="createdAt",sortOrder="desc"}=req.query;
  const query={};

  if(business_id){
   if(!isValidObjectId(business_id)) return res.status(400).json({success:false,message:"Invalid business_id"});
   query.business_id=business_id;
  }
  if(purchaseOrderRef){
   if(!isValidObjectId(purchaseOrderRef)) return res.status(400).json({success:false,message:"Invalid purchaseOrderRef"});
   query.purchaseOrderRef=purchaseOrderRef;
  }
  if(beverageItemRef){
   if(!isValidObjectId(beverageItemRef)) return res.status(400).json({success:false,message:"Invalid beverageItemRef"});
   query.beverageItemRef=beverageItemRef;
  }
  if(status) query.status=status;

  const pageNum=Math.max(parseInt(page,10)||1,1);
  const limitNum=Math.max(parseInt(limit,10)||20,1);
  const skip=(pageNum-1)*limitNum;
  const sort={ [sortBy]:sortOrder==="asc"?1:-1 };

  const [items,total]=await Promise.all([
   PurchaseOrderLine.find(query)
    .populate("business_id")
    .populate("purchaseOrderRef")
    .populate("beverageItemRef")
    .populate("beverageVendorItemRef")
    .populate("uomRef")
    .sort(sort)
    .skip(skip)
    .limit(limitNum),
   PurchaseOrderLine.countDocuments(query)
  ]);

  return res.status(200).json({success:true,count:items.length,total,page:pageNum,pages:Math.ceil(total/limitNum),data:items});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch purchase order lines",error:error.message});
 }
};

export const getPurchaseOrderLineById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid purchase order line id"});

  const item=await PurchaseOrderLine.findById(id)
   .populate("business_id")
   .populate("purchaseOrderRef")
   .populate("beverageItemRef")
   .populate("beverageVendorItemRef")
   .populate("uomRef");

  if(!item) return res.status(404).json({success:false,message:"Purchase order line not found"});

  return res.status(200).json({success:true,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch purchase order line",error:error.message});
 }
};

export const updatePurchaseOrderLine=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid purchase order line id"});

  const item=await PurchaseOrderLine.findByIdAndUpdate(id,req.body,{new:true,runValidators:true})
   .populate("business_id")
   .populate("purchaseOrderRef")
   .populate("beverageItemRef")
   .populate("beverageVendorItemRef")
   .populate("uomRef");

  if(!item) return res.status(404).json({success:false,message:"Purchase order line not found"});

  return res.status(200).json({success:true,message:"Purchase order line updated successfully",data:item});
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Duplicate purchase order line",error:error.message});
  }
  return res.status(500).json({success:false,message:"Failed to update purchase order line",error:error.message});
 }
};

export const deletePurchaseOrderLine=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid purchase order line id"});

  const item=await PurchaseOrderLine.findByIdAndDelete(id);
  if(!item) return res.status(404).json({success:false,message:"Purchase order line not found"});

  return res.status(200).json({success:true,message:"Purchase order line deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete purchase order line",error:error.message});
 }
};