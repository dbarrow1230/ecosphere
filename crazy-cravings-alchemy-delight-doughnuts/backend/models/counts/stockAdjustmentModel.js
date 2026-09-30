// src/backend/models/counts/stockAdjustmentModel.js
import mongoose from "mongoose";

const stockAdjustmentSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 adjustmentNumber:{type:String,required:true,trim:true,uppercase:true},
 locationRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Location"},
 status:{type:String,enum:["draft","approved","posted","voided"],default:"draft",index:true},
 adjustmentDate:{type:Date,required:true,index:true},
 reason:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},
 approvedAt:{type:Date,default:null},
 createdByRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"User"},
 approvedByRef:{type:mongoose.Schema.Types.ObjectId,default:null,ref:"User"}
},{ timestamps:true, collection:"stock_adjustments"});

stockAdjustmentSchema.index({business_id:1,adjustmentNumber:1},{unique:true});
stockAdjustmentSchema.index({business_id:1,locationRef:1,adjustmentDate:-1});
stockAdjustmentSchema.index({business_id:1,status:1});

const StockAdjustment=mongoose.models.StockAdjustment||mongoose.model("StockAdjustment",stockAdjustmentSchema);

export default StockAdjustment;