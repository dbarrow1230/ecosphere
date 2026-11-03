// backend/models/master/CuisineModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const CuisineSchema=new Schema({
 name:{type:String,required:true,trim:true,unique:true,index:true},
 slug:{type:String,trim:true,unique:true,index:true},
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"cuisines"});

export default businessInfoConnection.models.Cuisine||businessInfoConnection.model("Cuisine",CuisineSchema);