//backend/controllers/dashboard/dashboardWidgetController.js
import DashboardWidget from "../../models/dashboard/DashboardWidgetModel.js";

export const createDashboardWidget=async(req,res)=>{
 try{
  const payload={...req.body};
  if(req.user?._id) payload.user=req.user._id;

  const widget=await DashboardWidget.create(payload);
  return res.status(201).json(widget);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getDashboardWidgets=async(req,res)=>{
 try{
  const query={};
  if(req.user?._id) query.user=req.user._id;

  const widgets=await DashboardWidget.find(query).sort({"position.y":1,"position.x":1});
  return res.status(200).json(widgets);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const updateDashboardWidget=async(req,res)=>{
 try{
  const widget=await DashboardWidget.findByIdAndUpdate(
   req.params.id,
   {$set:req.body},
   {returnDocument:"after",runValidators:true}
  );
  if(!widget) return res.status(404).json({message:"Widget not found"});
  return res.status(200).json(widget);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const deleteDashboardWidget=async(req,res)=>{
 try{
  const widget=await DashboardWidget.findById(req.params.id);
  if(!widget) return res.status(404).json({message:"Widget not found"});
  await widget.deleteOne();
  return res.status(200).json({message:"Widget removed"});
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};