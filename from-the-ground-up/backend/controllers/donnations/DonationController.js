// backend/controllers/donnations/DonationController.js
import Donation from "../../models/donnations/DonationModel.js";
import DonorContact from "../../models/donnations/DonorContactModel.js";

export const createDonation=async(req,res)=>{
 try{
  const {name,email,amount,frequency,message,paymentIntentId}=req.body;

  if(!name||!email||!amount){
   return res.status(400).json({message:"Name, email, and amount are required."});
  }

  let donor=await DonorContact.findOne({email:email.trim().toLowerCase()});

  if(!donor){
   donor=await DonorContact.create({
    name:name.trim(),
    email:email.trim().toLowerCase()
   });
  }else if(donor.name!==name.trim()){
   donor.name=name.trim();
   await donor.save();
  }

  const donation=await Donation.create({
   donor:donor._id,
   amount,
   frequency,
   message,
   paymentIntentId
  });

  const populatedDonation=await Donation.findById(donation._id).populate("donor");

  res.status(201).json(populatedDonation);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const getDonations=async(req,res)=>{
 try{
  const donations=await Donation.find().populate("donor").sort({createdAt:-1});

  res.status(200).json(donations);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const getDonationById=async(req,res)=>{
 try{
  const donation=await Donation.findById(req.params.id).populate("donor");

  if(!donation){
   return res.status(404).json({message:"Donation not found."});
  }

  res.status(200).json(donation);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const updateDonationStatus=async(req,res)=>{
 try{
  const {status,paymentIntentId}=req.body;

  const donation=await Donation.findById(req.params.id);

  if(!donation){
   return res.status(404).json({message:"Donation not found."});
  }

  if(status){
   donation.status=status;
  }

  if(paymentIntentId){
   donation.paymentIntentId=paymentIntentId;
  }

  await donation.save();

  const updatedDonation=await Donation.findById(donation._id).populate("donor");

  res.status(200).json(updatedDonation);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const deleteDonation=async(req,res)=>{
 try{
  const donation=await Donation.findById(req.params.id);

  if(!donation){
   return res.status(404).json({message:"Donation not found."});
  }

  await donation.deleteOne();

  res.status(200).json({message:"Donation deleted successfully."});
 }catch(error){
  res.status(500).json({message:error.message});
 }
};