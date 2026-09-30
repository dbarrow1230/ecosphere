// backend/models/programModel.js
import mongoose from "mongoose";

const programModel=new mongoose.Schema({
 programType:{type:String,enum:["diploma","associate","stand alone"],required:true,trim:true},
 category:{type:String,enum:["pastry","culinary","holistic","plant based","stand alone"],trim:true,required:true},
 courseName:{type:String,trim:true,required:true},
 courses:[{
  courseNumber:{type:String,trim:true},
  courseName:{type:String,trim:true}
 }],
 requiredHours:{type:Number,default:150},
 externshipHours:{type:Number,default:150},
 notes:{type:String,trim:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
},{timestamps:true,collection:"program"});

const Program=mongoose.model("Program",programModel);

export default Program;