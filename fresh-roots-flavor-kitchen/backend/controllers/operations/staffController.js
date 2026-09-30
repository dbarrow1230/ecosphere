import mongoose from "mongoose";
import Staff from "../../models/operations/staffModel.js";

const fields=["name","role","shift","status","area","isActive"];
const pick=body=>Object.fromEntries(fields.filter(field=>body[field]!==undefined).map(field=>[field,body[field]]));
const validId=id=>mongoose.Types.ObjectId.isValid(id);

export const getStaff=async(req,res,next)=>{try{const staff=await Staff.find(req.query.active==="false"?{}:{isActive:{$ne:false}}).sort({area:1,name:1});res.json({staff});}catch(error){next(error);}};
export const createStaff=async(req,res,next)=>{try{const staff=await Staff.create(pick(req.body));res.status(201).json({message:"Staff member created successfully",staff});}catch(error){next(error);}};
export const updateStaff=async(req,res,next)=>{try{if(!validId(req.params.id))return res.status(400).json({message:"Invalid staff id"});const staff=await Staff.findByIdAndUpdate(req.params.id,pick(req.body),{returnDocument:"after",runValidators:true});if(!staff)return res.status(404).json({message:"Staff member not found"});res.json({message:"Staff member updated successfully",staff});}catch(error){next(error);}};
export const deleteStaff=async(req,res,next)=>{try{if(!validId(req.params.id))return res.status(400).json({message:"Invalid staff id"});const staff=await Staff.findByIdAndDelete(req.params.id);if(!staff)return res.status(404).json({message:"Staff member not found"});res.json({message:"Staff member deleted successfully"});}catch(error){next(error);}};
