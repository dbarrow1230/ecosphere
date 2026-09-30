import Business from "../reference/businessModel.js";
// src/backend/models/sales/salesUsageLine.js
import mongoose from "mongoose";

const salesUsageLineSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:Business},
 salesUsageRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"SalesUsage"},
 beverageItemRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"BeverageItem"},
 recipeRef:{type:mongoose.Schema.Types.ObjectId,default:null,index:true,ref:"Recipe"},
 qtySold:{type:Number,default:0,min:0},
 qtyConsumed:{type:Number,default:0,min:0},
 revenue:{type:Number,default:0,min:0},
 cost:{type:Number,default:0,min:0},
 profit:{type:Number,default:0}
},{
 timestamps:true,
 collection:"sales_usage_lines"
});

salesUsageLineSchema.index({business_id:1,salesUsageRef:1});
salesUsageLineSchema.index({business_id:1,beverageItemRef:1});
salesUsageLineSchema.index({business_id:1,recipeRef:1});

const SalesUsageLine=mongoose.models.SalesUsageLine||mongoose.model("SalesUsageLine",salesUsageLineSchema);

export default SalesUsageLine;