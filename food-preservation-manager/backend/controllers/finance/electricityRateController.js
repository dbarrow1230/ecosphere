import mongoose from "mongoose";
import ElectricityRate from "../../models/finance/electricityRateModel.js";

const toNum=v=>v==null?null:Number(v.toString());

const parseField=v=>{
 if(v==null||v==="")return undefined;
 if(typeof v!=="string")return v;
 try{
  return JSON.parse(v);
 }catch{
  return v;
 }
};

const toJson=d=>{
 const obj=d.toObject({virtuals:true});

 return {
  ...obj,
  averageDailyUse:obj.averageDailyUse==null?null:toNum(obj.averageDailyUse),
  newRead:obj.newRead?{
   ...obj.newRead,
   read:obj.newRead.read==null?null:toNum(obj.newRead.read)
  }:null,
  priorRead:obj.priorRead?{
   ...obj.priorRead,
   read:obj.priorRead.read==null?null:toNum(obj.priorRead.read)
  }:null,
  supplyCharges:obj.supplyCharges?{
   ...obj.supplyCharges,
   supply:obj.supplyCharges.supply==null?null:toNum(obj.supplyCharges.supply),
   ratePerKwh:obj.supplyCharges.ratePerKwh==null?null:toNum(obj.supplyCharges.ratePerKwh)
  }:null,
  deliveryCharges:obj.deliveryCharges?{
   ...obj.deliveryCharges,
   delivery:obj.deliveryCharges.delivery==null?null:toNum(obj.deliveryCharges.delivery),
   deliveryRate:obj.deliveryCharges.deliveryRate==null?null:toNum(obj.deliveryCharges.deliveryRate),
   systemBenefitCharge:obj.deliveryCharges.systemBenefitCharge==null?null:toNum(obj.deliveryCharges.systemBenefitCharge)
  }:null
 };
};

export const createElectricityRate=async(req,res)=>{
 try{
  const rate=await ElectricityRate.create({
   electricityAccount:req.body.electricityAccount,
   billingStartDate:req.body.billingStartDate,
   billingEndDate:req.body.billingEndDate,
   nextBillingDate:req.body.nextBillingDate,
   averageDailyUse:req.body.averageDailyUse,
   budgetBilledToDate:req.body.budgetBilledToDate,
   actualBilledToDate:req.body.actualBilledToDate,
   amountDue:req.body.amountDue,
   amountPaid:req.body.amountPaid,
   newRead:parseField(req.body.newRead),
   priorRead:parseField(req.body.priorRead),
   lastBillingPeriod:parseField(req.body.lastBillingPeriod),
   newCharges:parseField(req.body.newCharges),
   supplyCharges:parseField(req.body.supplyCharges),
   deliveryCharges:parseField(req.body.deliveryCharges),
   billAttachment:req.file?.filename||req.body.billAttachment,
   notes:req.body.notes
  });
  const populated=await ElectricityRate.findById(rate._id).populate("electricityAccount");
  return res.status(201).json(toJson(populated));
 }catch(err){
  return res.status(400).json({message:"Failed to create electricity rate",error:err.message});
 }
};

export const getElectricityRates=async(req,res)=>{
 try{
  const filter={};

  if(req.query.electricityAccount&&mongoose.Types.ObjectId.isValid(req.query.electricityAccount)){
   filter.electricityAccount=req.query.electricityAccount;
  }

  const rates=await ElectricityRate.find(filter)
   .populate("electricityAccount")
   .sort({billingEndDate:-1,billingStartDate:-1,createdAt:-1});

  return res.json(rates.map(toJson));
 }catch(err){
  return res.status(500).json({message:"Failed to fetch electricity rates",error:err.message});
 }
};

export const getElectricityRateById=async(req,res)=>{
 try{
  const rate=await ElectricityRate.findById(req.params.id).populate("electricityAccount");
  if(!rate)return res.status(404).json({message:"Electricity rate not found"});
  return res.json(toJson(rate));
 }catch(err){
  return res.status(500).json({message:"Failed to fetch electricity rate",error:err.message});
 }
};

export const updateElectricityRate=async(req,res)=>{
 try{
  const updateData={
   electricityAccount:req.body.electricityAccount,
   billingStartDate:req.body.billingStartDate,
   billingEndDate:req.body.billingEndDate,
   nextBillingDate:req.body.nextBillingDate,
   averageDailyUse:req.body.averageDailyUse,
   budgetBilledToDate:req.body.budgetBilledToDate,
   actualBilledToDate:req.body.actualBilledToDate,
   amountDue:req.body.amountDue,
   amountPaid:req.body.amountPaid,
   newRead:parseField(req.body.newRead),
   priorRead:parseField(req.body.priorRead),
   lastBillingPeriod:parseField(req.body.lastBillingPeriod),
   newCharges:parseField(req.body.newCharges),
   supplyCharges:parseField(req.body.supplyCharges),
   deliveryCharges:parseField(req.body.deliveryCharges),
   notes:req.body.notes
  };

  if(req.file?.filename){
   updateData.billAttachment=req.file.filename;
  }else if(req.body.billAttachment!==undefined){
   updateData.billAttachment=req.body.billAttachment;
  }

  Object.keys(updateData).forEach(k=>updateData[k]===undefined&&delete updateData[k]);

  const rate=await ElectricityRate.findByIdAndUpdate(
   req.params.id,
   updateData,
   {returnDocument:"after",runValidators:true}
  ).populate("electricityAccount");

  if(!rate)return res.status(404).json({message:"Electricity rate not found"});
  return res.json(toJson(rate));
 }catch(err){
  return res.status(400).json({message:"Failed to update electricity rate",error:err.message});
 }
};

export const deleteElectricityRate=async(req,res)=>{
 try{
  const rate=await ElectricityRate.findByIdAndDelete(req.params.id);
  if(!rate)return res.status(404).json({message:"Electricity rate not found"});
  return res.json({message:"Electricity rate deleted successfully"});
 }catch(err){
  return res.status(500).json({message:"Failed to delete electricity rate",error:err.message});
 }
};
