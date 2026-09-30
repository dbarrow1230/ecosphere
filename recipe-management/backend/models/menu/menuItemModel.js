// backend/models/menu/menuItemModel.js
import mongoose from "mongoose";

const menuItemSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"MenuCategory",required:true},
 description:{type:String,trim:true},
 price:{type:Number,required:true},
 image:{type:String},
 season:{type:String,trim:true},
 holiday:[{type:String,trim:true}],
 active:{type:Boolean,default:true},
 showOnPrimaryMenu:{type:Boolean,default:true},
 startDate:{type:Date},
 endDate:{type:Date},
 featured:{type:Boolean,default:false}
},{timestamps:true,collection:"menu_items"});

const MenuItem=mongoose.model("MenuItem",menuItemSchema);
export default MenuItem;