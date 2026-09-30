// /backend/models/brandModel.js
import mongoose from 'mongoose';

const brandSchema=new mongoose.Schema({
name:{type:String,required:true,trim:true},
slug:{type:String,required:true,trim:true,lowercase:true},
description:{type:String,trim:true,default:''},
logo:{type:String,default:''},
website:{type:String,trim:true,default:''},
country:{type:mongoose.Schema.Types.ObjectId,ref:'Country',default:null},
isActive:{type:Boolean,default:true}
},{timestamps:true,collection:'brands'});

export default mongoose.models.Brand||mongoose.model('Brand',brandSchema);