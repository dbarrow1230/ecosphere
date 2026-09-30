// backend/models/users/permissionModuleModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const permissionModuleSchema=new mongoose.Schema(
{
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 key:{type:String,required:true,trim:true,lowercase:true},
 label:{type:String,required:true,trim:true},
 path:{type:String,trim:true,default:""},
 group:{type:String,trim:true,default:"General"},
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},
{timestamps:true,collection:"permission_modules"}
);

permissionModuleSchema.index({business:1,key:1},{unique:true});
permissionModuleSchema.index({business:1,isActive:1});

const PermissionModule=businessInfoConnection.models.PermissionModule||businessInfoConnection.model("PermissionModule",permissionModuleSchema,"permission_modules");

export default PermissionModule;
