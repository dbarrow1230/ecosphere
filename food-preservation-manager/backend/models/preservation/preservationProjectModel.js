// backend/models/preservationProjectModel.js
import mongoose from "mongoose";

const preservationProjectSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 method:{type:mongoose.Schema.Types.ObjectId,ref:"PreservationMethod",required:true},

 description:{type:String,trim:true,default:""},

 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status"},

 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"preservation_projects"});

const PreservationProject=mongoose.models.PreservationProject||mongoose.model("PreservationProject",preservationProjectSchema);

export default PreservationProject;