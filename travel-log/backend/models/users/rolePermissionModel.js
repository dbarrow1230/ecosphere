// backend/models/users/rolePermissionModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";
import Role from "./userRolesModel.js";

const rolePermissionSchema=new mongoose.Schema(
{
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true},
 role:{type:mongoose.Schema.Types.ObjectId,ref:"Role",required:true},
 module:{type:String,required:true,trim:true},
 create:{type:Boolean,default:false},
 read:{type:Boolean,default:false},
 update:{type:Boolean,default:false},
 delete:{type:Boolean,default:false},
 admin:{type:Boolean,default:false}
},
{timestamps:true,collection:"role_permissions"}
);

rolePermissionSchema.index({role:1,module:1},{unique:true});
rolePermissionSchema.index({business:1,module:1});

rolePermissionSchema.pre("validate",async function(next){
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

const RolePermission=businessInfoConnection.models.RolePermission||businessInfoConnection.model("RolePermission",rolePermissionSchema);

export default RolePermission;