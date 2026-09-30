import Business from "../reference/businessModel.js";
import UnitOfMeasure from "../reference/unitOfMeasureModel.js";
// src/backend/models/transfers/stockTransferLineModel.js
import mongoose from "mongoose";

const stockTransferLineSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:Business},
 stockTransferRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"StockTransfer"},
 beverageItemRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"BeverageItem"},
 lotRef:{type:mongoose.Schema.Types.ObjectId,default:null,index:true,ref:"InventoryLot"},
 uomRef:{type:mongoose.Schema.Types.ObjectId,required:true,ref:UnitOfMeasure},
 qty:{type:Number,required:true,min:0},
 unitCost:{type:Number,default:0,min:0},
 notes:{type:String,trim:true,default:""}
},{ timestamps:true, collection:"stock_transfer_lines"});

stockTransferLineSchema.index({business_id:1,stockTransferRef:1});
stockTransferLineSchema.index({business_id:1,beverageItemRef:1});
stockTransferLineSchema.index({business_id:1,lotRef:1});

const StockTransferLine=mongoose.models.StockTransferLine||mongoose.model("StockTransferLine",stockTransferLineSchema);

export default StockTransferLine;