import mongoose from "mongoose";

const menuItemSchema=new mongoose.Schema({
 menu:{type:mongoose.Schema.Types.ObjectId,ref:"Menu",default:null,index:true},
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",default:null,index:true},
 recipe:{type:mongoose.Schema.Types.ObjectId,ref:"Recipe",default:null,index:true},
 servingsPerGuest:{type:Number,default:1,min:0},
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
