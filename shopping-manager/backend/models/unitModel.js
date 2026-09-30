// /backend/models/unitModel.js
import mongoose from 'mongoose';

const unitSchema=new mongoose.Schema({
name:{type:String,required:true,trim:true},
shortName:{type:String,required:true,trim:true},
type:{type:String,trim:true,default:''},
description:{type:String,trim:true,default:''},
isActive:{type:Boolean,default:true}
},{timestamps:true,collection:'units'});

export default mongoose.models.Unit||mongoose.model('Unit',unitSchema);