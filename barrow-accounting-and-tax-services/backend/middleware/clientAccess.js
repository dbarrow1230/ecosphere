import Role from "../models/users/userRolesModel.js";
import RoleAssignment from "../models/users/userRoleAssignmentModel.js";
import AppKey from "../models/reference/appKeyModel.js";

export async function clientAccess(req,res,next){
 try{
  if(req.user.isActive===false)return res.status(403).json({message:"This account is inactive."});
  // Same global owner account recognized by the existing EcoSphere navigation.
  let owner=String(req.user._id)==="69af088d21b4580a8cb6614b";
  if(!owner){
   const app=await AppKey.findOne({appKey:"barrow-accounting-tax-services",isActive:true}).select("businessRef").lean();
   if(app?.businessRef){
    const roles=await Role.find({business:app.businessRef,isActive:{$ne:false},name:{$in:["owner","business owner","app owner"]}}).select("_id").lean();
    owner=Boolean(await RoleAssignment.exists({user:req.user._id,business:app.businessRef,isActive:true,role:{$in:roles.map(role=>role._id)}}));
   }
  }
  req.canManageAllClients=owner;
  next();
 }catch(error){next(error);}
}
