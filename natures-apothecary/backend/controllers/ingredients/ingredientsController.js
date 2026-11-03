// backend/controllers/ingredients/ingredientsController.js
import mongoose from "mongoose";
import Ingredient from "../../models/ingredients/ingredientsModel.js";
import Part from "../../models/reference/partsModel.js";
import Form from "../../models/reference/formsModel.js";
import Status from "../../models/reference/statusModel.js";
import MetricUnit from "../../models/reference/metricUnitsModel.js";
import ImperialUnit from "../../models/reference/imperialUnitsModel.js";

const makeSlug=value=>String(value||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)+/g,"");

const formatIngredient=doc=>{
 const item=doc?.toObject?doc.toObject():doc;
 if(!item)return item;
 return item;
};

const ingredientPopulate=[
 {path:"part",model:Part,select:"name slug"},
 {path:"form",model:Form,select:"name slug"},
 {path:"metricUnit",model:MetricUnit,select:"name singular plural symbol code unitType baseUnit conversionFactor"},
 {path:"imperialUnit",model:ImperialUnit,select:"name singular plural symbol code unitType baseUnit conversionFactor"},
 {path:"status",model:Status,select:"name code color isDefault"}
];

export const createIngredient=async(req,res)=>{
 try{
  const{
   name,slug,botanicalName,inciName,part,form,metricUnit,imperialUnit,description,image,notes,status
  }=req.body;

  if(!name)return res.status(400).json({success:false,message:"Name is required"});
  if(!part)return res.status(400).json({success:false,message:"Part is required"});
  if(!form)return res.status(400).json({success:false,message:"Form is required"});
  if(!metricUnit)return res.status(400).json({success:false,message:"Metric unit is required"});
  if(!imperialUnit)return res.status(400).json({success:false,message:"Imperial unit is required"});
  if(!status)return res.status(400).json({success:false,message:"Status is required"});

  if(!mongoose.Types.ObjectId.isValid(part))return res.status(400).json({success:false,message:"Invalid part id"});
  if(!mongoose.Types.ObjectId.isValid(form))return res.status(400).json({success:false,message:"Invalid form id"});
  if(!mongoose.Types.ObjectId.isValid(metricUnit))return res.status(400).json({success:false,message:"Invalid metric unit id"});
  if(!mongoose.Types.ObjectId.isValid(imperialUnit))return res.status(400).json({success:false,message:"Invalid imperial unit id"});
  if(!mongoose.Types.ObjectId.isValid(status))return res.status(400).json({success:false,message:"Invalid status id"});

  const ingredient=new Ingredient({
   name:name.trim(),
   slug:slug&&String(slug).trim()?makeSlug(slug):makeSlug(name),
   botanicalName:botanicalName||"",
   inciName:inciName||"",
   part,
   form,
   metricUnit,
   imperialUnit,
   description:description||"",
   image:Array.isArray(image)?image.filter(Boolean):[],
   notes:Array.isArray(notes)?notes.filter(Boolean):[],
   status
  });

  const saved=await ingredient.save();
  const populated=await Ingredient.findById(saved._id).populate(ingredientPopulate);

  return res.status(201).json({success:true,message:"Ingredient created successfully",ingredient:formatIngredient(populated)});
 }catch(error){
  if(error.code===11000){
   const field=Object.keys(error.keyPattern||{})[0]||"field";
   return res.status(409).json({success:false,message:`${field} already exists`});
  }
  return res.status(500).json({success:false,message:"Error creating ingredient",error:error.message});
 }
};

export const getIngredients=async(req,res)=>{
 try{
  const{search,part,form,status,metricUnit,imperialUnit}=req.query;
  const query={};

  if(part&&mongoose.Types.ObjectId.isValid(part))query.part=part;
  if(form&&mongoose.Types.ObjectId.isValid(form))query.form=form;
  if(status&&mongoose.Types.ObjectId.isValid(status))query.status=status;
  if(metricUnit&&mongoose.Types.ObjectId.isValid(metricUnit))query.metricUnit=metricUnit;
  if(imperialUnit&&mongoose.Types.ObjectId.isValid(imperialUnit))query.imperialUnit=imperialUnit;

  if(search){
   query.$or=[
    {name:{$regex:search,$options:"i"}},
    {slug:{$regex:search,$options:"i"}},
    {botanicalName:{$regex:search,$options:"i"}},
    {inciName:{$regex:search,$options:"i"}},
    {description:{$regex:search,$options:"i"}}
   ];
  }

  const ingredients=await Ingredient.find(query).populate(ingredientPopulate).sort({name:1});

  return res.status(200).json({success:true,count:ingredients.length,ingredients:ingredients.map(formatIngredient)});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching ingredients",error:error.message});
 }
};

export const getIngredientById=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid ingredient id"});

  const ingredient=await Ingredient.findById(id).populate(ingredientPopulate);
  if(!ingredient)return res.status(404).json({success:false,message:"Ingredient not found"});

  return res.status(200).json({success:true,ingredient:formatIngredient(ingredient)});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching ingredient",error:error.message});
 }
};

export const updateIngredient=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid ingredient id"});

  const{
   name,slug,botanicalName,inciName,part,form,metricUnit,imperialUnit,description,image,notes,status
  }=req.body;

  const updateData={};

  if(name!==undefined)updateData.name=String(name).trim();
  if(slug!==undefined)updateData.slug=String(slug).trim()?makeSlug(slug):undefined;
  if(name!==undefined&&slug===undefined)updateData.slug=makeSlug(name);
  if(botanicalName!==undefined)updateData.botanicalName=botanicalName;
  if(inciName!==undefined)updateData.inciName=inciName;

  if(part!==undefined){
   if(!mongoose.Types.ObjectId.isValid(part))return res.status(400).json({success:false,message:"Invalid part id"});
   updateData.part=part;
  }

  if(form!==undefined){
   if(!mongoose.Types.ObjectId.isValid(form))return res.status(400).json({success:false,message:"Invalid form id"});
   updateData.form=form;
  }

  if(metricUnit!==undefined){
   if(!mongoose.Types.ObjectId.isValid(metricUnit))return res.status(400).json({success:false,message:"Invalid metric unit id"});
   updateData.metricUnit=metricUnit;
  }

  if(imperialUnit!==undefined){
   if(!mongoose.Types.ObjectId.isValid(imperialUnit))return res.status(400).json({success:false,message:"Invalid imperial unit id"});
   updateData.imperialUnit=imperialUnit;
  }

  if(description!==undefined)updateData.description=description;
  if(image!==undefined)updateData.image=Array.isArray(image)?image.filter(Boolean):[];
  if(notes!==undefined)updateData.notes=Array.isArray(notes)?notes.filter(Boolean):[];

  if(status!==undefined){
   if(!mongoose.Types.ObjectId.isValid(status))return res.status(400).json({success:false,message:"Invalid status id"});
   updateData.status=status;
  }

  const ingredient=await Ingredient.findByIdAndUpdate(id,updateData,{returnDocument:"after",runValidators:true}).populate(ingredientPopulate);

  if(!ingredient)return res.status(404).json({success:false,message:"Ingredient not found"});

  return res.status(200).json({success:true,message:"Ingredient updated successfully",ingredient:formatIngredient(ingredient)});
 }catch(error){
  if(error.code===11000){
   const field=Object.keys(error.keyPattern||{})[0]||"field";
   return res.status(409).json({success:false,message:`${field} already exists`});
  }
  return res.status(500).json({success:false,message:"Error updating ingredient",error:error.message});
 }
};

export const deleteIngredient=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid ingredient id"});

  const ingredient=await Ingredient.findByIdAndDelete(id);
  if(!ingredient)return res.status(404).json({success:false,message:"Ingredient not found"});

  return res.status(200).json({success:true,message:"Ingredient deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Error deleting ingredient",error:error.message});
 }
};