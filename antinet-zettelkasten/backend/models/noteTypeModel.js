// backend/models/noteTypeModel.js
import mongoose from "mongoose";

const noteTypeSchema=new mongoose.Schema(
{
   name:{type:String,required:true,trim:true,unique:true},
description:{type:String,trim:true}
},
{timestamps:true,collection:"note_types"}
);

const NoteType=mongoose.model("NoteType",noteTypeSchema);

export default NoteType;