// backend/controllers/inventoryController.js
import Inventory from "../models/inventoryModel.js";

export const createInventory=async(req,res)=>{
 try{
  const item=await Inventory.create(req.body);
  res.status(201).json({success:true,message:"Inventory item created successfully",item});
 }catch(error){
  res.status(400).json({success:false,message:error.message});
 }
};

export const getInventory=async(req,res)=>{
 try{
  const items=await Inventory.find().sort({name:1});
  res.status(200).json({success:true,count:items.length,items});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getSingleInventory=async(req,res)=>{
 try{
  const item=await Inventory.findById(req.params.id);
  if(!item){
   return res.status(404).json({success:false,message:"Inventory item not found"});
  }
  res.status(200).json({success:true,item});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const updateInventory=async(req,res)=>{
 try{
  const item=await Inventory.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
  if(!item){
   return res.status(404).json({success:false,message:"Inventory item not found"});
  }
  res.status(200).json({success:true,message:"Inventory item updated successfully",item});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const deleteInventory=async(req,res)=>{
 try{
  const item=await Inventory.findByIdAndDelete(req.params.id);
  if(!item){
   return res.status(404).json({success:false,message:"Inventory item not found"});
  }
  res.status(200).json({success:true,message:"Inventory item deleted successfully"});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};
