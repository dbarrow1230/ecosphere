// /backend/models/categoryModel.js
import mongoose from 'mongoose';

const categorySchema=new mongoose.Schema({
name:{type:String,required:true,trim:true},
slug:{type:String,required:true,trim:true,lowercase:true},
description:{type:String,trim:true,default:''},
image:{type:String,default:''},
parentCategory:{type:mongoose.Schema.Types.ObjectId,ref:'Category',default:null},
isActive:{type:Boolean,default:true}
},{timestamps:true,collection:'categories'});

export default mongoose.models.Category||mongoose.model('Category',categorySchema);