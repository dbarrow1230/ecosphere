// backend/models/archiveModel.js
import mongoose from "mongoose";

const archiveSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 employee:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",required:true,index:true},

 eventType:{type:String,enum:["archive","unarchive"],required:true,index:true},

 archivedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 unarchivedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},

 reason:{type:String,trim:true,default:""},

 archivedAt:{type:Date,default:null},
 unarchivedAt:{type:Date,default:null}
},{timestamps:true,collection:"archives"});

archiveSchema.index({business:1,employee:1,eventType:1});
archiveSchema.index({business:1,employee:1,archivedAt:-1});
archiveSchema.index({business:1,employee:1,unarchivedAt:-1});

const Archive=mongoose.models.Archive||mongoose.model("Archive",archiveSchema);

export default Archive;