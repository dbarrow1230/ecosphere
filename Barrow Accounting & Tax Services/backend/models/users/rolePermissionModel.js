// backend/models/users/rolePermissionModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";
import Role from "./userRolesModel.js";

const rolePermissionSchema=new mongoose.Schema(
{
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 role:{type:mongoose.Schema.Types.ObjectId,ref:"Role",required:true,index:true},
 module:{type:String,required:true,trim:true,lowercase:true},
 create:{type:Boolean,default:false},
 read:{type:Boolean,default:false},
 update:{type:Boolean,default:false},
 delete:{type:Boolean,default:false},
 admin:{type:Boolean,default:false}
},
{timestamps:true,collection:"role_permissions"}
);

rolePermissionSchema.index({business:1,role:1,module:1},{unique:true});
rolePermissionSchema.index({business:1,module:1});

rolePermissionSchema.pre("validate",async function(){
 if(!this.role||!this.business)
 {
  return;
 }

 const roleDoc=await Role.findById(this.role).select("business").lean();

 if(!roleDoc)
 {
  throw new Error("Invalid role.");
 }

 if(String(roleDoc.business)!==String(this.business))
 {
  throw new Error("Role does not belong to the selected business.");
 }

 if(this.admin)
 {
  this.create=true;
  this.read=true;
  this.update=true;
  this.delete=true;
 }
});

const RolePermission=businessInfoConnection.models.RolePermission||businessInfoConnection.model("RolePermission",rolePermissionSchema);

export default RolePermission;