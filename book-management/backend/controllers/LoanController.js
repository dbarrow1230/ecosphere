// backend/controllers/LoanController.js
import mongoose from "mongoose";
import LoanModel from "../models/LoanModel.js";

const loanPopulate=[
 {path:"book"},
 {path:"contact"}
];

const applyPopulate=query=>{
 loanPopulate.forEach(item=>query.populate(item));
 return query;
};

const toObjectId=value=>mongoose.Types.ObjectId.isValid(value)?new mongoose.Types.ObjectId(value):null;

const normalizeNotes=value=>{
 if(Array.isArray(value))return value.filter(Boolean).map(item=>String(item).trim()).filter(Boolean);
 if(typeof value==="string")return value.split(",").map(item=>item.trim()).filter(Boolean);
 return [];
};

const normalizeLoanPayload=body=>{
 const payload={...body};

 if(Object.prototype.hasOwnProperty.call(payload,"book")){
  payload.book=toObjectId(payload.book);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"contact")){
  payload.contact=toObjectId(payload.contact);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"lentAt")){
  payload.lentAt=payload.lentAt||null;
 }

 if(Object.prototype.hasOwnProperty.call(payload,"returnedAt")){
  payload.returnedAt=payload.returnedAt||null;
 }

 if(Object.prototype.hasOwnProperty.call(payload,"loanRule")){
  payload.loanRule=(payload.loanRule||"default").toString().trim();
 }

 if(Object.prototype.hasOwnProperty.call(payload,"conditionOut")){
  payload.conditionOut=(payload.conditionOut||"good").toString().trim();
 }

 if(Object.prototype.hasOwnProperty.call(payload,"conditionIn")){
  payload.conditionIn=(payload.conditionIn||"good").toString().trim();
 }

 if(Object.prototype.hasOwnProperty.call(payload,"notes")){
  payload.notes=normalizeNotes(payload.notes);
 }

 return payload;
};

const buildLoanQuery=async queryParams=>{
 const {status="",book="",contact="",overdue="",active=""}=queryParams;
 const query={};

 if(status)query.status=status;

 if(book){
  const bookId=toObjectId(book);
  query.book=bookId||null;
 }

 if(contact){
  const contactId=toObjectId(contact);
  query.contact=contactId||null;
 }

 if(active==="true"){
  query.returnedAt=null;
 }

 if(active==="false"){
  query.returnedAt={$ne:null};
 }

 if(overdue==="true"){
  query.returnedAt=null;
  query.dueAt={$lt:new Date()};
 }

 return query;
};

export const createLoan=async(req,res)=>{
 try{
  const payload=normalizeLoanPayload(req.body);

  if(!payload.book)return res.status(400).json({success:false,message:"Book is required"});
  if(!payload.contact)return res.status(400).json({success:false,message:"Contact is required"});

  const loan=await LoanModel.create(payload);
  const populated=await applyPopulate(LoanModel.findById(loan._id));
  return res.status(201).json({success:true,message:"Loan created successfully",loan:await populated});
 }catch(error){
  console.error("CREATE LOAN ERROR:",error);

  if(error.name==="ValidationError"){
   const firstError=Object.values(error.errors||{})[0];
   return res.status(400).json({success:false,message:firstError?.message||"Validation failed",error:error.message});
  }

  if(error.name==="CastError"){
   return res.status(400).json({success:false,message:`Invalid value for ${error.path}`,error:error.message});
  }

  return res.status(500).json({success:false,message:error.message||"Failed to create loan",error:error.message});
 }
};

export const getLoans=async(req,res)=>{
 try{
  const {page=1,limit=20,sort="lentAt",order="desc"}=req.query;
  const query=await buildLoanQuery(req.query);
  const currentPage=Math.max(parseInt(page)||1,1);
  const perPage=Math.max(parseInt(limit)||20,1);
  const skip=(currentPage-1)*perPage;
  const sortOrder=order==="asc"?1:-1;

  const [loans,total]=await Promise.all([
   applyPopulate(
    LoanModel.find(query)
     .sort({[sort]:sortOrder})
     .skip(skip)
     .limit(perPage)
   ),
   LoanModel.countDocuments(query)
  ]);

  return res.status(200).json({
   success:true,
   total,
   page:currentPage,
   pages:Math.ceil(total/perPage),
   limit:perPage,
   loans
  });
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch loans",error:error.message});
 }
};

export const getLoanById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid loan id"});

  const loan=await applyPopulate(LoanModel.findById(id));
  if(!loan)return res.status(404).json({success:false,message:"Loan not found"});

  return res.status(200).json({success:true,loan});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch loan",error:error.message});
 }
};

export const updateLoan=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid loan id"});

  const payload=normalizeLoanPayload(req.body);

  const loan=await applyPopulate(
   LoanModel.findByIdAndUpdate(id,payload,{new:true,runValidators:true})
  );

  if(!loan)return res.status(404).json({success:false,message:"Loan not found"});

  return res.status(200).json({success:true,message:"Loan updated successfully",loan});
 }catch(error){
  console.error("UPDATE LOAN ERROR:",error);

  if(error.name==="ValidationError"){
   const firstError=Object.values(error.errors||{})[0];
   return res.status(400).json({success:false,message:firstError?.message||"Validation failed",error:error.message});
  }

  if(error.name==="CastError"){
   return res.status(400).json({success:false,message:`Invalid value for ${error.path}`,error:error.message});
  }

  return res.status(500).json({success:false,message:error.message||"Failed to update loan",error:error.message});
 }
};

export const returnLoan=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid loan id"});

  const loan=await LoanModel.findById(id);
  if(!loan)return res.status(404).json({success:false,message:"Loan not found"});
  if(loan.returnedAt)return res.status(400).json({success:false,message:"Loan is already returned"});

  loan.returnedAt=req.body?.returnedAt||new Date();
  loan.conditionIn=(req.body?.conditionIn||loan.conditionIn||"good").toString().trim();

  if(Object.prototype.hasOwnProperty.call(req.body||{},"notes")){
   loan.notes=normalizeNotes(req.body.notes);
  }

  await loan.save();

  const populated=await applyPopulate(LoanModel.findById(loan._id));
  return res.status(200).json({success:true,message:"Loan returned successfully",loan:await populated});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to return loan",error:error.message});
 }
};

export const deleteLoan=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid loan id"});

  const loan=await LoanModel.findByIdAndDelete(id);
  if(!loan)return res.status(404).json({success:false,message:"Loan not found"});

  return res.status(200).json({success:true,message:"Loan deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete loan",error:error.message});
 }
};
