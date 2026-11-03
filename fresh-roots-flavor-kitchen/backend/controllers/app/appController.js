// backend/controllers/app/appController.js
import AppKey from "../../models/reference/appKeyModel.js";
import Business from "../../models/reference/businessModel.js";
import Footer from "../../models/reference/footerModel.js";
import Tagline from "../../models/reference/taglineModel.js";
import State from "../../models/locations/stateModel.js";
import Country from "../../models/locations/countryModel.js";

const populateBusiness=query=>query
 .populate({path:"taglineId",model:Tagline})
 .populate({path:"footerId",model:Footer})
 .populate({path:"stateRef",model:State})
 .populate({path:"countryRef",model:Country});

const escapeRegex=value=>String(value||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&");

export const getCurrentAppBusiness=async(req,res)=>{
 try{
  const appKey=String(req.params.appKey||"").trim().toLowerCase();
  if(!appKey)return res.status(400).json({message:"App key is required."});

  const row=await AppKey.findOne({appKey,isActive:true}).populate({path:"businessRef",populate:[{path:"taglineId",model:Tagline},{path:"footerId",model:Footer},{path:"stateRef",model:State},{path:"countryRef",model:Country}]});

  if(!row){
   const escapedAppKey=escapeRegex(appKey).replace(/[-\s]+/g,"\\s*");
   const fallbackBusiness=await populateBusiness(Business.findOne({
    $or:[
     {code:appKey},
     {code:appKey.replace(/-/g,"")},
     {legalName:{$regex:`^${escapedAppKey}$`,$options:"i"}}
    ],
    isActive:{$ne:false}
   }));

   return res.status(200).json({business:fallbackBusiness||null});
  }

  if(!row.businessRef)return res.status(200).json({business:null});

  return res.status(200).json({business:row.businessRef});
 }catch(err){
  return res.status(500).json({message:"Failed to load app business.",error:err.message});
 }
};

export const getAppKeys=async(req,res)=>{
 try{
  const rows=await AppKey.find().populate("businessRef").sort({name:1});
  return res.status(200).json(rows);
 }catch(err){
  return res.status(500).json({message:"Failed to load app keys.",error:err.message});
 }
};

export const createAppKey=async(req,res)=>{
 try{
  const payload={
   businessRef:req.body.businessRef,
   name:String(req.body.name||"").trim(),
   appKey:String(req.body.appKey||"").trim().toLowerCase(),
   isActive:req.body.isActive!==false
  };

  const row=await AppKey.create(payload);
  const saved=await AppKey.findById(row._id).populate("businessRef");

  return res.status(201).json(saved);
 }catch(err){
  return res.status(500).json({message:"Failed to create app key.",error:err.message});
 }
};

export const updateAppKey=async(req,res)=>{
 try{
  const row=await AppKey.findById(req.params.id);
  if(!row)return res.status(404).json({message:"App key not found."});

  row.businessRef=req.body.businessRef;
  row.name=String(req.body.name||"").trim();
  row.appKey=String(req.body.appKey||"").trim().toLowerCase();
  row.isActive=req.body.isActive!==false;

  await row.save();

  const saved=await AppKey.findById(row._id).populate("businessRef");

  return res.status(200).json(saved);
 }catch(err){
  return res.status(500).json({message:"Failed to update app key.",error:err.message});
 }
};

export const deleteAppKey=async(req,res)=>{
 try{
  const row=await AppKey.findByIdAndDelete(req.params.id);
  if(!row)return res.status(404).json({message:"App key not found."});

  return res.status(200).json({message:"App key deleted."});
 }catch(err){
  return res.status(500).json({message:"Failed to delete app key.",error:err.message});
 }
};
