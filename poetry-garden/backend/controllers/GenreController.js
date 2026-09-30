// backend/controllers/GenreController.js
import GenreModel from "../models/GenreModel.js";
import PoemModel from "../models/PoemModel.js";
import mongoose from "mongoose";

const normalizeGenreSections=value=>{
 if(!Array.isArray(value))return [];

 const seenSections=new Set();

 return value
  .map(section=>{
   const name=String(section?.name||"").trim();
   if(!name)return null;

   const key=name.toLowerCase();
   if(seenSections.has(key))return null;
   seenSections.add(key);

   const seenSubsections=new Set();
   const subsections=Array.isArray(section?.subsections)
    ?section.subsections
     .map(item=>String(item||"").trim())
     .filter(Boolean)
     .filter(item=>{
      const subKey=item.toLowerCase();
      if(seenSubsections.has(subKey))return false;
      seenSubsections.add(subKey);
      return true;
     })
    :[];

   return {name,subsections};
  })
  .filter(Boolean);
};

export const createGenre=async(req,res)=>{
 try{
  console.log("CREATE GENRE HIT",req.body);

  const name=req.body.name?.trim()||"";

  if(!name)return res.status(400).json({success:false,message:"Genre name is required"});

  const genre=new GenreModel({
   name,
   sections:normalizeGenreSections(req.body.sections)
  });

  const createdGenre=await genre.save();

  console.log("GENRE CREATED",createdGenre);

  return res.status(201).json({success:true,message:"Genre created successfully",genre:createdGenre});
 }catch(error){
  console.error("CREATE GENRE ERROR",error);
  if(error.code===11000)return res.status(409).json({success:false,message:"Genre already exists"});
  return res.status(500).json({success:false,message:"Failed to create genre",error:error.message});
 }
};

export const getGenres=async(req,res)=>{
 try{
  const {search=""}=req.query;

  const query={};

  if(search.trim()){
   query.name={$regex:search.trim(),$options:"i"};
  }

  const genres=await GenreModel.find(query).sort({name:1});

  return res.status(200).json({success:true,genres});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch genres",error:error.message});
 }
};

export const getGenreById=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid genre id"});

  const genre=await GenreModel.findById(id);

  if(!genre)return res.status(404).json({success:false,message:"Genre not found"});

  return res.status(200).json({success:true,genre});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch genre",error:error.message});
 }
};

export const updateGenre=async(req,res)=>{
 try{
  const {id}=req.params;
  const name=req.body.name?.trim()||"";

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid genre id"});
  if(!name)return res.status(400).json({success:false,message:"Genre name is required"});

  const genre=await GenreModel.findById(id);

  if(!genre)return res.status(404).json({success:false,message:"Genre not found"});

  genre.name=name;
  if(req.body.sections!==undefined)genre.sections=normalizeGenreSections(req.body.sections);

  const updatedGenre=await genre.save();

  return res.status(200).json({success:true,message:"Genre updated successfully",genre:updatedGenre});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"Genre already exists"});
  return res.status(500).json({success:false,message:"Failed to update genre",error:error.message});
 }
};

export const deleteGenre=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid genre id"});

  const genre=await GenreModel.findById(id);

  if(!genre)return res.status(404).json({success:false,message:"Genre not found"});

  const poemCount=await PoemModel.countDocuments({genre:id});

  if(poemCount>0){
   return res.status(409).json({
    success:false,
    message:`Cannot delete genre because ${poemCount} poem${poemCount===1?" uses":"s use"} it. Reassign those poems first.`
   });
  }

  await genre.deleteOne();

  return res.status(200).json({success:true,message:"Genre deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete genre",error:error.message});
 }
};
