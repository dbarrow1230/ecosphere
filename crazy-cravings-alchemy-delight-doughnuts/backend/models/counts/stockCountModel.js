// src/backend/models/counts/stockCount.js
import mongoose from "mongoose";

const stockCountSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 countNumber:{type:String,required:true,trim:true,uppercase:true},
 locationRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Location"},
 status:{type:String,enum:["draft","inProgress","submitted","approved","posted"],default:"draft",index:true},
 countDate:{type:Date,required:true,index:true},
 notes:{type:String,trim:true,default:""},
 approvedAt:{type:Date,default:null},
 createdByRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"User"},
 approvedByRef:{type:mongoose.Schema.Types.ObjectId,default:null,ref:"User"}
},{ timestamps:true, collection:"stock_counts"});

stockCountSchema.index({business_id:1,countNumber:1},{unique:true});
stockCountSchema.index({business_id:1,locationRef:1,countDate:-1});
stockCountSchema.index({business_id:1,status:1});

const StockCount=mongoose.models.StockCount||mongoose.model("StockCount",stockCountSchema);

export default StockCount;