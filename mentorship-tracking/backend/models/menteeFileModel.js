// backend/models/menteeFileModel.js
import mongoose from "mongoose";

const menteeFileModel=new mongoose.Schema({
 mentee:{type:mongoose.Schema.Types.ObjectId,ref:"Mentee",required:true,index:true},
 weekNumber:{type:Number,min:1,default:null},
 fileName:{type:String,required:true,trim:true}, // exact file name on disk
 filePath:{type:String,required:true,trim:true}, // menteeName/images/... or menteeName/...
 fileType:{type:String,required:true,trim:true,lowercase:true},
 category:{type:String,default:"general",trim:true,lowercase:true},
 description:{type:String,trim:true},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
},{timestamps:true,collection:"mentee_files"});

const MenteeFile=mongoose.model("MenteeFile",menteeFileModel);

export default MenteeFile;
