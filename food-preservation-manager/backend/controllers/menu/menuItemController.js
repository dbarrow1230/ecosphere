// backend/controllers/menu/menuItemController.js
import MenuItem from "../../models/menu/menuItemModel.js";

const buildQuery=query=>{
 const q={};

 if(query.menu)
 {
  q.menu=query.menu;
 }

 if(query.product)
 {
  q.product=query.product;
 }

 if(query.productBatch)
 {
  q.productBatch=query.productBatch;
 }

 if(query.containerType)
 {
  q.containerType=query.containerType;
 }

 if(query.sectionKey)
 {
  q.sectionKey=query.sectionKey;
 }

 if(query.category)
 {
  q.category=query.category;
 }

 if(query.isAvailable!==undefined)
 {
  q.isAvailable=query.isAvailable==="true";
 }

 if(query.search)
 {
  q.$or=[
   {nameOverride:{$regex:query.search,$options:"i"}},
   {descriptionOverride:{$regex:query.search,$options:"i"}},
   {sectionKey:{$regex:query.search,$options:"i"}},
   {category:{$regex:query.search,$options:"i"}},
   {notes:{$regex:query.search,$options:"i"}}
  ];
 }

 return q;
};

export const getMenuItems=async(req,res)=>{
 try
 {
  const query=buildQuery(req.query);

  const menuItems=await MenuItem.find(query)
   .populate("menu")
   .populate("product")
   .populate("productBatch")
   .populate("containerType")
   .sort({sortOrder:1,createdAt:-1});

  return res.status(200).json({success:true,count:menuItems.length,data:menuItems});
 }
 catch(err)
 {
  return res.status(500).json({success:false,message:err.message||"Failed to fetch menu items"});
 }
};

export const getMenuItemById=async(req,res)=>{
 try
 {
  const menuItem=await MenuItem.findById(req.params.id)
   .populate("menu")
   .populate("product")
   .populate("productBatch")
   .populate("containerType");

  if(!menuItem)
  {
   return res.status(404).json({success:false,message:"Menu item not found"});
  }

  return res.status(200).json({success:true,data:menuItem});
 }
 catch(err)
 {
  return res.status(500).json({success:false,message:err.message||"Failed to fetch menu item"});
 }
};

export const createMenuItem=async(req,res)=>{
 try
 {
  const menuItem=await MenuItem.create(req.body);

  const populated=await MenuItem.findById(menuItem._id)
   .populate("menu")
   .populate("product")
   .populate("productBatch")
   .populate("containerType");

  return res.status(201).json({success:true,message:"Menu item created",data:populated});
 }
 catch(err)
 {
  return res.status(400).json({success:false,message:err.message||"Failed to create menu item"});
 }
};

export const updateMenuItem=async(req,res)=>{
 try
 {
  const menuItem=await MenuItem.findByIdAndUpdate(
   req.params.id,
   req.body,
   {returnDocument:"after",runValidators:true}
  )
   .populate("menu")
   .populate("product")
   .populate("productBatch")
   .populate("containerType");

  if(!menuItem)
  {
   return res.status(404).json({success:false,message:"Menu item not found"});
  }

  return res.status(200).json({success:true,message:"Menu item updated",data:menuItem});
 }
 catch(err)
 {
  return res.status(400).json({success:false,message:err.message||"Failed to update menu item"});
 }
};

export const deleteMenuItem=async(req,res)=>{
 try
 {
  const menuItem=await MenuItem.findByIdAndDelete(req.params.id);

  if(!menuItem)
  {
   return res.status(404).json({success:false,message:"Menu item not found"});
  }

  return res.status(200).json({success:true,message:"Menu item deleted"});
 }
 catch(err)
 {
  return res.status(500).json({success:false,message:err.message||"Failed to delete menu item"});
 }
};
