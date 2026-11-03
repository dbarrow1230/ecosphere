//backend/controllers/inventory/inventoryTransactionController.js
import mongoose from "mongoose";
import InventoryTransaction from "../../models/inventory/inventoryTransactionModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

export const createInventoryTransaction=async(req,res)=>{
 try{
  const item=await InventoryTransaction.create(req.body);
  return res.status(201).json({success:true,message:"Inventory transaction created successfully",data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to create inventory transaction",error:error.message});
 }
};

export const getInventoryTransactions=async(req,res)=>{
 try{
  const {business_id,beverageItemRef,locationRef,lotRef,transactionType,referenceType,referenceId,page=1,limit=20,sortBy="createdAt",sortOrder="desc"}=req.query;
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
  if(transactionType) query.transactionType=transactionType;
  if(referenceType) query.referenceType=referenceType;
  if(referenceId){
   if(!isValidObjectId(referenceId)) return res.status(400).json({success:false,message:"Invalid referenceId"});
   query.referenceId=referenceId;
  }

  const pageNum=Math.max(parseInt(page,10)||1,1);
  const limitNum=Math.max(parseInt(limit,10)||20,1);
  const skip=(pageNum-1)*limitNum;
  const sort={ [sortBy]:sortOrder==="asc"?1:-1 };

  const [items,total]=await Promise.all([
   InventoryTransaction.find(query)
    .populate("business_id")
    .populate("beverageItemRef")
    .populate("locationRef")
    .populate("lotRef")
    .populate("createdByRef")
    .sort(sort)
    .skip(skip)
    .limit(limitNum),
   InventoryTransaction.countDocuments(query)
  ]);

  return res.status(200).json({success:true,count:items.length,total,page:pageNum,pages:Math.ceil(total/limitNum),data:items});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch inventory transactions",error:error.message});
 }
};

export const getInventoryTransactionById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid inventory transaction id"});

  const item=await InventoryTransaction.findById(id)
   .populate("business_id")
   .populate("beverageItemRef")
   .populate("locationRef")
   .populate("lotRef")
   .populate("createdByRef");

  if(!item) return res.status(404).json({success:false,message:"Inventory transaction not found"});

  return res.status(200).json({success:true,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch inventory transaction",error:error.message});
 }
};

export const deleteInventoryTransaction=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid inventory transaction id"});

  const item=await InventoryTransaction.findByIdAndDelete(id);
  if(!item) return res.status(404).json({success:false,message:"Inventory transaction not found"});

  return res.status(200).json({success:true,message:"Inventory transaction deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete inventory transaction",error:error.message});
 }
};