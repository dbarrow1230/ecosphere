// backend/models/users/userRolesModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const userRolesSchema=new mongoose.Schema(
{
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 name:{type:String,required:true,trim:true,lowercase:true},
 description:{type:String,trim:true,default:""},
 isDefault:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true}
},
{timestamps:true,collection:"roles"}
);

userRolesSchema.index({business:1,name:1},{unique:true});

const Role=businessInfoConnection.models.Role||businessInfoConnection.model("Role",userRolesSchema,"roles");

export default Role;