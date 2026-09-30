// backend/models/users/permissionModel.js
import mongoose from "mongoose";

const permissionSchema=new mongoose.Schema(
{
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 role:{type:String,enum:["admin","user","staff"],default:null},
 module:{type:String,required:true,trim:true},
 create:{type:Boolean,default:false},
 read:{type:Boolean,default:false},
 update:{type:Boolean,default:false},
 delete:{type:Boolean,default:false},
 admin:{type:Boolean,default:false}
},
{timestamps:true,collection:"user_permissions"}
);

permissionSchema.index(
 {role:1,module:1},
 {
  unique:true,
  partialFilterExpression:{
   role:{$type:"string"},
   user:null
  }
 }
);

permissionSchema.index(
 {user:1,module:1},
 {
  unique:true,
  partialFilterExpression:{
   user:{$type:"objectId"}
  }
 }
);

const Permission=mongoose.model("Permission",permissionSchema);

export default Permission;