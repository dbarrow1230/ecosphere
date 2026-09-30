// backend/models/supplierModel.js
import mongoose from "mongoose";

const supplierSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 contactName:{type:String,trim:true,default:""},
 email:{type:String,trim:true,lowercase:true,default:""},
 phone:{type:String,trim:true,default:""},
 altPhone:{type:String,trim:true,default:""},
 fax:{type:String,trim:true,default:""},
 website:{type:String,trim:true,default:""},
 address1:{type:String,trim:true,default:""},
 address2:{type:String,trim:true,default:""},
 city:{type:String,trim:true,default:""},
 state:{type:mongoose.Schema.Types.ObjectId,ref:"State"},
 country:{type:mongoose.Schema.Types.ObjectId,ref:"Country"},
 postalCode:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},
 status:{type:String,enum:["active","inactive"],default:"active"}
},{ timestamps:true, collection:"suppliers"});

const Supplier=mongoose.models.Supplier||mongoose.model("Supplier",supplierSchema);

export default Supplier;