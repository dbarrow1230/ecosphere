// backend/models/master/DietaryModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const DietarySchema=new Schema({
 name:{type:String,required:true,trim:true,unique:true,index:true},
 slug:{type:String,trim:true,unique:true,index:true,sparse:true},
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"dietaries"});

export default businessInfoConnection.models.Dietary||businessInfoConnection.model("Dietary",DietarySchema);
