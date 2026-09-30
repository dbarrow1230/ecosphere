import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;
const MealTypeSchema=new Schema({
 name:{type:String,required:true,trim:true,unique:true,index:true},
 slug:{type:String,trim:true,unique:true,index:true},
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"meal_types"});

export default businessInfoConnection.models.MealType||businessInfoConnection.model("MealType",MealTypeSchema);
