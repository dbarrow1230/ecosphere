import mongoose from "mongoose";

const menuCategorySchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 description:{type:String,default:"",trim:true},
 status:{type:String,enum:["active","inactive"],default:"active",trim:true}
},{timestamps:true,collection:"menu_categories"});

menuCategorySchema.index({name:1},{unique:true});
menuCategorySchema.index({status:1});

const MenuCategory=mongoose.models.MenuCategory||mongoose.model("MenuCategory",menuCategorySchema);

export default MenuCategory;
