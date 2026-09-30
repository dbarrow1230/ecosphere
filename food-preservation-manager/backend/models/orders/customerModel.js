// backend/models/order/customerModel.js
import mongoose from "mongoose";

const customerSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 firstName:{type:String,trim:true,default:""},
 lastName:{type:String,trim:true,default:""},
 company:{type:String,trim:true,default:""},
 email:{type:String,trim:true,default:""},
 phone:{type:String,trim:true,default:""},
 altPhone:{type:String,trim:true,default:""},
 address1:{type:String,trim:true,default:""},
 address2:{type:String,trim:true,default:""},
 city:{type:String,trim:true,default:""},
 state:{type:mongoose.Schema.Types.ObjectId,ref:"State"},
 country:{type:mongoose.Schema.Types.ObjectId,ref:"Country"},
 postalCode:{type:String,trim:true,default:""},
 status:{type:String,enum:["active","inactive"],default:"active"},

 contact:{
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
},{timestamps:true,collection:"customers"});

const Customer=mongoose.models.Customer||mongoose.model("Customer",customerSchema);

export default Customer;
