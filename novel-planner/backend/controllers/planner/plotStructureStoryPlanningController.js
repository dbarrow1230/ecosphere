// backend/controllers/planner/plotStructureStoryPlanningController.js
import PlotStructureStoryPlanning from "../../models/planner/plotStructureStoryPlanningModel.js";

export const getPlotStructureStoryPlanning=async(req,res)=>{
 try{
  const filter={isActive:true};

  if(req.query.business_id)filter.business_id=req.query.business_id;
  if(req.query.user_id)filter.user_id=req.query.user_id;
  if(req.query.book_id)filter.book_id=req.query.book_id;

  const plotStructureStoryPlanning=await PlotStructureStoryPlanning.findOne(filter);

  res.status(200).json({
   success:true,
   data:plotStructureStoryPlanning
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get plot structure story planning",
   error:error.message
  });
 }
};

export const getPlotStructureStoryPlanningById=async(req,res)=>{
 try{
  const plotStructureStoryPlanning=await PlotStructureStoryPlanning.findById(req.params.id);

  if(!plotStructureStoryPlanning){
   return res.status(404).json({
    success:false,
    message:"Plot structure story planning not found"
   });
  }

  res.status(200).json({
   success:true,
   data:plotStructureStoryPlanning
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get plot structure story planning",
   error:error.message
  });
 }
};

export const savePlotStructureStoryPlanning=async(req,res)=>{
 try{
  const {business_id,user_id,book_id}=req.body;

  if(!business_id||!user_id||!book_id){
   return res.status(400).json({
    success:false,
    message:"business_id, user_id, and book_id are required"
   });
  }

  const plotStructureStoryPlanning=await PlotStructureStoryPlanning.findOneAndUpdate(
   {business_id,user_id,book_id},
   {
    ...req.body,
    updatedBy:req.body.updatedBy||user_id||null
   },
   {
    returnDocument:"after",
    upsert:true,
    runValidators:true,
    setDefaultsOnInsert:true
   }
  );

  res.status(200).json({
   success:true,
   message:"Plot structure story planning saved",
   data:plotStructureStoryPlanning
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to save plot structure story planning",
   error:error.message
  });
 }
};

export const updatePlotStructureStoryPlanning=async(req,res)=>{
 try{
  const plotStructureStoryPlanning=await PlotStructureStoryPlanning.findByIdAndUpdate(
   req.params.id,
   {
    ...req.body,
    updatedBy:req.body.updatedBy||req.body.user_id||null
   },
   {returnDocument:"after",runValidators:true}
  );

  if(!plotStructureStoryPlanning){
   return res.status(404).json({
    success:false,
    message:"Plot structure story planning not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"Plot structure story planning updated",
   data:plotStructureStoryPlanning
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to update plot structure story planning",
   error:error.message
  });
 }
};

export const archivePlotStructureStoryPlanning=async(req,res)=>{
 try{
  const plotStructureStoryPlanning=await PlotStructureStoryPlanning.findByIdAndUpdate(
   req.params.id,
   {
    isActive:false,
    updatedBy:req.body.updatedBy||req.body.user_id||null
   },
   {returnDocument:"after"}
  );

  if(!plotStructureStoryPlanning){
   return res.status(404).json({
    success:false,
    message:"Plot structure story planning not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"Plot structure story planning archived",
   data:plotStructureStoryPlanning
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to archive plot structure story planning",
   error:error.message
  });
 }
};
