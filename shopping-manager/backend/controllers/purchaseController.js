// /backend/controllers/purchaseController.js
import Purchase from '../models/purchaseModel.js';

export const createPurchase=async(req,res)=>{
try{
const{user,store,receipt,coupon,shoppingList,purchaseDate,subtotal,discountTotal,taxTotal,shippingTotal,total,paymentMethod,status,notes}=req.body;
if(!user)return res.status(400).json({success:false,message:'User is required'});
const purchase=await Purchase.create({user,store,receipt,coupon,shoppingList,purchaseDate,subtotal,discountTotal,taxTotal,shippingTotal,total,paymentMethod,status,notes});
res.status(201).json({success:true,message:'Purchase created successfully',purchase});
}catch(error){
res.status(500).json({success:false,message:'Error creating purchase',error:error.message});
}
};

export const getPurchases=async(req,res)=>{
try{
const query={};
if(req.query.user)query.user=req.query.user;
if(req.query.store)query.store=req.query.store;
if(req.query.status)query.status=req.query.status;
const purchases=await Purchase.find(query)
.populate('user')
.populate('store')
.populate('receipt')
.populate('coupon')
.populate('shoppingList')
.populate('status')
.sort({createdAt:-1});
res.status(200).json({success:true,count:purchases.length,purchases});
}catch(error){
res.status(500).json({success:false,message:'Error fetching purchases',error:error.message});
}
};

export const getPurchaseById=async(req,res)=>{
try{
const purchase=await Purchase.findById(req.params.id)
.populate('user')
.populate('store')
.populate('receipt')
.populate('coupon')
.populate('shoppingList')
.populate('status');
if(!purchase)return res.status(404).json({success:false,message:'Purchase not found'});
res.status(200).json({success:true,purchase});
}catch(error){
res.status(500).json({success:false,message:'Error fetching purchase',error:error.message});
}
};

export const getPurchasesByUser=async(req,res)=>{
try{
const purchases=await Purchase.find({user:req.params.userId})
.populate('user')
.populate('store')
.populate('receipt')
.populate('coupon')
.populate('shoppingList')
.populate('status')
.sort({createdAt:-1});
res.status(200).json({success:true,count:purchases.length,purchases});
}catch(error){
res.status(500).json({success:false,message:'Error fetching user purchases',error:error.message});
}
};

export const updatePurchase=async(req,res)=>{
try{
const{user,store,receipt,coupon,shoppingList,purchaseDate,subtotal,discountTotal,taxTotal,shippingTotal,total,paymentMethod,status,notes}=req.body;
const purchase=await Purchase.findById(req.params.id);
if(!purchase)return res.status(404).json({success:false,message:'Purchase not found'});
purchase.user=user??purchase.user;
purchase.store=store!==undefined?store:purchase.store;
purchase.receipt=receipt!==undefined?receipt:purchase.receipt;
purchase.coupon=coupon!==undefined?coupon:purchase.coupon;
purchase.shoppingList=shoppingList!==undefined?shoppingList:purchase.shoppingList;
purchase.purchaseDate=purchaseDate!==undefined?purchaseDate:purchase.purchaseDate;
purchase.subtotal=subtotal??purchase.subtotal;
purchase.discountTotal=discountTotal??purchase.discountTotal;
purchase.taxTotal=taxTotal??purchase.taxTotal;
purchase.shippingTotal=shippingTotal??purchase.shippingTotal;
purchase.total=total??purchase.total;
purchase.paymentMethod=paymentMethod??purchase.paymentMethod;
purchase.status=status!==undefined?status:purchase.status;
purchase.notes=notes??purchase.notes;
await purchase.save();
const updatedPurchase=await Purchase.findById(purchase._id)
.populate('user')
.populate('store')
.populate('receipt')
.populate('coupon')
.populate('shoppingList')
.populate('status');
res.status(200).json({success:true,message:'Purchase updated successfully',purchase:updatedPurchase});
}catch(error){
res.status(500).json({success:false,message:'Error updating purchase',error:error.message});
}
};

export const deletePurchase=async(req,res)=>{
try{
const purchase=await Purchase.findById(req.params.id);
if(!purchase)return res.status(404).json({success:false,message:'Purchase not found'});
await Purchase.findByIdAndDelete(req.params.id);
res.status(200).json({success:true,message:'Purchase deleted successfully'});
}catch(error){
res.status(500).json({success:false,message:'Error deleting purchase',error:error.message});
}
};