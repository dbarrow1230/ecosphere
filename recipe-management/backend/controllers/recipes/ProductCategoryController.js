import ProductCategory from '../../models/recipes/ProductCategoryModel.js';
import mongoose from 'mongoose';
const key=name=>String(name||'').trim().toLocaleLowerCase();
const slug=name=>key(name).replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-');
const parents=record=>record.parents?.length?record.parents:[record.parent||null];
async function validateParent(parent,categoryId){
 if(!parent)return null;if(!mongoose.isValidObjectId(parent))throw Error('Choose a valid parent category.');
 const queue=[String(parent)],seen=new Set();while(queue.length){const id=queue.pop();if(id===String(categoryId))throw Error('A category cannot be linked beneath itself or its descendants.');if(seen.has(id))continue;seen.add(id);const record=await ProductCategory.findById(id);if(!record||record.isActive===false)throw Error('Parent category is unavailable.');queue.push(...parents(record).filter(Boolean).map(String));}return parent;
}
const fail=(res,error)=>res.status(error.code===11000?409:400).json({message:error.code===11000?'Category name or code already exists.':error.message});
export const createProductCategory=async(req,res)=>{try{
 const name=String(req.body.name||'').trim();if(!name)throw Error('Category name is required.');
 let record=await ProductCategory.findOne({nameKey:key(name)});
 const requested=req.body.parents||[req.body.parent||null];if(!Array.isArray(requested)||!requested.length)throw Error("Choose at least one parent link.");const requestedParents=[];for(const value of requested)requestedParents.push(await validateParent(value,record?._id));const parent=requestedParents[0];
 if(record){const links=parents(record);for(const value of requestedParents)if(!links.some(item=>String(item||'')===String(value||'')))links.push(value);record.parents=links;record.isActive=true;await record.save();}
 else record=await ProductCategory.create({name,nameKey:key(name),slug:slug(req.body.slug||name),parent,parents:requestedParents,description:req.body.description||'',code:req.body.code||undefined,isActive:true});
 res.status(201).json({productCategory:record});
}catch(error){fail(res,error);}};
export const getProductCategories=async(req,res)=>{try{res.json(await ProductCategory.find({isActive:{$ne:false}}).sort({name:1}));}catch(error){fail(res,error);}};
export const getProductCategoryById=async(req,res)=>{try{const record=await ProductCategory.findById(req.params.id);if(!record)return res.status(404).json({message:'Category not found.'});res.json(record);}catch(error){fail(res,error);}};
export const updateProductCategory=async(req,res)=>{try{
 const record=await ProductCategory.findById(req.params.id);if(!record)return res.status(404).json({message:'Category not found.'});
 if(req.body.name!==undefined){const name=String(req.body.name).trim();if(!name)throw Error('Category name is required.');record.name=name;record.nameKey=key(name);record.slug=slug(req.body.slug||name);}
 if(req.body.parents!==undefined){if(!Array.isArray(req.body.parents)||!req.body.parents.length)throw Error('Select at least one parent or main category.');const links=[];for(const value of req.body.parents){const parent=await validateParent(value,record._id);if(!links.some(item=>String(item||'')===String(parent||'')))links.push(parent);}record.parents=links;record.parent=links[0];}
 else if(Object.hasOwn(req.body,'parent')){const parent=await validateParent(req.body.parent,record._id),links=parents(record);if(!links.some(value=>String(value||'')===String(parent||'')))links.push(parent);record.parents=links;}
 for(const field of ['description','isActive'])if(req.body[field]!==undefined)record[field]=req.body[field];await record.save();res.json({productCategory:record});
}catch(error){fail(res,error);}};
export const deleteProductCategory=async(req,res)=>{try{
 if(await ProductCategory.exists({$or:[{parent:req.params.id},{parents:req.params.id}]}))throw Error('Remove child links before deleting this category.');
 const linked=await ProductCategory.db.collection('vendor_ingredient_prices').findOne({$or:[{productCategory:new mongoose.Types.ObjectId(req.params.id)},{productCategoryPath:new mongoose.Types.ObjectId(req.params.id)}]});if(linked)throw Error('This category is assigned to products.');
 const record=await ProductCategory.findByIdAndDelete(req.params.id);if(!record)return res.status(404).json({message:'Category not found.'});res.json({message:'Category deleted.'});
}catch(error){fail(res,error);}};
