import mongoose from "mongoose";

const attachmentSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 originalName:{type:String,required:true,trim:true},
 fileName:{type:String,required:true,trim:true},
 filePath:{type:String,required:true},
 fileUrl:{type:String,default:""},
 fileType:{type:String,enum:["image","document","audio","video","pdf","other"],default:"other"},
 mimeType:{type:String,default:""},
 size:{type:Number,default:0},
 attachedToType:{type:String,enum:["journalEntry","note","goal","task","habit","mindfulnessEntry","timelineEntry","calendarEvent","review","milestone"],required:true},
 attachedTo:{type:mongoose.Schema.Types.ObjectId,required:true},
 description:{type:String,default:""},
 isPrivate:{type:Boolean,default:false},
 tags:[{type:mongoose.Schema.Types.ObjectId,ref:"Tag"}]
},{ timestamps:true, collection:"attachments"});

attachmentSchema.index({user:1,attachedToType:1,attachedTo:1});
attachmentSchema.index({user:1,fileType:1});
attachmentSchema.index({user:1,isPrivate:1});

const Attachment=mongoose.model("Attachment",attachmentSchema);

export default Attachment;