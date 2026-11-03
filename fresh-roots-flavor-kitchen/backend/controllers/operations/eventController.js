import mongoose from "mongoose";
import Event from "../../models/operations/eventModel.js";

const fields=["eventName","clientName","eventDate","eventTime","guestCount","status","location","notes"];
const pick=body=>Object.fromEntries(fields.filter(field=>body[field]!==undefined).map(field=>[field,body[field]]));
const validId=id=>mongoose.Types.ObjectId.isValid(id);

export const getEvents=async(req,res,next)=>{try{const filter={};if(req.query.status)filter.status=req.query.status;const events=await Event.find(filter).sort({eventDate:1,eventTime:1});res.json({events});}catch(error){next(error);}};
export const getEventById=async(req,res,next)=>{try{if(!validId(req.params.id))return res.status(400).json({message:"Invalid event id"});const event=await Event.findById(req.params.id);if(!event)return res.status(404).json({message:"Event not found"});res.json({event});}catch(error){next(error);}};
export const createEvent=async(req,res,next)=>{try{const event=await Event.create(pick(req.body));res.status(201).json({message:"Event created successfully",event});}catch(error){next(error);}};
export const updateEvent=async(req,res,next)=>{try{if(!validId(req.params.id))return res.status(400).json({message:"Invalid event id"});const event=await Event.findByIdAndUpdate(req.params.id,pick(req.body),{returnDocument:"after",runValidators:true});if(!event)return res.status(404).json({message:"Event not found"});res.json({message:"Event updated successfully",event});}catch(error){next(error);}};
export const deleteEvent=async(req,res,next)=>{try{if(!validId(req.params.id))return res.status(400).json({message:"Invalid event id"});const event=await Event.findByIdAndDelete(req.params.id);if(!event)return res.status(404).json({message:"Event not found"});res.json({message:"Event deleted successfully"});}catch(error){next(error);}};
