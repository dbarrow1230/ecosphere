//backend/controllers/consulting/serviceController.js
import mongoose from "mongoose";
import Service from "../../models/consulting/serviceModel.js";

export const createService=async(req,res)=>{
 try{
  const{
   name,
   slug,
   category,
   description,
   scope,
   deliverables,
   pricingType,
   baseRate,
   estimatedHours,
   estimatedDays,
   sortOrder,
   notes,
   isActive
  }=req.body;

  if(!name){
   return res.status(400).json({message:"Service name is required"});
  }

  const service=new Service({
   name,
   slug,
   category,
   description,
   scope:Array.isArray(scope)?scope:[],
   deliverables:Array.isArray(deliverables)?deliverables:[],
   pricingType,
   baseRate,
   estimatedHours,
   estimatedDays,
   sortOrder,
   notes,
   isActive:typeof isActive==="boolean"?isActive:true,
   createdBy:req.user?req.user._id:null,
   updatedBy:req.user?req.user._id:null
  });

  const saved=await service.save();

  const populated=await Service.findById(saved._id)
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  return res.status(201).json(populated);
 }catch(error){
  return res.status(500).json({message:"Error creating service",error:error.message});
 }
};

export const getServices=async(req,res)=>{
 try{
  const{category,isActive,search}=req.query;

  const filter={};

  if(category){
   filter.category=category;
  }
  if(typeof isActive!=="undefined"){
   filter.isActive=isActive==="true";
  }
  if(search){
   filter.$or=[
    {name:{$regex:search,$options:"i"}},
    {slug:{$regex:search,$options:"i"}},
    {description:{$regex:search,$options:"i"}},
    {notes:{$regex:search,$options:"i"}}
   ];
  }

  const services=await Service.find(filter)
   .populate("createdBy","name email")
   .populate("updatedBy","name email")
   .sort({sortOrder:1,createdAt:-1});

  return res.status(200).json(services);
 }catch(error){
  return res.status(500).json({message:"Error fetching services",error:error.message});
 }
};

export const getServiceById=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid service id"});
  }

  const service=await Service.findById(id)
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  if(!service){
   return res.status(404).json({message:"Service not found"});
  }

  return res.status(200).json(service);
 }catch(error){
  return res.status(500).json({message:"Error fetching service",error:error.message});
 }
};

export const updateService=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid service id"});
  }

  const{
   name,
   slug,
   category,
   description,
   scope,
   deliverables,
   pricingType,
   baseRate,
   estimatedHours,
   estimatedDays,
   sortOrder,
   notes,
   isActive
  }=req.body;

  const updateData={};

  if(typeof name!=="undefined")updateData.name=name;
  if(typeof slug!=="undefined")updateData.slug=slug;
  if(typeof category!=="undefined")updateData.category=category;
  if(typeof description!=="undefined")updateData.description=description;
  if(typeof scope!=="undefined")updateData.scope=Array.isArray(scope)?scope:[];
  if(typeof deliverables!=="undefined")updateData.deliverables=Array.isArray(deliverables)?deliverables:[];
  if(typeof pricingType!=="undefined")updateData.pricingType=pricingType;
  if(typeof baseRate!=="undefined")updateData.baseRate=baseRate;
  if(typeof estimatedHours!=="undefined")updateData.estimatedHours=estimatedHours;
  if(typeof estimatedDays!=="undefined")updateData.estimatedDays=estimatedDays;
  if(typeof sortOrder!=="undefined")updateData.sortOrder=sortOrder;
  if(typeof notes!=="undefined")updateData.notes=notes;
  if(typeof isActive!=="undefined")updateData.isActive=isActive;

  updateData.updatedBy=req.user?req.user._id:null;

  const updated=await Service.findByIdAndUpdate(
   id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  if(!updated){
   return res.status(404).json({message:"Service not found"});
  }

  return res.status(200).json(updated);
 }catch(error){
  return res.status(500).json({message:"Error updating service",error:error.message});
 }
};

export const deleteService=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid service id"});
  }

  const deleted=await Service.findByIdAndDelete(id);

  if(!deleted){
   return res.status(404).json({message:"Service not found"});
  }

  return res.status(200).json({message:"Service deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Error deleting service",error:error.message});
 }
};

export const toggleServiceStatus=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid service id"});
  }

  const service=await Service.findById(id);

  if(!service){
   return res.status(404).json({message:"Service not found"});
  }

  service.isActive=!service.isActive;
  service.updatedBy=req.user?req.user._id:null;

  await service.save();

  const populated=await Service.findById(service._id)
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  return res.status(200).json(populated);
 }catch(error){
  return res.status(500).json({message:"Error updating service status",error:error.message});
 }
};