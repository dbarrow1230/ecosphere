// backend/controllers/menuController.js
import Menu from "../models/menuModel.js";

export const createMenu=async(req,res)=>{
 try{
  const menu=await Menu.create(req.body);
  res.status(201).json({success:true,message:"Menu created successfully",menu});
 }catch(error){
  res.status(400).json({success:false,message:error.message});
 }
};

export const getMenus=async(req,res)=>{
 try{
  const menus=await Menu.find()
   .populate("items.item")
   .sort({name:1});
  res.status(200).json({success:true,count:menus.length,menus});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getSingleMenu=async(req,res)=>{
 try{
  const menu=await Menu.findById(req.params.id).populate("items.item");
  if(!menu){
   return res.status(404).json({success:false,message:"Menu not found"});
  }
  res.status(200).json({success:true,menu});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const updateMenu=async(req,res)=>{
 try{
  const menu=await Menu.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
  if(!menu){
   return res.status(404).json({success:false,message:"Menu not found"});
  }
  res.status(200).json({success:true,message:"Menu updated successfully",menu});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const deleteMenu=async(req,res)=>{
 try{
  const menu=await Menu.findByIdAndDelete(req.params.id);
  if(!menu){
   return res.status(404).json({success:false,message:"Menu not found"});
  }
  res.status(200).json({success:true,message:"Menu deleted successfully"});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};
