import ProjectTask from "../models/taskModel.js";

const populate=query=>query.populate("project","name status").populate("assignee","username email");

export const listTasks=async(req,res,next)=>{try{const filter={};if(req.query.project)filter.project=req.query.project;if(req.query.assignee)filter.assignee=req.query.assignee;res.json(await populate(ProjectTask.find(filter)).sort({dueDate:1,createdAt:-1}));}catch(error){next(error);}};
export const getTask=async(req,res,next)=>{try{const item=await populate(ProjectTask.findById(req.params.id));if(!item)return res.status(404).json({message:"Task not found"});res.json(item);}catch(error){next(error);}};
export const createTask=async(req,res,next)=>{try{const data={...req.body};if(data.status==="completed"&&!data.completedAt)data.completedAt=new Date();const item=await ProjectTask.create(data);res.status(201).json(await populate(ProjectTask.findById(item._id)));}catch(error){next(error);}};
export const updateTask=async(req,res,next)=>{try{const data={...req.body};if(data.status==="completed"&&!data.completedAt)data.completedAt=new Date();const item=await populate(ProjectTask.findByIdAndUpdate(req.params.id,data,{returnDocument:"after",runValidators:true}));if(!item)return res.status(404).json({message:"Task not found"});res.json(item);}catch(error){next(error);}};
export const deleteTask=async(req,res,next)=>{try{const item=await ProjectTask.findByIdAndDelete(req.params.id);if(!item)return res.status(404).json({message:"Task not found"});res.json({message:"Task deleted"});}catch(error){next(error);}};
