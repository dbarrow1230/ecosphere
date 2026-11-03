// backend/models/vendors/VendorModel.js
import mongoose from "mongoose";

const vendorSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,index:true},
 legalName:{type:String,trim:true,default:""},

 email:{type:String,trim:true,default:""},
 phone:{type:String,trim:true,default:""},
 website:{type:String,trim:true,default:""},

 address1:{type:String,trim:true,default:""},
 address2:{type:String,trim:true,default:""},
 city:{type:String,trim:true,default:""},
 state:{type:mongoose.Schema.Types.ObjectId,ref:"State",default:null},
 postalCode:{type:String,trim:true,default:""},
 country:{type:mongoose.Schema.Types.ObjectId,ref:"Country",default:null},

 isActive:{type:Boolean,default:true,index:true},
 isPreferred:{type:Boolean,default:false,index:true},

 notes:{type:String,trim:true,default:""}
},{timestamps:true, collection:"vendors"});

export default mongoose.model("Vendor",vendorSchema);