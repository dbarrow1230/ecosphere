import "../../models/master/IngredientModel.js";
// backend/controllers/master/VendorIngredientPriceController.js
import VendorIngredientPrice from "../../models/master/VendorIngredientPriceModel.js";

export const createVendorIngredientPrice=async(req,res)=>{
 try{
  const vendorIngredientPrice=await VendorIngredientPrice.create(req.body);
  return res.status(201).json({message:"Vendor ingredient price created successfully",vendorIngredientPrice});
 }catch(error){
  return res.status(500).json({message:"Failed to create vendor ingredient price",error:error.message});
 }
};

export const getVendorIngredientPrices=async(req,res)=>{
 try{
  const filter={};
  if(req.query.business)filter.business=req.query.business;
  if(req.query.vendor)filter.vendor=req.query.vendor;
  if(req.query.ingredient)filter.ingredient=req.query.ingredient;
  if(req.query.isActive!==undefined)filter.isActive=req.query.isActive==="true";
  const vendorIngredientPrices=await VendorIngredientPrice.find(filter)
   .populate("business")
   .populate("vendor")
   .populate("ingredient")
   .populate("imperialUnit")
   .populate("metricUnit")
   .sort({effectiveDate:-1});
  return res.status(200).json(vendorIngredientPrices);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch vendor ingredient prices",error:error.message});
 }
};

export const getVendorIngredientPriceById=async(req,res)=>{
 try{
  const vendorIngredientPrice=await VendorIngredientPrice.findById(req.params.id)
   .populate("business")
   .populate("vendor")
   .populate("ingredient")
   .populate("imperialUnit")
   .populate("metricUnit");
  if(!vendorIngredientPrice)return res.status(404).json({message:"Vendor ingredient price not found"});
  return res.status(200).json(vendorIngredientPrice);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch vendor ingredient price",error:error.message});
 }
};

export const updateVendorIngredientPrice=async(req,res)=>{
 try{
  const vendorIngredientPrice=await VendorIngredientPrice.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
   .populate("business")
   .populate("vendor")
   .populate("ingredient")
   .populate("imperialUnit")
   .populate("metricUnit");
  if(!vendorIngredientPrice)return res.status(404).json({message:"Vendor ingredient price not found"});
  return res.status(200).json({message:"Vendor ingredient price updated successfully",vendorIngredientPrice});
 }catch(error){
  return res.status(500).json({message:"Failed to update vendor ingredient price",error:error.message});
 }
};

export const deleteVendorIngredientPrice=async(req,res)=>{
 try{
  const vendorIngredientPrice=await VendorIngredientPrice.findByIdAndDelete(req.params.id);
  if(!vendorIngredientPrice)return res.status(404).json({message:"Vendor ingredient price not found"});
  return res.status(200).json({message:"Vendor ingredient price deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete vendor ingredient price",error:error.message});
 }
};