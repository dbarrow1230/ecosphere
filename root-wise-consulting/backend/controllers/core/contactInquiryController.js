//backend/controllers/core/contactInquiryController.js
import ContactInquiry from "../../models/core/contactInquiryModel.js";

const buildPayload=(body,userId)=>{
 const payload={};

 if(body.firstName!==undefined) payload.firstName=body.firstName;
 if(body.lastName!==undefined) payload.lastName=body.lastName;
 if(body.email!==undefined) payload.email=body.email;
 if(body.phone!==undefined) payload.phone=body.phone;

 if(body.businessName!==undefined) payload.businessName=body.businessName;
 if(body.subject!==undefined) payload.subject=body.subject;
 if(body.message!==undefined) payload.message=body.message;

 if(body.source!==undefined) payload.source=body.source;
 if(body.status!==undefined) payload.status=body.status;

 if(body.clientBusiness!==undefined) payload.clientBusiness=body.clientBusiness;
 if(body.notes!==undefined) payload.notes=body.notes;

 if(body.isActive!==undefined) payload.isActive=body.isActive;
 if(userId) payload.updatedBy=userId;

 return payload;
};

export const createContactInquiry=async(req,res)=>{
 try{
  if(!req.body.firstName||!req.body.email||!req.body.message){
   return res.status(400).json({message:"firstName, email, and message are required"});
  }

  const payload=buildPayload(req.body,req.user?._id);
  if(req.user?._id) payload.createdBy=req.user._id;

  const contactInquiry=await ContactInquiry.create(payload);

  return res.status(201).json(contactInquiry);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getContactInquiries=async(req,res)=>{
 try{
  const query={};

  if(req.query.status) query.status=req.query.status;
  if(req.query.source) query.source=req.query.source;
  if(req.query.isActive!==undefined) query.isActive=req.query.isActive==="true";
  if(req.query.email) query.email={$regex:req.query.email,$options:"i"};
  if(req.query.businessName) query.businessName={$regex:req.query.businessName,$options:"i"};

  const contactInquiries=await ContactInquiry.find(query)
  .populate("clientBusiness")
  .populate("createdBy","firstName lastName email")
  .populate("updatedBy","firstName lastName email")
  .sort({createdAt:-1});

  return res.status(200).json(contactInquiries);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getContactInquiryById=async(req,res)=>{
 try{
  const contactInquiry=await ContactInquiry.findById(req.params.id)
  .populate("clientBusiness")
  .populate("createdBy","firstName lastName email")
  .populate("updatedBy","firstName lastName email");

  if(!contactInquiry){
   return res.status(404).json({message:"Contact inquiry not found"});
  }

  return res.status(200).json(contactInquiry);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const updateContactInquiry=async(req,res)=>{
 try{
  const contactInquiry=await ContactInquiry.findById(req.params.id);

  if(!contactInquiry){
   return res.status(404).json({message:"Contact inquiry not found"});
  }

  const payload=buildPayload(req.body,req.user?._id);

  const updatedContactInquiry=await ContactInquiry.findByIdAndUpdate(
   req.params.id,
   {$set:payload},
   {returnDocument:"after",runValidators:true}
  )
  .populate("clientBusiness")
  .populate("createdBy","firstName lastName email")
  .populate("updatedBy","firstName lastName email");

  return res.status(200).json(updatedContactInquiry);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const deleteContactInquiry=async(req,res)=>{
 try{
  const contactInquiry=await ContactInquiry.findById(req.params.id);

  if(!contactInquiry){
   return res.status(404).json({message:"Contact inquiry not found"});
  }

  await contactInquiry.deleteOne();

  return res.status(200).json({message:"Contact inquiry removed"});
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const deactivateContactInquiry=async(req,res)=>{
 try{
  const contactInquiry=await ContactInquiry.findById(req.params.id);

  if(!contactInquiry){
   return res.status(404).json({message:"Contact inquiry not found"});
  }

  contactInquiry.isActive=false;
  if(req.user?._id) contactInquiry.updatedBy=req.user._id;

  const updatedContactInquiry=await contactInquiry.save();

  return res.status(200).json(updatedContactInquiry);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};