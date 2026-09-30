// backend/controllers/menu/menuController.js
import Menu from "../../models/menu/menuModel.js";

const buildQuery=query=>{
 const q={};

 if(query.type)
 {
  q.type=query.type;
 }

 if(query.isActive!==undefined)
 {
  q.isActive=query.isActive==="true";
 }

 if(query.search)
 {
  q.$or=[
   {name:{$regex:query.search,$options:"i"}},
   {code:{$regex:query.search,$options:"i"}},
   {slug:{$regex:query.search,$options:"i"}},
   {description:{$regex:query.search,$options:"i"}}
  ];
 }

 return q;
};

export const getMenus=async(req,res)=>{
 try
 {
  const query=buildQuery(req.query);

  const menus=await Menu.find(query).sort({startDate:-1,name:1});

  return res.status(200).json({success:true,count:menus.length,data:menus});
 }
 catch(err)
 {
  return res.status(500).json({success:false,message:err.message||"Failed to fetch menus"});
 }
};

export const getMenuById=async(req,res)=>{
 try
 {
  const menu=await Menu.findById(req.params.id);

  if(!menu)
  {
   return res.status(404).json({success:false,message:"Menu not found"});
  }

  return res.status(200).json({success:true,data:menu});
 }
 catch(err)
 {
  return res.status(500).json({success:false,message:err.message||"Failed to fetch menu"});
 }
};

export const createMenu=async(req,res)=>{
 try
 {
  const menu=await Menu.create(req.body);
  return res.status(201).json({success:true,message:"Menu created",data:menu});
 }
 catch(err)
 {
  return res.status(400).json({success:false,message:err.message||"Failed to create menu"});
 }
};

export const updateMenu=async(req,res)=>{
 try
 {
  const menu=await Menu.findByIdAndUpdate(
   req.params.id,
   req.body,
   {returnDocument:"after",runValidators:true}
  );

  if(!menu)
  {
   return res.status(404).json({success:false,message:"Menu not found"});
  }

  return res.status(200).json({success:true,message:"Menu updated",data:menu});
 }
 catch(err)
 {
  return res.status(400).json({success:false,message:err.message||"Failed to update menu"});
 }
};

export const deleteMenu=async(req,res)=>{
 try
 {
  const menu=await Menu.findByIdAndDelete(req.params.id);

  if(!menu)
  {
   return res.status(404).json({success:false,message:"Menu not found"});
  }

  return res.status(200).json({success:true,message:"Menu deleted"});
 }
 catch(err)
 {
  return res.status(500).json({success:false,message:err.message||"Failed to delete menu"});
 }
};
