// src/backend/models/returns/vendorReturn.js
import mongoose from "mongoose";

const vendorReturnSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 returnNumber:{type:String,required:true,trim:true,uppercase:true},
 vendorRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Vendor"},
 locationRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Location"},
 goodsReceiptRef:{type:mongoose.Schema.Types.ObjectId,default:null,index:true,ref:"GoodsReceipt"},
 status:{type:String,enum:["draft","approved","sent","completed","cancelled"],default:"draft",index:true},
 returnDate:{type:Date,required:true,index:true},
 reason:{type:String,trim:true,default:""},
 total:{type:Number,default:0,min:0},
 notes:{type:String,trim:true,default:""},
 createdByRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"User"}
},{ timestamps:true, collection:"vendor_returns"});

vendorReturnSchema.index({business_id:1,returnNumber:1},{unique:true});
vendorReturnSchema.index({business_id:1,vendorRef:1,returnDate:-1});
vendorReturnSchema.index({business_id:1,status:1});

const VendorReturn=mongoose.models.VendorReturn||mongoose.model("VendorReturn",vendorReturnSchema);

export default VendorReturn;