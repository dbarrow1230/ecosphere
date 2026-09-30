import mongoose from "mongoose";
import Menu from "../../models/master/MenuModel.js";

const sortMenu=menu=>{
 const value=menu?.toObject?menu.toObject():menu;
 return{
  ...value,
  sections:[...(value?.sections||[])]
   .filter(section=>section.isActive!==false)
   .sort((a,b)=>(a.displayOrder??0)-(b.displayOrder??0))
   .map(section=>({
    ...section,
    items:[...(section.items||[])]
     .filter(item=>item.isAvailable!==false)
     .sort((a,b)=>(a.displayOrder??0)-(b.displayOrder??0))
   }))
 };
};

const isValidId=id=>mongoose.Types.ObjectId.isValid(id);

export const getPublicMenu=async(req,res,next)=>{
 try{
  const menu=await Menu.findOne({status:"active",isPublic:true}).sort({displayOrder:1,createdAt:1});
  if(!menu)return res.status(404).json({message:"Public menu not found"});
  return res.status(200).json({menu:sortMenu(menu)});
 }catch(error){
  return next(error);
 }
};

export const getMenus=async(req,res,next)=>{
 try{
  const filter={};
  if(req.query.status)filter.status=req.query.status;
  const menus=await Menu.find(filter).sort({displayOrder:1,createdAt:-1});
  return res.status(200).json({menus:menus.map(sortMenu)});
 }catch(error){
  return next(error);
 }
};

export const getMenuById=async(req,res,next)=>{
 try{
  if(!isValidId(req.params.id))return res.status(400).json({message:"Invalid menu id"});
  const menu=await Menu.findById(req.params.id);
  if(!menu)return res.status(404).json({message:"Menu not found"});
  return res.status(200).json({menu:sortMenu(menu)});
 }catch(error){
  return next(error);
 }
};

export const createMenu=async(req,res,next)=>{
 try{
  const menu=await Menu.create(req.body);
  return res.status(201).json({message:"Menu created successfully",menu:sortMenu(menu)});
 }catch(error){
  return next(error);
 }
};

export const updateMenu=async(req,res,next)=>{
 try{
  if(!isValidId(req.params.id))return res.status(400).json({message:"Invalid menu id"});
  const menu=await Menu.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
  if(!menu)return res.status(404).json({message:"Menu not found"});
  return res.status(200).json({message:"Menu updated successfully",menu:sortMenu(menu)});
 }catch(error){
  return next(error);
 }
};

export const deleteMenu=async(req,res,next)=>{
 try{
  if(!isValidId(req.params.id))return res.status(400).json({message:"Invalid menu id"});
  const menu=await Menu.findByIdAndDelete(req.params.id);
  if(!menu)return res.status(404).json({message:"Menu not found"});
  return res.status(200).json({message:"Menu deleted successfully"});
 }catch(error){
  return next(error);
 }
};
