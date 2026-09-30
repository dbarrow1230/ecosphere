// backend/models/archiveModel.js
import mongoose from "mongoose";

const archiveSchema=new mongoose.Schema(
{
note:{type:mongoose.Schema.Types.ObjectId,ref:"Note",required:true},
archivedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
unarchivedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
reason:{type:String,trim:true},
archivedAt:{type:Date,default:Date.now},
unarchivedAt:{type:Date}
},
{timestamps:true,collection:"archives"}
);

const Archive=mongoose.model("Archive",archiveSchema);

export default Archive;