// backend/models/reference/MetricUnitModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const MetricUnitSchema=new Schema({
 name:{type:String,required:true,trim:true,unique:true,index:true},
 symbol:{type:String,required:true,trim:true,unique:true,index:true},
 type:{type:String,required:true,trim:true}, // weight, volume, length, count
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"metric_units"});

export default businessInfoConnection.models.MetricUnit||
 businessInfoConnection.model("MetricUnit",MetricUnitSchema);