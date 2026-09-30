//backend/controllers/dashboard/dashboardSnapshotController.js
import DashboardSnapshot from "../../models/dashboard/dashboardSnapshotModel.js";

export const createDashboardSnapshot=async(req,res)=>{
 try{
  const payload={...req.body};
  if(req.user?._id) payload.user=req.user._id;

  const snapshot=await DashboardSnapshot.create(payload);
  return res.status(201).json(snapshot);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getDashboardSnapshots=async(req,res)=>{
 try{
  const query={};
  if(req.user?._id) query.user=req.user._id;

  const snapshots=await DashboardSnapshot.find(query).sort({snapshotDate:-1});
  return res.status(200).json(snapshots);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getDashboardSnapshotById=async(req,res)=>{
 try{
  const query={_id:req.params.id};
  if(req.user?._id) query.user=req.user._id;

  const snapshot=await DashboardSnapshot.findOne(query);

  if(!snapshot){
   return res.status(404).json({message:"Dashboard snapshot not found"});
  }

  return res.status(200).json(snapshot);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const deleteDashboardSnapshot=async(req,res)=>{
 try{
  const query={_id:req.params.id};
  if(req.user?._id) query.user=req.user._id;

  const snapshot=await DashboardSnapshot.findOne(query);

  if(!snapshot){
   return res.status(404).json({message:"Dashboard snapshot not found"});
  }

  await snapshot.deleteOne();

  return res.status(200).json({message:"Dashboard snapshot deleted"});
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};