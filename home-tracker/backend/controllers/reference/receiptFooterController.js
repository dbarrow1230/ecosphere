// backend/controllers/reference/receiptFooterController.js
import ReceiptFooter from "../../models/reference/receiptFooterModel.js";

export const createReceiptFooter=async(req,res,next)=>{
 try{
  const receiptFooter=await ReceiptFooter.create(req.body);
  res.status(201).json(receiptFooter);
 }catch(error){
  next(error);
 }
};

export const getReceiptFooters=async(req,res,next)=>{
 try{
  const receiptFooters=await ReceiptFooter.find()
   .sort({createdAt:-1});

  res.status(200).json(receiptFooters);
 }catch(error){
  next(error);
 }
};

export const getReceiptFooterById=async(req,res,next)=>{
 try{
  const receiptFooter=await ReceiptFooter.findById(req.params.id);

  if(!receiptFooter)return res.status(404).json({message:"Receipt footer not found"});

  res.status(200).json(receiptFooter);
 }catch(error){
  next(error);
 }
};

export const updateReceiptFooter=async(req,res,next)=>{
 try{
  const updated=await ReceiptFooter.findByIdAndUpdate(
   req.params.id,
   req.body,
   {new:true,runValidators:true}
  );

  if(!updated)return res.status(404).json({message:"Receipt footer not found"});

  res.status(200).json(updated);
 }catch(error){
  next(error);
 }
};

export const deleteReceiptFooter=async(req,res,next)=>{
 try{
  const receiptFooter=await ReceiptFooter.findByIdAndDelete(req.params.id);

  if(!receiptFooter)return res.status(404).json({message:"Receipt footer not found"});

  res.status(200).json({message:"Receipt footer deleted successfully"});
 }catch(error){
  next(error);
 }
};