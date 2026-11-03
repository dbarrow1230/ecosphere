//backend/controllers/core/businessProfileController.js
import BusinessProfile from "../../models/core/businessProfileModel.js";

const normalizeArray=(value)=>{
 if(Array.isArray(value)) return value.filter((item)=>item!==undefined&&item!==null&&String(item).trim()!=="").map((item)=>String(item).trim());
 if(value===undefined||value===null||value==="") return [];
 return [String(value).trim()];
};

const buildPayload=(body,userId)=>{
 const payload={};

 if(body.clientBusiness!==undefined) payload.clientBusiness=body.clientBusiness;
 if(body.concept!==undefined) payload.concept=body.concept;
 if(body.serviceStyle!==undefined) payload.serviceStyle=body.serviceStyle;
 if(body.cuisineFocus!==undefined) payload.cuisineFocus=body.cuisineFocus;
 if(body.businessType!==undefined) payload.businessType=body.businessType;
 if(body.openingStage!==undefined) payload.openingStage=body.openingStage;

 if(body.serviceModel!==undefined) payload.serviceModel=normalizeArray(body.serviceModel);
 if(body.mealPeriods!==undefined) payload.mealPeriods=normalizeArray(body.mealPeriods);
 if(body.goals!==undefined) payload.goals=normalizeArray(body.goals);
 if(body.currentChallenges!==undefined) payload.currentChallenges=normalizeArray(body.currentChallenges);

 if(body.seatingCapacity!==undefined) payload.seatingCapacity=body.seatingCapacity;
 if(body.averageTicket!==undefined) payload.averageTicket=body.averageTicket;
 if(body.menuCount!==undefined) payload.menuCount=body.menuCount;

 if(body.hasBar!==undefined) payload.hasBar=body.hasBar;
 if(body.hasCatering!==undefined) payload.hasCatering=body.hasCatering;
 if(body.hasTakeout!==undefined) payload.hasTakeout=body.hasTakeout;
 if(body.hasDelivery!==undefined) payload.hasDelivery=body.hasDelivery;
 if(body.hasPrivateDining!==undefined) payload.hasPrivateDining=body.hasPrivateDining;

 if(body.kitchenSetup!==undefined){
  payload.kitchenSetup={
   summary:body.kitchenSetup?.summary??"",
   strengths:body.kitchenSetup?.strengths??"",
   constraints:body.kitchenSetup?.constraints??""
  };
 }

 if(body.staffing!==undefined){
  payload.staffing={
   fohCount:body.staffing?.fohCount??0,
   bohCount:body.staffing?.bohCount??0,
   leadershipNotes:body.staffing?.leadershipNotes??""
  };
 }

 if(body.operations!==undefined){
  payload.operations={
   prepStyle:body.operations?.prepStyle??"",
   serviceFlow:body.operations?.serviceFlow??"",
   orderingStyle:body.operations?.orderingStyle??"",
   costingProcess:body.operations?.costingProcess??""
  };
 }

 if(body.notes!==undefined) payload.notes=body.notes;
 if(body.isActive!==undefined) payload.isActive=body.isActive;
 if(userId) payload.updatedBy=userId;

 return payload;
};

export const createBusinessProfile=async(req,res)=>{
 try{
  const {clientBusiness}=req.body;

  if(!clientBusiness){
   return res.status(400).json({message:"clientBusiness is required"});
  }

  const existingProfile=await BusinessProfile.findOne({clientBusiness});
  if(existingProfile){
   return res.status(400).json({message:"Business profile already exists for this clientBusiness"});
  }

  const payload=buildPayload(req.body,req.user?._id);
  if(req.user?._id) payload.createdBy=req.user._id;

  const businessProfile=await BusinessProfile.create(payload);

  return res.status(201).json(businessProfile);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getBusinessProfiles=async(req,res)=>{
 try{
  const query={};

  if(req.query.clientBusiness) query.clientBusiness=req.query.clientBusiness;
  if(req.query.openingStage) query.openingStage=req.query.openingStage;
  if(req.query.businessType) query.businessType=req.query.businessType;
  if(req.query.isActive!==undefined) query.isActive=req.query.isActive==="true";

  const businessProfiles=await BusinessProfile.find(query)
  .populate("clientBusiness")
  .populate("createdBy","firstName lastName email")
  .populate("updatedBy","firstName lastName email")
  .sort({createdAt:-1});

  return res.status(200).json(businessProfiles);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getBusinessProfileById=async(req,res)=>{
 try{
  const businessProfile=await BusinessProfile.findById(req.params.id)
  .populate("clientBusiness")
  .populate("createdBy","firstName lastName email")
  .populate("updatedBy","firstName lastName email");

  if(!businessProfile){
   return res.status(404).json({message:"Business profile not found"});
  }

  return res.status(200).json(businessProfile);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getBusinessProfileByClientBusiness=async(req,res)=>{
 try{
  const businessProfile=await BusinessProfile.findOne({clientBusiness:req.params.clientBusinessId})
  .populate("clientBusiness")
  .populate("createdBy","firstName lastName email")
  .populate("updatedBy","firstName lastName email");

  if(!businessProfile){
   return res.status(404).json({message:"Business profile not found"});
  }

  return res.status(200).json(businessProfile);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const updateBusinessProfile=async(req,res)=>{
 try{
  const businessProfile=await BusinessProfile.findById(req.params.id);

  if(!businessProfile){
   return res.status(404).json({message:"Business profile not found"});
  }

  const payload=buildPayload(req.body,req.user?._id);

  const updatedBusinessProfile=await BusinessProfile.findByIdAndUpdate(
   req.params.id,
   {$set:payload},
   {returnDocument:"after",runValidators:true}
  )
  .populate("clientBusiness")
  .populate("createdBy","firstName lastName email")
  .populate("updatedBy","firstName lastName email");

  return res.status(200).json(updatedBusinessProfile);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const deleteBusinessProfile=async(req,res)=>{
 try{
  const businessProfile=await BusinessProfile.findById(req.params.id);

  if(!businessProfile){
   return res.status(404).json({message:"Business profile not found"});
  }

  await businessProfile.deleteOne();

  return res.status(200).json({message:"Business profile removed"});
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const deactivateBusinessProfile=async(req,res)=>{
 try{
  const businessProfile=await BusinessProfile.findById(req.params.id);

  if(!businessProfile){
   return res.status(404).json({message:"Business profile not found"});
  }

  businessProfile.isActive=false;
  if(req.user?._id) businessProfile.updatedBy=req.user._id;

  const updatedBusinessProfile=await businessProfile.save();

  return res.status(200).json(updatedBusinessProfile);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};