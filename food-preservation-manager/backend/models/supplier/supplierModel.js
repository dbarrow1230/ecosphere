// backend/models/supplier/supplierModel.js
import mongoose from "mongoose";

const supplierSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,default:"",unique:true,sparse:true},

 type:{type:String,trim:true,default:""}, // farm, distributor, wholesale, retail

 contact:{
  contactName:{type:String,trim:true,default:""},
  email:{type:String,trim:true,default:""},
  phone:{type:String,trim:true,default:""}
 },

 address:{
  street:{type:String,trim:true,default:""},
  city:{type:String,trim:true,default:""},
  state:{type:mongoose.Schema.Types.ObjectId,ref:"State"},
  country:{type:mongoose.Schema.Types.ObjectId,ref:"Country"},
  zip:{type:String,trim:true,default:""}
 },

 isActive:{type:Boolean,default:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"suppliers"});

const Supplier=mongoose.models.Supplier||mongoose.model("Supplier",supplierSchema);

export default Supplier;