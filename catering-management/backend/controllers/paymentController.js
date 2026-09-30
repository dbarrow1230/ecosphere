// backend/controllers/paymentController.js
import Payment from "../models/paymentModel.js";

export const createPayment=async(req,res)=>{
 try{
  const {client,event,order,invoice,paymentNumber,amount,method,status,transactionId,paidAt,notes}=req.body;
  const payment=await Payment.create({
   client,
   event,
   order,
   invoice,
   paymentNumber,
   amount,
   method,
   status,
   transactionId,
   paidAt,
   notes
  });
  res.status(201).json({success:true,message:"Payment created successfully",payment});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getPayments=async(req,res)=>{
 try{
  const payments=await Payment.find()
   .populate("client")
   .populate("event")
   .populate("order")
   .populate("invoice")
   .sort({createdAt:-1});
  res.status(200).json({success:true,count:payments.length,payments});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getSinglePayment=async(req,res)=>{
 try{
  const payment=await Payment.findById(req.params.id)
   .populate("client")
   .populate("event")
   .populate("order")
   .populate("invoice");
  if(!payment){
   return res.status(404).json({success:false,message:"Payment not found"});
  }
  res.status(200).json({success:true,payment});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const updatePayment=async(req,res)=>{
 try{
  const payment=await Payment.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
  if(!payment){
   return res.status(404).json({success:false,message:"Payment not found"});
  }
  res.status(200).json({success:true,message:"Payment updated successfully",payment});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const deletePayment=async(req,res)=>{
 try{
  const payment=await Payment.findByIdAndDelete(req.params.id);
  if(!payment){
   return res.status(404).json({success:false,message:"Payment not found"});
  }
  res.status(200).json({success:true,message:"Payment deleted successfully"});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};