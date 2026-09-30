// backend/controllers/products/productsController.js
import mongoose from "mongoose";
import Product from "../../models/products/productsModel.js";
import Category from "../../models/reference/categoryModel.js";
import Status from "../../models/reference/statusModel.js";
import Costing from "../../models/costings/costingsModel.js";
import {parseProductDetails,applyProductDetailsEdits} from "../../utils/parseProductDetails.js";
import {makeSku,buildBarcodeData} from "../../../shared/productIdentifiers.js";

const makeSlug=value=>String(value||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)+/g,"");

const toDecimal=value=>{
 if(value===undefined||value===null||value==="")return null;
 return mongoose.Types.Decimal128.fromString(String(value));
};

const validateFields=async body=>{
 if(body.name!==undefined&&(typeof body.name!=="string"||!body.name.trim()))return "Name is required";
 for(const field of ["price","compareAtPrice","cost","markupPercent","quantity"]){
  const value=body[field];
  if(value===undefined||value===null||value==="")continue;
  if(!["string","number"].includes(typeof value)||!Number.isFinite(Number(value))||Number(value)<0)return field+" must be a non-negative number";
  if(field==="quantity"&&!Number.isInteger(Number(value)))return "Quantity must be a whole number";
 }
 for(const [field,Model] of [["category",Category],["status",Status],["costingRef",Costing]]){
  if(body[field]===undefined||(field==="costingRef"&&!body[field]))continue;
  if(!mongoose.Types.ObjectId.isValid(body[field]))return "Invalid "+field+" id";
  if(!await Model.exists({_id:body[field]}))return field+" was not found";
 }
 for(const field of ["image","gallery","notes"]){
  if(body[field]!==undefined&&(!Array.isArray(body[field])||body[field].some(v=>typeof v!=="string")))return field+" must be an array of text values";
 }
 if(body.detailsText!==undefined&&(typeof body.detailsText!=="string"||body.detailsText.length>500000))return "Product details must be text under 500,000 characters";
 if(body.detailsSections!==undefined&&(!Array.isArray(body.detailsSections)||typeof body.detailsText!=="string"||body.detailsSections.length>1000||body.detailsSections.some(section=>typeof section?.title!=="string"||typeof section?.content!=="string"||section.content.length>500000)))return "Invalid parsed product sections";
 return "";
};

export const previewProductDetails=(req,res)=>{
 if(typeof req.body?.detailsText!=="string"||req.body.detailsText.length>500000)return res.status(400).json({success:false,message:"Product details must be text under 500,000 characters"});
 return res.json({success:true,details:parseProductDetails(req.body.detailsText)});
};

const formatProduct=doc=>{
 const item=doc?.toObject?doc.toObject():doc;
 if(!item)return item;
 const price=item.price!=null?item.price.toString():"0";
 const sku=makeSku(item.name,price);
 const barcodeData=buildBarcodeData(item.name,price);
 return{
  ...item,
  price,
  sku,
  barcode:barcodeData,
  barcodeData,
  compareAtPrice:item.compareAtPrice!=null?item.compareAtPrice.toString():"",
  cost:item.cost!=null?item.cost.toString():"",
  markupPercent:item.markupPercent!=null?item.markupPercent.toString():""
 };
};

const productPopulate=[
 {path:"category",model:Category,select:"name slug"},
 {path:"status",model:Status,select:"name code color isDefault"},
 {path:"costingRef",model:Costing}
];

// Older catalog records store status codes. Resolve them for display without migrating data.
const populateProducts=async docs=>{
 const rows=Array.isArray(docs)?docs:[docs];
 const legacyRows=rows.filter(item=>item&&typeof item.status==="string"&&!mongoose.Types.ObjectId.isValid(item.status));
 const legacyLabels=new Map();
 if(legacyRows.length){
  const statuses=await Status.find().lean();
  for(const item of legacyRows){
   const code=item.status.trim().toLowerCase();
   const status=statuses.find(value=>value.code===code||value.name?.toLowerCase()===code);
   if(!status)legacyLabels.set(String(item._id),item.status);
   item.status=status?status._id:null;
  }
 }
 const populated=await Product.populate(rows.filter(Boolean),productPopulate);
 for(const item of populated){
  const legacyLabel=legacyLabels.get(String(item._id));
  if(legacyLabel)item.status={name:legacyLabel,code:legacyLabel};
 }
 return Array.isArray(docs)?populated:populated[0]||null;
};

export const createProduct=async(req,res)=>{
 try{
  const validation=await validateFields(req.body);
  if(validation)return res.status(400).json({success:false,message:validation});
  const{
   name,slug,description,shortDescription,category,price,compareAtPrice,cost,
   quantity,image,gallery,featured,notes,status,
   costingRef,priceFromCosting,markupPercent,detailsText,detailsSections
  }=req.body;

  if(!name)return res.status(400).json({success:false,message:"Name is required"});
  if(!category)return res.status(400).json({success:false,message:"Category is required"});
  if(!mongoose.Types.ObjectId.isValid(category))return res.status(400).json({success:false,message:"Invalid category id"});
  if(costingRef&& !mongoose.Types.ObjectId.isValid(costingRef))return res.status(400).json({success:false,message:"Invalid costing reference id"});
  if(!status)return res.status(400).json({success:false,message:"Status is required"});
  if(!mongoose.Types.ObjectId.isValid(status))return res.status(400).json({success:false,message:"Invalid status id"});

  let finalCost=cost!==undefined&&cost!==null&&cost!==""?Number(cost):0;
  let finalPrice=price!==undefined&&price!==null&&price!==""?Number(price):0;

  if(priceFromCosting){
   const markup=Number(markupPercent||0);
   finalPrice=finalCost+(finalCost*(markup/100));
  }

  const parsedDetails=detailsSections?applyProductDetailsEdits(detailsText,detailsSections):parseProductDetails(detailsText);
  const finalSku=makeSku(name,finalPrice);
  const barcodeData=buildBarcodeData(name,finalPrice);

  const newProduct=new Product({
   name:name.trim(),
   slug:slug&&String(slug).trim()?makeSlug(slug):makeSlug(name),
   description:description||parsedDetails.description||"",
   shortDescription:shortDescription||parsedDetails.introduction.slice(0,250)||"",
   category,
   price:mongoose.Types.Decimal128.fromString(String(finalPrice)),
   compareAtPrice:toDecimal(compareAtPrice),
   cost:cost===undefined||cost===null||cost===""?null:toDecimal(finalCost),
   costingRef:costingRef||null,
   priceFromCosting:Boolean(priceFromCosting),
   markupPercent:toDecimal(markupPercent),
   sku:finalSku,
   barcode:barcodeData,
   barcodeData,
   quantity:Number(quantity||0),
   image:Array.isArray(image)?image.filter(Boolean):[],
   gallery:Array.isArray(gallery)?gallery.filter(Boolean):[],
   featured:Boolean(featured),
   notes:Array.isArray(notes)?notes.filter(Boolean):[],
   details:parsedDetails,
   status
  });

  const saved=await newProduct.save();
  const populated=await Product.findById(saved._id).populate(productPopulate);

  return res.status(201).json({success:true,message:"Product created successfully",product:formatProduct(populated)});
 }catch(error){
  if(error.code===11000){
   const field=Object.keys(error.keyPattern||{})[0]||"field";
   return res.status(409).json({success:false,message:`${field} already exists`});
  }
  return res.status(error.name==="ValidationError"||error.name==="CastError"?400:500).json({success:false,message:error.name==="ValidationError"?error.message:"Error creating product",error:error.message});
 }
};

export const getProducts=async(req,res)=>{
 try{
  const{status,featured,category,search}=req.query;
  const query={};

  if(status){
   if(!mongoose.Types.ObjectId.isValid(status))return res.status(400).json({success:false,message:"Invalid status id"});
   const selectedStatus=await Status.findById(status).lean();
   const statusValues=[new mongoose.Types.ObjectId(status),status];
   if(selectedStatus)statusValues.push(selectedStatus.code,selectedStatus.name);
   query.$expr={$in:["$status",statusValues]};
  }
  if(featured!==undefined)query.featured=String(featured)==="true";
  if(category&&mongoose.Types.ObjectId.isValid(category))query.category=category;
  const searchText=String(search||"").trim().toLowerCase();
  const products=await populateProducts(await Product.find(query).sort({createdAt:-1}).lean());
  const matching=searchText?products.filter(item=>[
   item.name,item.slug,item.sku,item.barcode,item.barcodeData,
   makeSku(item.name,item.price?.toString())
  ].some(value=>String(value||"").toLowerCase().includes(searchText))):products;
  return res.status(200).json({success:true,count:matching.length,products:matching.map(formatProduct)});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching products",error:error.message});
 }
};

export const getProductById=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid product id"});

  const product=await populateProducts(await Product.findById(id).lean());
  if(!product)return res.status(404).json({success:false,message:"Product not found"});

  return res.status(200).json({success:true,product:formatProduct(product)});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching product",error:error.message});
 }
};

export const updateProduct=async(req,res)=>{
 try{
  const validation=await validateFields(req.body);
  if(validation)return res.status(400).json({success:false,message:validation});
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid product id"});

  const existingProduct=await Product.findById(id);
  if(!existingProduct)return res.status(404).json({success:false,message:"Product not found"});

  const{
   name,slug,description,shortDescription,category,price,compareAtPrice,cost,
   quantity,image,gallery,featured,notes,status,
   costingRef,priceFromCosting,markupPercent,detailsText,detailsSections
  }=req.body;

  const updateData={};

  let finalCost=cost!==undefined?Number(cost||0):existingProduct.cost!=null?Number(existingProduct.cost.toString()):0;
  let finalPrice=price!==undefined&&price!==null&&price!==""?Number(price):existingProduct.price!=null?Number(existingProduct.price.toString()):0;
  const usePriceFromCosting=priceFromCosting!==undefined?Boolean(priceFromCosting):existingProduct.priceFromCosting;
  const finalMarkupPercent=markupPercent!==undefined&&markupPercent!==null&&markupPercent!==""?Number(markupPercent):existingProduct.markupPercent!=null?Number(existingProduct.markupPercent.toString()):0;

  if(usePriceFromCosting){
   finalPrice=finalCost+(finalCost*(finalMarkupPercent/100));
  }

  if(name!==undefined)updateData.name=String(name).trim();
  if(slug!==undefined)updateData.slug=String(slug).trim()?makeSlug(slug):makeSlug(name??existingProduct.name);
  if(name!==undefined&&slug===undefined)updateData.slug=makeSlug(name);
  if(description!==undefined)updateData.description=description;
  if(shortDescription!==undefined)updateData.shortDescription=shortDescription;

  if(category!==undefined){
   if(!mongoose.Types.ObjectId.isValid(category))return res.status(400).json({success:false,message:"Invalid category id"});
   updateData.category=category;
  }

  if(price!==undefined||cost!==undefined||priceFromCosting!==undefined||markupPercent!==undefined){
   updateData.price=mongoose.Types.Decimal128.fromString(String(finalPrice));
   updateData.cost=cost===""||cost===null?null:toDecimal(finalCost);
   updateData.priceFromCosting=usePriceFromCosting;
   updateData.markupPercent=toDecimal(finalMarkupPercent);
  }

  if(compareAtPrice!==undefined)updateData.compareAtPrice=toDecimal(compareAtPrice);

  if(costingRef!==undefined){
   if(costingRef!==null&&costingRef!==""&&!mongoose.Types.ObjectId.isValid(costingRef))return res.status(400).json({success:false,message:"Invalid costing reference id"});
   updateData.costingRef=costingRef||null;
  }

  const barcodeName=name!==undefined?String(name).trim():existingProduct.name;
  const finalSku=makeSku(barcodeName,finalPrice);
  const barcodeData=buildBarcodeData(barcodeName,finalPrice);

  updateData.sku=finalSku;
  updateData.barcodeData=barcodeData;
  updateData.barcode=barcodeData;

  if(quantity!==undefined)updateData.quantity=Number(quantity||0);
  if(image!==undefined)updateData.image=Array.isArray(image)?image.filter(Boolean):[];
  if(gallery!==undefined)updateData.gallery=Array.isArray(gallery)?gallery.filter(Boolean):[];
  if(featured!==undefined)updateData.featured=Boolean(featured);
  if(notes!==undefined)updateData.notes=Array.isArray(notes)?notes.filter(Boolean):[];
  if(detailsText!==undefined)updateData.details=detailsSections?applyProductDetailsEdits(detailsText,detailsSections):parseProductDetails(detailsText);
  if(status!==undefined){
   if(!mongoose.Types.ObjectId.isValid(status))return res.status(400).json({success:false,message:"Invalid status id"});
   updateData.status=status;
  }

  const product=await Product.findByIdAndUpdate(id,updateData,{returnDocument:"after",runValidators:true}).populate(productPopulate);

  return res.status(200).json({success:true,message:"Product updated successfully",product:formatProduct(product)});
 }catch(error){
  if(error.code===11000){
   const field=Object.keys(error.keyPattern||{})[0]||"field";
   return res.status(409).json({success:false,message:`${field} already exists`});
  }
  return res.status(error.name==="ValidationError"||error.name==="CastError"?400:500).json({success:false,message:error.name==="ValidationError"?error.message:"Error updating product",error:error.message});
 }
};

export const deleteProduct=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid product id"});

  const product=await Product.findByIdAndDelete(id);
  if(!product)return res.status(404).json({success:false,message:"Product not found"});

  return res.status(200).json({success:true,message:"Product deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Error deleting product",error:error.message});
 }
};
