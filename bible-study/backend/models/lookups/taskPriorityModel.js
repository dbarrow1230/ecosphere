// backend/models/lookups/taskPriorityModel.js
import mongoose from "mongoose";

const taskPrioritySchema=new mongoose.Schema({
 title:{type:String,required:true,trim:true},
 slug:{type:String,required:true,trim:true,lowercase:true,unique:true},
 description:{type:String,trim:true,default:""},
 color:{type:String,trim:true,default:""},
 active:{type:Boolean,default:true},
 sortOrder:{type:Number,default:0}
},{ timestamps:true, collection:"task_priorities"});

export default mongoose.models.TaskPriority||mongoose.model("TaskPriority",taskPrioritySchema);