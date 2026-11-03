//backend/controllers/finance/paymentController.js
import Payment from "../../models/finance/paymentModel.js";

export const createPayment=async(req,res)=>{
 try{
  const payload={...req.body};
  if(req.user?._id) payload.createdBy=req.user._id;

  const payment=await Payment.create(payload);
  return res.status(201).json(payment);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getPayments=async(req,res)=>{
 try{
  const query={};
  if(req.query.project) query.project=req.query.project;
  if(req.query.clientBusiness) query.clientBusiness=req.query.clientBusiness;
  if(req.query.status) query.status=req.query.status;

  const payments=await Payment.find(query).sort({paymentDate:-1});
  return res.status(200).json(payments);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getPaymentById=async(req,res)=>{
 try{
  const payment=await Payment.findById(req.params.id);
  if(!payment) return res.status(404).json({message:"Payment not found"});
  return res.status(200).json(payment);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const updatePayment=async(req,res)=>{
 try{
  const payment=await Payment.findByIdAndUpdate(req.params.id,{$set:req.body},{returnDocument:"after",runValidators:true});
  if(!payment) return res.status(404).json({message:"Payment not found"});
  return res.status(200).json(payment);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const deletePayment=async(req,res)=>{
 try{
  const payment=await Payment.findById(req.params.id);
  if(!payment) return res.status(404).json({message:"Payment not found"});
  await payment.deleteOne();
  return res.status(200).json({message:"Payment removed"});
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};