// backend/models/admin/fileAttachmentModel.js
import mongoose from "mongoose";

const fileAttachmentSchema=new mongoose.Schema({
 entityType:{type:String,required:true,trim:true},
 entityId:{type:mongoose.Schema.Types.ObjectId,required:true},

 user:{type:mongoose.Schema.Types.ObjectId,ref:"User"},

 originalName:{type:String,required:true,trim:true},
 storedName:{type:String,trim:true,default:""},
 fileName:{type:String,trim:true,default:""},
 fileType:{type:String,trim:true,default:""},
 mimeType:{type:String,trim:true,default:""},
 folder:{type:String,trim:true,default:""},
 url:{type:String,trim:true,default:""},
 size:{type:Number,default:0},

 notes:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"file_attachments"});

const FileAttachment=mongoose.models.FileAttachment||mongoose.model("FileAttachment",fileAttachmentSchema);

export default FileAttachment;