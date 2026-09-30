// backend/models/PoetryMeter.js
import mongoose from "mongoose";

const poetryMeterSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,unique:true,index:true},
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true,index:true}
},{timestamps:true,collection:"poetry_meters"});

const PoetryMeter=mongoose.models.PoetryMeter||mongoose.model("PoetryMeter",poetryMeterSchema);

export default PoetryMeter;