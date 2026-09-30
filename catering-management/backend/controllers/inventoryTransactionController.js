// backend/controllers/inventoryTransactionController.js
import InventoryTransaction from "../models/inventoryTransactionModel.js";

export const createInventoryTransaction=async(req,res)=>{
 try{
  const {inventory,event,order,supplier,type,quantity,unitCost,totalCost,referenceNumber,notes}=req.body;
  const transaction=await InventoryTransaction.create({
   inventory,
   event,
   order,
   supplier,
   type,
   quantity,
   unitCost,
   totalCost,
   referenceNumber,
   notes
  });
  res.status(201).json({success:true,message:"Inventory transaction created successfully",transaction});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getInventoryTransactions=async(req,res)=>{
 try{
  const transactions=await InventoryTransaction.find()
   .populate("inventory")
   .populate("event")
   .populate("order")
   .populate("supplier")
   .sort({createdAt:-1});
  res.status(200).json({success:true,count:transactions.length,transactions});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getSingleInventoryTransaction=async(req,res)=>{
 try{
  const transaction=await InventoryTransaction.findById(req.params.id)
   .populate("inventory")
   .populate("event")
   .populate("order")
   .populate("supplier");
  if(!transaction){
   return res.status(404).json({success:false,message:"Inventory transaction not found"});
  }
  res.status(200).json({success:true,transaction});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const updateInventoryTransaction=async(req,res)=>{
 try{
  const transaction=await InventoryTransaction.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
  if(!transaction){
   return res.status(404).json({success:false,message:"Inventory transaction not found"});
  }
  res.status(200).json({success:true,message:"Inventory transaction updated successfully",transaction});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const deleteInventoryTransaction=async(req,res)=>{
 try{
  const transaction=await InventoryTransaction.findByIdAndDelete(req.params.id);
  if(!transaction){
   return res.status(404).json({success:false,message:"Inventory transaction not found"});
  }
  res.status(200).json({success:true,message:"Inventory transaction deleted successfully"});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};