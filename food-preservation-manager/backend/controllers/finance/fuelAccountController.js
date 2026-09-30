// backend/controllers/fuelAccountController.js
import mongoose from "mongoose";
import FuelAccount from "../../models/finance/fuelAccountModel.js";

export const getFuelAccounts=async(req,res)=>{
 try{
  const query={};

  if(req.query.isActive!==""){
   if(req.query.isActive==="true") query.isActive=true;
   if(req.query.isActive==="false") query.isActive=false;
  }

  if(req.query.fuelType) query.fuelType=req.query.fuelType;

  const fuelAccounts=await FuelAccount.find(query).sort({provider:1,nickname:1,createdAt:-1});

  return res.status(200).json({success:true,count:fuelAccounts.length,fuelAccounts});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch fuel accounts.",error:error.message});
 }
};

export const getFuelAccountById=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid fuel account id."});
  }

  const fuelAccount=await FuelAccount.findById(id);

  if(!fuelAccount){
   return res.status(404).json({success:false,message:"Fuel account not found."});
  }

  return res.status(200).json({success:true,fuelAccount});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch fuel account.",error:error.message});
 }
};

export const createFuelAccount=async(req,res)=>{
 try{
  const fuelAccount=await FuelAccount.create({
   provider:req.body.provider,
   accountNumber:req.body.accountNumber,
   fuelType:req.body.fuelType,
   nickname:req.body.nickname,
   isActive:req.body.isActive,
   notes:req.body.notes
  });

  return res.status(201).json({success:true,message:"Fuel account created successfully.",fuelAccount});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to create fuel account.",error:error.message});
 }
};

export const updateFuelAccount=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid fuel account id."});
  }

  const fuelAccount=await FuelAccount.findByIdAndUpdate(id,{
   provider:req.body.provider,
   accountNumber:req.body.accountNumber,
   fuelType:req.body.fuelType,
   nickname:req.body.nickname,
   isActive:req.body.isActive,
   notes:req.body.notes
  },{returnDocument:"after",runValidators:true});

  if(!fuelAccount){
   return res.status(404).json({success:false,message:"Fuel account not found."});
  }

  return res.status(200).json({success:true,message:"Fuel account updated successfully.",fuelAccount});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update fuel account.",error:error.message});
 }
};

export const deleteFuelAccount=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid fuel account id."});
  }

  const fuelAccount=await FuelAccount.findByIdAndDelete(id);

  if(!fuelAccount){
   return res.status(404).json({success:false,message:"Fuel account not found."});
  }

  return res.status(200).json({success:true,message:"Fuel account deleted successfully."});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete fuel account.",error:error.message});
 }
};
