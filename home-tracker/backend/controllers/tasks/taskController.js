import Task from "../../models/tasks/taskModel.js";

const getBusinessFilter=req=>req.query?.business||req.body?.business||req.user?.business_id||req.user?.business||null;

const normalizePayload=body=>({
 business:body.business||null,
 name:body.name?.trim(),
 description:body.description?.trim()||"",
 dueDate:body.dueDate||null,
 status:body.status||"Open",
 priority:body.priority||"Normal",
 remindAt:body.remindAt||null,
 message:body.message?.trim()||"",
 completedAt:body.status==="Done"||body.status==="Completed"?new Date():body.completedAt||null
});

const buildFilter=req=>{
 const filter={};
 const business=getBusinessFilter(req);
 if(business)filter.business=business;
 if(req.query.status)filter.status=req.query.status;
 if(req.query.priority)filter.priority=req.query.priority;
 if(req.query.search?.trim())filter.$text={$search:req.query.search.trim()};
 return filter;
};

export const createTask=async(req,res,next)=>{
 try{
  const payload=normalizePayload(req.body);
  payload.business=getBusinessFilter(req);

  if(!payload.name)return res.status(400).json({message:"Task name is required"});

  const task=await Task.create(payload);
  return res.status(201).json({task,reminders:[]});
 }catch(error){
  return next(error);
 }
};

export const getTasks=async(req,res,next)=>{
 try{
  const tasks=await Task.find(buildFilter(req)).sort({dueDate:1,priority:1,name:1}).lean();
  return res.json({tasks});
 }catch(error){
  return next(error);
 }
};

export const getTaskById=async(req,res,next)=>{
 try{
  const task=await Task.findById(req.params.id).lean();
  if(!task)return res.status(404).json({message:"Task not found"});
  return res.json({task,reminders:[]});
 }catch(error){
  return next(error);
 }
};

export const updateTask=async(req,res,next)=>{
 try{
  const payload=normalizePayload(req.body);
  const business=getBusinessFilter(req);
  if(business)payload.business=business;
  else delete payload.business;

  if(!payload.name)return res.status(400).json({message:"Task name is required"});

  const task=await Task.findByIdAndUpdate(req.params.id,payload,{new:true,runValidators:true});
  if(!task)return res.status(404).json({message:"Task not found"});
  return res.json({task,reminders:[]});
 }catch(error){
  return next(error);
 }
};

export const deleteTask=async(req,res,next)=>{
 try{
  const task=await Task.findByIdAndDelete(req.params.id);
  if(!task)return res.status(404).json({message:"Task not found"});
  return res.json({message:"Task deleted successfully"});
 }catch(error){
  return next(error);
 }
};
