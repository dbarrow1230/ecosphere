import mongoose from "mongoose";
import CommunityResource from "../../models/reference/communityResourceModel.js";
import State from "../../models/locations/stateModel.js";
import Country from "../../models/locations/countryModel.js";
import County from "../../models/locations/countyModel.js";

export const createCommunityResource=async(req,res)=>{
 try{
  const {
   name,
   organization,
   category,
   subcategories,
   description,
   services,
   eligibility,
   requirements,
   intakeInstructions,
   address,
   contact,
   transportation,
   schedule,
   isWalkIn,
   appointmentRequired,
   idRequired,
   is24Hours,
   isFamilyFriendly,
   isWomenOnly,
   isMenOnly,
   youthOnly,
   notes,
   source,
   sourceDateLabel,
   isActive,
   createdBy
  }=req.body;

  const communityResource=new CommunityResource({
   name,
   organization,
   category:category||null,
   subcategories:Array.isArray(subcategories)?subcategories:[],
   description,
   services:Array.isArray(services)?services:[],
   eligibility,
   requirements,
   intakeInstructions,
   address:address||{},
   contact:contact||{},
   transportation:{
    trains:Array.isArray(transportation?.trains)?transportation.trains:[],
    buses:Array.isArray(transportation?.buses)?transportation.buses:[]
   },
   schedule:Array.isArray(schedule)?schedule:[],
   isWalkIn:isWalkIn!==undefined?isWalkIn:false,
   appointmentRequired:appointmentRequired!==undefined?appointmentRequired:false,
   idRequired:idRequired!==undefined?idRequired:false,
   is24Hours:is24Hours!==undefined?is24Hours:false,
   isFamilyFriendly:isFamilyFriendly!==undefined?isFamilyFriendly:false,
   isWomenOnly:isWomenOnly!==undefined?isWomenOnly:false,
   isMenOnly:isMenOnly!==undefined?isMenOnly:false,
   youthOnly:youthOnly!==undefined?youthOnly:false,
   notes,
   source,
   sourceDateLabel,
   isActive:isActive!==undefined?isActive:true,
   createdBy:createdBy||null
  });

  const saved=await communityResource.save();
  const populated=await CommunityResource.findById(saved._id)
   .populate("category")
   .populate("subcategories")
   .populate({path:"address.state",model:State})
   .populate({path:"address.country",model:Country})
   .populate({path:"address.county",model:County})
   .populate("address.borough")
   .populate("createdBy");

  return res.status(201).json(populated);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getCommunityResources=async(req,res)=>{
 try{
  const query={};

  if(req.query.category)query.category=req.query.category;
  if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";
  if(req.query.isWalkIn!==undefined)query.isWalkIn=req.query.isWalkIn==="true";
  if(req.query.appointmentRequired!==undefined)query.appointmentRequired=req.query.appointmentRequired==="true";
  if(req.query.idRequired!==undefined)query.idRequired=req.query.idRequired==="true";
  if(req.query.is24Hours!==undefined)query.is24Hours=req.query.is24Hours==="true";
  if(req.query.isFamilyFriendly!==undefined)query.isFamilyFriendly=req.query.isFamilyFriendly==="true";
  if(req.query.isWomenOnly!==undefined)query.isWomenOnly=req.query.isWomenOnly==="true";
  if(req.query.isMenOnly!==undefined)query.isMenOnly=req.query.isMenOnly==="true";
  if(req.query.youthOnly!==undefined)query.youthOnly=req.query.youthOnly==="true";
  if(req.query.organization)query.organization={$regex:req.query.organization,$options:"i"};
  if(req.query.state)query["address.state"]=req.query.state;
  if(req.query.country)query["address.country"]=req.query.country;
  if(req.query.county)query["address.county"]=req.query.county;
  if(req.query.borough)query["address.borough"]=req.query.borough;
  if(req.query.city)query["address.city"]={$regex:req.query.city,$options:"i"};
  if(req.query.postalCode)query["address.postalCode"]={$regex:req.query.postalCode,$options:"i"};
  if(req.query.service)query.services={$in:[req.query.service]};
  if(req.query.train)query["transportation.trains"]={$in:[req.query.train]};
  if(req.query.bus)query["transportation.buses"]={$in:[req.query.bus]};
  if(req.query.search){
   query.$or=[
    {name:{$regex:req.query.search,$options:"i"}},
    {organization:{$regex:req.query.search,$options:"i"}},
    {description:{$regex:req.query.search,$options:"i"}},
    {services:{$elemMatch:{$regex:req.query.search,$options:"i"}}},
    {"address.address1":{$regex:req.query.search,$options:"i"}},
    {"address.address2":{$regex:req.query.search,$options:"i"}},
    {"address.city":{$regex:req.query.search,$options:"i"}},
    {"address.postalCode":{$regex:req.query.search,$options:"i"}},
    {"address.crossStreets":{$regex:req.query.search,$options:"i"}},
    {"address.fullText":{$regex:req.query.search,$options:"i"}},
    {"transportation.trains":{$elemMatch:{$regex:req.query.search,$options:"i"}}},
    {"transportation.buses":{$elemMatch:{$regex:req.query.search,$options:"i"}}},
    {notes:{$regex:req.query.search,$options:"i"}}
   ];
  }

  const communityResources=await CommunityResource.find(query)
   .populate("category")
   .populate("subcategories")
   .populate({path:"address.state",model:State})
   .populate({path:"address.country",model:Country})
   .populate({path:"address.county",model:County})
   .populate("address.borough")
   .populate("createdBy")
   .sort({name:1});

  return res.status(200).json(communityResources);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getCommunityResourceById=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid community resource id"});
  }

  const communityResource=await CommunityResource.findById(id)
   .populate("category")
   .populate("subcategories")
   .populate({path:"address.state",model:State})
   .populate({path:"address.country",model:Country})
   .populate({path:"address.county",model:County})
   .populate("address.borough")
   .populate("createdBy");

  if(!communityResource){
   return res.status(404).json({message:"Community resource not found"});
  }

  return res.status(200).json(communityResource);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const updateCommunityResource=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid community resource id"});
  }

  const communityResource=await CommunityResource.findById(id);
  if(!communityResource){
   return res.status(404).json({message:"Community resource not found"});
  }

  const {
   name,
   organization,
   category,
   subcategories,
   description,
   services,
   eligibility,
   requirements,
   intakeInstructions,
   address,
   contact,
   transportation,
   schedule,
   isWalkIn,
   appointmentRequired,
   idRequired,
   is24Hours,
   isFamilyFriendly,
   isWomenOnly,
   isMenOnly,
   youthOnly,
   notes,
   source,
   sourceDateLabel,
   isActive,
   createdBy
  }=req.body;

  if(name!==undefined)communityResource.name=name;
  if(organization!==undefined)communityResource.organization=organization;
  if(category!==undefined)communityResource.category=category||null;
  if(subcategories!==undefined)communityResource.subcategories=Array.isArray(subcategories)?subcategories:[];
  if(description!==undefined)communityResource.description=description;
  if(services!==undefined)communityResource.services=Array.isArray(services)?services:[];
  if(eligibility!==undefined)communityResource.eligibility=eligibility;
  if(requirements!==undefined)communityResource.requirements=requirements;
  if(intakeInstructions!==undefined)communityResource.intakeInstructions=intakeInstructions;
  if(address!==undefined)communityResource.address=address||{};
  if(contact!==undefined)communityResource.contact=contact||{};
  if(transportation!==undefined)communityResource.transportation={
   trains:Array.isArray(transportation?.trains)?transportation.trains:[],
   buses:Array.isArray(transportation?.buses)?transportation.buses:[]
  };
  if(schedule!==undefined)communityResource.schedule=Array.isArray(schedule)?schedule:[];
  if(isWalkIn!==undefined)communityResource.isWalkIn=isWalkIn;
  if(appointmentRequired!==undefined)communityResource.appointmentRequired=appointmentRequired;
  if(idRequired!==undefined)communityResource.idRequired=idRequired;
  if(is24Hours!==undefined)communityResource.is24Hours=is24Hours;
  if(isFamilyFriendly!==undefined)communityResource.isFamilyFriendly=isFamilyFriendly;
  if(isWomenOnly!==undefined)communityResource.isWomenOnly=isWomenOnly;
  if(isMenOnly!==undefined)communityResource.isMenOnly=isMenOnly;
  if(youthOnly!==undefined)communityResource.youthOnly=youthOnly;
  if(notes!==undefined)communityResource.notes=notes;
  if(source!==undefined)communityResource.source=source;
  if(sourceDateLabel!==undefined)communityResource.sourceDateLabel=sourceDateLabel;
  if(isActive!==undefined)communityResource.isActive=isActive;
  if(createdBy!==undefined)communityResource.createdBy=createdBy||null;

  const updated=await communityResource.save();
  const populated=await CommunityResource.findById(updated._id)
   .populate("category")
   .populate("subcategories")
   .populate({path:"address.state",model:State})
   .populate({path:"address.country",model:Country})
   .populate({path:"address.county",model:County})
   .populate("address.borough")
   .populate("createdBy");

  return res.status(200).json(populated);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const deleteCommunityResource=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid community resource id"});
  }

  const communityResource=await CommunityResource.findByIdAndDelete(id);
  if(!communityResource){
   return res.status(404).json({message:"Community resource not found"});
  }

  return res.status(200).json({message:"Community resource deleted successfully"});
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};