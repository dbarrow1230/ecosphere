// backend/controllers/GenreController.js
import GenreModel from "../models/GenreModel.js";
import BookModel from "../models/BookModel.js";
import mongoose from "mongoose";

export const createGenre=async(req,res)=>{
 try{
  const genre=await GenreModel.create({
   name:req.body.name
  });
  return res.status(201).json({success:true,message:"Genre created successfully",genre});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"Genre already exists"});
  return res.status(500).json({success:false,message:"Failed to create genre",error:error.message});
 }
};

export const getGenres=async(req,res)=>{
 try{
  const {search=""}=req.query;

  const query={};

  if(search){
   query.$text={$search:search};
  }

  const genres=await GenreModel.find(query).sort({name:1}).lean();
  const usageRows=await BookModel.aggregate([
   {$unwind:"$genres"},
   {$project:{
    genreId:{
     $switch:{
      branches:[
       {case:{$eq:[{$type:"$genres"},"objectId"]},then:{$toString:"$genres"}},
       {case:{$eq:[{$type:"$genres"},"object"]},then:{$toString:"$genres._id"}},
       {case:{$eq:[{$type:"$genres"},"string"]},then:"$genres"}
      ],
      default:""
     }
    },
    genreName:{
     $switch:{
      branches:[
       {case:{$eq:[{$type:"$genres"},"object"]},then:{$toLower:{$trim:{input:{$ifNull:["$genres.name",""]}}}}},
       {case:{$eq:[{$type:"$genres"},"string"]},then:{$toLower:{$trim:{input:"$genres"}}}}
      ],
      default:""
     }
    }
   }},
   {$facet:{
    byId:[
     {$match:{genreId:{$ne:""}}},
     {$group:{_id:"$genreId",numberOfBooks:{$sum:1}}}
    ],
    byName:[
     {$match:{genreName:{$ne:""}}},
     {$group:{_id:"$genreName",numberOfBooks:{$sum:1}}}
    ]
   }}
  ]);
  const usageById=new Map((usageRows[0]?.byId||[]).map(row=>[String(row._id),row.numberOfBooks]));
  const usageByName=new Map((usageRows[0]?.byName||[]).map(row=>[String(row._id),row.numberOfBooks]));
  const genresWithUsage=genres.map(genre=>({
   ...genre,
   numberOfBooks:(usageById.get(String(genre._id))||0)+(usageByName.get(String(genre.name||"").trim().toLowerCase())||0)
  }));

  return res.status(200).json({success:true,genres:genresWithUsage});
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

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid genre id"});

  const genre=await GenreModel.findByIdAndUpdate(id,{
   name:req.body.name
  },{new:true,runValidators:true});

  if(!genre)return res.status(404).json({success:false,message:"Genre not found"});

  return res.status(200).json({success:true,message:"Genre updated successfully",genre});
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

  const bookCount=await BookModel.countDocuments({genres:{$in:[id,String(id),genre.name]}});
  if(bookCount>0){
   return res.status(409).json({
    success:false,
    message:`Cannot delete this genre because it is assigned to ${bookCount} ${bookCount===1?"book":"books"}. Remove it from those books first.`,
    bookCount
   });
  }

  await GenreModel.findByIdAndDelete(id);

  return res.status(200).json({success:true,message:"Genre deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete genre",error:error.message});
 }
};
