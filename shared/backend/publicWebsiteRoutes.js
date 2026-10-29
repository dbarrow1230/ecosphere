import {Router} from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import {canManagePublicWebsites} from "../public/websiteAccess.js";
import {randomUUID} from "node:crypto";

const requestSchema=new mongoose.Schema({
 appKey:{type:String,required:true,index:true},reference:{type:String,required:true,unique:true},
 customer:{name:{type:String,required:true},email:{type:String,required:true},phone:String},
 items:[{productId:String,name:String,quantity:Number,unitPrice:{type:Number,default:null},configuration:{type:String,default:""}}],
 subtotal:{type:Number,default:null},notes:{type:String,default:""},status:{type:String,enum:["pending","confirmed","completed","cancelled"],default:"pending"}
},{timestamps:true,collection:"public_website_orders"});
const Requests=mongoose.models.PublicWebsiteOrder||mongoose.model("PublicWebsiteOrder",requestSchema);
export const publicMoney=value=>{const number=Number(value?.$numberDecimal??value?.toString?.()??value);return Number.isFinite(number)&&number>0?number:null;};
export function publicProduct(product){
 const fields=["id","name","description","category","price","stock","image","featured","size","ingredients","allergens","storage","code","customizable","includedItems","sharpener","sku"];
 return Object.fromEntries(fields.filter(key=>product[key]!==undefined).map(key=>[key,key==="includedItems"?product[key].map(item=>({name:item.name,quantity:item.quantity})):product[key]]));
}
export function normalizeOrder(payload,catalog){
 const customer=payload?.customer||{};
 const name=typeof customer.name==="string"?customer.name.trim():"",email=typeof customer.email==="string"?customer.email.trim().toLowerCase():"";
 if(!name||name.length>120||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)throw Error("Enter your name and a valid email address.");
 if(!Array.isArray(payload.items)||!payload.items.length||payload.items.length>50)throw Error("Choose between one and fifty products.");
 const products=new Map(catalog.map(product=>[String(product.id),product])),seen=new Set();
 const items=payload.items.map(item=>{
  if(typeof item.productId!=="string"||seen.has(item.productId))throw Error("Check the products in your basket.");seen.add(item.productId);
  const product=products.get(item.productId),quantity=Number(item.quantity);
  if(!product||!Number.isInteger(quantity)||quantity<1||quantity>99)throw Error("A product or quantity is no longer available.");
  if(product.stock!==null&&product.stock!==undefined&&quantity>product.stock)throw Error(`The requested quantity of ${product.name} is unavailable.`);
  const configuration=typeof item.configuration==="string"?item.configuration.trim():"";
  if(configuration.length>3000)throw Error("The product configuration is too long.");
  return {productId:product.id,name:product.name,quantity,unitPrice:product.price,configuration};
 });
 const notes=typeof payload.notes==="string"?payload.notes.trim():"",phone=typeof customer.phone==="string"?customer.phone.trim():"";
 if(notes.length>2000||phone.length>50)throw Error("Your contact details or message are too long.");
 return {customer:{name,email,phone},items,notes,subtotal:items.every(item=>item.unitPrice!==null)?Math.round(items.reduce((sum,item)=>sum+item.quantity*item.unitPrice,0)*100)/100:null};
}

export function createPublicWebsiteRoutes({appKey,catalog=async()=>[],protect,authorize,posts,post,donation,options,orderStore=Requests}){
 const router=Router(),limit=rateLimit({windowMs:15*60*1000,limit:20,standardHeaders:"draft-8",legacyHeaders:false});
 router.get("/products",async(req,res,next)=>{try{res.json((await catalog()).map(publicProduct));}catch(error){next(error);}});
 if(options)router.get("/options",async(req,res,next)=>{try{res.json(await options());}catch(error){next(error);}});
 router.get("/config",(req,res)=>{const value=process.env.PUBLIC_DONATION_URL||"";let donationUrl="";try{if(new URL(value).protocol==="https:")donationUrl=value;}catch{/* No hosted donation page configured. */}res.json({donationUrl});});
 router.post("/orders",limit,async(req,res,next)=>{
  try{
   const products=await catalog();let payload;try{payload=normalizeOrder(req.body,products);}catch(error){return res.status(400).json({message:error.message});}
   const reference=`WEB-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0,8).toUpperCase()}`;
   const row=await orderStore.create({...payload,appKey,reference,status:"pending"});
   res.status(201).json({reference:row.reference,status:row.status,message:"Your order request was received. Availability, final pricing, and payment will be confirmed. No payment has been taken."});
  }catch(error){next(error);}
 });
 if(protect)router.get("/orders",protect,authorize||((req,res,next)=>canManagePublicWebsites(req.user)?next():res.status(403).json({message:"Owner or administrator access is required."})),async(req,res,next)=>{try{res.json(await orderStore.find({appKey}).sort({createdAt:-1}).limit(200).lean());}catch(error){next(error);}});
 if(posts)router.get("/posts",async(req,res,next)=>{try{res.json(await posts());}catch(error){next(error);}});
 if(post)router.get("/posts/:slug",async(req,res,next)=>{try{const row=await post(req.params.slug);if(!row)return res.status(404).json({message:"Article not found."});res.json(row);}catch(error){next(error);}});
 if(donation)router.post("/donations",limit,async(req,res,next)=>{
  const {name,email,amount,frequency,message}=req.body||{};const value=Number(amount);
  if(typeof name!=="string"||!name.trim()||name.length>120||typeof email!=="string"||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!Number.isFinite(value)||value<1||value>100000||!["one-time","recurring"].includes(frequency)||typeof message!=="string"||message.length>2000)return res.status(400).json({message:"Enter valid donor details, an amount, and a giving frequency."});
  try{const row=await donation({name:name.trim(),email:email.trim().toLowerCase(),amount:Math.round(value*100)/100,frequency,message});res.status(201).json({reference:String(row._id),status:"pending",message:"Your pledge was recorded. No payment has been collected."});}catch(error){next(error);}
 });
 return router;
}
