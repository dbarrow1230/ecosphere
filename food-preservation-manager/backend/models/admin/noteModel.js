// backend/models/admin/noteModel.js
import mongoose from "mongoose";

const noteSchema=new mongoose.Schema({
 entityType:{type:String,required:true,trim:true},
 entityId:{type:mongoose.Schema.Types.ObjectId,required:true},

 user:{type:mongoose.Schema.Types.ObjectId,ref:"User"},

 type:{type:String,trim:true,default:"internal"}, // internal, public, private
 title:{type:String,trim:true,default:""},
 content:{type:String,required:true,trim:true},

 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"notes"});

const Note=mongoose.models.Note||mongoose.model("Note",noteSchema);

export default Note;