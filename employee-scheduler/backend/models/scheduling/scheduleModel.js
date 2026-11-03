import mongoose from "mongoose";

const scheduleSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 department:{type:mongoose.Schema.Types.ObjectId,ref:"Department",default:null,index:true},

 title:{type:String,trim:true,default:""},
 weekStart:{type:Date,required:true},
 weekEnd:{type:Date,required:true},

 status:{type:String,enum:["draft","published","archived"],default:"draft"},
 publishedAt:{type:Date,default:null},

 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"schedules"});

scheduleSchema.index({business:1,weekStart:1},{unique:true});

const Schedule=mongoose.models.Schedule||mongoose.model("Schedule",scheduleSchema);

export default Schedule;