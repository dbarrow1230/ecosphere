// backend/controllers/AuthorController.js
import AuthorModel from "../models/AuthorModel.js";
import mongoose from "mongoose";

export const createAuthor=async(req,res)=>{
 try{
  console.log("CREATE AUTHOR HIT",req.body);

  const author=new AuthorModel(req.body);

  const createdAuthor=await author.save();

  console.log("AUTHOR CREATED",createdAuthor);

  return res.status(201).json({success:true,message:"Author created successfully",author:createdAuthor});
 }catch(error){
  console.error("CREATE AUTHOR ERROR",error);
  if(error.code===11000)return res.status(409).json({success:false,message:"Author slug already exists"});
  return res.status(500).json({success:false,message:"Failed to create author",error:error.message});
 }
};

export const getAuthors=async(req,res)=>{
 try{
  const {search="",isActive,page=1,limit,sort="lastName",order="asc"}=req.query;

  const query={};

  if(search.trim()){
   query.$or=[
    {displayName:{$regex:search.trim(),$options:"i"}},
    {firstName:{$regex:search.trim(),$options:"i"}},
    {middleName:{$regex:search.trim(),$options:"i"}},
    {lastName:{$regex:search.trim(),$options:"i"}},
    {nationality:{$regex:search.trim(),$options:"i"}},
    {bio:{$regex:search.trim(),$options:"i"}}
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
   ?await AuthorModel.findById(id)
   :await AuthorModel.findOne({slug:id});

  if(!author)return res.status(404).json({success:false,message:"Author not found"});

  Object.assign(author,req.body);

  const updatedAuthor=await author.save();

  return res.status(200).json({success:true,message:"Author updated successfully",author:updatedAuthor});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"Author slug already exists"});
  return res.status(500).json({success:false,message:"Failed to update author",error:error.message});
 }
};

export const deleteAuthor=async(req,res)=>{
 try{
  const {id}=req.params;

  const author=mongoose.Types.ObjectId.isValid(id)
   ?await AuthorModel.findById(id)
   :await AuthorModel.findOne({slug:id});

  if(!author)return res.status(404).json({success:false,message:"Author not found"});

  await author.deleteOne();

  return res.status(200).json({success:true,message:"Author deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete author",error:error.message});
 }
};