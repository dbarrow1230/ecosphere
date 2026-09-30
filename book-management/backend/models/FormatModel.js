// backend/models/FormatModel.js
import mongoose from "mongoose";

const FormatModelSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,unique:true,index:true}
},{timestamps:true,collection:"formats"});

const FormatModel=mongoose.models.Format||mongoose.model("Format",FormatModelSchema);

export default FormatModel;