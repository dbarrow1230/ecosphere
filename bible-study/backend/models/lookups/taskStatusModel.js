// backend/models/lookups/taskStatusModel.js
import mongoose from "mongoose";

const taskStatusSchema=new mongoose.Schema({
 title:{type:String,required:true,trim:true},
 slug:{type:String,required:true,trim:true,lowercase:true,unique:true},
 description:{type:String,trim:true,default:""},
 color:{type:String,trim:true,default:""},
 active:{type:Boolean,default:true},
 sortOrder:{type:Number,default:0}
},{ timestamps:true, collection:"task_statuses"});

export default mongoose.models.TaskStatus||mongoose.model("TaskStatus",taskStatusSchema);