// backend/controllers/electricityAccountController.js
import mongoose from "mongoose";
import ElectricityAccount from "../../models/finance/electricityAccountModel.js";
import ElectricityRate from "../../models/finance/electricityRateModel.js";

// New helper: convert Decimal128 and dates for API responses
const mapRate=r=>({
 _id:r._id,
 electricityAccount:r.electricityAccount,
 billingStartDate:r.billingStartDate,
 billingEndDate:r.billingEndDate,
 dueDate:r.dueDate,
 ratePerKwh:r.ratePerKwh?Number(r.ratePerKwh.toString()):0,
 deliveryRate:r.deliveryRate?Number(r.deliveryRate.toString()):0,
 systemBenefitCharge:r.systemBenefitCharge?Number(r.systemBenefitCharge.toString()):0,
 notes:r.notes||"",
 createdAt:r.createdAt,
 updatedAt:r.updatedAt
});

// New helper: consistent account response with latest rate
const mapAccount=(account,latestRate,totalBills)=>({
 _id:account._id,
 provider:account.provider,
 accountNumber:account.accountNumber,
 meterNumber:account.meterNumber||"",
 nickname:account.nickname||"",
 isActive:account.isActive,
 notes:account.notes||"",
 latestRate:latestRate?mapRate(latestRate):null,
 totalBills:totalBills||0,
 createdAt:account.createdAt,
 updatedAt:account.updatedAt
});

export const createElectricityAccount=async(req,res)=>{
 try{
  const {provider,accountNumber,meterNumber,nickname,isActive,notes}=req.body;
  const account=await ElectricityAccount.create({
   provider,
   accountNumber,
   meterNumber,
   nickname,
   isActive:isActive!==undefined?isActive:true,
   notes
  });
  res.status(201).json(mapAccount(account,null,0));
 }catch(err){
  res.status(400).json({message:err.message});
 }
};

export const getElectricityAccounts=async(req,res)=>{
 try{
  const accounts=await ElectricityAccount.find({}).sort({createdAt:-1}).lean();
  const accountIds=accounts.map(v=>v._id);
  const latestRates=await ElectricityRate.aggregate([
   {$match:{electricityAccount:{$in:accountIds}}},
   {$sort:{billingEndDate:-1,createdAt:-1}},
   {$group:{_id:"$electricityAccount",rate:{$first:"$$ROOT"},totalBills:{$sum:1}}}
  ]);
  const rateMap=new Map(latestRates.map(v=>[String(v._id),v]));
  res.json(accounts.map(account=>{
   const found=rateMap.get(String(account._id));
   return mapAccount(account,found?.rate||null,found?.totalBills||0);
  }));
 }catch(err){
  res.status(500).json({message:err.message});
 }
};

export const getElectricityAccountDetails=async(req,res)=>{
 try{
  const {_id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(400).json({message:"Invalid account id"});
  const account=await ElectricityAccount.findById(_id).lean();
  if(!account) return res.status(404).json({message:"Account not found"});
  const rates=await ElectricityRate.find({electricityAccount:_id}).sort({billingEndDate:-1,createdAt:-1}).lean();
  res.json({
   account:mapAccount(account,rates[0]||null,rates.length),
   bills:rates.map(mapRate)
  });
 }catch(err){
  res.status(500).json({message:err.message});
 }
};

export const updateElectricityAccount=async(req,res)=>{
 try{
  const {_id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(400).json({message:"Invalid account id"});
  const account=await ElectricityAccount.findByIdAndUpdate(_id,req.body,{returnDocument:"after",runValidators:true}).lean();
  if(!account) return res.status(404).json({message:"Account not found"});
  const latestRate=await ElectricityRate.findOne({electricityAccount:_id}).sort({billingEndDate:-1,createdAt:-1}).lean();
  const totalBills=await ElectricityRate.countDocuments({electricityAccount:_id});
  res.json(mapAccount(account,latestRate,totalBills));
 }catch(err){
  res.status(400).json({message:err.message});
 }
};

export const createElectricityBill=async(req,res)=>{
 try{
  const {accountId}=req.params;
  if(!mongoose.Types.ObjectId.isValid(accountId)) return res.status(400).json({message:"Invalid account id"});
  const account=await ElectricityAccount.findById(accountId).lean();
  if(!account) return res.status(404).json({message:"Account not found"});
  const bill=await ElectricityRate.create({
   electricityAccount:accountId,
   billingStartDate:req.body.billingStartDate,
   billingEndDate:req.body.billingEndDate,
   dueDate:req.body.dueDate||null,
   ratePerKwh:req.body.ratePerKwh,
   deliveryRate:req.body.deliveryRate||0,
   systemBenefitCharge:req.body.systemBenefitCharge||0,
   notes:req.body.notes||""
  });
  res.status(201).json(mapRate(bill));
 }catch(err){
  res.status(400).json({message:err.message});
 }
};
