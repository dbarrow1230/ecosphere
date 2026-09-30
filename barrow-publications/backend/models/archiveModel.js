// backend/models/archiveModel.js
import mongoose from "mongoose";

const archiveSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 user_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"User"},
 note_id:{type:mongoose.Schema.Types.ObjectId,ref:"Note",required:true,index:true},

 reason:{type:String,trim:true,default:""},

 archivedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true},
 unarchivedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true},

 archivedAt:{type:Date,default:Date.now,index:true},
 unarchivedAt:{type:Date,default:null},

 isArchived:{type:Boolean,default:true,index:true},
 isActive:{type:Boolean,default:true,index:true},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true}
},{timestamps:true,collection:"archives"});

archiveSchema.index({business_id:1,user_id:1,note_id:1});
archiveSchema.index({business_id:1,user_id:1,isArchived:1});
archiveSchema.index({business_id:1,user_id:1,isActive:1});

const Archive=mongoose.models.Archive||mongoose.model("Archive",archiveSchema);

export default Archive;