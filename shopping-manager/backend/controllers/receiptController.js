// /backend/controllers/receiptController.js
import Receipt from '../models/receiptModel.js';
import State from '../models/locations/stateModel.js';
import Country from '../models/locations/countryModel.js';
import Currency from '../models/currencyModel.js';

export const createReceipt=async(req,res)=>{
try{
const{user,purchase,store,receiptNumber,image,purchaseDate,subtotal,taxTotal,discountTotal,total,currency,address1,address2,city,state,country,postalCode,notes}=req.body;
if(!user)return res.status(400).json({success:false,message:'User is required'});
const receipt=await Receipt.create({user,purchase,store,receiptNumber,image,purchaseDate,subtotal,taxTotal,discountTotal,total,currency,address1,address2,city,state,country,postalCode,notes});
res.status(201).json({success:true,message:'Receipt created successfully',receipt});
}catch(error){
res.status(500).json({success:false,message:'Error creating receipt',error:error.message});
}
};

export const getReceipts=async(req,res)=>{
try{
const query={};
if(req.query.user)query.user=req.query.user;
if(req.query.purchase)query.purchase=req.query.purchase;
if(req.query.store)query.store=req.query.store;
if(req.query.currency)query.currency=req.query.currency;
const receipts=await Receipt.find(query)
.populate('user')
.populate('purchase')
.populate('store')
.populate({path:'currency',model:Currency})
.populate({path:'state',model:State})
.populate({path:'country',model:Country})
.sort({createdAt:-1});
res.status(200).json({success:true,count:receipts.length,receipts});
}catch(error){
res.status(500).json({success:false,message:'Error fetching receipts',error:error.message});
}
};

export const getReceiptById=async(req,res)=>{
try{
const receipt=await Receipt.findById(req.params.id)
.populate('user')
.populate('purchase')
.populate('store')
.populate({path:'currency',model:Currency})
.populate({path:'state',model:State})
.populate({path:'country',model:Country});
if(!receipt)return res.status(404).json({success:false,message:'Receipt not found'});
res.status(200).json({success:true,receipt});
}catch(error){
res.status(500).json({success:false,message:'Error fetching receipt',error:error.message});
}
};

export const getReceiptsByUser=async(req,res)=>{
try{
const receipts=await Receipt.find({user:req.params.userId})
.populate('user')
.populate('purchase')
.populate('store')
.populate({path:'currency',model:Currency})
.populate({path:'state',model:State})
.populate({path:'country',model:Country})
.sort({createdAt:-1});
res.status(200).json({success:true,count:receipts.length,receipts});
}catch(error){
res.status(500).json({success:false,message:'Error fetching user receipts',error:error.message});
}
};

export const updateReceipt=async(req,res)=>{
try{
const{user,purchase,store,receiptNumber,image,purchaseDate,subtotal,taxTotal,discountTotal,total,currency,address1,address2,city,state,country,postalCode,notes}=req.body;
const receipt=await Receipt.findById(req.params.id);
if(!receipt)return res.status(404).json({success:false,message:'Receipt not found'});
receipt.user=user??receipt.user;
receipt.purchase=purchase!==undefined?purchase:receipt.purchase;
receipt.store=store!==undefined?store:receipt.store;
receipt.receiptNumber=receiptNumber??receipt.receiptNumber;
receipt.image=image??receipt.image;
receipt.purchaseDate=purchaseDate!==undefined?purchaseDate:receipt.purchaseDate;
receipt.subtotal=subtotal??receipt.subtotal;
receipt.taxTotal=taxTotal??receipt.taxTotal;
receipt.discountTotal=discountTotal??receipt.discountTotal;
receipt.total=total??receipt.total;
receipt.currency=currency!==undefined?currency:receipt.currency;
receipt.address1=address1??receipt.address1;
receipt.address2=address2??receipt.address2;
receipt.city=city??receipt.city;
receipt.state=state!==undefined?state:receipt.state;
receipt.country=country!==undefined?country:receipt.country;
receipt.postalCode=postalCode??receipt.postalCode;
receipt.notes=notes??receipt.notes;
await receipt.save();
const updatedReceipt=await Receipt.findById(receipt._id)
.populate('user')
.populate('purchase')
.populate('store')
.populate({path:'currency',model:Currency})
.populate({path:'state',model:State})
.populate({path:'country',model:Country});
res.status(200).json({success:true,message:'Receipt updated successfully',receipt:updatedReceipt});
}catch(error){
res.status(500).json({success:false,message:'Error updating receipt',error:error.message});
}
};

export const deleteReceipt=async(req,res)=>{
try{
const receipt=await Receipt.findById(req.params.id);
if(!receipt)return res.status(404).json({success:false,message:'Receipt not found'});
await Receipt.findByIdAndDelete(req.params.id);
res.status(200).json({success:true,message:'Receipt deleted successfully'});
}catch(error){
res.status(500).json({success:false,message:'Error deleting receipt',error:error.message});
}
};