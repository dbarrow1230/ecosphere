// backend/models/menu/menuModel.js
import mongoose from "mongoose";

const menuSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,default:"",unique:true,sparse:true},
 slug:{type:String,trim:true,default:"",unique:true,sparse:true},

 type:{type:String,trim:true,default:""}, // holiday, event, weekly, online
 description:{type:String,trim:true,default:""},

 startDate:{type:Date},
 endDate:{type:Date},

 isActive:{type:Boolean,default:true},

 layout:{
  style:{type:String,trim:true,default:""},
  theme:{type:String,trim:true,default:""},
  sections:[{
   key:{type:String,trim:true,default:""},
   label:{type:String,trim:true,default:""},
   sortOrder:{type:Number,default:0}
  }]
 },

 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"menus"});

const Menu=mongoose.models.Menu||mongoose.model("Menu",menuSchema);

export default Menu;