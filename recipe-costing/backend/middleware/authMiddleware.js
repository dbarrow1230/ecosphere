// backend/middleware/authMiddleware.js
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
  const userId=decoded.id||decoded._id;

  if(!userId)
  {
   return res.status(401).json({success:false,message:"Unauthorized, invalid token"});
  }

  const user=await User.findById(userId).select("-password");

  if(!user)
  {
   return res.status(401).json({success:false,message:"Unauthorized, user not found"});
  }

  if(user.isActive===false)
  {
   return res.status(403).json({success:false,message:"User account is inactive"});
  }

  req.user=user;
  req.userId=String(user._id);

  next();
 }
 catch(error){
  return res.status(401).json({
   success:false,
   message:"Unauthorized, token failed",
   error:error.message
  });
 }
};