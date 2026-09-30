// backend/controllers/reference/receiptHeaderController.js
import ReceiptHeader from "../../models/reference/receiptHeaderModel.js";

export const createReceiptHeader=async(req,res,next)=>{
 try{
  const receiptHeader=await ReceiptHeader.create(req.body);
  res.status(201).json(receiptHeader);
 }catch(error){
  next(error);
 }
};

export const getReceiptHeaders=async(req,res,next)=>{
 try{
  const receiptHeaders=await ReceiptHeader.find()
   .sort({createdAt:-1});

  res.status(200).json(receiptHeaders);
 }catch(error){
  next(error);
 }
};

export const getReceiptHeaderById=async(req,res,next)=>{
 try{
  const receiptHeader=await ReceiptHeader.findById(req.params.id);

  if(!receiptHeader)return res.status(404).json({message:"Receipt header not found"});

  res.status(200).json(receiptHeader);
 }catch(error){
  next(error);
 }
};

export const updateReceiptHeader=async(req,res,next)=>{
 try{
  const updated=await ReceiptHeader.findByIdAndUpdate(
   req.params.id,
   req.body,
   {returnDocument:"after",runValidators:true}
  );

  if(!updated)return res.status(404).json({message:"Receipt header not found"});

  res.status(200).json(updated);
 }catch(error){
  next(error);
 }
};

export const deleteReceiptHeader=async(req,res,next)=>{
 try{
  const receiptHeader=await ReceiptHeader.findByIdAndDelete(req.params.id);

  if(!receiptHeader)return res.status(404).json({message:"Receipt header deleted successfully"});

  res.status(200).json({message:"Receipt header deleted successfully"});
 }catch(error){
  next(error);
 }
};
