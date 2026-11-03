// backend/models/studies/studyTaskModel.js
import mongoose from "mongoose";

const studyTaskSchema=new mongoose.Schema({

 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 study:{type:mongoose.Schema.Types.ObjectId,ref:"Study",default:null},

 title:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},
 context:{type:String,trim:true,default:""},

 dueLabel:{type:String,trim:true,default:""},
 dueDate:{type:Date,default:null},
 dueTime:{type:String,trim:true,default:""},

 priority:{type:mongoose.Schema.Types.ObjectId,ref:"TaskPriority",default:null},
 status:{type:mongoose.Schema.Types.ObjectId,ref:"TaskStatus",default:null},

 completed:{type:Boolean,default:false},
 completedAt:{type:Date,default:null},

 reminderAt:{type:Date,default:null},
 tags:[{type:String,trim:true}]

},{timestamps:true,collection:"study_tasks"});

export default mongoose.models.StudyTask||mongoose.model("StudyTask",studyTaskSchema);