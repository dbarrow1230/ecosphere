import Supplier from "../../models/supplier/supplierModel.js";

const populateSupplier=query=>query.populate("address.state").populate("address.country");

export const getSuppliers=async(req,res)=>{
 try{
  const q={};
  if(req.query.type)q.type=req.query.type;
  if(req.query.isActive!==undefined)q.isActive=req.query.isActive==="true";
  if(req.query.search){
   q.$or=[
    {name:{$regex:req.query.search,$options:"i"}},
    {code:{$regex:req.query.search,$options:"i"}},
    {type:{$regex:req.query.search,$options:"i"}},
    {"contact.contactName":{$regex:req.query.search,$options:"i"}},
    {"contact.email":{$regex:req.query.search,$options:"i"}},
    {notes:{$regex:req.query.search,$options:"i"}}
   ];
  }
  const suppliers=await populateSupplier(Supplier.find(q)).sort({name:1});
  return res.status(200).json({success:true,count:suppliers.length,data:suppliers,suppliers});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to fetch suppliers"});
 }
};

export const getSupplierById=async(req,res)=>{
 try{
  const supplier=await populateSupplier(Supplier.findById(req.params.id));
  if(!supplier)return res.status(404).json({success:false,message:"Supplier not found"});
  return res.status(200).json({success:true,data:supplier,supplier});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to fetch supplier"});
 }
};

export const createSupplier=async(req,res)=>{
 try{
  const supplier=await Supplier.create(req.body);
  const populated=await populateSupplier(Supplier.findById(supplier._id));
  return res.status(201).json({success:true,message:"Supplier created",data:populated,supplier:populated});
 }catch(error){
  return res.status(400).json({success:false,message:error.message||"Failed to create supplier"});
 }
};

export const updateSupplier=async(req,res)=>{
 try{
  const supplier=await populateSupplier(Supplier.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true}));
  if(!supplier)return res.status(404).json({success:false,message:"Supplier not found"});
  return res.status(200).json({success:true,message:"Supplier updated",data:supplier,supplier});
 }catch(error){
  return res.status(400).json({success:false,message:error.message||"Failed to update supplier"});
 }
};

export const deleteSupplier=async(req,res)=>{
 try{
  const supplier=await Supplier.findByIdAndDelete(req.params.id);
  if(!supplier)return res.status(404).json({success:false,message:"Supplier not found"});
  return res.status(200).json({success:true,message:"Supplier deleted"});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to delete supplier"});
 }
};

