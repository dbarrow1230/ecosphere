// backend/models/users/permissionModuleModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const permissionModuleSchema=new mongoose.Schema(
{
 key:{type:String,required:true,trim:true,lowercase:true,unique:true,index:true},
 label:{type:String,required:true,trim:true},
 path:{type:String,trim:true,default:""},
 group:{type:String,trim:true,default:"General"},
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},
{timestamps:true,collection:"permission_modules"}
);

const PermissionModule=businessInfoConnection.models.PermissionModule||businessInfoConnection.model("PermissionModule",permissionModuleSchema,"permission_modules");

export default PermissionModule;