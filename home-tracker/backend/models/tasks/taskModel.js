import mongoose from "mongoose";

const taskSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",default:null,index:true},
 name:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},
 dueDate:{type:Date,default:null,index:true},
 status:{type:String,trim:true,default:"Open",index:true},
 priority:{type:String,trim:true,default:"Normal",index:true},
 remindAt:{type:Date,default:null},
 message:{type:String,trim:true,default:""},
 completedAt:{type:Date,default:null}
},{timestamps:true,collection:"tasks"});

taskSchema.index({name:"text",description:"text"});

const Task=mongoose.models.Task||mongoose.model("Task",taskSchema);

export default Task;
