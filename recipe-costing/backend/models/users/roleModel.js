// backend/models/users/roleModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const roleSchema=new mongoose.Schema(
{
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 name:{type:String,required:true,trim:true,lowercase:true},
 label:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},
 rank:{type:Number,default:100},
 isSystem:{type:Boolean,default:false},
 isDefault:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true}
},
{timestamps:true,collection:"roles"}
);

roleSchema.index({business:1,name:1},{unique:true});
roleSchema.index({business:1,isActive:1});
roleSchema.index({business:1,isDefault:1});

roleSchema.pre("validate",function(){
 if(this.name)this.name=String(this.name).trim().toLowerCase();
 if(!this.label&&this.name)this.label=this.name.replace(/-/g," ").replace(/\b\w/g,char=>char.toUpperCase());
});

const Role=businessInfoConnection.models.Role||businessInfoConnection.model("Role",roleSchema);

export default Role;