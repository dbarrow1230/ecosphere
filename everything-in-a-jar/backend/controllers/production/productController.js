import mongoose from "mongoose";
import Product from "../../models/production/productModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

const buildQuery=queryParams=>{
 const {business_id,productType,status,isActive,search}=queryParams;
 const query={};

 if(business_id){
  if(!isValidObjectId(business_id))return {error:"Invalid business_id"};
  query.business_id=business_id;
 }

 if(productType)query.productType=productType;
 if(status)query.status=status;
 if(isActive!==undefined)query.isActive=String(isActive)==="true";
 if(search){
  query.$or=[
   {productName:{$regex:search,$options:"i"}},
   {sku:{$regex:search,$options:"i"}},
   {description:{$regex:search,$options:"i"}}
  ];
 }

 return {query};
};

export const createProduct=async(req,res)=>{
 try{
  const item=await Product.create(req.body);
  return res.status(201).json({success:true,message:"Product created successfully",data:item});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"Duplicate product",error:error.message});
  return res.status(500).json({success:false,message:"Failed to create product",error:error.message});
 }
};

export const getProducts=async(req,res)=>{
 try{
  const {page=1,limit=20,sortBy="productName",sortOrder="asc"}=req.query;
  const built=buildQuery(req.query);
  if(built.error)return res.status(400).json({success:false,message:built.error});

  const pageNum=Math.max(parseInt(page,10)||1,1);
  const limitNum=Math.max(parseInt(limit,10)||20,1);
  const skip=(pageNum-1)*limitNum;
  const sort={[sortBy]:sortOrder==="asc"?1:-1};

  const [items,total]=await Promise.all([
   Product.find(built.query)
    .populate("business_id")
    .populate("recipeRef")
    .populate("categoryRef")
    .sort(sort)
    .skip(skip)
    .limit(limitNum),
   Product.countDocuments(built.query)
  ]);

  return res.status(200).json({success:true,count:items.length,total,page:pageNum,pages:Math.ceil(total/limitNum),data:items});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch products",error:error.message});
 }
};

export const getProductById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id))return res.status(400).json({success:false,message:"Invalid product id"});

  const item=await Product.findById(id).populate("business_id").populate("recipeRef").populate("categoryRef");
  if(!item)return res.status(404).json({success:false,message:"Product not found"});

  return res.status(200).json({success:true,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch product",error:error.message});
 }
};

export const updateProduct=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id))return res.status(400).json({success:false,message:"Invalid product id"});

  const item=await Product.findByIdAndUpdate(id,req.body,{returnDocument:"after",runValidators:true})
   .populate("business_id")
   .populate("recipeRef")
   .populate("categoryRef");

  if(!item)return res.status(404).json({success:false,message:"Product not found"});
  return res.status(200).json({success:true,message:"Product updated successfully",data:item});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"Duplicate product",error:error.message});
  return res.status(500).json({success:false,message:"Failed to update product",error:error.message});
 }
};

export const deleteProduct=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id))return res.status(400).json({success:false,message:"Invalid product id"});

  const item=await Product.findByIdAndDelete(id);
  if(!item)return res.status(404).json({success:false,message:"Product not found"});

  return res.status(200).json({success:true,message:"Product deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete product",error:error.message});
 }
};
