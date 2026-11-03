import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const EquipmentSchema=new Schema({
 name:{type:String,required:true,trim:true,unique:true,index:true},
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{timestamps:true,autoIndex:false,autoCreate:false,collection:"equipment"});

export default businessInfoConnection.models.Equipment||businessInfoConnection.model("Equipment",EquipmentSchema);
