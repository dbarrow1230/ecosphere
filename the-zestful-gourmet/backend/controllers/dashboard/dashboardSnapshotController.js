//backend/controllers/dashboard/dashboardSnapshotController.js
import mongoose from "mongoose";
import DashboardSnapshot from "../../models/dashboard/dashboardSnapshotModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

export const createDashboardSnapshot=async(req,res)=>{
 try{
  const item=await DashboardSnapshot.create(req.body);
  return res.status(201).json({success:true,message:"Dashboard snapshot created successfully",data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to create dashboard snapshot",error:error.message});
 }
};

export const getDashboardSnapshots=async(req,res)=>{
 try{
  const {business_id,roleScope,selectedPeriod,page=1,limit=20,sortBy="generatedAt",sortOrder="desc"}=req.query;
  const query={};

  if(business_id){
   if(!isValidObjectId(business_id)) return res.status(400).json({success:false,message:"Invalid business_id"});
   query.business_id=business_id;
  }
  if(roleScope) query.roleScope=roleScope;
  if(selectedPeriod) query.selectedPeriod=selectedPeriod;

  const pageNum=Math.max(parseInt(page,10)||1,1);
  const limitNum=Math.max(parseInt(limit,10)||20,1);
  const skip=(pageNum-1)*limitNum;
  const sort={ [sortBy]:sortOrder==="asc"?1:-1 };

  const [items,total]=await Promise.all([
   DashboardSnapshot.find(query)
    .populate("business_id")
    .populate("locationRefs")
    .sort(sort)
    .skip(skip)
    .limit(limitNum),
   DashboardSnapshot.countDocuments(query)
  ]);

  return res.status(200).json({success:true,count:items.length,total,page:pageNum,pages:Math.ceil(total/limitNum),data:items});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch dashboard snapshots",error:error.message});
 }
};

export const getDashboardSnapshotById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid dashboard snapshot id"});

  const item=await DashboardSnapshot.findById(id)
   .populate("business_id")
   .populate("locationRefs");

  if(!item) return res.status(404).json({success:false,message:"Dashboard snapshot not found"});

  return res.status(200).json({success:true,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch dashboard snapshot",error:error.message});
 }
};

export const deleteDashboardSnapshot=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid dashboard snapshot id"});

  const item=await DashboardSnapshot.findByIdAndDelete(id);
  if(!item) return res.status(404).json({success:false,message:"Dashboard snapshot not found"});

  return res.status(200).json({success:true,message:"Dashboard snapshot deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete dashboard snapshot",error:error.message});
 }
};