import mongoose from "mongoose";

const taskSchema=new mongoose.Schema({
 title:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},
 event:{type:mongoose.Schema.Types.ObjectId,ref:"Event",default:null},
 order:{type:mongoose.Schema.Types.ObjectId,ref:"Order",default:null},
 priority:{type:String,enum:["low","normal","high","urgent"],default:"normal",index:true},
 status:{type:String,enum:["pending","in-progress","completed","cancelled"],default:"pending",index:true},
 dueDate:{type:Date,default:null,index:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"tasks"});

taskSchema.index({status:1,dueDate:1});

const Task=mongoose.models.Task||mongoose.model("Task",taskSchema);

export default Task;
