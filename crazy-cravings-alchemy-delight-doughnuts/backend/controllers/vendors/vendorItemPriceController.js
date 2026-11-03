// backend/controllers/vendors/vendorItemPriceController.js
import VendorItemPrice from "../../models/vendors/VendorItemPriceModel.js";
import Vendor from "../../models/vendors/VendorModel.js";
import VendorItem from "../../models/vendors/VendorItemModel.js";
import Ingredient from "../../models/ingredients/IngredientModel.js";

export const createVendorItemPrice=async(req,res)=>{
 try{
  const {
   vendor,vendorItem,ingredient,unitCost,minimumOrderQty,leadTimeDays,
   effectiveFrom,effectiveTo,isCurrent,isAvailable,notes
  }=req.body;

  if(!vendor) return res.status(400).json({message:"Vendor is required"});
  if(!vendorItem) return res.status(400).json({message:"Vendor item is required"});
  if(unitCost===undefined||unitCost<0) return res.status(400).json({message:"Unit cost is required"});

  const vendorItemPrice=await VendorItemPrice.create({
   vendor,
   vendorItem,
   ingredient:ingredient||null,
   unitCost,
   minimumOrderQty:minimumOrderQty||0,
   leadTimeDays:leadTimeDays||0,
   effectiveFrom:effectiveFrom||new Date(),
   effectiveTo:effectiveTo||null,
   isCurrent:typeof isCurrent==="boolean"?isCurrent:true,
   isAvailable:typeof isAvailable==="boolean"?isAvailable:true,
   notes:notes?.trim()||""
  });

  const populatedVendorItemPrice=await VendorItemPrice.findById(vendorItemPrice._id)
   .populate({path:"vendor",model:Vendor})
   .populate({path:"vendorItem",model:VendorItem})
   .populate({path:"ingredient",model:Ingredient});

  return res.status(201).json(populatedVendorItemPrice);
 }catch(error){
  return res.status(500).json({message:"Failed to create vendor item price",error:error.message});
 }
};

export const getVendorItemPrices=async(req,res)=>{
 try{
  const {vendor,vendorItem,ingredient,isCurrent,isAvailable}=req.query;

  const filter={};

  if(vendor) filter.vendor=vendor;
  if(vendorItem) filter.vendorItem=vendorItem;
  if(ingredient) filter.ingredient=ingredient;

  if(isCurrent==="true") filter.isCurrent=true;
  if(isCurrent==="false") filter.isCurrent=false;

  if(isAvailable==="true") filter.isAvailable=true;
  if(isAvailable==="false") filter.isAvailable=false;

  const vendorItemPrices=await VendorItemPrice.find(filter)
   .populate({path:"vendor",model:Vendor})
   .populate({path:"vendorItem",model:VendorItem})
   .populate({path:"ingredient",model:Ingredient})
   .sort({effectiveFrom:-1});

  return res.status(200).json(vendorItemPrices);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch vendor item prices",error:error.message});
 }
};

export const getVendorItemPriceById=async(req,res)=>{
 try{
  const vendorItemPrice=await VendorItemPrice.findById(req.params.id)
   .populate({path:"vendor",model:Vendor})
   .populate({path:"vendorItem",model:VendorItem})
   .populate({path:"ingredient",model:Ingredient});

  if(!vendorItemPrice) return res.status(404).json({message:"Vendor item price not found"});

  return res.status(200).json(vendorItemPrice);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch vendor item price",error:error.message});
 }
};

export const updateVendorItemPrice=async(req,res)=>{
 try{
  const {
   vendor,vendorItem,ingredient,unitCost,minimumOrderQty,leadTimeDays,
   effectiveFrom,effectiveTo,isCurrent,isAvailable,notes
  }=req.body;

  const updateData={};

  if(vendor!==undefined) updateData.vendor=vendor;
  if(vendorItem!==undefined) updateData.vendorItem=vendorItem;
  if(ingredient!==undefined) updateData.ingredient=ingredient||null;

  if(unitCost!==undefined){
   if(unitCost<0) return res.status(400).json({message:"Unit cost must be >= 0"});
   updateData.unitCost=unitCost;
  }

  if(minimumOrderQty!==undefined) updateData.minimumOrderQty=minimumOrderQty;
  if(leadTimeDays!==undefined) updateData.leadTimeDays=leadTimeDays;

  if(effectiveFrom!==undefined) updateData.effectiveFrom=effectiveFrom;
  if(effectiveTo!==undefined) updateData.effectiveTo=effectiveTo||null;

  if(isCurrent!==undefined) updateData.isCurrent=isCurrent;
  if(isAvailable!==undefined) updateData.isAvailable=isAvailable;

  if(notes!==undefined) updateData.notes=notes?.trim()||"";

  const vendorItemPrice=await VendorItemPrice.findByIdAndUpdate(
   req.params.id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
   .populate({path:"vendor",model:Vendor})
   .populate({path:"vendorItem",model:VendorItem})
   .populate({path:"ingredient",model:Ingredient});

  if(!vendorItemPrice) return res.status(404).json({message:"Vendor item price not found"});

  return res.status(200).json(vendorItemPrice);
 }catch(error){
  return res.status(500).json({message:"Failed to update vendor item price",error:error.message});
 }
};

export const deleteVendorItemPrice=async(req,res)=>{
 try{
  const vendorItemPrice=await VendorItemPrice.findByIdAndDelete(req.params.id);

  if(!vendorItemPrice) return res.status(404).json({message:"Vendor item price not found"});

  return res.status(200).json({message:"Vendor item price deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete vendor item price",error:error.message});
 }
};
