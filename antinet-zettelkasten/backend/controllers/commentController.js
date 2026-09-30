// backend/controllers/commentController.js
import mongoose from "mongoose";
import Comment from "../models/commentModel.js";

export const createComment=async(req,res)=>{
 try{
  const{note,user,parentComment,content}=req.body;

  if(!note||!user||!content)
   return res.status(400).json({success:false,message:"note, user and content are required"});

  if(!mongoose.Types.ObjectId.isValid(note))
   return res.status(400).json({success:false,message:"Invalid note id"});

  if(!mongoose.Types.ObjectId.isValid(user))
   return res.status(400).json({success:false,message:"Invalid user id"});

  if(parentComment&&!mongoose.Types.ObjectId.isValid(parentComment))
   return res.status(400).json({success:false,message:"Invalid parentComment id"});

  const comment=await Comment.create({
   note,
   user,
   parentComment,
   content
  });

  return res.status(201).json({success:true,message:"Comment created successfully",data:comment});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to create comment",error:error.message});
 }
};

export const getComments=async(req,res)=>{
 try{
  const{note,user,parentComment}=req.query;
  const query={};

  if(note){
   if(!mongoose.Types.ObjectId.isValid(note))
    return res.status(400).json({success:false,message:"Invalid note id"});
   query.note=note;
  }

  if(user){
   if(!mongoose.Types.ObjectId.isValid(user))
    return res.status(400).json({success:false,message:"Invalid user id"});
   query.user=user;
  }

  if(parentComment){
   if(!mongoose.Types.ObjectId.isValid(parentComment))
    return res.status(400).json({success:false,message:"Invalid parentComment id"});
   query.parentComment=parentComment;
  }

  const comments=await Comment.find(query)
  .populate("user","username email")
  .populate("parentComment")
  .sort({createdAt:-1});

  return res.status(200).json({success:true,count:comments.length,data:comments});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch comments",error:error.message});
 }
};

export const getCommentById=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid comment id"});

  const comment=await Comment.findById(id)
  .populate("user","username email")
  .populate("parentComment");

  if(!comment)
   return res.status(404).json({success:false,message:"Comment not found"});

  return res.status(200).json({success:true,data:comment});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch comment",error:error.message});
 }
};

export const updateComment=async(req,res)=>{
 try{
  const{id}=req.params;
  const updateData={...req.body,isEdited:true};

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid comment id"});

  const comment=await Comment.findByIdAndUpdate(
   id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
  .populate("user","username email");

  if(!comment)
   return res.status(404).json({success:false,message:"Comment not found"});

  return res.status(200).json({success:true,message:"Comment updated successfully",data:comment});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to update comment",error:error.message});
 }
};

export const deleteComment=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid comment id"});

  const comment=await Comment.findByIdAndUpdate(
   id,
   {isDeleted:true},
   {returnDocument:"after"}
  );

  if(!comment)
   return res.status(404).json({success:false,message:"Comment not found"});

  return res.status(200).json({success:true,message:"Comment deleted successfully"});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to delete comment",error:error.message});
 }
};