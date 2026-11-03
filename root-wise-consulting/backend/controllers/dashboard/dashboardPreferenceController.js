//backend/controllers/dashboard/dashboardPreferenceController.js
import DashboardPreference from "../../models/dashboard/DashboardPreferenceModel.js";

export const getDashboardPreference=async(req,res)=>{
 try{
  const pref=await DashboardPreference.findOne({user:req.user?._id});
  if(!pref) return res.status(404).json({message:"Dashboard preference not found"});
  return res.status(200).json(pref);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const upsertDashboardPreference=async(req,res)=>{
 try{
  const update={...req.body};
  if(req.user?._id) update.user=req.user._id;

  const pref=await DashboardPreference.findOneAndUpdate(
   {user:req.user?._id},
   {$set:update},
   {returnDocument:"after",upsert:true,runValidators:true}
  );

  return res.status(200).json(pref);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};