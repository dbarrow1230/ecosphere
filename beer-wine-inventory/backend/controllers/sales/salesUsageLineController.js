//backend/controllers/sales/salesUsageLineController.js
import mongoose from "mongoose";
import SalesUsageLine from "../../models/sales/salesUsageLineModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

export const createSalesUsageLine=async(req,res)=>{
 try{
  const item=await SalesUsageLine.create(req.body);
  return res.status(201).json({success:true,message:"Sales usage line created successfully",data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to create sales usage line",error:error.message});
 }
};

export const getSalesUsageLines=async(req,res)=>{
 try{
  const {business_id,salesUsageRef,beverageItemRef,recipeRef,page=1,limit=20,sortBy="createdAt",sortOrder="desc"}=req.query;
  const query={};

  if(business_id){
   if(!isValidObjectId(business_id)) return res.status(400).json({success:false,message:"Invalid business_id"});
   query.business_id=business_id;
  }
  if(salesUsageRef){
   if(!isValidObjectId(salesUsageRef)) return res.status(400).json({success:false,message:"Invalid salesUsageRef"});
   query.salesUsageRef=salesUsageRef;
  }
  if(beverageItemRef){
   if(!isValidObjectId(beverageItemRef)) return res.status(400).json({success:false,message:"Invalid beverageItemRef"});
   query.beverageItemRef=beverageItemRef;
  }
  if(recipeRef){
   if(!isValidObjectId(recipeRef)) return res.status(400).json({success:false,message:"Invalid recipeRef"});
   query.recipeRef=recipeRef;
  }

  const pageNum=Math.max(parseInt(page,10)||1,1);
  const limitNum=Math.max(parseInt(limit,10)||20,1);
  const skip=(pageNum-1)*limitNum;
  const sort={ [sortBy]:sortOrder==="asc"?1:-1 };

  const [items,total]=await Promise.all([
   SalesUsageLine.find(query)
    .populate("business_id")
    .populate("salesUsageRef")
    .populate("beverageItemRef")
    .populate("recipeRef")
    .sort(sort)
    .skip(skip)
    .limit(limitNum),
   SalesUsageLine.countDocuments(query)
  ]);

  return res.status(200).json({success:true,count:items.length,total,page:pageNum,pages:Math.ceil(total/limitNum),data:items});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch sales usage lines",error:error.message});
 }
};

export const getSalesUsageLineById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid sales usage line id"});

  const item=await SalesUsageLine.findById(id)
   .populate("business_id")
   .populate("salesUsageRef")
   .populate("beverageItemRef")
   .populate("recipeRef");

  if(!item) return res.status(404).json({success:false,message:"Sales usage line not found"});

  return res.status(200).json({success:true,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch sales usage line",error:error.message});
 }
};

export const updateSalesUsageLine=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid sales usage line id"});

  const item=await SalesUsageLine.findByIdAndUpdate(id,req.body,{returnDocument:"after",runValidators:true})
   .populate("business_id")
   .populate("salesUsageRef")
   .populate("beverageItemRef")
   .populate("recipeRef");

  if(!item) return res.status(404).json({success:false,message:"Sales usage line not found"});

  return res.status(200).json({success:true,message:"Sales usage line updated successfully",data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update sales usage line",error:error.message});
 }
};

export const deleteSalesUsageLine=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid sales usage line id"});

  const item=await SalesUsageLine.findByIdAndDelete(id);
  if(!item) return res.status(404).json({success:false,message:"Sales usage line not found"});

  return res.status(200).json({success:true,message:"Sales usage line deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete sales usage line",error:error.message});
 }
};