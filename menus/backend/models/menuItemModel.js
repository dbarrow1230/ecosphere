import mongoose from "mongoose";

const menuItemSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 category:{type:String,default:"",trim:true},
 description:{type:String,default:"",trim:true},
 price:{type:Number,default:0,min:0},
 status:{type:String,enum:["active","inactive","archived"],default:"active",trim:true}
},{timestamps:true,collection:"menu_items"});

menuItemSchema.index({name:1});
menuItemSchema.index({category:1,status:1});

const MenuItem=mongoose.models.MenuItem||mongoose.model("MenuItem",menuItemSchema);

export default MenuItem;
