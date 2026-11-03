//backend/controllers/content/testimonialController.js
import mongoose from "mongoose";
import Testimonial from "../../models/content/testimonialModel.js";

export const createTestimonial=async(req,res)=>{
 try{
  const{
   title,
   name,
   role,
   company,
   quote,
   rating,
   project,
   clientBusiness,
   image,
   isFeatured,
   isPublished,
   isActive,
   notes
  }=req.body;

  if(!name){
   return res.status(400).json({message:"Name is required"});
  }

  if(!quote){
   return res.status(400).json({message:"Quote is required"});
  }

  if(project&& !mongoose.Types.ObjectId.isValid(project)){
   return res.status(400).json({message:"Valid project is required"});
  }

  if(clientBusiness&& !mongoose.Types.ObjectId.isValid(clientBusiness)){
   return res.status(400).json({message:"Valid clientBusiness is required"});
  }

  const testimonial=new Testimonial({
   title,
   name,
   role,
   company,
   quote,
   rating,
   project:project||null,
   clientBusiness:clientBusiness||null,
   image,
   isFeatured:typeof isFeatured==="boolean"?isFeatured:false,
   isPublished:typeof isPublished==="boolean"?isPublished:false,
   isActive:typeof isActive==="boolean"?isActive:true,
   notes,
   createdBy:req.user?req.user._id:null,
   updatedBy:req.user?req.user._id:null
  });

  const saved=await testimonial.save();

  const populated=await Testimonial.findById(saved._id)
   .populate("project")
   .populate("clientBusiness")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  return res.status(201).json(populated);
 }catch(error){
  return res.status(500).json({message:"Error creating testimonial",error:error.message});
 }
};

export const getTestimonials=async(req,res)=>{
 try{
  const{project,clientBusiness,isFeatured,isPublished,isActive,search}=req.query;

  const filter={};

  if(project&&mongoose.Types.ObjectId.isValid(project)){
   filter.project=project;
  }
  if(clientBusiness&&mongoose.Types.ObjectId.isValid(clientBusiness)){
   filter.clientBusiness=clientBusiness;
  }
  if(typeof isFeatured!=="undefined"){
   filter.isFeatured=isFeatured==="true";
  }
  if(typeof isPublished!=="undefined"){
   filter.isPublished=isPublished==="true";
  }
  if(typeof isActive!=="undefined"){
   filter.isActive=isActive==="true";
  }
  if(search){
   filter.$or=[
    {title:{$regex:search,$options:"i"}},
    {name:{$regex:search,$options:"i"}},
    {role:{$regex:search,$options:"i"}},
    {company:{$regex:search,$options:"i"}},
    {quote:{$regex:search,$options:"i"}},
    {notes:{$regex:search,$options:"i"}}
   ];
  }

  const testimonials=await Testimonial.find(filter)
   .populate("project")
   .populate("clientBusiness")
   .populate("createdBy","name email")
   .populate("updatedBy","name email")
   .sort({createdAt:-1});

  return res.status(200).json(testimonials);
 }catch(error){
  return res.status(500).json({message:"Error fetching testimonials",error:error.message});
 }
};

export const getTestimonialById=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid testimonial id"});
  }

  const testimonial=await Testimonial.findById(id)
   .populate("project")
   .populate("clientBusiness")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  if(!testimonial){
   return res.status(404).json({message:"Testimonial not found"});
  }

  return res.status(200).json(testimonial);
 }catch(error){
  return res.status(500).json({message:"Error fetching testimonial",error:error.message});
 }
};

export const updateTestimonial=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid testimonial id"});
  }

  const{
   title,
   name,
   role,
   company,
   quote,
   rating,
   project,
   clientBusiness,
   image,
   isFeatured,
   isPublished,
   isActive,
   notes
  }=req.body;

  if(typeof project!=="undefined"&&project!==null&&project!==""&&!mongoose.Types.ObjectId.isValid(project)){
   return res.status(400).json({message:"Valid project is required"});
  }

  if(typeof clientBusiness!=="undefined"&&clientBusiness!==null&&clientBusiness!==""&&!mongoose.Types.ObjectId.isValid(clientBusiness)){
   return res.status(400).json({message:"Valid clientBusiness is required"});
  }

  const updateData={};

  if(typeof title!=="undefined")updateData.title=title;
  if(typeof name!=="undefined")updateData.name=name;
  if(typeof role!=="undefined")updateData.role=role;
  if(typeof company!=="undefined")updateData.company=company;
  if(typeof quote!=="undefined")updateData.quote=quote;
  if(typeof rating!=="undefined")updateData.rating=rating;
  if(typeof project!=="undefined")updateData.project=project||null;
  if(typeof clientBusiness!=="undefined")updateData.clientBusiness=clientBusiness||null;
  if(typeof image!=="undefined")updateData.image=image;
  if(typeof isFeatured!=="undefined")updateData.isFeatured=isFeatured;
  if(typeof isPublished!=="undefined")updateData.isPublished=isPublished;
  if(typeof isActive!=="undefined")updateData.isActive=isActive;
  if(typeof notes!=="undefined")updateData.notes=notes;
  updateData.updatedBy=req.user?req.user._id:null;

  const updated=await Testimonial.findByIdAndUpdate(
   id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
   .populate("project")
   .populate("clientBusiness")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  if(!updated){
   return res.status(404).json({message:"Testimonial not found"});
  }

  return res.status(200).json(updated);
 }catch(error){
  return res.status(500).json({message:"Error updating testimonial",error:error.message});
 }
};

export const deleteTestimonial=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid testimonial id"});
  }

  const deleted=await Testimonial.findByIdAndDelete(id);

  if(!deleted){
   return res.status(404).json({message:"Testimonial not found"});
  }

  return res.status(200).json({message:"Testimonial deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Error deleting testimonial",error:error.message});
 }
};

export const toggleTestimonialStatus=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid testimonial id"});
  }

  const testimonial=await Testimonial.findById(id);

  if(!testimonial){
   return res.status(404).json({message:"Testimonial not found"});
  }

  testimonial.isActive=!testimonial.isActive;
  testimonial.updatedBy=req.user?req.user._id:null;

  await testimonial.save();

  const populated=await Testimonial.findById(testimonial._id)
   .populate("project")
   .populate("clientBusiness")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  return res.status(200).json(populated);
 }catch(error){
  return res.status(500).json({message:"Error updating testimonial status",error:error.message});
 }
};