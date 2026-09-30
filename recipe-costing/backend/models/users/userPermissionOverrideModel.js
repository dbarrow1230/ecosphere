// backend/models/users/userPermissionOverrideModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";
import BusinessDepartment from "./businessDepartmentModel.js";

const userPermissionOverrideSchema=new mongoose.Schema(
{
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 department:{type:mongoose.Schema.Types.ObjectId,ref:"BusinessDepartment",default:null,index:true},
 module:{type:String,required:true,trim:true,lowercase:true},
 create:{type:Boolean,default:null},
 read:{type:Boolean,default:null},
 update:{type:Boolean,default:null},
 delete:{type:Boolean,default:null},
 admin:{type:Boolean,default:null},
 reason:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},
{timestamps:true,collection:"user_permission_overrides"}
);

userPermissionOverrideSchema.index({user:1,business:1,department:1,module:1},{unique:true});
userPermissionOverrideSchema.index({business:1,module:1});
userPermissionOverrideSchema.index({user:1,business:1,isActive:1});

userPermissionOverrideSchema.pre("validate",async function(){
 if(this.module)this.module=String(this.module).trim().toLowerCase();

 if(this.admin===true)
 {
  this.create=true;
  this.read=true;
  this.update=true;
  this.delete=true;
 }

 if(!this.department||!this.business)return;

 const departmentDoc=await BusinessDepartment.findById(this.department).select("business").lean();

 if(!departmentDoc)throw new Error("Invalid department.");
 if(String(departmentDoc.business)!==String(this.business))throw new Error("Department does not belong to the selected business.");
});

const UserPermissionOverride=businessInfoConnection.models.UserPermissionOverride||businessInfoConnection.model("UserPermissionOverride",userPermissionOverrideSchema);

export default UserPermissionOverride;