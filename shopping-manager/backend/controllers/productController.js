// /backend/controllers/productController.js
import Product from '../models/productModel.js';
import Country from '../models/locations/countryModel.js';

export const createProduct=async(req,res)=>{
try{
const{name,slug,sku,barcode,description,image,category,brand,unit,defaultStore,countries,tags,size,color,material,modelNumber,price,minPrice,maxPrice,isActive,isFeatured}=req.body;
if(!name||!slug||!category)return res.status(400).json({success:false,message:'Name, slug, and category are required'});
const existing=await Product.findOne({$or:[{slug:slug.trim().toLowerCase()},{sku:sku?.trim()||null},{barcode:barcode?.trim()||null}]});
if(existing)return res.status(409).json({success:false,message:'Product with this slug, sku, or barcode already exists'});
const product=await Product.create({name,slug,sku,barcode,description,image,category,brand,unit,defaultStore,countries,tags,size,color,material,modelNumber,price,minPrice,maxPrice,isActive,isFeatured});
res.status(201).json({success:true,message:'Product created successfully',product});
}catch(error){
res.status(500).json({success:false,message:'Error creating product',error:error.message});
}
};

export const getProducts=async(req,res)=>{
try{
const query={};
if(req.query.category)query.category=req.query.category;
if(req.query.brand)query.brand=req.query.brand;
if(req.query.unit)query.unit=req.query.unit;
if(req.query.defaultStore)query.defaultStore=req.query.defaultStore;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==='true';
if(req.query.isFeatured!==undefined)query.isFeatured=req.query.isFeatured==='true';
const products=await Product.find(query)
.populate('category')
.populate('brand')
.populate('unit')
.populate('defaultStore')
.populate({path:'countries',model:Country})
.sort({createdAt:-1});
res.status(200).json({success:true,count:products.length,products});
}catch(error){
res.status(500).json({success:false,message:'Error fetching products',error:error.message});
}
};

export const getActiveProducts=async(req,res)=>{
try{
const products=await Product.find({isActive:true})
.populate('category')
.populate('brand')
.populate('unit')
.populate('defaultStore')
.populate({path:'countries',model:Country})
.sort({name:1});
res.status(200).json({success:true,count:products.length,products});
}catch(error){
res.status(500).json({success:false,message:'Error fetching active products',error:error.message});
}
};

export const getFeaturedProducts=async(req,res)=>{
try{
const products=await Product.find({isFeatured:true,isActive:true})
.populate('category')
.populate('brand')
.populate('unit')
.populate('defaultStore')
.populate({path:'countries',model:Country})
.sort({createdAt:-1});
res.status(200).json({success:true,count:products.length,products});
}catch(error){
res.status(500).json({success:false,message:'Error fetching featured products',error:error.message});
}
};

export const getProductById=async(req,res)=>{
try{
const product=await Product.findById(req.params.id)
.populate('category')
.populate('brand')
.populate('unit')
.populate('defaultStore')
.populate({path:'countries',model:Country});
if(!product)return res.status(404).json({success:false,message:'Product not found'});
res.status(200).json({success:true,product});
}catch(error){
res.status(500).json({success:false,message:'Error fetching product',error:error.message});
}
};

export const getProductBySlug=async(req,res)=>{
try{
const product=await Product.findOne({slug:req.params.slug.trim().toLowerCase()})
.populate('category')
.populate('brand')
.populate('unit')
.populate('defaultStore')
.populate({path:'countries',model:Country});
if(!product)return res.status(404).json({success:false,message:'Product not found'});
res.status(200).json({success:true,product});
}catch(error){
res.status(500).json({success:false,message:'Error fetching product',error:error.message});
}
};

export const updateProduct=async(req,res)=>{
try{
const{name,slug,sku,barcode,description,image,category,brand,unit,defaultStore,countries,tags,size,color,material,modelNumber,price,minPrice,maxPrice,isActive,isFeatured}=req.body;
const product=await Product.findById(req.params.id);
if(!product)return res.status(404).json({success:false,message:'Product not found'});
if(slug&&slug.trim().toLowerCase()!==product.slug){
const existingSlug=await Product.findOne({slug:slug.trim().toLowerCase(),_id:{$ne:req.params.id}});
if(existingSlug)return res.status(409).json({success:false,message:'Product slug already exists'});
}
if(sku&&sku.trim()!==product.sku){
const existingSku=await Product.findOne({sku:sku.trim(),_id:{$ne:req.params.id}});
if(existingSku)return res.status(409).json({success:false,message:'Product sku already exists'});
}
if(barcode&&barcode.trim()!==product.barcode){
const existingBarcode=await Product.findOne({barcode:barcode.trim(),_id:{$ne:req.params.id}});
if(existingBarcode)return res.status(409).json({success:false,message:'Product barcode already exists'});
}
product.name=name??product.name;
product.slug=slug?slug.trim().toLowerCase():product.slug;
product.sku=sku??product.sku;
product.barcode=barcode??product.barcode;
product.description=description??product.description;
product.image=image??product.image;
product.category=category??product.category;
product.brand=brand!==undefined?brand:product.brand;
product.unit=unit!==undefined?unit:product.unit;
product.defaultStore=defaultStore!==undefined?defaultStore:product.defaultStore;
product.countries=countries??product.countries;
product.tags=tags??product.tags;
product.size=size??product.size;
product.color=color??product.color;
product.material=material??product.material;
product.modelNumber=modelNumber??product.modelNumber;
product.price=price??product.price;
product.minPrice=minPrice??product.minPrice;
product.maxPrice=maxPrice??product.maxPrice;
product.isActive=isActive!==undefined?isActive:product.isActive;
product.isFeatured=isFeatured!==undefined?isFeatured:product.isFeatured;
await product.save();
const updatedProduct=await Product.findById(product._id)
.populate('category')
.populate('brand')
.populate('unit')
.populate('defaultStore')
.populate({path:'countries',model:Country});
res.status(200).json({success:true,message:'Product updated successfully',product:updatedProduct});
}catch(error){
res.status(500).json({success:false,message:'Error updating product',error:error.message});
}
};

export const deleteProduct=async(req,res)=>{
try{
const product=await Product.findById(req.params.id);
if(!product)return res.status(404).json({success:false,message:'Product not found'});
await Product.findByIdAndDelete(req.params.id);
res.status(200).json({success:true,message:'Product deleted successfully'});
}catch(error){
res.status(500).json({success:false,message:'Error deleting product',error:error.message});
}
};