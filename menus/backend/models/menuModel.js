import mongoose from "mongoose";

const menuSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",default:null,index:true},
 recipeAssignments:[{recipe:{type:mongoose.Schema.Types.ObjectId,ref:"Recipe",required:true},servingsPerGuest:{type:Number,default:1,min:0}}],
 name:{type:String,required:true,trim:true},
 description:{type:String,default:"",trim:true},
 status:{type:String,enum:["draft","active","inactive","archived"],default:"draft",trim:true},
 notes:{type:String,default:"",trim:true}
},{timestamps:true,collection:"menus"});

menuSchema.index({name:1});
menuSchema.index({status:1});

const Menu=mongoose.models.Menu||mongoose.model("Menu",menuSchema);

export default Menu;
