import jwt from "jsonwebtoken";

// Authentication adapter: confirm claim names with the existing EcoSphere token issuer before enabling access.
export function requireBusinessAuth(req,res,next){
 const token=req.headers.authorization?.startsWith("Bearer ")?req.headers.authorization.slice(7):null;
 if(!token||!process.env.JWT_SECRET||!process.env.JWT_ISSUER||!process.env.JWT_AUDIENCE)return res.status(401).json({error:"Authorized EcoSphere session required"});
 try{
  const claims=jwt.verify(token,process.env.JWT_SECRET,{algorithms:["HS256"],issuer:process.env.JWT_ISSUER,audience:process.env.JWT_AUDIENCE});
  const business=claims.businessKey;
  const roles=Array.isArray(claims.roles)?claims.roles:[];
  if(business!=="BATS"||!roles.some(role=>["BATS-Management","BATS-Administrators","BATS-Accounting","BATS-ClientServices"].includes(role)))return res.status(403).json({error:"BATS access required"});
  req.actor={id:claims.sub,roles};next();
 }catch{return res.status(401).json({error:"Invalid or expired session"});}
}
