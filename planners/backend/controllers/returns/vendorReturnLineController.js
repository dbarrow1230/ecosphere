//backend/controllers/returns/vendorReturnLineController.js
import mongoose from "mongoose";
import VendorReturnLine from "../../models/returns/vendorReturnLineModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

export const createVendorReturnLine=async(req,res)=>{
 try{
  const item=await VendorReturnLine.create(req.body);
  return res.status(201).json({success:true,message:"Vendor return line created successfully",data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to create vendor return line",error:error.message});
 }
};

export const getVendorReturnLines=async(req,res)=>{
 try{
  const {business_id,vendorReturnRef,beverageItemRef,lotRef,page=1,limit=20,sortBy="createdAt",sortOrder="desc"}=req.query;
  const query={};

  if(business_id){
   if(!isValidObjectId(business_id)) return res.status(400).json({success:false,message:"Invalid business_id"});
   query.business_id=business_id;
  }
  if(vendorReturnRef){
   if(!isValidObjectId(vendorReturnRef)) return res.status(400).json({success:false,message:"Invalid vendorReturnRef"});
   query.vendorReturnRef=vendorReturnRef;
  }
  if(beverageItemRef){
   if(!isValidObjectId(beverageItemRef)) return res.status(400).json({success:false,message:"Invalid beverageItemRef"});
   query.beverageItemRef=beverageItemRef;
  }
  if(lotRef){
   if(!isValidObjectId(lotRef)) return res.status(400).json({success:false,message:"Invalid lotRef"});
   query.lotRef=lotRef;
  }

  const pageNum=Math.max(parseInt(page,10)||1,1);
  const limitNum=Math.max(parseInt(limit,10)||20,1);
  const skip=(pageNum-1)*limitNum;
  const sort={ [sortBy]:sortOrder==="asc"?1:-1 };

  const [items,total]=await Promise.all([
   VendorReturnLine.find(query)
    .populate("business_id")
    .populate("vendorReturnRef")
    .populate("beverageItemRef")
    .populate("lotRef")
    .populate("uomRef")
    .sort(sort)
    .skip(skip)
    .limit(limitNum),
   VendorReturnLine.countDocuments(query)
  ]);

  return res.status(200).json({success:true,count:items.length,total,page:pageNum,pages:Math.ceil(total/limitNum),data:items});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch vendor return lines",error:error.message});
 }
};

export const getVendorReturnLineById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid vendor return line id"});

  const item=await VendorReturnLine.findById(id)
   .populate("business_id")
   .populate("vendorReturnRef")
   .populate("beverageItemRef")
   .populate("lotRef")
   .populate("uomRef");

  if(!item) return res.status(404).json({success:false,message:"Vendor return line not found"});

  return res.status(200).json({success:true,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch vendor return line",error:error.message});
 }
};

export const updateVendorReturnLine=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid vendor return line id"});

  const item=await VendorReturnLine.findByIdAndUpdate(id,req.body,{returnDocument:"after",runValidators:true})
   .populate("business_id")
   .populate("vendorReturnRef")
   .populate("beverageItemRef")
   .populate("lotRef")
   .populate("uomRef");

  if(!item) return res.status(404).json({success:false,message:"Vendor return line not found"});

  return res.status(200).json({success:true,message:"Vendor return line updated successfully",data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update vendor return line",error:error.message});
 }
};

export const deleteVendorReturnLine=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid vendor return line id"});

  const item=await VendorReturnLine.findByIdAndDelete(id);
  if(!item) return res.status(404).json({success:false,message:"Vendor return line not found"});

  return res.status(200).json({success:true,message:"Vendor return line deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete vendor return line",error:error.message});
 }
};