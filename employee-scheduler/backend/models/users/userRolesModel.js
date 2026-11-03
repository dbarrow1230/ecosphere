// backend/models/users/userRolesModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const roleSchema=new mongoose.Schema(
{
 name:{type:String,required:true,trim:true},
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true},
 description:{type:String,trim:true},
 isActive:{type:Boolean,default:true}
},
{timestamps:true,collection:"roles"}
);

roleSchema.index({name:1,business:1},{unique:true});

const Role=businessInfoConnection.models.Role||businessInfoConnection.model("Role",roleSchema);

export default Role;