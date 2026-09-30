import Resource from "../../models/resources/resourceModel.js";
import MenteeResource from "../../models/resources/menteeResourceModel.js";
import State from "../../models/locations/stateModel.js";
import Country from "../../models/locations/countryModel.js";

const resourcePopulate=[
 {path:"category",select:"name slug"},
 {path:"links.category",select:"name slug"},
 {path:"links.state",model:State,select:"name abbreviation"},
 {path:"links.country",model:Country,select:"name"},
 {path:"createdBy",select:"firstName lastName email"}
];

const assignmentPopulate=[
 {path:"mentee",select:"firstName lastName email businessName status"},
 {path:"resource",populate:resourcePopulate},
 {path:"createdBy",select:"firstName lastName email"}
];

export const createResource=async(req,res)=>{
 try{
  const resource=await Resource.create({...req.body,createdBy:req.user?._id||req.body.createdBy});
  res.status(201).json(await Resource.findById(resource._id).populate(resourcePopulate));
 }catch(error){
  res.status(400).json({message:error.message});
 }
};

export const getResources=async(req,res)=>{
 try{
  res.status(200).json(await Resource.find().populate(resourcePopulate).sort({title:1}));
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const getResourcesByMentee=async(req,res)=>{
 try{
  res.status(200).json(await MenteeResource.find({mentee:req.params.menteeId}).populate(assignmentPopulate).sort({givenDate:-1}));
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const getGivenResources=async(req,res)=>{
 try{
  res.status(200).json(await MenteeResource.find().populate(assignmentPopulate).sort({givenDate:-1}));
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const giveResource=async(req,res)=>{
 try{
  const resource=await Resource.findById(req.body.resource);
  if(!resource)return res.status(404).json({message:"Catalog resource not found"});
  if(!req.body.resourceLink)return res.status(400).json({message:"Choose a file or link from the catalog"});
  if(!resource.links.id(req.body.resourceLink))return res.status(400).json({message:"The selected file or link is not part of this catalog resource"});
  const record=await MenteeResource.create({...req.body,givenDate:req.body.givenDate||new Date(),createdBy:req.user?._id||req.body.createdBy});
  res.status(201).json(await MenteeResource.findById(record._id).populate(assignmentPopulate));
 }catch(error){
  res.status(400).json({message:error.code===11000?"This resource is already recorded for this mentee.":error.message});
 }
};

export const updateGivenResource=async(req,res)=>{
 try{
  const record=await MenteeResource.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true}).populate(assignmentPopulate);
  if(!record)return res.status(404).json({message:"Mentee resource record not found"});
  res.status(200).json(record);
 }catch(error){
  res.status(400).json({message:error.message});
 }
};

export const deleteGivenResource=async(req,res)=>{
 try{
  const record=await MenteeResource.findByIdAndDelete(req.params.id);
  if(!record)return res.status(404).json({message:"Mentee resource record not found"});
  res.status(200).json({message:"Resource removed from mentee history"});
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const getResourceById=async(req,res)=>{
 try{
  const resource=await Resource.findById(req.params.id).populate(resourcePopulate);
  if(!resource)return res.status(404).json({message:"Resource not found"});
  res.status(200).json(resource);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const updateResource=async(req,res)=>{
 try{
  const resource=await Resource.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true}).populate(resourcePopulate);
  if(!resource)return res.status(404).json({message:"Resource not found"});
  res.status(200).json(resource);
 }catch(error){
  res.status(400).json({message:error.message});
 }
};

export const deleteResource=async(req,res)=>{
 try{
  if(await MenteeResource.exists({resource:req.params.id})){
   return res.status(409).json({message:"Archive this resource instead. It is part of a mentee's resource history."});
  }
  const resource=await Resource.findByIdAndDelete(req.params.id);
  if(!resource)return res.status(404).json({message:"Resource not found"});
  res.status(200).json({message:"Resource deleted"});
 }catch(error){
  res.status(500).json({message:error.message});
 }
};
