import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const AllergenSchema=new Schema({
 name:{type:String,required:true,trim:true,unique:true,index:true},
 emoji:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true,index:true}
},{timestamps:true,collection:"allergens"});

export default businessInfoConnection.models.Allergen||businessInfoConnection.model("Allergen",AllergenSchema);
