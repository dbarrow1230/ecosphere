// backend/models/noteModel.js
import mongoose from "mongoose";

const noteSchema=new mongoose.Schema(
{
user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
notebook:{type:mongoose.Schema.Types.ObjectId,ref:"Notebook"},
noteType:{type:mongoose.Schema.Types.ObjectId,ref:"NoteType",required:true},
title:{type:String,required:true,trim:true},
noteId:{type:String,required:true,unique:true,trim:true},
content:{type:String,default:""},
summary:{type:String,default:""},
tags:[{type:mongoose.Schema.Types.ObjectId,ref:"Tag"}],
links:[{type:mongoose.Schema.Types.ObjectId,ref:"Link"}],
isArchived:{type:Boolean,default:false},
isFavorite:{type:Boolean,default:false},
status:{type:String,enum:["draft","active","archived"],default:"active"}
},
{timestamps:true,collection:"notes"}
);

const Note=mongoose.model("Note",noteSchema);

export default Note;