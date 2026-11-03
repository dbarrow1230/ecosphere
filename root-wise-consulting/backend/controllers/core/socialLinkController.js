//backend/controllers/core/socialLinkController.js
import SocialLink from "../../models/core/socialLinkModel.js";

const buildPayload=(body,userId)=>{
 const payload={};

 if(body.clientBusiness!==undefined) payload.clientBusiness=body.clientBusiness;
 if(body.platform!==undefined) payload.platform=body.platform;

 if(body.label!==undefined) payload.label=body.label;
 if(body.url!==undefined) payload.url=body.url;

 if(body.isPrimary!==undefined) payload.isPrimary=body.isPrimary;
 if(body.sortOrder!==undefined) payload.sortOrder=body.sortOrder;

 if(body.notes!==undefined) payload.notes=body.notes;

 if(body.isActive!==undefined) payload.isActive=body.isActive;
 if(userId) payload.updatedBy=userId;

 return payload;
};

export const createSocialLink=async(req,res)=>{
 try{
  if(!req.body.clientBusiness||!req.body.platform||!req.body.url){
   return res.status(400).json({message:"clientBusiness, platform, and url are required"});
  }

  const payload=buildPayload(req.body,req.user?._id);
  if(req.user?._id) payload.createdBy=req.user._id;

  if(payload.isPrimary){
   await SocialLink.updateMany(
    {clientBusiness:payload.clientBusiness,platform:payload.platform,isPrimary:true},
    {$set:{isPrimary:false}}
   );
  }

  const socialLink=await SocialLink.create(payload);

  return res.status(201).json(socialLink);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getSocialLinks=async(req,res)=>{
 try{
  const query={};

  if(req.query.clientBusiness) query.clientBusiness=req.query.clientBusiness;
  if(req.query.platform) query.platform=req.query.platform;
  if(req.query.isActive!==undefined) query.isActive=req.query.isActive==="true";

  const socialLinks=await SocialLink.find(query)
  .populate("clientBusiness")
  .populate("createdBy","firstName lastName email")
  .populate("updatedBy","firstName lastName email")
  .sort({sortOrder:1,createdAt:-1});

  return res.status(200).json(socialLinks);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getSocialLinkById=async(req,res)=>{
 try{
  const socialLink=await SocialLink.findById(req.params.id)
  .populate("clientBusiness")
  .populate("createdBy","firstName lastName email")
  .populate("updatedBy","firstName lastName email");

  if(!socialLink){
   return res.status(404).json({message:"Social link not found"});
  }

  return res.status(200).json(socialLink);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const updateSocialLink=async(req,res)=>{
 try{
  const socialLink=await SocialLink.findById(req.params.id);

  if(!socialLink){
   return res.status(404).json({message:"Social link not found"});
  }

  const payload=buildPayload(req.body,req.user?._id);

  if(payload.isPrimary){
   await SocialLink.updateMany(
    {clientBusiness:socialLink.clientBusiness,platform:socialLink.platform,isPrimary:true,_id:{$ne:req.params.id}},
    {$set:{isPrimary:false}}
   );
  }

  const updatedSocialLink=await SocialLink.findByIdAndUpdate(
   req.params.id,
   {$set:payload},
   {returnDocument:"after",runValidators:true}
  )
  .populate("clientBusiness")
  .populate("createdBy","firstName lastName email")
  .populate("updatedBy","firstName lastName email");

  return res.status(200).json(updatedSocialLink);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const deleteSocialLink=async(req,res)=>{
 try{
  const socialLink=await SocialLink.findById(req.params.id);

  if(!socialLink){
   return res.status(404).json({message:"Social link not found"});
  }

  await socialLink.deleteOne();

  return res.status(200).json({message:"Social link removed"});
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const deactivateSocialLink=async(req,res)=>{
 try{
  const socialLink=await SocialLink.findById(req.params.id);

  if(!socialLink){
   return res.status(404).json({message:"Social link not found"});
  }

  socialLink.isActive=false;
  if(req.user?._id) socialLink.updatedBy=req.user._id;

  const updatedSocialLink=await socialLink.save();

  return res.status(200).json(updatedSocialLink);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};