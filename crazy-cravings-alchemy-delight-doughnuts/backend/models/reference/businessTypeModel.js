// backend/models/reference/businessTypeModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const businessTypeSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,uppercase:true,default:""},
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"business_types"});

businessTypeSchema.index({name:1},{unique:true});
businessTypeSchema.index({code:1},{unique:true,sparse:true});
businessTypeSchema.index({isActive:1});

const BusinessType=businessInfoConnection.models.BusinessType||businessInfoConnection.model("BusinessType",businessTypeSchema);

export default BusinessType;