// backend/models/linkModel.js
import mongoose from "mongoose";

const linkSchema=new mongoose.Schema(
{
fromNote:{type:mongoose.Schema.Types.ObjectId,ref:"Note",required:true},
toNote:{type:mongoose.Schema.Types.ObjectId,ref:"Note",required:true},
relationType:{type:mongoose.Schema.Types.ObjectId,ref:"RelationType",required:true},
description:{type:String,trim:true}
},
{timestamps:true,collection:"note_links"}
);

const Link=mongoose.model("Link",linkSchema);

export default Link;