//backend/controllers/consulting/menuReviewController.js
import mongoose from "mongoose";
import MenuReview from "../../models/consulting/menuReviewModel.js";

export const createMenuReview=async(req,res)=>{
 try{
  const{
   project,
   reviewTitle,
   menuName,
   menuVersion,
   reviewDate,
   menuType,
   summary,
   sections,
   items,
   pricingNotes,
   structureNotes,
   executionNotes,
   recommendations,
   notes,
   isActive
  }=req.body;

  if(!project||!mongoose.Types.ObjectId.isValid(project)){
   return res.status(400).json({message:"Valid project is required"});
  }

  const menuReview=new MenuReview({
   project,
   reviewTitle,
   menuName,
   menuVersion,
   reviewDate,
   menuType,
   summary,
   sections:Array.isArray(sections)?sections:[],
   items:Array.isArray(items)?items:[],
   pricingNotes,
   structureNotes,
   executionNotes,
   recommendations:Array.isArray(recommendations)?recommendations:[],
   notes,
   isActive:typeof isActive==="boolean"?isActive:true,
   createdBy:req.user?req.user._id:null,
   updatedBy:req.user?req.user._id:null
  });

  const saved=await menuReview.save();

  const populated=await MenuReview.findById(saved._id)
   .populate("project")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  return res.status(201).json(populated);
 }catch(error){
  return res.status(500).json({message:"Error creating menu review",error:error.message});
 }
};

export const getMenuReviews=async(req,res)=>{
 try{
  const{project,menuType,isActive,search}=req.query;

  const filter={};

  if(project&&mongoose.Types.ObjectId.isValid(project)){
   filter.project=project;
  }
  if(menuType){
   filter.menuType=menuType;
  }
  if(typeof isActive!=="undefined"){
   filter.isActive=isActive==="true";
  }
  if(search){
   filter.$or=[
    {reviewTitle:{$regex:search,$options:"i"}},
    {menuName:{$regex:search,$options:"i"}},
    {summary:{$regex:search,$options:"i"}},
    {notes:{$regex:search,$options:"i"}},
    {"items.itemName":{$regex:search,$options:"i"}},
    {"items.observation":{$regex:search,$options:"i"}},
    {"items.recommendation":{$regex:search,$options:"i"}}
   ];
  }

  const reviews=await MenuReview.find(filter)
   .populate("project")
   .populate("createdBy","name email")
   .populate("updatedBy","name email")
   .sort({reviewDate:-1,createdAt:-1});

  return res.status(200).json(reviews);
 }catch(error){
  return res.status(500).json({message:"Error fetching menu reviews",error:error.message});
 }
};

export const getMenuReviewById=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid menu review id"});
  }

  const review=await MenuReview.findById(id)
   .populate("project")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  if(!review){
   return res.status(404).json({message:"Menu review not found"});
  }

  return res.status(200).json(review);
 }catch(error){
  return res.status(500).json({message:"Error fetching menu review",error:error.message});
 }
};

export const updateMenuReview=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid menu review id"});
  }

  const{
   project,
   reviewTitle,
   menuName,
   menuVersion,
   reviewDate,
   menuType,
   summary,
   sections,
   items,
   pricingNotes,
   structureNotes,
   executionNotes,
   recommendations,
   notes,
   isActive
  }=req.body;

  if(project&& !mongoose.Types.ObjectId.isValid(project)){
   return res.status(400).json({message:"Valid project is required"});
  }

  const updateData={};

  if(typeof project!=="undefined")updateData.project=project;
  if(typeof reviewTitle!=="undefined")updateData.reviewTitle=reviewTitle;
  if(typeof menuName!=="undefined")updateData.menuName=menuName;
  if(typeof menuVersion!=="undefined")updateData.menuVersion=menuVersion;
  if(typeof reviewDate!=="undefined")updateData.reviewDate=reviewDate;
  if(typeof menuType!=="undefined")updateData.menuType=menuType;
  if(typeof summary!=="undefined")updateData.summary=summary;
  if(typeof sections!=="undefined")updateData.sections=Array.isArray(sections)?sections:[];
  if(typeof items!=="undefined")updateData.items=Array.isArray(items)?items:[];
  if(typeof pricingNotes!=="undefined")updateData.pricingNotes=pricingNotes;
  if(typeof structureNotes!=="undefined")updateData.structureNotes=structureNotes;
  if(typeof executionNotes!=="undefined")updateData.executionNotes=executionNotes;
  if(typeof recommendations!=="undefined")updateData.recommendations=Array.isArray(recommendations)?recommendations:[];
  if(typeof notes!=="undefined")updateData.notes=notes;
  if(typeof isActive!=="undefined")updateData.isActive=isActive;
  updateData.updatedBy=req.user?req.user._id:null;

  const updated=await MenuReview.findByIdAndUpdate(
   id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
   .populate("project")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  if(!updated){
   return res.status(404).json({message:"Menu review not found"});
  }

  return res.status(200).json(updated);
 }catch(error){
  return res.status(500).json({message:"Error updating menu review",error:error.message});
 }
};

export const deleteMenuReview=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid menu review id"});
  }

  const deleted=await MenuReview.findByIdAndDelete(id);

  if(!deleted){
   return res.status(404).json({message:"Menu review not found"});
  }

  return res.status(200).json({message:"Menu review deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Error deleting menu review",error:error.message});
 }
};

export const toggleMenuReviewStatus=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid menu review id"});
  }

  const review=await MenuReview.findById(id);

  if(!review){
   return res.status(404).json({message:"Menu review not found"});
  }

  review.isActive=!review.isActive;
  review.updatedBy=req.user?req.user._id:null;

  await review.save();

  const populated=await MenuReview.findById(review._id)
   .populate("project")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  return res.status(200).json(populated);
 }catch(error){
  return res.status(500).json({message:"Error updating menu review status",error:error.message});
 }
};