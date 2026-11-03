//backend/controllers/finance/invoiceController.js
import Invoice from "../../models/finance/invoiceModel.js";

export const createInvoice=async(req,res)=>{
 try{
  const payload={...req.body};
  if(req.user?._id) payload.createdBy=req.user._id;

  const invoice=await Invoice.create(payload);
  return res.status(201).json(invoice);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getInvoices=async(req,res)=>{
 try{
  const query={};
  if(req.query.project) query.project=req.query.project;
  if(req.query.clientBusiness) query.clientBusiness=req.query.clientBusiness;
  if(req.query.status) query.status=req.query.status;

  const invoices=await Invoice.find(query).sort({createdAt:-1});
  return res.status(200).json(invoices);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getInvoiceById=async(req,res)=>{
 try{
  const invoice=await Invoice.findById(req.params.id);
  if(!invoice) return res.status(404).json({message:"Invoice not found"});
  return res.status(200).json(invoice);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const updateInvoice=async(req,res)=>{
 try{
  const invoice=await Invoice.findByIdAndUpdate(req.params.id,{$set:req.body},{returnDocument:"after",runValidators:true});
  if(!invoice) return res.status(404).json({message:"Invoice not found"});
  return res.status(200).json(invoice);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const deleteInvoice=async(req,res)=>{
 try{
  const invoice=await Invoice.findById(req.params.id);
  if(!invoice) return res.status(404).json({message:"Invoice not found"});
  await invoice.deleteOne();
  return res.status(200).json({message:"Invoice removed"});
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};