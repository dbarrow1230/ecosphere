import Project from "../models/projectModel.js";

const populate=query=>query.populate("owner","username email").populate("members","username email");

export const listProjects=async(req,res,next)=>{try{res.json(await populate(Project.find()).sort({updatedAt:-1}));}catch(error){next(error);}};
export const getProject=async(req,res,next)=>{try{const item=await populate(Project.findById(req.params.id));if(!item)return res.status(404).json({message:"Project not found"});res.json(item);}catch(error){next(error);}};
export const createProject=async(req,res,next)=>{try{const item=await Project.create(req.body);res.status(201).json(await populate(Project.findById(item._id)));}catch(error){next(error);}};
export const updateProject=async(req,res,next)=>{try{const item=await populate(Project.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true}));if(!item)return res.status(404).json({message:"Project not found"});res.json(item);}catch(error){next(error);}};
export const deleteProject=async(req,res,next)=>{try{const item=await Project.findByIdAndDelete(req.params.id);if(!item)return res.status(404).json({message:"Project not found"});res.json({message:"Project deleted"});}catch(error){next(error);}};
