import mongoose from "mongoose";
import Inventory from "../../models/operations/inventoryModel.js";

const fields=["name","category","sku","quantityOnHand","reorderLevel","unit","costPerUnit","supplier","status","area","notes"];
const pick=body=>Object.fromEntries(fields.filter(field=>body[field]!==undefined).map(field=>[field,body[field]]));
const validId=id=>mongoose.Types.ObjectId.isValid(id);

export const getInventory=async(req,res,next)=>{try{const filter={};if(req.query.status)filter.status=req.query.status;if(req.query.area)filter.area=req.query.area;const inventory=await Inventory.find(filter).sort({name:1});res.json({inventory});}catch(error){next(error);}};
export const getInventoryItemById=async(req,res,next)=>{try{if(!validId(req.params.id))return res.status(400).json({message:"Invalid inventory id"});const inventory=await Inventory.findById(req.params.id);if(!inventory)return res.status(404).json({message:"Inventory item not found"});res.json({inventory});}catch(error){next(error);}};
export const createInventoryItem=async(req,res,next)=>{try{const inventory=await Inventory.create(pick(req.body));res.status(201).json({message:"Inventory item created successfully",inventory});}catch(error){next(error);}};
export const updateInventoryItem=async(req,res,next)=>{try{if(!validId(req.params.id))return res.status(400).json({message:"Invalid inventory id"});const inventory=await Inventory.findByIdAndUpdate(req.params.id,pick(req.body),{returnDocument:"after",runValidators:true});if(!inventory)return res.status(404).json({message:"Inventory item not found"});res.json({message:"Inventory item updated successfully",inventory});}catch(error){next(error);}};
export const deleteInventoryItem=async(req,res,next)=>{try{if(!validId(req.params.id))return res.status(400).json({message:"Invalid inventory id"});const inventory=await Inventory.findByIdAndDelete(req.params.id);if(!inventory)return res.status(404).json({message:"Inventory item not found"});res.json({message:"Inventory item deleted successfully"});}catch(error){next(error);}};
