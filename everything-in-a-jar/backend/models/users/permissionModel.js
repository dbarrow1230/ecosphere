// backend/models/users/permissionModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const permissionSchema=new mongoose.Schema(
{
 name:{type:String,required:true,trim:true},
 code:{type:String,required:true,trim:true,uppercase:true},
 category:{type:String,trim:true,default:"general"},
 description:{type:String,trim:true,default:""},
 isSystem:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true}
},
{timestamps:true,collection:"permissions"}
);

permissionSchema.index({code:1},{unique:true});
permissionSchema.index({name:1});
permissionSchema.index({category:1});
permissionSchema.index({isActive:1});

const Permission=businessInfoConnection.models.Permission||businessInfoConnection.model("Permission",permissionSchema);

export default Permission;