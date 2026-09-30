// backend/models/users/businessDepartmentModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";
import Role from "./userRolesModel.js";

const businessDepartmentSchema=new mongoose.Schema(
{
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 name:{type:String,required:true,trim:true},
 code:{type:String,required:true,trim:true,uppercase:true},
 accountingCode:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},
 defaultRole:{type:mongoose.Schema.Types.ObjectId,ref:"Role",default:null},
 isDefault:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true}
},
{timestamps:true,collection:"business_departments"}
);

businessDepartmentSchema.index({business:1,code:1},{unique:true});
businessDepartmentSchema.index({business:1,accountingCode:1});
businessDepartmentSchema.index({business:1,name:1});

businessDepartmentSchema.pre("validate",async function(){
 if(this.code)
 {
  this.code=String(this.code).trim().toUpperCase();
 }

 if(this.accountingCode)
 {
  this.accountingCode=String(this.accountingCode).trim().toUpperCase();
 }

 if(!this.defaultRole||!this.business)
 {
  return;
 }

 const roleDoc=await Role.findById(this.defaultRole).select("business").lean();

 if(!roleDoc)
 {
  throw new Error("Invalid default role.");
 }

 if(String(roleDoc.business)!==String(this.business))
 {
  throw new Error("Default role does not belong to the selected business.");
 }
});

const BusinessDepartment=businessInfoConnection.models.BusinessDepartment||businessInfoConnection.model("BusinessDepartment",businessDepartmentSchema);

export default BusinessDepartment;
