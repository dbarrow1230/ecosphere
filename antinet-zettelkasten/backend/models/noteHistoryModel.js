// backend/models/noteHistoryModel.js
import mongoose from "mongoose";

const noteHistorySchema=new mongoose.Schema(
{
note:{type:mongoose.Schema.Types.ObjectId,ref:"Note",required:true},
user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
title:{type:String,trim:true},
content:{type:String},
summary:{type:String},
version:{type:Number,required:true},
changeType:{type:String,trim:true},
noteType:{type:mongoose.Schema.Types.ObjectId,ref:"NoteType"},
notebook:{type:mongoose.Schema.Types.ObjectId,ref:"Notebook"}
},
{timestamps:true,collection:"note_history"}
);

noteHistorySchema.index({note:1,version:1},{unique:true});

const NoteHistory=mongoose.model("NoteHistory",noteHistorySchema);

export default NoteHistory;