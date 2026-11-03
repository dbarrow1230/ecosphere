// backend/models/mentorNoteModel.js
import mongoose from "mongoose";

const mentorNoteModel=new mongoose.Schema({
 mentee:{type:mongoose.Schema.Types.ObjectId,ref:"Mentee",required:true,index:true},
 weekNumber:{type:Number,min:1,default:null},
 note:{type:String,required:true,trim:true},
 category:{type:String,enum:["general","session","performance","attendance","behavior","goal","hours"],default:"general"},
 isFlagged:{type:Boolean,default:false},
 followUpRequired:{type:Boolean,default:false},
 riskLevel:{type:String,enum:["low","medium","high"],default:"low"},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
},{timestamps:true,collection:"mentor_notes"});

const MentorNote=mongoose.model("MentorNote",mentorNoteModel);

export default MentorNote;