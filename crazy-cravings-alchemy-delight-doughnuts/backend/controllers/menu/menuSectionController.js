// backend/controllers/menu/menuSectionController.js
import MenuSection from "../../models/menu/MenuSectionModel.js";

export const createMenuSection=async(req,res)=>{
 try{
  const {name,description,order,isActive}=req.body;

  if(!name||!name.trim()) return res.status(400).json({message:"Name is required"});

  const menuSection=await MenuSection.create({
   name:name.trim(),
   description:description?.trim()||"",
   order:order??0,
   isActive:typeof isActive==="boolean"?isActive:true
  });

  return res.status(201).json(menuSection);
 }catch(error){
  return res.status(500).json({message:"Failed to create menu section",error:error.message});
 }
};

export const getMenuSections=async(req,res)=>{
 try{
  const {search,isActive}=req.query;

  const filter={};

  if(search?.trim()){
   filter.$or=[
    {name:{$regex:search.trim(),$options:"i"}},
    {description:{$regex:search.trim(),$options:"i"}}
   ];
  }

  if(isActive==="true") filter.isActive=true;
  if(isActive==="false") filter.isActive=false;

  const menuSections=await MenuSection.find(filter).sort({order:1,name:1});

  return res.status(200).json(menuSections);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch menu sections",error:error.message});
 }
};

export const getMenuSectionById=async(req,res)=>{
 try{
  const menuSection=await MenuSection.findById(req.params.id);

  if(!menuSection) return res.status(404).json({message:"Menu section not found"});

  return res.status(200).json(menuSection);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch menu section",error:error.message});
 }
};

export const updateMenuSection=async(req,res)=>{
 try{
  const {name,description,order,isActive}=req.body;

  const updateData={};

  if(name!==undefined){
   if(!name.trim()) return res.status(400).json({message:"Name is required"});
   updateData.name=name.trim();
  }

  if(description!==undefined) updateData.description=description?.trim()||"";
  if(order!==undefined) updateData.order=order;
  if(isActive!==undefined) updateData.isActive=isActive;

  const menuSection=await MenuSection.findByIdAndUpdate(
   req.params.id,
   updateData,
   {returnDocument:"after",runValidators:true}
  );

  if(!menuSection) return res.status(404).json({message:"Menu section not found"});

  return res.status(200).json(menuSection);
 }catch(error){
  return res.status(500).json({message:"Failed to update menu section",error:error.message});
 }
};

export const deleteMenuSection=async(req,res)=>{
 try{
  const menuSection=await MenuSection.findByIdAndDelete(req.params.id);

  if(!menuSection) return res.status(404).json({message:"Menu section not found"});

  return res.status(200).json({message:"Menu section deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete menu section",error:error.message});
 }
};