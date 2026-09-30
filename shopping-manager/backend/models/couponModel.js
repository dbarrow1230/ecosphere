// /backend/models/couponModel.js
import mongoose from 'mongoose';

const couponSchema=new mongoose.Schema({
user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
store:{type:mongoose.Schema.Types.ObjectId,ref:'Store',default:null},
code:{type:String,required:true,trim:true},
title:{type:String,required:true,trim:true},
description:{type:String,trim:true,default:''},
discountType:{type:String,enum:['percent','fixed','shipping'],default:'fixed'},
discountValue:{type:Number,required:true,default:0},
minPurchaseAmount:{type:Number,default:0},
maxDiscountAmount:{type:Number,default:0},
startDate:{type:Date,default:null},
endDate:{type:Date,default:null},
countries:[{type:mongoose.Schema.Types.ObjectId,ref:'Country'}],
isUsed:{type:Boolean,default:false},
usedAt:{type:Date,default:null},
isActive:{type:Boolean,default:true}
},{timestamps:true,collection:'coupons'});

export default mongoose.models.Coupon||mongoose.model('Coupon',couponSchema);