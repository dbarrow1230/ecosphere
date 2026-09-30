import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const IngredientSchema=new Schema({
 name:{type:String,required:true,trim:true,unique:true,index:true},
 description:{type:String,trim:true,default:""},
 unit:{type:String,required:true,trim:true,default:"g"},
 notes:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true,index:true}
},{timestamps:true,collection:"ingredients"});

export default businessInfoConnection.models.Ingredient||businessInfoConnection.model("Ingredient",IngredientSchema);
