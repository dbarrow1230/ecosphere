// backend/controllers/invoiceController.js
import Invoice from "../models/invoiceModel.js";

export const createInvoice=async(req,res)=>{
 try{
  const {client,event,order,invoiceNumber,issueDate,dueDate,subtotal,tax,discount,total,balanceDue,status,notes}=req.body;
  const invoice=await Invoice.create({
   client,
   event,
   order,
   invoiceNumber,
   issueDate,
   dueDate,
   subtotal,
   tax,
   discount,
   total,
   balanceDue,
   status,
   notes
  });
  res.status(201).json({success:true,message:"Invoice created successfully",invoice});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getInvoices=async(req,res)=>{
 try{
  const invoices=await Invoice.find()
   .populate("client")
   .populate("event")
   .populate("order")
   .sort({issueDate:-1});
  res.status(200).json({success:true,count:invoices.length,invoices});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getSingleInvoice=async(req,res)=>{
 try{
  const invoice=await Invoice.findById(req.params.id)
   .populate("client")
   .populate("event")
   .populate("order");
  if(!invoice){
   return res.status(404).json({success:false,message:"Invoice not found"});
  }
  res.status(200).json({success:true,invoice});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const updateInvoice=async(req,res)=>{
 try{
  const invoice=await Invoice.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
  if(!invoice){
   return res.status(404).json({success:false,message:"Invoice not found"});
  }
  res.status(200).json({success:true,message:"Invoice updated successfully",invoice});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const deleteInvoice=async(req,res)=>{
 try{
  const invoice=await Invoice.findByIdAndDelete(req.params.id);
  if(!invoice){
   return res.status(404).json({success:false,message:"Invoice not found"});
  }
  res.status(200).json({success:true,message:"Invoice deleted successfully"});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};