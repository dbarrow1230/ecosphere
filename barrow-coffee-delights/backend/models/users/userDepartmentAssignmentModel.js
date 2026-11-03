// backend/models/users/userDepartmentAssignmentModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";
import BusinessDepartment from "./businessDepartmentModel.js";
import Role from "./userRolesModel.js";

const userDepartmentAssignmentSchema=new mongoose.Schema(
{
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 department:{type:mongoose.Schema.Types.ObjectId,ref:"BusinessDepartment",required:true,index:true},
 role:{type:mongoose.Schema.Types.ObjectId,ref:"Role",default:null},
 isPrimary:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true}
},
{timestamps:true,collection:"user_department_assignments"}
);

userDepartmentAssignmentSchema.index({user:1,business:1,department:1},{unique:true});
userDepartmentAssignmentSchema.index({business:1,department:1});
userDepartmentAssignmentSchema.index({user:1,business:1});

userDepartmentAssignmentSchema.pre("validate",async function(next){
 try
 {
  if(!this.business||!this.department)
  {
   return next();
  }

  const departmentDoc=await BusinessDepartment.findById(this.department).select("business defaultRole").lean();

  if(!departmentDoc)
  {
   return next(new Error("Invalid department."));
  }

  if(String(departmentDoc.business)!==String(this.business))
  {
   return next(new Error("Department does not belong to the selected business."));
  }

  if(this.role)
  {
   const roleDoc=await Role.findById(this.role).select("business").lean();

   if(!roleDoc)
   {
    return next(new Error("Invalid role."));
   }

   if(String(roleDoc.business)!==String(this.business))
   {
    return next(new Error("Role does not belong to the selected business."));
   }
  }

  next();
 }
 catch(error)
 {
  next(error);
 }
});

const UserDepartmentAssignment=businessInfoConnection.models.UserDepartmentAssignment||businessInfoConnection.model("UserDepartmentAssignment",userDepartmentAssignmentSchema);

export default UserDepartmentAssignment;