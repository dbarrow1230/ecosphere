// backend/models/morse/morsePracticeSessionModel.js
import mongoose from "mongoose";

const morsePracticeSessionModel=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},

 practiceText:{type:mongoose.Schema.Types.ObjectId,ref:"MorsePracticeText",default:null},

 title:{type:String,trim:true,default:"Morse Practice Session"},

 sourceType:{type:String,enum:["generated","pasted","uploaded","custom"],default:"generated"},
 practiceType:{type:String,enum:["letters","numbers","mixed","words","qcodes","callsigns","qso","custom"],default:"letters"},

 level:{type:Number,default:1},
 wpm:{type:Number,default:5},
 incrementBy:{type:Number,default:5},

 targetText:{type:String,trim:true,required:true},
 userAnswer:{type:String,trim:true,default:""},

 correctCharacters:{type:Number,default:0},
 incorrectCharacters:{type:Number,default:0},
 missedCharacters:{type:Number,default:0},
 accuracy:{type:Number,default:0},

 durationMs:{type:Number,default:0},

 startedAt:{type:Date,default:null},
 completedAt:{type:Date,default:null},

 notes:{type:String,trim:true,default:""},

 isCompleted:{type:Boolean,default:false},
 isArchived:{type:Boolean,default:false}
},{timestamps:true,collection:"morse_practice_sessions"});

const MorsePracticeSession=mongoose.model("MorsePracticeSession",morsePracticeSessionModel);

export default MorsePracticeSession;