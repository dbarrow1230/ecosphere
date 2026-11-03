import Business from "../reference/businessModel.js";
import Location from "../reference/LocationModel.js";
// src/backend/models/sales/salesUsage.js
import mongoose from "mongoose";

const salesUsageSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:Business},
 locationRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:Location},
 businessDate:{type:Date,required:true,index:true},
 sourceType:{type:String,enum:["pos","manual"],default:"manual",index:true},
 referenceId:{type:mongoose.Schema.Types.ObjectId,default:null}
},{ timestamps:true, collection:"sales_usage"});

salesUsageSchema.index({business_id:1,locationRef:1,businessDate:-1});
salesUsageSchema.index({business_id:1,sourceType:1});

const SalesUsage=mongoose.models.SalesUsage||mongoose.model("SalesUsage",salesUsageSchema);

export default SalesUsage;