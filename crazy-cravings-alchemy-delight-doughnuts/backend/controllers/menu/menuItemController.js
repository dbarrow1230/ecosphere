// backend/controllers/menu/menuItemController.js
import MenuItem from "../../models/menu/menuItemsModel.js";

export const createMenuItem=async(req,res)=>{
 try{
  const {name,description,price,recipe,section,image,isActive,isFeatured,isAlwaysOnMenu,tags,occasions,availableDays,availableMonths,availableFrom,availableTo}=req.body;

  if(!name||!name.trim()) return res.status(400).json({message:"Name is required"});
  if(price===undefined||price<0) return res.status(400).json({message:"Price is required"});
  if(!recipe) return res.status(400).json({message:"Recipe is required"});
  if(!section) return res.status(400).json({message:"Section is required"});

  const menuItem=await MenuItem.create({
   name:name.trim(),
   description:description?.trim()||"",
   price,
   recipe,
   section,
   image:image||"",
   isActive:typeof isActive==="boolean"?isActive:true,
   isFeatured:typeof isFeatured==="boolean"?isFeatured:false,
   isAlwaysOnMenu:typeof isAlwaysOnMenu==="boolean"?isAlwaysOnMenu:false,
   tags:Array.isArray(tags)?tags:[],
   occasions:Array.isArray(occasions)?occasions:[],
   availableDays:Array.isArray(availableDays)?availableDays:[],
   availableMonths:Array.isArray(availableMonths)?availableMonths:[],
   availableFrom:availableFrom||null,
   availableTo:availableTo||null
  });

  return res.status(201).json(menuItem);
 }catch(error){
  return res.status(500).json({message:"Failed to create menu item",error:error.message});
 }
};

export const getMenuItems=async(req,res)=>{
 try{
  const {search,section,isActive,isFeatured}=req.query;

  const filter={};

  if(search?.trim()){
   filter.$or=[
    {name:{$regex:search.trim(),$options:"i"}},
    {description:{$regex:search.trim(),$options:"i"}},
    {tags:{$regex:search.trim(),$options:"i"}}
   ];
  }

  if(section) filter.section=section;
  if(isActive==="true") filter.isActive=true;
  if(isActive==="false") filter.isActive=false;
  if(isFeatured==="true") filter.isFeatured=true;
  if(isFeatured==="false") filter.isFeatured=false;

  const menuItems=await MenuItem.find(filter)
   .populate("recipe")
   .populate("section")
   .populate("occasions")
   .sort({name:1});

  return res.status(200).json(menuItems);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch menu items",error:error.message});
 }
};

export const getMenuItemById=async(req,res)=>{
 try{
  const menuItem=await MenuItem.findById(req.params.id)
   .populate("recipe")
   .populate("section")
   .populate("occasions");

  if(!menuItem) return res.status(404).json({message:"Menu item not found"});

  return res.status(200).json(menuItem);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch menu item",error:error.message});
 }
};

export const updateMenuItem=async(req,res)=>{
 try{
  const {name,description,price,recipe,section,image,isActive,isFeatured,isAlwaysOnMenu,tags,occasions,availableDays,availableMonths,availableFrom,availableTo}=req.body;

  const updateData={};

  if(name!==undefined){
   if(!name.trim()) return res.status(400).json({message:"Name is required"});
   updateData.name=name.trim();
  }

  if(price!==undefined){
   if(price<0) return res.status(400).json({message:"Price must be >= 0"});
   updateData.price=price;
  }

  if(recipe!==undefined) updateData.recipe=recipe;
  if(section!==undefined) updateData.section=section;

  if(description!==undefined) updateData.description=description?.trim()||"";
  if(image!==undefined) updateData.image=image||"";

  if(isActive!==undefined) updateData.isActive=isActive;
  if(isFeatured!==undefined) updateData.isFeatured=isFeatured;
  if(isAlwaysOnMenu!==undefined) updateData.isAlwaysOnMenu=isAlwaysOnMenu;

  if(tags!==undefined) updateData.tags=Array.isArray(tags)?tags:[];
  if(occasions!==undefined) updateData.occasions=Array.isArray(occasions)?occasions:[];
  if(availableDays!==undefined) updateData.availableDays=Array.isArray(availableDays)?availableDays:[];
  if(availableMonths!==undefined) updateData.availableMonths=Array.isArray(availableMonths)?availableMonths:[];
  if(availableFrom!==undefined) updateData.availableFrom=availableFrom||null;
  if(availableTo!==undefined) updateData.availableTo=availableTo||null;

  const menuItem=await MenuItem.findByIdAndUpdate(
   req.params.id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
   .populate("recipe")
   .populate("section")
   .populate("occasions");

  if(!menuItem) return res.status(404).json({message:"Menu item not found"});

  return res.status(200).json(menuItem);
 }catch(error){
  return res.status(500).json({message:"Failed to update menu item",error:error.message});
 }
};

export const deleteMenuItem=async(req,res)=>{
 try{
  const menuItem=await MenuItem.findByIdAndDelete(req.params.id);

  if(!menuItem) return res.status(404).json({message:"Menu item not found"});

  return res.status(200).json({message:"Menu item deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete menu item",error:error.message});
 }
};