//backend/controllers/dashboard/dashboardStatController.js
import DashboardStat from "../../models/dashboard/DashboardStatModel.js";

export const createDashboardStat=async(req,res)=>{
 try{
  const payload={...req.body};
  if(req.user?._id) payload.user=req.user._id;

  const stat=await DashboardStat.create(payload);
  return res.status(201).json(stat);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getDashboardStats=async(req,res)=>{
 try{
  const query={};
  if(req.user?._id) query.user=req.user._id;
  if(req.query.key) query.key=req.query.key;
  if(req.query.period) query.period=req.query.period;

  const stats=await DashboardStat.find(query).sort({recordedAt:-1});
  return res.status(200).json(stats);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};