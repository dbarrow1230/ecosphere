//backend/controllers/waste/wasteRecordController.js
import mongoose from "mongoose";
import WasteRecord from "../../models/waste/wasteRecordModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

export const createWasteRecord=async(req,res)=>{
 try{
  const item=await WasteRecord.create(req.body);
  return res.status(201).json({success:true,message:"Waste record created successfully",data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to create waste record",error:error.message});
 }
};

export const getWasteRecords=async(req,res)=>{
 try{
  const {business_id,beverageItemRef,locationRef,lotRef,reason,page=1,limit=20,sortBy="wasteDate",sortOrder="desc"}=req.query;
  const query={};

  if(business_id){
   if(!isValidObjectId(business_id)) return res.status(400).json({success:false,message:"Invalid business_id"});
   query.business_id=business_id;
  }
  if(beverageItemRef){
   if(!isValidObjectId(beverageItemRef)) return res.status(400).json({success:false,message:"Invalid beverageItemRef"});
   query.beverageItemRef=beverageItemRef;
  }
  if(locationRef){
   if(!isValidObjectId(locationRef)) return res.status(400).json({success:false,message:"Invalid locationRef"});
   query.locationRef=locationRef;
  }
  if(lotRef){
   if(!isValidObjectId(lotRef)) return res.status(400).json({success:false,message:"Invalid lotRef"});
   query.lotRef=lotRef;
  }
  if(reason) query.reason=reason;

  const pageNum=Math.max(parseInt(page,10)||1,1);
  const limitNum=Math.max(parseInt(limit,10)||20,1);
  const skip=(pageNum-1)*limitNum;
  const sort={ [sortBy]:sortOrder==="asc"?1:-1 };

  const [items,total]=await Promise.all([
   WasteRecord.find(query)
    .populate("business_id")
    .populate("beverageItemRef")
    .populate("locationRef")
    .populate("lotRef")
    .populate("createdByRef")
    .sort(sort)
    .skip(skip)
    .limit(limitNum),
   WasteRecord.countDocuments(query)
  ]);

  return res.status(200).json({success:true,count:items.length,total,page:pageNum,pages:Math.ceil(total/limitNum),data:items});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch waste records",error:error.message});
 }
};

export const getWasteRecordById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid waste record id"});

  const item=await WasteRecord.findById(id)
   .populate("business_id")
   .populate("beverageItemRef")
   .populate("locationRef")
   .populate("lotRef")
   .populate("createdByRef");

  if(!item) return res.status(404).json({success:false,message:"Waste record not found"});

  return res.status(200).json({success:true,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch waste record",error:error.message});
 }
};

export const updateWasteRecord=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid waste record id"});

  const item=await WasteRecord.findByIdAndUpdate(id,req.body,{returnDocument:"after",runValidators:true})
   .populate("business_id")
   .populate("beverageItemRef")
   .populate("locationRef")
   .populate("lotRef")
   .populate("createdByRef");

  if(!item) return res.status(404).json({success:false,message:"Waste record not found"});

  return res.status(200).json({success:true,message:"Waste record updated successfully",data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update waste record",error:error.message});
 }
};

export const deleteWasteRecord=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid waste record id"});

  const item=await WasteRecord.findByIdAndDelete(id);
  if(!item) return res.status(404).json({success:false,message:"Waste record not found"});

  return res.status(200).json({success:true,message:"Waste record deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete waste record",error:error.message});
 }
};