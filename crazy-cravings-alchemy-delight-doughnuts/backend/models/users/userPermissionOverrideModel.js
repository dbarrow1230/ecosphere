// backend/models/users/userPermissionOverrideModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const userPermissionOverrideSchema=new mongoose.Schema(
{
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 module:{type:String,required:true,trim:true,lowercase:true},
 create:{type:Boolean,default:null},
 read:{type:Boolean,default:null},
 update:{type:Boolean,default:null},
 delete:{type:Boolean,default:null},
 admin:{type:Boolean,default:null}
},
{timestamps:true,collection:"user_permission_overrides"}
);

userPermissionOverrideSchema.index({user:1,business:1,module:1},{unique:true});
userPermissionOverrideSchema.index({business:1,module:1});

const UserPermissionOverride=businessInfoConnection.models.UserPermissionOverride||businessInfoConnection.model("UserPermissionOverride",userPermissionOverrideSchema);

export default UserPermissionOverride;