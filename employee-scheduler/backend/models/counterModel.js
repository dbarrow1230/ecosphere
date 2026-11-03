// backend/models/counterModel.js
import mongoose from "mongoose";

const counterSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 type:{type:String,required:true,trim:true},
 seq:{type:Number,default:0,min:0}
},{timestamps:true,collection:"counters"});

counterSchema.index({business:1,type:1},{unique:true});

const Counter=mongoose.models.Counter||mongoose.model("Counter",counterSchema);

export default Counter;