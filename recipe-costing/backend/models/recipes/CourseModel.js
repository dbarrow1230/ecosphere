// backend/models/master/CourseModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const CourseSchema=new Schema({
 name:{type:String,required:true,trim:true,unique:true,index:true},
 slug:{type:String,trim:true,unique:true,index:true,sparse:true},
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"courses"});

export default businessInfoConnection.models.Course||businessInfoConnection.model("Course",CourseSchema);
