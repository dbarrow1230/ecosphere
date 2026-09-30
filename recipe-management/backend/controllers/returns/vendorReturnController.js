//backend/controllers/returns/vendorReturnController.js
import mongoose from "mongoose";
import VendorReturn from "../../models/returns/vendorReturnModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

export const createVendorReturn=async(req,res)=>{
 try{
  const item=await VendorReturn.create(req.body);
  return res.status(201).json({success:true,message:"Vendor return created successfully",data:item});
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Duplicate vendor return",error:error.message});
  }
  return res.status(500).json({success:false,message:"Failed to create vendor return",error:error.message});
 }
};

export const getVendorReturns=async(req,res)=>{
 try{
  const {business_id,vendorRef,locationRef,goodsReceiptRef,status,page=1,limit=20,sortBy="createdAt",sortOrder="desc"}=req.query;
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
  if(goodsReceiptRef){
   if(!isValidObjectId(goodsReceiptRef)) return res.status(400).json({success:false,message:"Invalid goodsReceiptRef"});
   query.goodsReceiptRef=goodsReceiptRef;
  }
  if(status) query.status=status;

  const pageNum=Math.max(parseInt(page,10)||1,1);
  const limitNum=Math.max(parseInt(limit,10)||20,1);
  const skip=(pageNum-1)*limitNum;
  const sort={ [sortBy]:sortOrder==="asc"?1:-1 };

  const [items,total]=await Promise.all([
   VendorReturn.find(query)
    .populate("business_id")
    .populate("vendorRef")
    .populate("locationRef")
    .populate("goodsReceiptRef")
    .populate("createdByRef")
    .sort(sort)
    .skip(skip)
    .limit(limitNum),
   VendorReturn.countDocuments(query)
  ]);

  return res.status(200).json({success:true,count:items.length,total,page:pageNum,pages:Math.ceil(total/limitNum),data:items});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch vendor returns",error:error.message});
 }
};

export const getVendorReturnById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid vendor return id"});

  const item=await VendorReturn.findById(id)
   .populate("business_id")
   .populate("vendorRef")
   .populate("locationRef")
   .populate("goodsReceiptRef")
   .populate("createdByRef");

  if(!item) return res.status(404).json({success:false,message:"Vendor return not found"});

  return res.status(200).json({success:true,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch vendor return",error:error.message});
 }
};

export const updateVendorReturn=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid vendor return id"});

  const item=await VendorReturn.findByIdAndUpdate(id,req.body,{returnDocument:"after",runValidators:true})
   .populate("business_id")
   .populate("vendorRef")
   .populate("locationRef")
   .populate("goodsReceiptRef")
   .populate("createdByRef");

  if(!item) return res.status(404).json({success:false,message:"Vendor return not found"});

  return res.status(200).json({success:true,message:"Vendor return updated successfully",data:item});
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Duplicate vendor return",error:error.message});
  }
  return res.status(500).json({success:false,message:"Failed to update vendor return",error:error.message});
 }
};

export const deleteVendorReturn=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid vendor return id"});

  const item=await VendorReturn.findByIdAndDelete(id);
  if(!item) return res.status(404).json({success:false,message:"Vendor return not found"});

  return res.status(200).json({success:true,message:"Vendor return deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete vendor return",error:error.message});
 }
};

export const updateVendorReturnStatus=async(req,res)=>{
 try{
  const {id}=req.params;
  const {status}=req.body;

  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid vendor return id"});
  if(!["draft","approved","sent","completed","cancelled"].includes(status)){
   return res.status(400).json({success:false,message:"Invalid status value"});
  }

  const item=await VendorReturn.findById(id);
  if(!item) return res.status(404).json({success:false,message:"Vendor return not found"});

  item.status=status;
  await item.save();

  return res.status(200).json({success:true,message:"Vendor return status updated successfully",data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update vendor return status",error:error.message});
 }
};