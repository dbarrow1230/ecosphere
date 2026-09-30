//backend/controllers/reference/vendorController.js
import Vendor from "../../models/reference/vendorModel.js";
import "../../models/location/countryModel.js";
import "../../models/location/countyModel.js";
import "../../models/location/stateModel.js";

export const getVendors=async(req,res)=>{
 try{
  const vendors=await Vendor.find().populate("addresses.stateRef addresses.countryRef addresses.countyRef").sort({legalName:1}).lean();
  res.status(200).json(vendors);
 }catch(err){
  res.status(500).json({message:"Failed to fetch vendors",error:err.message});
 }
};

export const getVendorById=async(req,res)=>{
 try{
  const vendor=await Vendor.findById(req.params.id).populate("addresses.stateRef addresses.countryRef addresses.countyRef").lean();
  if(!vendor)return res.status(404).json({message:"Vendor not found"});
  res.status(200).json(vendor);
 }catch(err){
  res.status(500).json({message:"Failed to fetch vendor",error:err.message});
 }
};

export const createVendor=async(req,res)=>{
 try{
  const vendor=new Vendor(req.body);
  const savedVendor=await vendor.save();
  const populatedVendor=await Vendor.findById(savedVendor._id).populate("addresses.stateRef addresses.countryRef addresses.countyRef").lean();
  res.status(201).json(populatedVendor);
 }catch(err){
  res.status(400).json({message:"Failed to create vendor",error:err.message});
 }
};

export const updateVendor=async(req,res)=>{
 try{
  const updatedVendor=await Vendor.findByIdAndUpdate(req.params.id,req.body,{
   returnDocument:"after",
   runValidators:true
  }).populate("addresses.stateRef addresses.countryRef addresses.countyRef").lean();
  if(!updatedVendor)return res.status(404).json({message:"Vendor not found"});
  res.status(200).json(updatedVendor);
 }catch(err){
  res.status(400).json({message:"Failed to update vendor",error:err.message});
 }
};

export const deleteVendor=async(req,res)=>{
 try{
  const deletedVendor=await Vendor.findByIdAndDelete(req.params.id);
  if(!deletedVendor)return res.status(404).json({message:"Vendor not found"});
  res.status(200).json({message:"Vendor deleted successfully"});
 }catch(err){
  res.status(500).json({message:"Failed to delete vendor",error:err.message});
 }
};
