// backend/controllers/reference/receiptTemplateController.js
import ReceiptTemplate from "../../models/reference/receiptTemplateModel.js";

export const createReceiptTemplate=async(req,res,next)=>{
 try{
  const receiptTemplate=await ReceiptTemplate.create(req.body);
  res.status(201).json(receiptTemplate);
 }catch(error){
  next(error);
 }
};

export const getReceiptTemplates=async(req,res,next)=>{
 try{
  const receiptTemplates=await ReceiptTemplate.find()
   .sort({createdAt:-1});

  res.status(200).json(receiptTemplates);
 }catch(error){
  next(error);
 }
};

export const getReceiptTemplateById=async(req,res,next)=>{
 try{
  const receiptTemplate=await ReceiptTemplate.findById(req.params.id);

  if(!receiptTemplate)return res.status(404).json({message:"Receipt template not found"});

  res.status(200).json(receiptTemplate);
 }catch(error){
  next(error);
 }
};

export const updateReceiptTemplate=async(req,res,next)=>{
 try{
  const updated=await ReceiptTemplate.findByIdAndUpdate(
   req.params.id,
   req.body,
   {new:true,runValidators:true}
  );

  if(!updated)return res.status(404).json({message:"Receipt template not found"});

  res.status(200).json(updated);
 }catch(error){
  next(error);
 }
};

export const deleteReceiptTemplate=async(req,res,next)=>{
 try{
  const receiptTemplate=await ReceiptTemplate.findByIdAndDelete(req.params.id);

  if(!receiptTemplate)return res.status(404).json({message:"Receipt template not found"});

  res.status(200).json({message:"Receipt template deleted successfully"});
 }catch(error){
  next(error);
 }
};