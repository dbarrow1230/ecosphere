// backend/models/studies/studySessionModel.js
import mongoose from "mongoose";

const studySessionSchema=new mongoose.Schema({

 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 study:{type:mongoose.Schema.Types.ObjectId,ref:"Study",default:null},
 method:{type:mongoose.Schema.Types.ObjectId,ref:"BibleStudyMethod",default:null},

 title:{type:String,required:true,trim:true},
 focus:{type:String,trim:true,default:""},
 location:{type:String,trim:true,default:""},
 notesExpected:{type:String,trim:true,default:""},

 scheduledFor:{type:Date,default:null},
 startedAt:{type:Date,default:null},
 endedAt:{type:Date,default:null},

 durationMinutes:{type:Number,default:0,min:0},
 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status",default:null},

 summary:{type:String,trim:true,default:""},
 tags:[{type:String,trim:true}]

},{ timestamps:true, collection:"study_sessions"});

export default mongoose.models.StudySession||mongoose.model("StudySession",studySessionSchema);