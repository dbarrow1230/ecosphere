import mongoose from "mongoose";

const taskSchema=new mongoose.Schema({
 title:{type:String,required:true,trim:true},
 description:{type:String,default:""},
 project:{type:mongoose.Schema.Types.ObjectId,ref:"Project",default:null},
 assignee:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 status:{type:String,enum:["backlog","todo","in-progress","review","completed"],default:"todo"},
 priority:{type:String,enum:["low","normal","high","urgent"],default:"normal"},
 dueDate:{type:Date,default:null},
 completedAt:{type:Date,default:null}
},{timestamps:true});

export default mongoose.models.ProjectTask||mongoose.model("ProjectTask",taskSchema);
