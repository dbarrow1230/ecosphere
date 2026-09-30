// backend/models/statusModel.js
import mongoose from "mongoose";

const statusModel=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 code:{type:String,required:true,trim:true},
 type:{type:String,required:true,trim:true},
 description:{type:String,trim:true},
 isActive:{type:Boolean,default:true},
 sortOrder:{type:Number,default:0},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"statuses"});

statusModel.index({code:1,type:1},{unique:true});

const Status=mongoose.model("Status",statusModel);

export default Status;