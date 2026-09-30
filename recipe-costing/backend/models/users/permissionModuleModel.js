// backend/models/users/permissionModuleModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const permissionModuleSchema=new mongoose.Schema(
{
 appKey:{type:String,required:true,trim:true,lowercase:true,index:true},
 key:{type:String,required:true,trim:true,lowercase:true},
 label:{type:String,required:true,trim:true},
 path:{type:String,trim:true,default:""},
 group:{type:String,trim:true,default:"General"},
 description:{type:String,trim:true,default:""},
 sortOrder:{type:Number,default:0},
 isSystem:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true}
},
{timestamps:true,collection:"permission_modules"}
);

permissionModuleSchema.index({appKey:1,key:1},{unique:true});
permissionModuleSchema.index({appKey:1,isActive:1});
permissionModuleSchema.index({appKey:1,group:1,sortOrder:1});

permissionModuleSchema.pre("validate",function(){
 if(this.appKey)this.appKey=String(this.appKey).trim().toLowerCase();
 if(this.key)this.key=String(this.key).trim().toLowerCase();
});

const PermissionModule=businessInfoConnection.models.PermissionModule||businessInfoConnection.model("PermissionModule",permissionModuleSchema);

export default PermissionModule;