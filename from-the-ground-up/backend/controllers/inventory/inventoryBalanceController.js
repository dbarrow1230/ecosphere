//backend/controllers/inventory/inventoryBalanceController.js
import mongoose from "mongoose";
import InventoryBalance from "../../models/inventory/inventoryBalanceModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

export const createInventoryBalance=async(req,res)=>{
 try{
  const item=await InventoryBalance.create(req.body);
  return res.status(201).json({success:true,message:"Inventory balance created successfully",data:item});
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Duplicate inventory balance",error:error.message});
  }
  return res.status(500).json({success:false,message:"Failed to create inventory balance",error:error.message});
 }
};

export const getInventoryBalances=async(req,res)=>{
 try{
  const {business_id,beverageItemRef,locationRef,page=1,limit=20,sortBy="createdAt",sortOrder="desc"}=req.query;
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

  const pageNum=Math.max(parseInt(page,10)||1,1);
  const limitNum=Math.max(parseInt(limit,10)||20,1);
  const skip=(pageNum-1)*limitNum;
  const sort={ [sortBy]:sortOrder==="asc"?1:-1 };

  const [items,total]=await Promise.all([
   InventoryBalance.find(query)
    .populate("business_id")
    .populate("beverageItemRef")
    .populate("locationRef")
    .sort(sort)
    .skip(skip)
    .limit(limitNum),
   InventoryBalance.countDocuments(query)
  ]);

  return res.status(200).json({success:true,count:items.length,total,page:pageNum,pages:Math.ceil(total/limitNum),data:items});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch inventory balances",error:error.message});
 }
};

export const getInventoryBalanceById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid inventory balance id"});

  const item=await InventoryBalance.findById(id)
   .populate("business_id")
   .populate("beverageItemRef")
   .populate("locationRef");

  if(!item) return res.status(404).json({success:false,message:"Inventory balance not found"});

  return res.status(200).json({success:true,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch inventory balance",error:error.message});
 }
};

export const updateInventoryBalance=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid inventory balance id"});

  const item=await InventoryBalance.findByIdAndUpdate(id,req.body,{new:true,runValidators:true})
   .populate("business_id")
   .populate("beverageItemRef")
   .populate("locationRef");

  if(!item) return res.status(404).json({success:false,message:"Inventory balance not found"});

  return res.status(200).json({success:true,message:"Inventory balance updated successfully",data:item});
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Duplicate inventory balance",error:error.message});
  }
  return res.status(500).json({success:false,message:"Failed to update inventory balance",error:error.message});
 }
};

export const deleteInventoryBalance=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid inventory balance id"});

  const item=await InventoryBalance.findByIdAndDelete(id);
  if(!item) return res.status(404).json({success:false,message:"Inventory balance not found"});

  return res.status(200).json({success:true,message:"Inventory balance deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete inventory balance",error:error.message});
 }
};