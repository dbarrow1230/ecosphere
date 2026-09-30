// backend/controllers/favoriteController.js
import mongoose from "mongoose";
import Favorite from "../models/favoriteModel.js";

export const createFavorite=async(req,res)=>{
 try{
  const{user,note}=req.body;

  if(!user||!note)
   return res.status(400).json({success:false,message:"user and note are required"});

  if(!mongoose.Types.ObjectId.isValid(user))
   return res.status(400).json({success:false,message:"Invalid user id"});

  if(!mongoose.Types.ObjectId.isValid(note))
   return res.status(400).json({success:false,message:"Invalid note id"});

  const favorite=await Favorite.create({
   user,
   note
  });

  return res.status(201).json({success:true,message:"Favorite created successfully",data:favorite});
 }
 catch(error){
  if(error.code===11000)
   return res.status(409).json({success:false,message:"Note already favorited by this user"});
  return res.status(500).json({success:false,message:"Failed to create favorite",error:error.message});
 }
};

export const getFavorites=async(req,res)=>{
 try{
  const{user,note}=req.query;
  const query={};

  if(user){
   if(!mongoose.Types.ObjectId.isValid(user))
    return res.status(400).json({success:false,message:"Invalid user id"});
   query.user=user;
  }

  if(note){
   if(!mongoose.Types.ObjectId.isValid(note))
    return res.status(400).json({success:false,message:"Invalid note id"});
   query.note=note;
  }

  const favorites=await Favorite.find(query)
  .populate("user","username email")
  .populate("note")
  .sort({createdAt:-1});

  return res.status(200).json({success:true,count:favorites.length,data:favorites});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch favorites",error:error.message});
 }
};

export const getFavoriteById=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid favorite id"});

  const favorite=await Favorite.findById(id)
  .populate("user","username email")
  .populate("note");

  if(!favorite)
   return res.status(404).json({success:false,message:"Favorite not found"});

  return res.status(200).json({success:true,data:favorite});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch favorite",error:error.message});
 }
};

export const deleteFavorite=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid favorite id"});

  const favorite=await Favorite.findByIdAndDelete(id);

  if(!favorite)
   return res.status(404).json({success:false,message:"Favorite not found"});

  return res.status(200).json({success:true,message:"Favorite removed successfully"});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to delete favorite",error:error.message});
 }
};