// backend/models/menuItemModel.js
import mongoose from "mongoose";

const menuItemSchema=new mongoose.Schema({
 menu:{type:mongoose.Schema.Types.ObjectId,ref:"Menu",required:true},
 name:{type:String,required:true,trim:true},
 category:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},
 price:{type:Number,required:true,min:0},
 unit:{type:String,trim:true,default:"each"},
 status:{type:String,enum:["active","inactive","draft"],default:"active"},
 isVegetarian:{type:Boolean,default:false},
 isVegan:{type:Boolean,default:false},
 isGlutenFree:{type:Boolean,default:false},
 notes:{type:String,trim:true,default:""}
},{timestamps:true, collection:"menuitems"});

const MenuItem=mongoose.models.MenuItem||mongoose.model("MenuItem",menuItemSchema);

export default MenuItem;