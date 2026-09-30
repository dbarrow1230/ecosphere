// backend/controllers/studies/studyTaskController.js
import StudyTask from "../../models/studies/studyTaskModel.js";

const normalizeStudyTaskPayload=body=>({
 ...body,
 study:body.study||null,
 dueDate:body.dueDate||null,
 dueTime:body.dueTime?.trim?.()||"",
 priority:body.priority||null,
 status:body.status||null,
 completed:typeof body.completed==="boolean"?body.completed:false,
 completedAt:body.completedAt||null,
 reminderAt:body.reminderAt||null,
 tags:Array.isArray(body.tags)?body.tags.map(tag=>String(tag).trim()).filter(Boolean):[]
});

export const getStudyTasks=async(req,res)=>{
 try{
  const {user,study,status,priority}=req.query;
  const filter={};

  if(user)filter.user=user;
  if(study)filter.study=study;
  if(status)filter.status=status;
  if(priority)filter.priority=priority;

  const items=await StudyTask.find(filter)
   .populate("user")
   .populate("study")
   .populate("priority")
   .populate("status")
   .sort({dueDate:1,dueTime:1,createdAt:-1});

  return res.status(200).json({
   success:true,
   count:items.length,
   data:items
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch study tasks",
   error:err.message
  });
 }
};

export const getStudyTaskById=async(req,res)=>{
 try{
  const item=await StudyTask.findById(req.params.id)
   .populate("user")
   .populate("study")
   .populate("priority")
   .populate("status");

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Study task not found"
   });
  }

  return res.status(200).json({
   success:true,
   data:item
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch study task",
   error:err.message
  });
 }
};

export const createStudyTask=async(req,res)=>{
 try{
  const payload=normalizeStudyTaskPayload(req.body);
  const item=await StudyTask.create(payload);

  const populatedItem=await StudyTask.findById(item._id)
   .populate("user")
   .populate("study")
   .populate("priority")
   .populate("status");

  return res.status(201).json({
   success:true,
   message:"Study task created successfully",
   data:populatedItem
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to create study task",
   error:err.message
  });
 }
};

export const updateStudyTask=async(req,res)=>{
 try{
  const payload=normalizeStudyTaskPayload(req.body);

  const item=await StudyTask.findByIdAndUpdate(req.params.id,payload,{
   returnDocument:"after",
   runValidators:true
  })
   .populate("user")
   .populate("study")
   .populate("priority")
   .populate("status");

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Study task not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Study task updated successfully",
   data:item
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to update study task",
   error:err.message
  });
 }
};

export const deleteStudyTask=async(req,res)=>{
 try{
  const item=await StudyTask.findByIdAndDelete(req.params.id);

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Study task not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Study task deleted successfully"
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to delete study task",
   error:err.message
  });
 }
};