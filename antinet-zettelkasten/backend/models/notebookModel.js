// backend/models/notebookModel.js
import mongoose from "mongoose";

const notebookSchema=new mongoose.Schema(
{
user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
name:{type:String,required:true,trim:true},
description:{type:String,trim:true},
color:{type:String,trim:true},
isArchived:{type:Boolean,default:false}
},
{timestamps:true,collection:"notebooks"}
);

const Notebook=mongoose.model("Notebook",notebookSchema);

export default Notebook;