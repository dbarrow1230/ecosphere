import mongoose from "mongoose";

const menuItemSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},
 price:{type:Number,required:true,min:0},
 displayOrder:{type:Number,default:0,min:0},
 isAvailable:{type:Boolean,default:true}
},{_id:true});

const menuSectionSchema=new mongoose.Schema({
 title:{type:String,required:true,trim:true},
 displayOrder:{type:Number,default:0,min:0},
 isActive:{type:Boolean,default:true},
 items:{type:[menuItemSchema],default:[]}
},{_id:true});

const menuSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 eyebrow:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},
 category:{type:String,trim:true,default:"Restaurant Menu"},
 pricePerGuest:{type:Number,default:0,min:0},
 minimumGuests:{type:Number,default:1,min:1},
 maximumGuests:{type:Number,default:0,min:0},
 status:{type:String,enum:["active","draft","inactive"],default:"draft",index:true},
 isPublic:{type:Boolean,default:false,index:true},
 displayOrder:{type:Number,default:0,min:0},
 sections:{type:[menuSectionSchema],default:[]},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"menus"});

menuSchema.index({status:1,isPublic:1,displayOrder:1});

const Menu=mongoose.models.Menu||mongoose.model("Menu",menuSchema);

export default Menu;
