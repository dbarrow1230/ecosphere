// backend/controllers/fuelRateController.js
import mongoose from "mongoose";
import FuelRate from "../../models/finance/fuelRateModel.js";

const decimalToString=value=>{
 if(value==null) return "0.000";
 if(typeof value==="string") return value;
 if(typeof value==="number") return value.toFixed(3);
 if(typeof value?.toString==="function") return value.toString();
 return "0.000";
};

const normalizeFuelRate=rate=>({
 ...rate.toObject({flattenObjectIds:false}),
 ratePerUnit:decimalToString(rate.ratePerUnit),
 deliveryRate:decimalToString(rate.deliveryRate),
 systemBenefitCharge:decimalToString(rate.systemBenefitCharge)
});

export const getFuelRates=async(req,res)=>{
 try{
  const query={};

  if(req.query.fuelAccount&&mongoose.Types.ObjectId.isValid(req.query.fuelAccount)){
   query.fuelAccount=req.query.fuelAccount;
  }

  if(req.query.usageUnit) query.usageUnit=req.query.usageUnit;

  if(req.query.startDate||req.query.endDate){
   query.billingStartDate={};

   if(req.query.startDate) query.billingStartDate.$gte=new Date(req.query.startDate);
   if(req.query.endDate) query.billingStartDate.$lte=new Date(req.query.endDate);
  }

  const fuelRates=await FuelRate.find(query)
  .populate("fuelAccount")
  .sort({billingStartDate:1,createdAt:1});

  return res.status(200).json({
   success:true,
   count:fuelRates.length,
   fuelRates:fuelRates.map(normalizeFuelRate)
  });
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch fuel rates.",error:error.message});
 }
};

export const getFuelRateById=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid fuel rate id."});
  }

  const fuelRate=await FuelRate.findById(id).populate("fuelAccount");

  if(!fuelRate){
   return res.status(404).json({success:false,message:"Fuel rate not found."});
  }

  return res.status(200).json({success:true,fuelRate:normalizeFuelRate(fuelRate)});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch fuel rate.",error:error.message});
 }
};

export const createFuelRate=async(req,res)=>{
 try{
  const fuelRate=await FuelRate.create({
   fuelAccount:req.body.fuelAccount,
   billingStartDate:req.body.billingStartDate,
   billingEndDate:req.body.billingEndDate,
   dueDate:req.body.dueDate,
   ratePerUnit:req.body.ratePerUnit,
   deliveryRate:req.body.deliveryRate,
   systemBenefitCharge:req.body.systemBenefitCharge,
   usageUnit:req.body.usageUnit,
   notes:req.body.notes
  });

  const populatedFuelRate=await FuelRate.findById(fuelRate._id).populate("fuelAccount");

  return res.status(201).json({
   success:true,
   message:"Fuel rate created successfully.",
   fuelRate:normalizeFuelRate(populatedFuelRate)
  });
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to create fuel rate.",error:error.message});
 }
};

export const updateFuelRate=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid fuel rate id."});
  }

  const fuelRate=await FuelRate.findByIdAndUpdate(id,{
   fuelAccount:req.body.fuelAccount,
   billingStartDate:req.body.billingStartDate,
   billingEndDate:req.body.billingEndDate,
   dueDate:req.body.dueDate,
   ratePerUnit:req.body.ratePerUnit,
   deliveryRate:req.body.deliveryRate,
   systemBenefitCharge:req.body.systemBenefitCharge,
   usageUnit:req.body.usageUnit,
   notes:req.body.notes
  },{returnDocument:"after",runValidators:true}).populate("fuelAccount");

  if(!fuelRate){
   return res.status(404).json({success:false,message:"Fuel rate not found."});
  }

  return res.status(200).json({
   success:true,
   message:"Fuel rate updated successfully.",
   fuelRate:normalizeFuelRate(fuelRate)
  });
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update fuel rate.",error:error.message});
 }
};

export const deleteFuelRate=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid fuel rate id."});
  }

  const fuelRate=await FuelRate.findByIdAndDelete(id);

  if(!fuelRate){
   return res.status(404).json({success:false,message:"Fuel rate not found."});
  }

  return res.status(200).json({success:true,message:"Fuel rate deleted successfully."});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete fuel rate.",error:error.message});
 }
};
