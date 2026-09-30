import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const departmentSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},
 color:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"departments"});

departmentSchema.index({business:1,name:1});
departmentSchema.index({business:1,code:1},{unique:true,sparse:true});

const Department=businessInfoConnection.models.Department||businessInfoConnection.model("Department",departmentSchema);

export default Department;