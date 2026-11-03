// backend/models/users/departmentPermissionModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";
import BusinessDepartment from "./businessDepartmentModel.js";

const departmentPermissionSchema=new mongoose.Schema(
{
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 department:{type:mongoose.Schema.Types.ObjectId,ref:"BusinessDepartment",required:true,index:true},
 module:{type:String,required:true,trim:true,lowercase:true},
 create:{type:Boolean,default:false},
 read:{type:Boolean,default:false},
 update:{type:Boolean,default:false},
 delete:{type:Boolean,default:false},
 admin:{type:Boolean,default:false}
},
{timestamps:true,collection:"department_permissions"}
);

departmentPermissionSchema.index({business:1,department:1,module:1},{unique:true});
departmentPermissionSchema.index({business:1,module:1});

departmentPermissionSchema.pre("validate",async function(next){
 try
 {
  if(!this.department||!this.business)
  {
   return next();
  }

  const departmentDoc=await BusinessDepartment.findById(this.department).select("business").lean();

  if(!departmentDoc)
  {
   return next(new Error("Invalid department."));
  }

  if(String(departmentDoc.business)!==String(this.business))
  {
   return next(new Error("Department does not belong to the selected business."));
  }

  if(this.admin)
  {
   this.create=true;
   this.read=true;
   this.update=true;
   this.delete=true;
  }

  next();
 }
 catch(error)
 {
  next(error);
 }
});

const DepartmentPermission=businessInfoConnection.models.DepartmentPermission||businessInfoConnection.model("DepartmentPermission",departmentPermissionSchema);

export default DepartmentPermission;