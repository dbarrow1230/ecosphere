// src/backend/models/counts/stockAdjustmentLineModel.js
import mongoose from "mongoose";

const stockAdjustmentLineSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 stockAdjustmentRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"StockAdjustment"},
 beverageItemRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"BeverageItem"},
 lotRef:{type:mongoose.Schema.Types.ObjectId,default:null,index:true,ref:"InventoryLot"},
 qty:{type:Number,required:true},
 unitCost:{type:Number,default:0,min:0},
 totalCost:{type:Number,default:0},
 reasonCode:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""}
},{
 timestamps:true,
 collection:"stock_adjustment_lines"
});

stockAdjustmentLineSchema.index({business_id:1,stockAdjustmentRef:1});
stockAdjustmentLineSchema.index({business_id:1,beverageItemRef:1});

const StockAdjustmentLine=mongoose.models.StockAdjustmentLine||mongoose.model("StockAdjustmentLine",stockAdjustmentLineSchema);

export default StockAdjustmentLine;