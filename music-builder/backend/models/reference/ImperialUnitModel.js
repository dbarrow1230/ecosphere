// backend/models/reference/ImperialUnitModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const ImperialUnitSchema=new Schema({
 name:{type:String,required:true,trim:true,unique:true,index:true},
 symbol:{type:String,required:true,trim:true,unique:true,index:true},
 type:{type:String,required:true,trim:true}, // weight, volume, length, count
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"imperial_units"});

export default businessInfoConnection.models.ImperialUnit||
 businessInfoConnection.model("ImperialUnit",ImperialUnitSchema);