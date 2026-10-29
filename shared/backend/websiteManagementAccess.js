import {canManagePublicWebsites} from "../public/websiteAccess.js";
export function websiteManagementAccess(RoleAssignment){return async(req,res,next)=>{
 try{
  if(canManagePublicWebsites(req.user))return next();
  const assignments=await RoleAssignment.find({user:req.user._id,isActive:true}).select("role isActive").populate("role","name code").lean();
  if(canManagePublicWebsites({...req.user.toObject?.()||req.user,roleAssignments:assignments}))return next();
  return res.status(403).json({message:"Owner or administrator access is required."});
 }catch{return res.status(503).json({message:"Website management permissions could not be verified."});}
};}
