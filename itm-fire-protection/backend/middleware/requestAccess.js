import AppKey from "../models/reference/appKeyModel.js";
import Role from "../models/users/userRolesModel.js";
import UserRoleAssignment from "../models/users/userRoleAssignmentModel.js";
import UserDepartmentAssignment from "../models/users/userDepartmentAssignmentModel.js";

// Restrict the new request inbox without changing any existing login or admin routes.
export const requestAccess=async(req,res,next)=>{
 try{
  if(!req.user?.isActive)return res.status(403).json({message:"An active staff account is required."});
  // Existing application owner exception used by Navigation and Admin Dashboard.
  if(String(req.user._id)==="69af088d21b4580a8cb6614b")return next();
  const appKey=await AppKey.findOne({appKey:"itm-fire-protection",isActive:true}).lean();
  if(!appKey?.businessRef)return res.status(403).json({message:"ITM business access is not configured."});
  const business=appKey.businessRef;
  const [assignments,departments]=await Promise.all([
   UserRoleAssignment.find({user:req.user._id,business,isActive:true}).lean(),
   UserDepartmentAssignment.find({user:req.user._id,business,isActive:true}).populate("department").lean()
  ]);
  const roleIds=[req.user.role,...assignments.map(row=>row.role),...departments.filter(row=>row.department?.isActive!==false).map(row=>row.role||row.department?.defaultRole)].filter(Boolean);
  const allowed=await Role.exists({_id:{$in:roleIds},business,isActive:true,name:{$in:["owner","business owner","app owner","super admin","admin","administrator","manager"]}});
  return allowed?next():res.status(403).json({message:"ITM staff access is required to review customer requests."});
 }catch{return res.status(500).json({message:"Unable to verify request access."});}
};
