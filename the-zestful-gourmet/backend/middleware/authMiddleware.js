import jwt from "jsonwebtoken";
import User from "../models/users/userModel.js";

export const protect=async(req,res,next)=>{
 try{
  let token;

  if(req.headers.authorization&&req.headers.authorization.startsWith("Bearer "))
  {
   token=req.headers.authorization.split(" ")[1].trim();
  }

  if(!token&&req.cookies?.token)
  {
   token=String(req.cookies.token).trim();
  }

  if(!token)
  {
   return res.status(401).json({success:false,message:"Unauthorized, no token"});
  }

  if((token.startsWith('"')&&token.endsWith('"'))||(token.startsWith("'")&&token.endsWith("'")))
  {
   token=token.slice(1,-1).trim();
  }

  const decoded=jwt.verify(token,process.env.JWT_SECRET);

  const user=await User.findById(decoded.id).select("-password");

  if(!user)
  {
   return res.status(401).json({success:false,message:"Unauthorized, user not found"});
  }

  req.user=user;
  next();
 }
 catch(error){
  return res.status(401).json({success:false,message:"Unauthorized, token failed",error:error.message});
 }
};

export const optionalProtect=async(req,res,next)=>{
 try{
  let token;

  if(req.headers.authorization&&req.headers.authorization.startsWith("Bearer "))
  {
   token=req.headers.authorization.split(" ")[1].trim();
  }

  if(!token&&req.cookies?.token)
  {
   token=String(req.cookies.token).trim();
  }

  if(!token)
  {
   req.user=null;
   return next();
  }

  if((token.startsWith('"')&&token.endsWith('"'))||(token.startsWith("'")&&token.endsWith("'")))
  {
   token=token.slice(1,-1).trim();
  }

  const decoded=jwt.verify(token,process.env.JWT_SECRET);

  const user=await User.findById(decoded.id).select("-password");

  req.user=user||null;
  next();
 }
 catch(error){
  req.user=null;
  next();
 }
};