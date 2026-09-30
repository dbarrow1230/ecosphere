//backend/controllers/core/clientBusinessController.js
import ClientBusiness from "../../models/core/clientBusinessModel.js";

const normalizeArray=(value)=>{
 if(Array.isArray(value)) return value.filter((item)=>item!==undefined&&item!==null&&String(item).trim()!=="").map((item)=>String(item).trim());
 if(value===undefined||value===null||value==="") return [];
 return [String(value).trim()];
};

const normalizeContacts=(value)=>{
 if(!Array.isArray(value)) return [];
 return value.map((item)=>({
  firstName:item?.firstName??"",
  lastName:item?.lastName??"",
  role:item?.role??"",
  email:item?.email??"",
  phone:item?.phone??"",
  isPrimary:item?.isPrimary??false
 }));
};

const normalizeAddresses=(value)=>{
 if(!Array.isArray(value)) return [];
 return value.map((item)=>({
  label:item?.label??"",
  line1:item?.line1??"",
  line2:item?.line2??"",
  city:item?.city??"",
  state:item?.state??null,
  country:item?.country??null,
  postalCode:item?.postalCode??""
 }));
};

const buildPayload=(body,userId)=>{
 const payload={};

 if(body.name!==undefined) payload.name=body.name;
 if(body.displayName!==undefined) payload.displayName=body.displayName;
 if(body.legalName!==undefined) payload.legalName=body.legalName;

 if(body.primaryContact!==undefined){
  payload.primaryContact={
   firstName:body.primaryContact?.firstName??"",
   lastName:body.primaryContact?.lastName??"",
   email:body.primaryContact?.email??"",
   phone:body.primaryContact?.phone??""
  };
 }

 if(body.contacts!==undefined) payload.contacts=normalizeContacts(body.contacts);
 if(body.addresses!==undefined) payload.addresses=normalizeAddresses(body.addresses);

 if(body.communication!==undefined){
  payload.communication={
   preferredMethod:body.communication?.preferredMethod??"email",
   notes:body.communication?.notes??""
  };
 }

 if(body.status!==undefined) payload.status=body.status;
 if(body.stage!==undefined) payload.stage=body.stage;
 if(body.tags!==undefined) payload.tags=normalizeArray(body.tags);
 if(body.notes!==undefined) payload.notes=body.notes;
 if(body.isActive!==undefined) payload.isActive=body.isActive;
 if(userId) payload.updatedBy=userId;

 return payload;
};

export const createClientBusiness=async(req,res)=>{
 try{
  if(!req.body.name){
   return res.status(400).json({message:"name is required"});
  }

  const payload=buildPayload(req.body,req.user?._id);
  if(req.user?._id) payload.createdBy=req.user._id;

  const clientBusiness=await ClientBusiness.create(payload);

  const populatedClientBusiness=await ClientBusiness.findById(clientBusiness._id)
  .populate("addresses.state")
  .populate("addresses.country")
  .populate("createdBy","firstName lastName email")
  .populate("updatedBy","firstName lastName email");

  return res.status(201).json(populatedClientBusiness);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getClientBusinesses=async(req,res)=>{
 try{
  const query={};

  if(req.query.status) query.status=req.query.status;
  if(req.query.stage) query.stage=req.query.stage;
  if(req.query.isActive!==undefined) query.isActive=req.query.isActive==="true";
  if(req.query.name) query.name={$regex:req.query.name,$options:"i"};
  if(req.query.tag) query.tags={$in:[req.query.tag]};

  const clientBusinesses=await ClientBusiness.find(query)
  .populate("addresses.state")
  .populate("addresses.country")
  .populate("createdBy","firstName lastName email")
  .populate("updatedBy","firstName lastName email")
  .sort({createdAt:-1});

  return res.status(200).json(clientBusinesses);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getClientBusinessById=async(req,res)=>{
 try{
  const clientBusiness=await ClientBusiness.findById(req.params.id)
  .populate("addresses.state")
  .populate("addresses.country")
  .populate("createdBy","firstName lastName email")
  .populate("updatedBy","firstName lastName email");

  if(!clientBusiness){
   return res.status(404).json({message:"Client business not found"});
  }

  return res.status(200).json(clientBusiness);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const updateClientBusiness=async(req,res)=>{
 try{
  const clientBusiness=await ClientBusiness.findById(req.params.id);

  if(!clientBusiness){
   return res.status(404).json({message:"Client business not found"});
  }

  const payload=buildPayload(req.body,req.user?._id);

  const updatedClientBusiness=await ClientBusiness.findByIdAndUpdate(
   req.params.id,
   {$set:payload},
   {returnDocument:"after",runValidators:true}
  )
  .populate("addresses.state")
  .populate("addresses.country")
  .populate("createdBy","firstName lastName email")
  .populate("updatedBy","firstName lastName email");

  return res.status(200).json(updatedClientBusiness);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const deleteClientBusiness=async(req,res)=>{
 try{
  const clientBusiness=await ClientBusiness.findById(req.params.id);

  if(!clientBusiness){
   return res.status(404).json({message:"Client business not found"});
  }

  await clientBusiness.deleteOne();

  return res.status(200).json({message:"Client business removed"});
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const deactivateClientBusiness=async(req,res)=>{
 try{
  const clientBusiness=await ClientBusiness.findById(req.params.id);

  if(!clientBusiness){
   return res.status(404).json({message:"Client business not found"});
  }

  clientBusiness.isActive=false;
  if(req.user?._id) clientBusiness.updatedBy=req.user._id;

  const updatedClientBusiness=await clientBusiness.save();

  return res.status(200).json(updatedClientBusiness);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};