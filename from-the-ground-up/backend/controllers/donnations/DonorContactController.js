// backend/controllers/donnations/DonorContactController.js
import DonorContact from "../../models/donnations/DonationModel.js";

export const createDonorContact=async(req,res)=>{
 try{
  const {name,email,phone,company,address1,address2,city,state,country,postalCode,mailingOptIn}=req.body;

  if(!name||!email){
   return res.status(400).json({message:"Name and email are required."});
  }

  const existingDonorContact=await DonorContact.findOne({email:email.trim().toLowerCase()});

  if(existingDonorContact){
   return res.status(409).json({message:"Donor contact already exists."});
  }

  const donorContact=await DonorContact.create({
   name:name.trim(),
   email:email.trim().toLowerCase(),
   phone,
   company,
   address1,
   address2,
   city,
   state,
   country,
   postalCode,
   mailingOptIn
  });

  const populatedDonorContact=await DonorContact.findById(donorContact._id)
   .populate([{path:"state"},{path:"country"}]);

  res.status(201).json(populatedDonorContact);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const getDonorContacts=async(req,res)=>{
 try{
  const donorContacts=await DonorContact.find()
   .populate([{path:"state"},{path:"country"}])
   .sort({createdAt:-1});

  res.status(200).json(donorContacts);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const getDonorContactById=async(req,res)=>{
 try{
  const donorContact=await DonorContact.findById(req.params.id)
   .populate([{path:"state"},{path:"country"}]);

  if(!donorContact){
   return res.status(404).json({message:"Donor contact not found."});
  }

  res.status(200).json(donorContact);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const updateDonorContact=async(req,res)=>{
 try{
  const {name,email,phone,company,address1,address2,city,state,country,postalCode,mailingOptIn}=req.body;

  const donorContact=await DonorContact.findById(req.params.id);

  if(!donorContact){
   return res.status(404).json({message:"Donor contact not found."});
  }

  if(email&&email.trim().toLowerCase()!==donorContact.email){
   const existingDonorContact=await DonorContact.findOne({email:email.trim().toLowerCase()});

   if(existingDonorContact&&existingDonorContact._id.toString()!==req.params.id){
    return res.status(409).json({message:"Email already exists."});
   }

   donorContact.email=email.trim().toLowerCase();
  }

  if(name!==undefined){donorContact.name=name.trim();}
  if(phone!==undefined){donorContact.phone=phone;}
  if(company!==undefined){donorContact.company=company;}
  if(address1!==undefined){donorContact.address1=address1;}
  if(address2!==undefined){donorContact.address2=address2;}
  if(city!==undefined){donorContact.city=city;}
  if(state!==undefined){donorContact.state=state;}
  if(country!==undefined){donorContact.country=country;}
  if(postalCode!==undefined){donorContact.postalCode=postalCode;}
  if(mailingOptIn!==undefined){donorContact.mailingOptIn=mailingOptIn;}

  await donorContact.save();

  const populatedDonorContact=await DonorContact.findById(donorContact._id)
   .populate([{path:"state"},{path:"country"}]);

  res.status(200).json(populatedDonorContact);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const deleteDonorContact=async(req,res)=>{
 try{
  const donorContact=await DonorContact.findById(req.params.id);

  if(!donorContact){
   return res.status(404).json({message:"Donor contact not found."});
  }

  await donorContact.deleteOne();

  res.status(200).json({message:"Donor contact deleted successfully."});
 }catch(error){
  res.status(500).json({message:error.message});
 }
};