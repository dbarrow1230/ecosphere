import express from "express";
import mongoose from "mongoose";
import Brand from "../../models/reference/brandModel.js";
import UnitOfMeasure from "../../models/reference/unitOfMeasureModel.js";

const router=express.Router();
for(const [path,Model] of [["brands",Brand],["units-of-measure",UnitOfMeasure]]){
 router.get(`/${path}`,async(req,res,next)=>{
  try{res.json(await Model.find().sort({name:1}));}catch(error){next(error);}
 });
 router.post(`/${path}`,async(req,res)=>{
  try{res.status(201).json({data:await Model.create(req.body)});}
  catch(error){res.status(error.code===11000?409:400).json({message:error.message});}
 });
 router.put(`/${path}/:id`,async(req,res)=>{
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:"Invalid reference ID"});
  try{
   const data=await Model.findByIdAndUpdate(req.params.id,{$set:{name:req.body.name,description:req.body.description,isActive:req.body.isActive,...(path==="units-of-measure"?{symbol:req.body.symbol}:{})}},{returnDocument:"after",runValidators:true});
   if(!data)return res.status(404).json({message:"Reference not found"});
   res.json({data});
  }catch(error){res.status(error.code===11000?409:400).json({message:error.message});}
 });
}
export default router;
