// backend/controllers/AuthorController.js
import AuthorModel from "../models/AuthorModel.js";
import mongoose from "mongoose";

export const createAuthor=async(req,res)=>{
 try{
  const author=await AuthorModel.create(req.body);
  return res.status(201).json({success:true,message:"Author created successfully",author});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"Author slug already exists"});
  return res.status(500).json({success:false,message:"Failed to create author",error:error.message});
 }
};

export const getAuthors=async(req,res)=>{
 try{
  const {search="",isActive,page=1,limit,sort="lastName",order="asc"}=req.query;

  const query={};

  if(search){
   query.$or=[
    {displayName:{$regex:search,$options:"i"}},
    {firstName:{$regex:search,$options:"i"}},
    {middleName:{$regex:search,$options:"i"}},
    {lastName:{$regex:search,$options:"i"}},
    {nationality:{$regex:search,$options:"i"}},
    {bio:{$regex:search,$options:"i"}},
    {$text:{$search:search}}
   ];
  }

  if(typeof isActive!=="undefined")query.isActive=isActive==="true";

  const currentPage=Math.max(parseInt(page)||1,1);
  const perPage=limit?Math.max(parseInt(limit)||1,1):0;
  const skip=perPage?(currentPage-1)*perPage:0;
  const sortOrder=order==="desc"?-1:1;

  const findQuery=AuthorModel.find(query).sort({[sort]:sortOrder});

  if(perPage){
   findQuery.skip(skip).limit(perPage);
  }

  const [authors,total]=await Promise.all([
   findQuery,
   AuthorModel.countDocuments(query)
  ]);

  return res.status(200).json({
   success:true,
   total,
   page:currentPage,
   pages:perPage?Math.ceil(total/perPage):1,
   limit:perPage||total,
   authors
  });
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch authors",error:error.message});
 }
};

export const getAuthorById=async(req,res)=>{
 try{
  const {id}=req.params;

  const author=mongoose.Types.ObjectId.isValid(id)
   ?await AuthorModel.findById(id)
   :await AuthorModel.findOne({slug:id});

  if(!author)return res.status(404).json({success:false,message:"Author not found"});

  return res.status(200).json({success:true,author});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch author",error:error.message});
 }
};

export const updateAuthor=async(req,res)=>{
 try{
  const {id}=req.params;

  const author=mongoose.Types.ObjectId.isValid(id)
   ?await AuthorModel.findByIdAndUpdate(id,req.body,{new:true,runValidators:true})
   :await AuthorModel.findOneAndUpdate({slug:id},req.body,{new:true,runValidators:true});

  if(!author)return res.status(404).json({success:false,message:"Author not found"});

  return res.status(200).json({success:true,message:"Author updated successfully",author});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"Author slug already exists"});
  return res.status(500).json({success:false,message:"Failed to update author",error:error.message});
 }
};

export const deleteAuthor=async(req,res)=>{
 try{
  const {id}=req.params;

  const author=mongoose.Types.ObjectId.isValid(id)
   ?await AuthorModel.findByIdAndDelete(id)
   :await AuthorModel.findOneAndDelete({slug:id});

  if(!author)return res.status(404).json({success:false,message:"Author not found"});

  return res.status(200).json({success:true,message:"Author deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete author",error:error.message});
 }
};