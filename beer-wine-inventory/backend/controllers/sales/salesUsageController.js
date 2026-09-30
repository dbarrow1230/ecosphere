//backend/controllers/sales/salesUsageController.js
import mongoose from "mongoose";
import SalesUsage from "../../models/sales/salesUsageModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

export const createSalesUsage=async(req,res)=>{
 try{
  const item=await SalesUsage.create(req.body);
  return res.status(201).json({success:true,message:"Sales usage created successfully",data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to create sales usage",error:error.message});
 }
};

export const getSalesUsages=async(req,res)=>{
 try{
  const {business_id,locationRef,sourceType,page=1,limit=20,sortBy="createdAt",sortOrder="desc"}=req.query;
  const query={};

  if(business_id){
   if(!isValidObjectId(business_id)) return res.status(400).json({success:false,message:"Invalid business_id"});
   query.business_id=business_id;
  }
  if(locationRef){
   if(!isValidObjectId(locationRef)) return res.status(400).json({success:false,message:"Invalid locationRef"});
   query.locationRef=locationRef;
  }
  if(sourceType) query.sourceType=sourceType;

  const pageNum=Math.max(parseInt(page,10)||1,1);
  const limitNum=Math.max(parseInt(limit,10)||20,1);
  const skip=(pageNum-1)*limitNum;
  const sort={ [sortBy]:sortOrder==="asc"?1:-1 };

  const [items,total]=await Promise.all([
   SalesUsage.find(query)
    .populate("business_id")
    .populate("locationRef")
    .sort(sort)
    .skip(skip)
    .limit(limitNum),
   SalesUsage.countDocuments(query)
  ]);

  return res.status(200).json({success:true,count:items.length,total,page:pageNum,pages:Math.ceil(total/limitNum),data:items});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch sales usage",error:error.message});
 }
};

export const getSalesUsageById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid sales usage id"});

  const item=await SalesUsage.findById(id)
   .populate("business_id")
   .populate("locationRef");

  if(!item) return res.status(404).json({success:false,message:"Sales usage not found"});

  return res.status(200).json({success:true,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch sales usage",error:error.message});
 }
};

export const updateSalesUsage=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid sales usage id"});

  const item=await SalesUsage.findByIdAndUpdate(id,req.body,{returnDocument:"after",runValidators:true})
   .populate("business_id")
   .populate("locationRef");

  if(!item) return res.status(404).json({success:false,message:"Sales usage not found"});

  return res.status(200).json({success:true,message:"Sales usage updated successfully",data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update sales usage",error:error.message});
 }
};

export const deleteSalesUsage=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid sales usage id"});

  const item=await SalesUsage.findByIdAndDelete(id);
  if(!item) return res.status(404).json({success:false,message:"Sales usage not found"});

  return res.status(200).json({success:true,message:"Sales usage deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete sales usage",error:error.message});
 }
};