// backend/controllers/menuItemController.js
import MenuItem from "../models/menuItemModel.js";

export const createMenuItem=async(req,res)=>{
 try{
  const {menu,name,category,description,price,unit,status,isVegetarian,isVegan,isGlutenFree,notes}=req.body;
  const item=await MenuItem.create({
   menu,
   name,
   category,
   description,
   price,
   unit,
   status,
   isVegetarian,
   isVegan,
   isGlutenFree,
   notes
  });
  res.status(201).json({success:true,message:"Menu item created successfully",item});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getMenuItems=async(req,res)=>{
 try{
  const items=await MenuItem.find()
   .populate("menu")
   .sort({name:1});
  res.status(200).json({success:true,count:items.length,items});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getSingleMenuItem=async(req,res)=>{
 try{
  const item=await MenuItem.findById(req.params.id).populate("menu");
  if(!item){
   return res.status(404).json({success:false,message:"Menu item not found"});
  }
  res.status(200).json({success:true,item});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const updateMenuItem=async(req,res)=>{
 try{
  const item=await MenuItem.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
  if(!item){
   return res.status(404).json({success:false,message:"Menu item not found"});
  }
  res.status(200).json({success:true,message:"Menu item updated successfully",item});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const deleteMenuItem=async(req,res)=>{
 try{
  const item=await MenuItem.findByIdAndDelete(req.params.id);
  if(!item){
   return res.status(404).json({success:false,message:"Menu item not found"});
  }
  res.status(200).json({success:true,message:"Menu item deleted successfully"});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};