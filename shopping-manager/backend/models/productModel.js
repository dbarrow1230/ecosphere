// /backend/models/productModel.js
import mongoose from 'mongoose';

const productSchema=new mongoose.Schema({
name:{type:String,required:true,trim:true},
slug:{type:String,required:true,trim:true,lowercase:true},
sku:{type:String,trim:true,default:''},
barcode:{type:String,trim:true,default:''},
description:{type:String,trim:true,default:''},
image:{type:String,default:''},
category:{type:mongoose.Schema.Types.ObjectId,ref:'Category',required:true},
brand:{type:mongoose.Schema.Types.ObjectId,ref:'Brand',default:null},
unit:{type:mongoose.Schema.Types.ObjectId,ref:'Unit',default:null},
defaultStore:{type:mongoose.Schema.Types.ObjectId,ref:'Store',default:null},
countries:[{type:mongoose.Schema.Types.ObjectId,ref:'Country'}],
tags:[{type:String,trim:true}],
size:{type:String,trim:true,default:''},
color:{type:String,trim:true,default:''},
material:{type:String,trim:true,default:''},
modelNumber:{type:String,trim:true,default:''},
price:{type:Number,default:0},
minPrice:{type:Number,default:0},
maxPrice:{type:Number,default:0},
isActive:{type:Boolean,default:true},
isFeatured:{type:Boolean,default:false}
},{timestamps:true,collection:'products'});

export default mongoose.models.Product||mongoose.model('Product',productSchema);