import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const stockAdjustmentSchema=new Schema({
 business_id:{type:Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 adjustmentNumber:{type:String,required:true,trim:true,index:true},
 locationRef:{type:Schema.Types.ObjectId,ref:"Location",default:null,index:true},
 adjustmentDate:{type:Date,default:Date.now,index:true},
 status:{type:String,enum:["draft","approved","posted","voided"],default:"draft",index:true},
 reason:{type:String,trim:true,default:""},
 createdByRef:{type:Schema.Types.ObjectId,ref:"User",default:null},
 approvedByRef:{type:Schema.Types.ObjectId,ref:"User",default:null},
 approvedAt:{type:Date,default:null},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"stock_adjustments"});

stockAdjustmentSchema.index({business_id:1,adjustmentNumber:1},{unique:true});

export default businessInfoConnection.models.StockAdjustment||businessInfoConnection.model("StockAdjustment",stockAdjustmentSchema);
