import mongoose from "mongoose";
import Shift from "../../models/operations/shiftModel.js";

const fields=["staff","title","role","area","status","start","end","published"];
const pick=body=>Object.fromEntries(fields.filter(field=>body[field]!==undefined).map(field=>[field,body[field]]));
const validId=id=>mongoose.Types.ObjectId.isValid(id);
const withStaff=query=>query.populate("staff","name role area");

export const getShifts=async(req,res,next)=>{try{const filter={};if(req.query.start||req.query.end)filter.start={...(req.query.start?{$gte:new Date(req.query.start)}:{}),...(req.query.end?{$lte:new Date(req.query.end)}:{})};const shifts=await withStaff(Shift.find(filter).sort({start:1}));res.json({shifts});}catch(error){next(error);}};
export const createShift=async(req,res,next)=>{try{const payload=pick(req.body);if(new Date(payload.end)<=new Date(payload.start))return res.status(400).json({message:"Shift end must be after its start"});const created=await Shift.create(payload);const shift=await withStaff(Shift.findById(created._id));res.status(201).json({message:"Shift created successfully",shift});}catch(error){next(error);}};
export const updateShift=async(req,res,next)=>{try{if(!validId(req.params.id))return res.status(400).json({message:"Invalid shift id"});const payload=pick(req.body);const shift=await withStaff(Shift.findByIdAndUpdate(req.params.id,payload,{returnDocument:"after",runValidators:true}));if(!shift)return res.status(404).json({message:"Shift not found"});res.json({message:"Shift updated successfully",shift});}catch(error){next(error);}};
export const deleteShift=async(req,res,next)=>{try{if(!validId(req.params.id))return res.status(400).json({message:"Invalid shift id"});const shift=await Shift.findByIdAndDelete(req.params.id);if(!shift)return res.status(404).json({message:"Shift not found"});res.json({message:"Shift deleted successfully"});}catch(error){next(error);}};
export const publishShifts=async(req,res,next)=>{try{const ids=Array.isArray(req.body.ids)?req.body.ids.filter(validId):[];const filter=ids.length?{_id:{$in:ids}}:{};const result=await Shift.updateMany(filter,{$set:{published:true}});res.json({message:"Schedule published successfully",updated:result.modifiedCount});}catch(error){next(error);}};
