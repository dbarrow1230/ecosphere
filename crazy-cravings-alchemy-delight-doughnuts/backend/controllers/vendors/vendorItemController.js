// backend/controllers/vendors/vendorItemController.js
import VendorItem from "../../models/vendors/VendorItemModel.js";
import Vendor from "../../models/vendors/VendorModel.js";
import Ingredient from "../../models/ingredients/IngredientModel.js";

export const createVendorItem=async(req,res)=>{
 try{
  const {
   vendor,ingredient,itemName,itemType,sku,vendorSku,brand,
   packSize,packUnit,baseUnit,conversionToBase,
   isAvailable,isPreferred,notes
  }=req.body;

  if(!vendor) return res.status(400).json({message:"Vendor is required"});
  if(!itemName||!itemName.trim()) return res.status(400).json({message:"Item name is required"});

  const vendorItem=await VendorItem.create({
   vendor,
   ingredient:ingredient||null,
   itemName:itemName.trim(),
   itemType:itemType||"ingredient",
   sku:sku?.trim()||"",
   vendorSku:vendorSku?.trim()||"",
   brand:brand?.trim()||"",
   packSize:packSize||0,
   packUnit:packUnit?.trim()||"",
   baseUnit:baseUnit?.trim()||"",
   conversionToBase:conversionToBase||1,
   isAvailable:typeof isAvailable==="boolean"?isAvailable:true,
   isPreferred:typeof isPreferred==="boolean"?isPreferred:false,
   notes:notes?.trim()||""
  });

  const populatedVendorItem=await VendorItem.findById(vendorItem._id)
   .populate({path:"vendor",model:Vendor})
   .populate({path:"ingredient",model:Ingredient});

  return res.status(201).json(populatedVendorItem);
 }catch(error){
  return res.status(500).json({message:"Failed to create vendor item",error:error.message});
 }
};

export const getVendorItems=async(req,res)=>{
 try{
  const {vendor,ingredient,itemType,isAvailable,isPreferred,search}=req.query;

  const filter={};

  if(vendor) filter.vendor=vendor;
  if(ingredient) filter.ingredient=ingredient;
  if(itemType) filter.itemType=itemType;

  if(isAvailable==="true") filter.isAvailable=true;
  if(isAvailable==="false") filter.isAvailable=false;

  if(isPreferred==="true") filter.isPreferred=true;
  if(isPreferred==="false") filter.isPreferred=false;

  if(search?.trim()){
   filter.$or=[
    {itemName:{$regex:search.trim(),$options:"i"}},
    {sku:{$regex:search.trim(),$options:"i"}},
    {vendorSku:{$regex:search.trim(),$options:"i"}},
    {brand:{$regex:search.trim(),$options:"i"}}
   ];
  }

  const vendorItems=await VendorItem.find(filter)
   .populate({path:"vendor",model:Vendor})
   .populate({path:"ingredient",model:Ingredient})
   .sort({itemName:1});

  return res.status(200).json(vendorItems);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch vendor items",error:error.message});
 }
};

export const getVendorItemById=async(req,res)=>{
 try{
  const vendorItem=await VendorItem.findById(req.params.id)
   .populate({path:"vendor",model:Vendor})
   .populate({path:"ingredient",model:Ingredient});

  if(!vendorItem) return res.status(404).json({message:"Vendor item not found"});

  return res.status(200).json(vendorItem);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch vendor item",error:error.message});
 }
};

export const updateVendorItem=async(req,res)=>{
 try{
  const {
   vendor,ingredient,itemName,itemType,sku,vendorSku,brand,
   packSize,packUnit,baseUnit,conversionToBase,
   isAvailable,isPreferred,notes
  }=req.body;

  const updateData={};

  if(vendor!==undefined) updateData.vendor=vendor;
  if(ingredient!==undefined) updateData.ingredient=ingredient||null;

  if(itemName!==undefined){
   if(!itemName.trim()) return res.status(400).json({message:"Item name is required"});
   updateData.itemName=itemName.trim();
  }

  if(itemType!==undefined) updateData.itemType=itemType;

  if(sku!==undefined) updateData.sku=sku?.trim()||"";
  if(vendorSku!==undefined) updateData.vendorSku=vendorSku?.trim()||"";
  if(brand!==undefined) updateData.brand=brand?.trim()||"";

  if(packSize!==undefined) updateData.packSize=packSize;
  if(packUnit!==undefined) updateData.packUnit=packUnit?.trim()||"";
  if(baseUnit!==undefined) updateData.baseUnit=baseUnit?.trim()||"";
  if(conversionToBase!==undefined) updateData.conversionToBase=conversionToBase;

  if(isAvailable!==undefined) updateData.isAvailable=isAvailable;
  if(isPreferred!==undefined) updateData.isPreferred=isPreferred;

  if(notes!==undefined) updateData.notes=notes?.trim()||"";

  const vendorItem=await VendorItem.findByIdAndUpdate(
   req.params.id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
   .populate({path:"vendor",model:Vendor})
   .populate({path:"ingredient",model:Ingredient});

  if(!vendorItem) return res.status(404).json({message:"Vendor item not found"});

  return res.status(200).json(vendorItem);
 }catch(error){
  return res.status(500).json({message:"Failed to update vendor item",error:error.message});
 }
};

export const deleteVendorItem=async(req,res)=>{
 try{
  const vendorItem=await VendorItem.findByIdAndDelete(req.params.id);

  if(!vendorItem) return res.status(404).json({message:"Vendor item not found"});

  return res.status(200).json({message:"Vendor item deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete vendor item",error:error.message});
 }
};