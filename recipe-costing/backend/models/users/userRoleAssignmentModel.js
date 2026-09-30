// backend/models/users/userRoleAssignmentModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";
import Role from "./roleModel.js";

const userRoleAssignmentSchema=new mongoose.Schema(
{
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 role:{type:mongoose.Schema.Types.ObjectId,ref:"Role",required:true,index:true},
 isPrimary:{type:Boolean,default:true},
 isActive:{type:Boolean,default:true}
},
{timestamps:true,collection:"user_role_assignments"}
);

userRoleAssignmentSchema.index({user:1,business:1},{unique:true});
userRoleAssignmentSchema.index({business:1,role:1});
userRoleAssignmentSchema.index({user:1,isActive:1});

userRoleAssignmentSchema.pre("validate",async function(){
 if(!this.role||!this.business)return;

 const roleDoc=await Role.findById(this.role).select("business").lean();

 if(!roleDoc)throw new Error("Invalid role.");
 if(String(roleDoc.business)!==String(this.business))throw new Error("Role does not belong to the selected business.");
});

const UserRoleAssignment=businessInfoConnection.models.UserRoleAssignment||businessInfoConnection.model("UserRoleAssignment",userRoleAssignmentSchema);

export default UserRoleAssignment;