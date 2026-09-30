// backend/models/admin/statusModel.js
import mongoose from "mongoose";

const statusSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 code:{type:String,required:true,trim:true,unique:true},

 group:{type:String,trim:true,default:"general"}, // process, order, batch, project

 description:{type:String,trim:true,default:""},

 isDefault:{type:Boolean,default:false},
 isFinal:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true},

 sortOrder:{type:Number,default:0}
},{timestamps:true,collection:"statuses"});

const Status=mongoose.models.Status||mongoose.model("Status",statusSchema);

export default Status;