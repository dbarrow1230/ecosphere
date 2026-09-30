// backend/models/users/userRoleAssignmentModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";
import Role from "./userRolesModel.js";

const userRoleAssignmentSchema=new mongoose.Schema(
{
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true},
 role:{type:mongoose.Schema.Types.ObjectId,ref:"Role",required:true},
 isActive:{type:Boolean,default:true}
},
{timestamps:true,collection:"user_role_assignments"}
);

userRoleAssignmentSchema.index({user:1,business:1,role:1},{unique:true});

userRoleAssignmentSchema.pre("validate",async function(next){
 if(!this.role||!this.business)
 {
  return next();
 }

 const roleDoc=await Role.findById(this.role).select("business").lean();
 if(!roleDoc)
 {
  return next(new Error("Invalid role."));
 }

 if(String(roleDoc.business)!==String(this.business))
 {
  return next(new Error("Role does not belong to the selected business."));
 }

 next();
});

const UserRoleAssignment=businessInfoConnection.models.UserRoleAssignment||businessInfoConnection.model("UserRoleAssignment",userRoleAssignmentSchema);

export default UserRoleAssignment;