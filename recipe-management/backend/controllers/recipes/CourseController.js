// backend/controllers/recipes/CourseController.js
import Course from "../../models/recipes/CourseModel.js";

const buildSlug=value=>value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-");

export const createCourse=async(req,res)=>{
 try{
  const{name,slug,description,isActive}=req.body;
  if(!name?.trim())return res.status(400).json({message:"Course name is required"});
  const trimmedName=name.trim();
  const finalSlug=(slug?.trim()?buildSlug(slug):buildSlug(trimmedName));
  const existingName=await Course.findOne({name:trimmedName});
  if(existingName)return res.status(409).json({message:"Course name already exists"});
  const existingSlug=await Course.findOne({slug:finalSlug});
  if(existingSlug)return res.status(409).json({message:"Course slug already exists"});
  const course=await Course.create({
   name:trimmedName,
   slug:finalSlug,
   description:description?.trim()||"",
   isActive:isActive!==undefined?isActive:true
  });
  return res.status(201).json({message:"Course created successfully",course});
 }catch(error){
  return res.status(500).json({message:"Failed to create course",error:error.message});
 }
};

export const getCourses=async(req,res)=>{
 try{
  const courses=await Course.find().sort({name:1});
  return res.status(200).json(courses);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch courses",error:error.message});
 }
};

export const getCourseById=async(req,res)=>{
 try{
  const course=await Course.findById(req.params.id);
  if(!course)return res.status(404).json({message:"Course not found"});
  return res.status(200).json(course);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch course",error:error.message});
 }
};

export const updateCourse=async(req,res)=>{
 try{
  const{name,slug,description,isActive}=req.body;
  const course=await Course.findById(req.params.id);
  if(!course)return res.status(404).json({message:"Course not found"});
  if(name!==undefined){
   if(!name?.trim())return res.status(400).json({message:"Course name is required"});
   const trimmedName=name.trim();
   const existingName=await Course.findOne({_id:{$ne:req.params.id},name:trimmedName});
   if(existingName)return res.status(409).json({message:"Course name already exists"});
   course.name=trimmedName;
  }
  const nextSlug=slug!==undefined?(slug?.trim()?buildSlug(slug):buildSlug(course.name)):course.slug;
  if(nextSlug){
   const existingSlug=await Course.findOne({_id:{$ne:req.params.id},slug:nextSlug});
   if(existingSlug)return res.status(409).json({message:"Course slug already exists"});
   course.slug=nextSlug;
  }
  if(description!==undefined)course.description=description?.trim()||"";
  if(isActive!==undefined)course.isActive=isActive;
  await course.save();
  return res.status(200).json({message:"Course updated successfully",course});
 }catch(error){
  return res.status(500).json({message:"Failed to update course",error:error.message});
 }
};

export const deleteCourse=async(req,res)=>{
 try{
  const course=await Course.findByIdAndDelete(req.params.id);
  if(!course)return res.status(404).json({message:"Course not found"});
  return res.status(200).json({message:"Course deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete course",error:error.message});
 }
};