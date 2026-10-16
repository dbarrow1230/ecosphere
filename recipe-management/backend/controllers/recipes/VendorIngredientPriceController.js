import ProductCategory from "../../models/recipes/ProductCategoryModel.js";
// backend/controllers/recipes/VendorIngredientPriceController.js
import VendorIngredientPrice from "../../models/recipes/VendorIngredientPriceModel.js";
import {pricePayload,updateVendorPrice} from "../../../../shared/culinary/vendorHistory.js";

async function validateCategoryPath(body){
 if(!Object.hasOwn(body,"productCategory")&&!Object.hasOwn(body,"productCategoryPath"))return;
 if(!body.productCategory){body.productCategoryPath=[];return;}
 if(!body.productCategoryPath?.length)return;
 const path=body.productCategoryPath.map(value=>String(value?._id||value));if(path.at(-1)!==String(body.productCategory?._id||body.productCategory)||new Set(path).size!==path.length)throw Error("Choose a valid category path.");
 let parent="";for(const id of path){const category=await ProductCategory.findById(id);const links=category?.parents?.length?category.parents:[category?.parent||null];if(!category||category.isActive===false||!links.some(value=>String(value||"")===parent))throw Error("Category links changed. Select the category path again.");parent=id;}
}
export const createVendorIngredientPrice=async(req,res)=>{
 try{
  await validateCategoryPath(req.body);
  if(!req.body.business||!req.body.vendor||!req.body.ingredient)return res.status(400).json({message:"Business, vendor, and ingredient are required"});
  const vendorIngredientPrice=await VendorIngredientPrice.create(pricePayload(req.body));
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
  await validateCategoryPath(req.body);
  if(!req.body.business||!req.body.vendor||!req.body.ingredient)return res.status(400).json({message:"Business, vendor, and ingredient are required"});
  const vendorIngredientPrice=await updateVendorPrice(VendorIngredientPrice,req.params.id,req.body);
  if(vendorIngredientPrice)await vendorIngredientPrice.populate("business vendor ingredient imperialUnit metricUnit");
  if(!vendorIngredientPrice)return res.status(404).json({message:"Vendor ingredient price not found"});
  return res.status(200).json({message:"Vendor ingredient price updated successfully",vendorIngredientPrice});
 }catch(error){
  return res.status(500).json({message:"Failed to update vendor ingredient price",error:error.message});
 }
};

export const deleteVendorIngredientPrice=async(req,res)=>{
 try{
  const vendorIngredientPrice=await VendorIngredientPrice.findByIdAndUpdate(req.params.id,{isActive:false},{returnDocument:"after"});
  if(!vendorIngredientPrice)return res.status(404).json({message:"Vendor ingredient price not found"});
  return res.status(200).json({message:"Vendor ingredient price archived successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete vendor ingredient price",error:error.message});
 }
};
