// backend/controllers/reference/receiptSubHeaderController.js
import ReceiptSubHeader from "../../models/reference/receiptSubHeaderModel.js";

export const createReceiptSubHeader=async(req,res,next)=>{
 try{
  const receiptSubHeader=await ReceiptSubHeader.create(req.body);
  res.status(201).json(receiptSubHeader);
 }catch(error){
  next(error);
 }
};

export const getReceiptSubHeaders=async(req,res,next)=>{
 try{
  const receiptSubHeaders=await ReceiptSubHeader.find()
   .sort({createdAt:-1});

  res.status(200).json(receiptSubHeaders);
 }catch(error){
  next(error);
 }
};

export const getReceiptSubHeaderById=async(req,res,next)=>{
 try{
  const receiptSubHeader=await ReceiptSubHeader.findById(req.params.id);

  if(!receiptSubHeader)return res.status(404).json({message:"Receipt sub header not found"});

  res.status(200).json(receiptSubHeader);
 }catch(error){
  next(error);
 }
};

export const updateReceiptSubHeader=async(req,res,next)=>{
 try{
  const updated=await ReceiptSubHeader.findByIdAndUpdate(
   req.params.id,
   req.body,
   {new:true,runValidators:true}
  );

  if(!updated)return res.status(404).json({message:"Receipt sub header not found"});

  res.status(200).json(updated);
 }catch(error){
  next(error);
 }
};

export const deleteReceiptSubHeader=async(req,res,next)=>{
 try{
  const receiptSubHeader=await ReceiptSubHeader.findByIdAndDelete(req.params.id);

  if(!receiptSubHeader)return res.status(404).json({message:"Receipt sub header not found"});

  res.status(200).json({message:"Receipt sub header deleted successfully"});
 }catch(error){
  next(error);
 }
};