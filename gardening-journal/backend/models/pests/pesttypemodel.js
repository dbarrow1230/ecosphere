// backend/models/pests/pesttypemodel.js
import mongoose from "mongoose";
const {Schema}=mongoose;

const pestTypeSchema=new Schema({
pest_type:{type:String,trim:true,default:""},
description:{type:String,trim:true,default:""},
isActive:{type:Boolean,default:true},
createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"pest_types"});

const PestType=mongoose.models.PestType||mongoose.model("PestType",pestTypeSchema);

export default PestType;