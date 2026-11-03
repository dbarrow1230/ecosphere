import {BookDeadline,BookGoal,BookSession} from "../../models/planner/bookTrackingModel.js";

const getFilter=query=>{
 const filter={};
 for(const key of ["business_id","book_id","user_id"]){
  if(query[key])filter[key]=query[key];
 }
 if(query.isActive!==undefined)filter.isActive=query.isActive==="true";
 return filter;
};

const list=model=>async(req,res)=>{
 try{
  const records=await model.find(getFilter(req.query)).sort({updatedAt:-1,createdAt:-1});
  res.status(200).json(records);
 }catch(error){
  res.status(500).json({success:false,message:"Book tracking records could not load",error:error.message});
 }
};

const create=model=>async(req,res)=>{
 try{
  if(!req.body.business_id||!req.body.book_id){
   return res.status(400).json({success:false,message:"business_id and book_id are required"});
  }
  const record=await model.create(req.body);
  res.status(201).json(record);
 }catch(error){
  res.status(500).json({success:false,message:"Book tracking record could not save",error:error.message});
 }
};

const update=model=>async(req,res)=>{
 try{
  const record=await model.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
  if(!record)return res.status(404).json({success:false,message:"Book tracking record not found"});
  res.status(200).json(record);
 }catch(error){
  res.status(500).json({success:false,message:"Book tracking record could not update",error:error.message});
 }
};

export const getBookGoals=list(BookGoal);
export const createBookGoal=create(BookGoal);
export const updateBookGoal=update(BookGoal);
export const getBookDeadlines=list(BookDeadline);
export const createBookDeadline=create(BookDeadline);
export const updateBookDeadline=update(BookDeadline);
export const getBookSessions=list(BookSession);
export const createBookSession=create(BookSession);
export const updateBookSession=update(BookSession);
