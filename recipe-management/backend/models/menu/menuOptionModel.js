// backend/models/menu/menuOptionModel.js
import mongoose from "mongoose";

const menuOptionSchema=new mongoose.Schema({
 group:{type:mongoose.Schema.Types.ObjectId,ref:"MenuOptionGroup",required:true},
 name:{type:String,required:true,trim:true},
 price:{type:Number,default:0},
 active:{type:Boolean,default:true}
},{timestamps:true});

const MenuOption=mongoose.model("MenuOption",menuOptionSchema);
export default MenuOption;