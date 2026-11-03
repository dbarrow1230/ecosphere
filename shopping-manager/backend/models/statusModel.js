// /backend/models/statusModel.js
import mongoose from 'mongoose';

const statusSchema=new mongoose.Schema({
name:{type:String,required:true,trim:true},
key:{type:String,required:true,trim:true,lowercase:true},
type:{type:String,required:true,trim:true,lowercase:true},
label:{type:String,trim:true,default:''},
description:{type:String,trim:true,default:''},
color:{type:String,trim:true,default:''},
sortOrder:{type:Number,default:0},
isActive:{type:Boolean,default:true}
},{timestamps:true,collection:'statuses'});

statusSchema.index({type:1,key:1},{unique:true});

export default mongoose.models.Status||mongoose.model('Status',statusSchema);