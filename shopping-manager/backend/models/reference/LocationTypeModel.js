// backend/models/reference/LocationTypeModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const LocationTypeSchema=new Schema({
 name:{type:String,required:true,trim:true,unique:true,index:true},
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"location_types"});

export default businessInfoConnection.models.LocationType||
 businessInfoConnection.model("LocationType",LocationTypeSchema);