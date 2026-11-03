import Supplier from "../models/supplierModel.js";
import State from "../models/locations/stateModel.js";
import Country from "../models/locations/countryModel.js";

export const createSupplier=async(req,res)=>{
 try{
  const {name,contactName,email,phone,altPhone,fax,website,address1,address2,city,state,country,postalCode,notes,status}=req.body;
  const supplier=await Supplier.create({
   name,
   contactName,
   email,
   phone,
   altPhone,
   fax,
   website,
   address1,
   address2,
   city,
   state:state||null,
   country:country||null,
   postalCode,
   notes,
   status
  });
  const populatedSupplier=await Supplier.findById(supplier._id)
   .populate({path:"state",model:State})
   .populate({path:"country",model:Country});
  res.status(201).json({success:true,message:"Supplier created successfully",supplier:populatedSupplier});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getSuppliers=async(req,res)=>{
 try{
  const suppliers=await Supplier.find()
   .populate({path:"state",model:State})
   .populate({path:"country",model:Country})
   .sort({name:1});
  res.status(200).json({success:true,count:suppliers.length,suppliers});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getSingleSupplier=async(req,res)=>{
 try{
  const supplier=await Supplier.findById(req.params.id)
   .populate({path:"state",model:State})
   .populate({path:"country",model:Country});
  if(!supplier){
   return res.status(404).json({success:false,message:"Supplier not found"});
  }
  res.status(200).json({success:true,supplier});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const updateSupplier=async(req,res)=>{
 try{
  const payload={
   ...req.body,
   state:req.body.state||null,
   country:req.body.country||null
  };
  const updatedSupplier=await Supplier.findByIdAndUpdate(req.params.id,payload,{returnDocument:"after",runValidators:true});
  if(!updatedSupplier){
   return res.status(404).json({success:false,message:"Supplier not found"});
  }
  const supplier=await Supplier.findById(updatedSupplier._id)
   .populate({path:"state",model:State})
   .populate({path:"country",model:Country});
  res.status(200).json({success:true,message:"Supplier updated successfully",supplier});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const deleteSupplier=async(req,res)=>{
 try{
  const supplier=await Supplier.findByIdAndDelete(req.params.id);
  if(!supplier){
   return res.status(404).json({success:false,message:"Supplier not found"});
  }
  res.status(200).json({success:true,message:"Supplier deleted successfully"});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};