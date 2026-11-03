// backend/models/menu/menuOptionGroupModel.js
import mongoose from "mongoose";

const menuOptionGroupSchema=new mongoose.Schema({
 menuItem:{type:mongoose.Schema.Types.ObjectId,ref:"MenuItem",required:true},
 name:{type:String,required:true,trim:true},
 description:{type:String,trim:true},
 minSelect:{type:Number,default:0},
 maxSelect:{type:Number,default:1},
 required:{type:Boolean,default:false},
 active:{type:Boolean,default:true}
},{timestamps:true});

const MenuOptionGroup=mongoose.model("MenuOptionGroup",menuOptionGroupSchema);
export default MenuOptionGroup;