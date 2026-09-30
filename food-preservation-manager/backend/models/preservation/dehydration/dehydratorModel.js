// backend/models/dehydratorModel.js
import mongoose from "mongoose";

const d=v=>v==null?v:mongoose.Types.Decimal128.fromString(String(v));

const dehydratorSchema=new mongoose.Schema({
 brand:{type:String,trim:true,required:true},
 name:{type:String,trim:true,required:true},
 watts:{type:mongoose.Schema.Types.Decimal128,required:true,set:d},
 isActive:{type:Boolean,default:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"dehydrators"});

const Dehydrator=mongoose.models.Dehydrator||mongoose.model("Dehydrator",dehydratorSchema);

export default Dehydrator;