//backend/models/menu/MenuSectionModel.js
import mongoose from "mongoose";


const menuSectionSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true}, // Signature, Drinks, Featured
 description:{type:String,trim:true,default:""},

 order:{type:Number,default:0}, // controls display order
 isActive:{type:Boolean,default:true}

},{timestamps:true, Collection:"menu_sections"});

export default mongoose.model("MenuSection",menuSectionSchema);