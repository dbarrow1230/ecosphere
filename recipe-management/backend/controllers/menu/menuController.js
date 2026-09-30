import Menu from "../../models/menu/menuModel.js";

export const getMenus=async(req,res)=>{
 try{return res.json(await Menu.find().sort({createdAt:-1}));}
 catch(error){return res.status(500).json({message:"Failed to load menus",error:error.message});}
};
export const createMenu=async(req,res)=>{
 try{const menu=await Menu.create(req.body);return res.status(201).json({message:"Menu created successfully",menu});}
 catch(error){return res.status(500).json({message:"Failed to create menu",error:error.message});}
};
export const updateMenu=async(req,res)=>{
 try{const menu=await Menu.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});if(!menu)return res.status(404).json({message:"Menu not found"});return res.json({message:"Menu updated successfully",menu});}
 catch(error){return res.status(500).json({message:"Failed to update menu",error:error.message});}
};
export const deleteMenu=async(req,res)=>{
 try{const menu=await Menu.findByIdAndDelete(req.params.id);if(!menu)return res.status(404).json({message:"Menu not found"});return res.json({message:"Menu deleted successfully"});}
 catch(error){return res.status(500).json({message:"Failed to delete menu",error:error.message});}
};
