// backend/models/PoetryCategory.js
import mongoose from "mongoose";

const poetryCategorySchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,unique:true,index:true},
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true,index:true}
},{timestamps:true,collection:"poetry_categories"});

const PoetryCategory=mongoose.models.PoetryCategory||mongoose.model("PoetryCategory",poetryCategorySchema);

export default PoetryCategory;