import mongoose from "mongoose";

const menuSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 description:{type:String,default:"",trim:true},
 status:{type:String,enum:["draft","active","inactive","archived"],default:"draft",trim:true},
 notes:{type:String,default:"",trim:true}
},{timestamps:true,collection:"menus"});

menuSchema.index({name:1});
menuSchema.index({status:1});

const Menu=mongoose.models.Menu||mongoose.model("Menu",menuSchema);

export default Menu;
