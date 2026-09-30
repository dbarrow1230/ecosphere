//backend/controllers/reference/vendorController.js
import Vendor from "../../models/reference/vendorModel.js";
import Business from "../../models/reference/businessModel.js";
import VendorCategory from "../../models/master/VendorCategoryModel.js";
import "../../models/locations/countryModel.js";
import "../../models/locations/countyModel.js";
import "../../models/locations/stateModel.js";

const vendorPopulate=[
 {path:"business_id",model:Business,select:"legalName code"},
 {path:"vendorCategories",model:VendorCategory,select:"name code description isActive"},
 {path:"addresses.stateRef"},
 {path:"addresses.countryRef"},
 {path:"addresses.countyRef"}
];

export const getVendors=async(req,res)=>{
 try{
  const query={};
  if(req.query.business_id)query.business_id=req.query.business_id;
  const vendors=await Vendor.find(query).populate(vendorPopulate).sort({legalName:1}).lean();
  res.status(200).json(vendors);
 }catch(err){
  res.status(500).json({message:"Failed to fetch vendors",error:err.message});
 }
};

export const getVendorById=async(req,res)=>{
 try{
  const vendor=await Vendor.findById(req.params.id).populate(vendorPopulate).lean();
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
  const populatedVendor=await Vendor.findById(savedVendor._id).populate(vendorPopulate).lean();
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
  }).populate(vendorPopulate).lean();
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
