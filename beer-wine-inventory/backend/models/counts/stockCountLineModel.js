import Business from "../reference/businessModel.js";
// src/backend/models/counts/stockCountLineModel.js
import mongoose from "mongoose";

const stockCountLineSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:Business},
 stockCountRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"StockCount"},
 beverageItemRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"BeverageItem"},
 systemQty:{type:Number,default:0},
 countedQty:{type:Number,default:0},
 varianceQty:{type:Number,default:0},
 unitCost:{type:Number,default:0,min:0},
 varianceValue:{type:Number,default:0},
 reasonCode:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},
 countedAt:{type:Date,default:null},
 countedByRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"User"}
},{ timestamps:true, collection:"stock_count_lines"});

stockCountLineSchema.index({business_id:1,stockCountRef:1,beverageItemRef:1},{unique:true});
stockCountLineSchema.index({business_id:1,beverageItemRef:1});

const StockCountLine=mongoose.models.StockCountLine||mongoose.model("StockCountLine",stockCountLineSchema);

export default StockCountLine;