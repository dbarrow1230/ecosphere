// src/backend/models/transfers/stockTransferModel.js
import mongoose from "mongoose";

const stockTransferSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 transferNumber:{type:String,required:true,trim:true,uppercase:true},
 fromLocationRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Location"},
 toLocationRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Location"},
 status:{type:String,enum:["draft","approved","inTransit","received","cancelled"],default:"draft",index:true},
 transferDate:{type:Date,required:true,index:true},
 shippedAt:{type:Date,default:null},
 receivedAt:{type:Date,default:null},
 notes:{type:String,trim:true,default:""},
 createdByRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"User"},
 approvedByRef:{type:mongoose.Schema.Types.ObjectId,default:null,ref:"User"}
},{ timestamps:true, collection:"stock_transfers"});

stockTransferSchema.index({business_id:1,transferNumber:1},{unique:true});
stockTransferSchema.index({business_id:1,fromLocationRef:1,toLocationRef:1,status:1});
stockTransferSchema.index({business_id:1,transferDate:-1});

const StockTransfer=mongoose.models.StockTransfer||mongoose.model("StockTransfer",stockTransferSchema);

export default StockTransfer;