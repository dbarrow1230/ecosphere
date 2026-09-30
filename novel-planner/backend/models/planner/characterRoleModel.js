//backend/models/planner/characterRoleModel.js
import mongoose from "mongoose";

const characterRoleSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 user_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"User"},
 name:{type:String,trim:true,required:true},
 description:{type:String,trim:true,default:""},
 isDefault:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true,index:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true}
},{timestamps:true,collection:"character_roles"});

characterRoleSchema.index({business_id:1,user_id:1,name:1},{unique:true});
characterRoleSchema.index({business_id:1,user_id:1,isActive:1});

const CharacterRole=mongoose.models.CharacterRole||mongoose.model("CharacterRole",characterRoleSchema);

export default CharacterRole;