import mongoose from "mongoose";

const projectSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 description:{type:String,default:""},
 status:{type:String,enum:["planning","active","on-hold","completed","cancelled"],default:"planning"},
 priority:{type:String,enum:["low","normal","high","urgent"],default:"normal"},
 owner:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 members:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
 startDate:{type:Date,default:null},
 dueDate:{type:Date,default:null},
 progress:{type:Number,min:0,max:100,default:0}
},{timestamps:true});

export default mongoose.models.Project||mongoose.model("Project",projectSchema);
