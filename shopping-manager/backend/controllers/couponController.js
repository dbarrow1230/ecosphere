// /backend/controllers/couponController.js
import Coupon from '../models/couponModel.js';
import Country from '../models/locations/countryModel.js';

export const createCoupon=async(req,res)=>{
try{
const{user,store,code,title,description,discountType,discountValue,minPurchaseAmount,maxDiscountAmount,startDate,endDate,countries,isUsed,usedAt,isActive}=req.body;
if(!user||!code||!title||discountValue===undefined)return res.status(400).json({success:false,message:'User, code, title, and discountValue are required'});
const existing=await Coupon.findOne({user,code:code.trim()});
if(existing)return res.status(409).json({success:false,message:'Coupon code already exists for this user'});
const coupon=await Coupon.create({user,store,code,title,description,discountType,discountValue,minPurchaseAmount,maxDiscountAmount,startDate,endDate,countries,isUsed,usedAt,isActive});
res.status(201).json({success:true,message:'Coupon created successfully',coupon});
}catch(error){
res.status(500).json({success:false,message:'Error creating coupon',error:error.message});
}
};

export const getCoupons=async(req,res)=>{
try{
const query={};
if(req.query.user)query.user=req.query.user;
if(req.query.store)query.store=req.query.store;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==='true';
if(req.query.isUsed!==undefined)query.isUsed=req.query.isUsed==='true';
const coupons=await Coupon.find(query)
.populate('user')
.populate('store')
.populate({path:'countries',model:Country})
.sort({createdAt:-1});
res.status(200).json({success:true,count:coupons.length,coupons});
}catch(error){
res.status(500).json({success:false,message:'Error fetching coupons',error:error.message});
}
};

export const getActiveCoupons=async(req,res)=>{
try{
const query={isActive:true,isUsed:false};
if(req.query.user)query.user=req.query.user;
if(req.query.store)query.store=req.query.store;
const coupons=await Coupon.find(query)
.populate('user')
.populate('store')
.populate({path:'countries',model:Country})
.sort({createdAt:-1});
res.status(200).json({success:true,count:coupons.length,coupons});
}catch(error){
res.status(500).json({success:false,message:'Error fetching active coupons',error:error.message});
}
};

export const getCouponById=async(req,res)=>{
try{
const coupon=await Coupon.findById(req.params.id)
.populate('user')
.populate('store')
.populate({path:'countries',model:Country});
if(!coupon)return res.status(404).json({success:false,message:'Coupon not found'});
res.status(200).json({success:true,coupon});
}catch(error){
res.status(500).json({success:false,message:'Error fetching coupon',error:error.message});
}
};

export const getCouponsByUser=async(req,res)=>{
try{
const coupons=await Coupon.find({user:req.params.userId})
.populate('user')
.populate('store')
.populate({path:'countries',model:Country})
.sort({createdAt:-1});
res.status(200).json({success:true,count:coupons.length,coupons});
}catch(error){
res.status(500).json({success:false,message:'Error fetching user coupons',error:error.message});
}
};

export const updateCoupon=async(req,res)=>{
try{
const{user,store,code,title,description,discountType,discountValue,minPurchaseAmount,maxDiscountAmount,startDate,endDate,countries,isUsed,usedAt,isActive}=req.body;
const coupon=await Coupon.findById(req.params.id);
if(!coupon)return res.status(404).json({success:false,message:'Coupon not found'});
if(code&&code.trim()!==coupon.code){
const existing=await Coupon.findOne({user:user??coupon.user,code:code.trim(),_id:{$ne:req.params.id}});
if(existing)return res.status(409).json({success:false,message:'Coupon code already exists for this user'});
}
coupon.user=user??coupon.user;
coupon.store=store!==undefined?store:coupon.store;
coupon.code=code??coupon.code;
coupon.title=title??coupon.title;
coupon.description=description??coupon.description;
coupon.discountType=discountType??coupon.discountType;
coupon.discountValue=discountValue??coupon.discountValue;
coupon.minPurchaseAmount=minPurchaseAmount??coupon.minPurchaseAmount;
coupon.maxDiscountAmount=maxDiscountAmount??coupon.maxDiscountAmount;
coupon.startDate=startDate!==undefined?startDate:coupon.startDate;
coupon.endDate=endDate!==undefined?endDate:coupon.endDate;
coupon.countries=countries??coupon.countries;
coupon.isUsed=isUsed??coupon.isUsed;
coupon.usedAt=usedAt!==undefined?usedAt:coupon.usedAt;
coupon.isActive=isActive??coupon.isActive;
await coupon.save();
const updatedCoupon=await Coupon.findById(coupon._id)
.populate('user')
.populate('store')
.populate({path:'countries',model:Country});
res.status(200).json({success:true,message:'Coupon updated successfully',coupon:updatedCoupon});
}catch(error){
res.status(500).json({success:false,message:'Error updating coupon',error:error.message});
}
};

export const deleteCoupon=async(req,res)=>{
try{
const coupon=await Coupon.findById(req.params.id);
if(!coupon)return res.status(404).json({success:false,message:'Coupon not found'});
await Coupon.findByIdAndDelete(req.params.id);
res.status(200).json({success:true,message:'Coupon deleted successfully'});
}catch(error){
res.status(500).json({success:false,message:'Error deleting coupon',error:error.message});
}
};