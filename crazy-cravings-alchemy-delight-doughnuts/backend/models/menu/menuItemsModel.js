// backend/models/menu/menuItemsModel.js
import mongoose from "mongoose";

const menuItemSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},
 price:{type:Number,required:true,min:0},

 // link to recipe
 recipe:{type:mongoose.Schema.Types.ObjectId,ref:"Recipe",required:true},

 // where item shows on menu
 section:{type:mongoose.Schema.Types.ObjectId,ref:"MenuSection",required:true},  // featured, drinks, signature, filled, minis, etc.

 image:{type:String,default:""},

 // menu behavior
 isActive:{type:Boolean,default:true},
 isFeatured:{type:Boolean,default:false},
 isAlwaysOnMenu:{type:Boolean,default:false},

 // flexible labels instead of enum
 tags:[{type:String,trim:true}], // spicy, savory, vegan, pumpkin, etc.
 occasions:[{type:mongoose.Schema.Types.ObjectId,ref:"Occasion"}], // halloween, christmas, new-years, valentines, etc.

 // seasonal / limited availability
 availableDays:[{type:Number,min:0,max:6}], // 0 sunday - 6 saturday
 availableMonths:[{type:Number,min:1,max:12}], // 1 january - 12 december
 availableFrom:{type:Date,default:null},
 availableTo:{type:Date,default:null}
},{timestamps:true, collation:"menu_items"});

export default mongoose.model("MenuItem",menuItemSchema);