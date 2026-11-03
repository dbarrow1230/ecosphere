import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const TechniqueSchema=new Schema({
 name:{type:String,required:true,trim:true,unique:true,index:true},
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"techniques"});

export default businessInfoConnection.models.Technique||businessInfoConnection.model("Technique",TechniqueSchema);
