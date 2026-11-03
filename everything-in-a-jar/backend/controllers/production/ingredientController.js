import mongoose from "mongoose";
import Ingredient from "../../models/production/ingredientModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

export const createIngredient=async(req,res)=>{
 try{
  const item=await Ingredient.create(req.body);
  return res.status(201).json({success:true,message:"Ingredient created successfully",data:item});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"Duplicate ingredient",error:error.message});
  return res.status(500).json({success:false,message:"Failed to create ingredient",error:error.message});
 }
};

export const getIngredients=async(req,res)=>{
 try{
  const {business_id,ingredientType,isActive,search,page=1,limit=20,sortBy="name",sortOrder="asc"}=req.query;
  const query={};

  if(business_id){
   if(!isValidObjectId(business_id))return res.status(400).json({success:false,message:"Invalid business_id"});
   query.business_id=business_id;
  }
  if(ingredientType)query.ingredientType=ingredientType;
  if(isActive!==undefined)query.isActive=String(isActive)==="true";
  if(search){
   query.$or=[
    {name:{$regex:search,$options:"i"}},
    {sku:{$regex:search,$options:"i"}},
    {notes:{$regex:search,$options:"i"}}
   ];
  }

  const pageNum=Math.max(parseInt(page,10)||1,1);
  const limitNum=Math.max(parseInt(limit,10)||20,1);
  const skip=(pageNum-1)*limitNum;
  const sort={[sortBy]:sortOrder==="asc"?1:-1};

  const [items,total]=await Promise.all([
   Ingredient.find(query).populate("business_id").populate("preferredVendorRef").sort(sort).skip(skip).limit(limitNum),
   Ingredient.countDocuments(query)
  ]);

  return res.status(200).json({success:true,count:items.length,total,page:pageNum,pages:Math.ceil(total/limitNum),data:items});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch ingredients",error:error.message});
 }
};

export const getIngredientById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id))return res.status(400).json({success:false,message:"Invalid ingredient id"});

  const item=await Ingredient.findById(id).populate("business_id").populate("preferredVendorRef");
  if(!item)return res.status(404).json({success:false,message:"Ingredient not found"});

  return res.status(200).json({success:true,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch ingredient",error:error.message});
 }
};

export const updateIngredient=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id))return res.status(400).json({success:false,message:"Invalid ingredient id"});

  const item=await Ingredient.findByIdAndUpdate(id,req.body,{returnDocument:"after",runValidators:true})
   .populate("business_id")
   .populate("preferredVendorRef");

  if(!item)return res.status(404).json({success:false,message:"Ingredient not found"});
  return res.status(200).json({success:true,message:"Ingredient updated successfully",data:item});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"Duplicate ingredient",error:error.message});
  return res.status(500).json({success:false,message:"Failed to update ingredient",error:error.message});
 }
};

export const deleteIngredient=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id))return res.status(400).json({success:false,message:"Invalid ingredient id"});

  const item=await Ingredient.findByIdAndDelete(id);
  if(!item)return res.status(404).json({success:false,message:"Ingredient not found"});

  return res.status(200).json({success:true,message:"Ingredient deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete ingredient",error:error.message});
 }
};
