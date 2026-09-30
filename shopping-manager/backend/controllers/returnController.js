// /backend/controllers/returnController.js
import Return from '../models/returnModel.js';

export const createReturn=async(req,res)=>{
try{
const{user,store,order,purchase,receipt,returnNumber,returnDate,status,refundStatus,refundMethod,carrier,trackingNumber,trackingUrl,reason,refundTotal,requestedAt,approvedAt,shippedAt,receivedAt,completedAt,notes}=req.body;
if(!user||!returnNumber)return res.status(400).json({success:false,message:'User and returnNumber are required'});
const existing=await Return.findOne({returnNumber:returnNumber.trim()});
if(existing)return res.status(409).json({success:false,message:'Return number already exists'});
const returnDoc=await Return.create({user,store,order,purchase,receipt,returnNumber,returnDate,status,refundStatus,refundMethod,carrier,trackingNumber,trackingUrl,reason,refundTotal,requestedAt,approvedAt,shippedAt,receivedAt,completedAt,notes});
res.status(201).json({success:true,message:'Return created successfully',return:returnDoc});
}catch(error){
res.status(500).json({success:false,message:'Error creating return',error:error.message});
}
};

export const getReturns=async(req,res)=>{
try{
const query={};
if(req.query.user)query.user=req.query.user;
if(req.query.store)query.store=req.query.store;
if(req.query.order)query.order=req.query.order;
if(req.query.purchase)query.purchase=req.query.purchase;
if(req.query.receipt)query.receipt=req.query.receipt;
if(req.query.status)query.status=req.query.status;
if(req.query.refundStatus)query.refundStatus=req.query.refundStatus;
if(req.query.refundMethod)query.refundMethod=req.query.refundMethod;
const returns=await Return.find(query)
.populate('user')
.populate('store')
.populate('order')
.populate('purchase')
.populate('receipt')
.populate('status')
.populate('refundStatus')
.populate('refundMethod')
.sort({createdAt:-1});
res.status(200).json({success:true,count:returns.length,returns});
}catch(error){
res.status(500).json({success:false,message:'Error fetching returns',error:error.message});
}
};

export const getReturnById=async(req,res)=>{
try{
const returnDoc=await Return.findById(req.params.id)
.populate('user')
.populate('store')
.populate('order')
.populate('purchase')
.populate('receipt')
.populate('status')
.populate('refundStatus')
.populate('refundMethod');
if(!returnDoc)return res.status(404).json({success:false,message:'Return not found'});
res.status(200).json({success:true,return:returnDoc});
}catch(error){
res.status(500).json({success:false,message:'Error fetching return',error:error.message});
}
};

export const getReturnsByUser=async(req,res)=>{
try{
const returns=await Return.find({user:req.params.userId})
.populate('user')
.populate('store')
.populate('order')
.populate('purchase')
.populate('receipt')
.populate('status')
.populate('refundStatus')
.populate('refundMethod')
.sort({createdAt:-1});
res.status(200).json({success:true,count:returns.length,returns});
}catch(error){
res.status(500).json({success:false,message:'Error fetching user returns',error:error.message});
}
};

export const getReturnByNumber=async(req,res)=>{
try{
const returnDoc=await Return.findOne({returnNumber:req.params.returnNumber.trim()})
.populate('user')
.populate('store')
.populate('order')
.populate('purchase')
.populate('receipt')
.populate('status')
.populate('refundStatus')
.populate('refundMethod');
if(!returnDoc)return res.status(404).json({success:false,message:'Return not found'});
res.status(200).json({success:true,return:returnDoc});
}catch(error){
res.status(500).json({success:false,message:'Error fetching return',error:error.message});
}
};

export const updateReturn=async(req,res)=>{
try{
const{user,store,order,purchase,receipt,returnNumber,returnDate,status,refundStatus,refundMethod,carrier,trackingNumber,trackingUrl,reason,refundTotal,requestedAt,approvedAt,shippedAt,receivedAt,completedAt,notes}=req.body;
const returnDoc=await Return.findById(req.params.id);
if(!returnDoc)return res.status(404).json({success:false,message:'Return not found'});
if(returnNumber&&returnNumber.trim()!==returnDoc.returnNumber){
const existing=await Return.findOne({returnNumber:returnNumber.trim(),_id:{$ne:req.params.id}});
if(existing)return res.status(409).json({success:false,message:'Return number already exists'});
}
returnDoc.user=user??returnDoc.user;
returnDoc.store=store!==undefined?store:returnDoc.store;
returnDoc.order=order!==undefined?order:returnDoc.order;
returnDoc.purchase=purchase!==undefined?purchase:returnDoc.purchase;
returnDoc.receipt=receipt!==undefined?receipt:returnDoc.receipt;
returnDoc.returnNumber=returnNumber??returnDoc.returnNumber;
returnDoc.returnDate=returnDate!==undefined?returnDate:returnDoc.returnDate;
returnDoc.status=status!==undefined?status:returnDoc.status;
returnDoc.refundStatus=refundStatus!==undefined?refundStatus:returnDoc.refundStatus;
returnDoc.refundMethod=refundMethod!==undefined?refundMethod:returnDoc.refundMethod;
returnDoc.carrier=carrier??returnDoc.carrier;
returnDoc.trackingNumber=trackingNumber??returnDoc.trackingNumber;
returnDoc.trackingUrl=trackingUrl??returnDoc.trackingUrl;
returnDoc.reason=reason??returnDoc.reason;
returnDoc.refundTotal=refundTotal??returnDoc.refundTotal;
returnDoc.requestedAt=requestedAt!==undefined?requestedAt:returnDoc.requestedAt;
returnDoc.approvedAt=approvedAt!==undefined?approvedAt:returnDoc.approvedAt;
returnDoc.shippedAt=shippedAt!==undefined?shippedAt:returnDoc.shippedAt;
returnDoc.receivedAt=receivedAt!==undefined?receivedAt:returnDoc.receivedAt;
returnDoc.completedAt=completedAt!==undefined?completedAt:returnDoc.completedAt;
returnDoc.notes=notes??returnDoc.notes;
await returnDoc.save();
const updatedReturn=await Return.findById(returnDoc._id)
.populate('user')
.populate('store')
.populate('order')
.populate('purchase')
.populate('receipt')
.populate('status')
.populate('refundStatus')
.populate('refundMethod');
res.status(200).json({success:true,message:'Return updated successfully',return:updatedReturn});
}catch(error){
res.status(500).json({success:false,message:'Error updating return',error:error.message});
}
};

export const deleteReturn=async(req,res)=>{
try{
const returnDoc=await Return.findById(req.params.id);
if(!returnDoc)return res.status(404).json({success:false,message:'Return not found'});
await Return.findByIdAndDelete(req.params.id);
res.status(200).json({success:true,message:'Return deleted successfully'});
}catch(error){
res.status(500).json({success:false,message:'Error deleting return',error:error.message});
}
};