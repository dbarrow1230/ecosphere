//backend/models/roleModel.js
import mongoose from "mongoose";

const noteSchema=new mongoose.Schema({
 date:{type:Date,default:Date.now},
 text:{type:String,trim:true}
},{_id:false});

const roleSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 department:{type:mongoose.Schema.Types.ObjectId,ref:"Department",default:null,index:true},

 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true},

 notes:{type:[noteSchema],default:[]}
},{timestamps:true,collection:"roles"});

roleSchema.index({business:1,name:1},{unique:true});
roleSchema.index({business:1,code:1},{unique:true,sparse:true});
roleSchema.index({business:1,department:1});
roleSchema.index({business:1,isActive:1});

const Role=mongoose.models.Role||mongoose.model("Role",roleSchema);

export default Role;