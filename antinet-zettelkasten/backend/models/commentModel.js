//backend/models/commentModel.js
import mongoose from "mongoose";

const commentSchema=new mongoose.Schema(
{
note:{type:mongoose.Schema.Types.ObjectId,ref:"Note",required:true},
user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
parentComment:{type:mongoose.Schema.Types.ObjectId,ref:"Comment"},
content:{type:String,required:true,trim:true},
isEdited:{type:Boolean,default:false},
isDeleted:{type:Boolean,default:false}
},
{timestamps:true,collection:"comments"}
);

const Comment=mongoose.model("Comment",commentSchema);

export default Comment;