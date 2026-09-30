// backend/controllers/product/productController.js
import "../../models/pricing/containerTypeModel.js";
import {Product} from "../../models/product/productModel.js";

const buildQuery=query=>{
 const q={};

 if(query.preservationProject)
 {
  q.preservationProject=query.preservationProject;
 }

 if(query.category)
 {
  q.category=query.category;
 }

 if(query.subcategory)
 {
  q.subcategory=query.subcategory;
 }

 if(query.isActive!==undefined)
 {
  q["sellingControls.isActive"]=query.isActive==="true";
 }

 if(query.availableOnline!==undefined)
 {
  q["sellingControls.availableOnline"]=query.availableOnline==="true";
 }

 if(query.availableInStore!==undefined)
 {
  q["sellingControls.availableInStore"]=query.availableInStore==="true";
 }

 if(query.featured!==undefined)
 {
  q["sellingControls.featured"]=query.featured==="true";
 }

 if(query.search)
 {
  q.$or=[
   {name:{$regex:query.search,$options:"i"}},
   {sku:{$regex:query.search,$options:"i"}},
   {slug:{$regex:query.search,$options:"i"}},
   {shortDescription:{$regex:query.search,$options:"i"}},
   {longDescription:{$regex:query.search,$options:"i"}}
  ];
 }

 return q;
};

export const getProducts=async(req,res)=>{
 try
 {
  const query=buildQuery(req.query);

  const products=await Product.find(query)
   .populate("preservationProject")
   .populate("packagingDefaults.containerType")
   .sort({name:1});

  return res.status(200).json({success:true,count:products.length,data:products});
 }
 catch(err)
 {
  return res.status(500).json({success:false,message:err.message||"Failed to fetch products"});
 }
};

export const getProductById=async(req,res)=>{
 try
 {
  const product=await Product.findById(req.params.id)
   .populate("preservationProject")
   .populate("packagingDefaults.containerType");

  if(!product)
  {
   return res.status(404).json({success:false,message:"Product not found"});
  }

  return res.status(200).json({success:true,data:product});
 }
 catch(err)
 {
  return res.status(500).json({success:false,message:err.message||"Failed to fetch product"});
 }
};

export const createProduct=async(req,res)=>{
 try
 {
  const product=await Product.create(req.body);

  const populated=await Product.findById(product._id)
   .populate("preservationProject")
   .populate("packagingDefaults.containerType");

  return res.status(201).json({success:true,message:"Product created",data:populated});
 }
 catch(err)
 {
  return res.status(400).json({success:false,message:err.message||"Failed to create product"});
 }
};

export const updateProduct=async(req,res)=>{
 try
 {
  const product=await Product.findByIdAndUpdate(
   req.params.id,
   req.body,
   {returnDocument:"after",runValidators:true}
  )
   .populate("preservationProject")
   .populate("packagingDefaults.containerType");

  if(!product)
  {
   return res.status(404).json({success:false,message:"Product not found"});
  }

  return res.status(200).json({success:true,message:"Product updated",data:product});
 }
 catch(err)
 {
  return res.status(400).json({success:false,message:err.message||"Failed to update product"});
 }
};

export const deleteProduct=async(req,res)=>{
 try
 {
  const product=await Product.findByIdAndDelete(req.params.id);

  if(!product)
  {
   return res.status(404).json({success:false,message:"Product not found"});
  }

  return res.status(200).json({success:true,message:"Product deleted"});
 }
 catch(err)
 {
  return res.status(500).json({success:false,message:err.message||"Failed to delete product"});
 }
};
