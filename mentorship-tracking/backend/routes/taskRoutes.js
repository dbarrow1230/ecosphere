import express from "express";
import Task from "../models/taskModel.js";

const router=express.Router();
const userId=req=>req.query.user||req.body.user;

router.get("/",async(req,res,next)=>{
 try{
  const filter={user:userId(req)};
  if(!filter.user)return res.status(400).json({message:"User is required"});
  if(req.query.status)filter.status=req.query.status;
  const tasks=await Task.find(filter).sort({dueDate:1,priority:1,createdAt:-1}).lean();
  return res.json({tasks});
 }catch(error){return next(error);}
});

router.post("/",async(req,res,next)=>{
 try{
  if(!userId(req)||!String(req.body.name||"").trim())return res.status(400).json({message:"User and task name are required"});
  const task=await Task.create({...req.body,user:userId(req),name:String(req.body.name).trim()});
  return res.status(201).json({task});
 }catch(error){return next(error);}
});

router.put("/:id",async(req,res,next)=>{
 try{
  const task=await Task.findOneAndUpdate({_id:req.params.id,user:userId(req)},req.body,{returnDocument:"after",runValidators:true});
  if(!task)return res.status(404).json({message:"Task not found"});
  return res.json({task});
 }catch(error){return next(error);}
});

router.delete("/:id",async(req,res,next)=>{
 try{
  const task=await Task.findOneAndDelete({_id:req.params.id,user:userId(req)});
  if(!task)return res.status(404).json({message:"Task not found"});
  return res.json({message:"Task deleted"});
 }catch(error){return next(error);}
});

export default router;
