import express from "express";
import process from "node:process";
import {readFileSync} from "node:fs";
import {protect} from "../middleware/authMiddleware.js";
const runtime=JSON.parse(readFileSync(new URL("../../../app-runtime-config.json",import.meta.url),"utf8"));
const base=process.env.BOOK_MANAGEMENT_API_URL||`http://${runtime.host}:${runtime.backends["book-management"]}`;
const router=express.Router();
router.use(protect);
// Book Management remains the source of truth; catalog records are never copied locally.
router.all(["/:resource","/:resource/:id"],async(req,res)=>{
 const {resource,id}=req.params;
 if(!["publishers","genres","categories","books"].includes(resource)||!["GET","POST","PUT"].includes(req.method)||resource==="books"&&req.method!=="GET")return res.sendStatus(404);
 if(id&&!/^[a-f0-9]{24}$/i.test(id))return res.status(400).json({message:"Invalid catalog ID."});
 try{
  const url=new URL(`/api/${resource}${id?`/${id}`:""}`,base);
  url.search=new URL(req.originalUrl,"http://localhost").search;
  const response=await fetch(url,{method:req.method,headers:{"Content-Type":"application/json",...(req.headers.authorization?{Authorization:req.headers.authorization}:{})},...(req.method!=="GET"?{body:JSON.stringify(req.body)}:{}),signal:AbortSignal.timeout(15000)});
  const data=await response.json();res.status(response.status).json(data);
 }catch{
  res.status(503).json({message:"The publisher catalog is temporarily unavailable. Please retry the connection."});
 }
});
export default router;
