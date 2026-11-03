// backend/models/menu/menuCategoryModel.js
import mongoose from "mongoose";

const menuCategorySchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 description:{type:String,trim:true},
 image:{type:String},
 active:{type:Boolean,default:true}
},{timestamps:true,collection:"menu_categories"});

const MenuCategory=mongoose.model("MenuCategory",menuCategorySchema);
export default MenuCategory;