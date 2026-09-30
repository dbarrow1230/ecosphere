import BlogCategory from "../models/blogCategoryModel.js";

const slugify=value=>String(value||"").trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

export const getCategories=async(req,res,next)=>{try{res.json(await BlogCategory.find(req.query.all==="true"?{}:{isActive:true}).sort({name:1}));}catch(error){next(error);}};
export const createCategory=async(req,res,next)=>{try{const name=String(req.body.name||"").trim();if(!name)return res.status(400).json({message:"Category name is required."});const category=await BlogCategory.create({name,slug:slugify(req.body.slug||name),description:req.body.description||"",isActive:req.body.isActive!==false});res.status(201).json(category);}catch(error){next(error);}};
export const updateCategory=async(req,res,next)=>{try{const category=await BlogCategory.findById(req.params.id);if(!category)return res.status(404).json({message:"Category not found."});for(const field of ["name","description","isActive"])if(req.body[field]!==undefined)category[field]=req.body[field];if(req.body.slug||req.body.name)category.slug=slugify(req.body.slug||req.body.name);res.json(await category.save());}catch(error){next(error);}};
export const deleteCategory=async(req,res,next)=>{try{const category=await BlogCategory.findById(req.params.id);if(!category)return res.status(404).json({message:"Category not found."});category.isActive=false;res.json(await category.save());}catch(error){next(error);}};
