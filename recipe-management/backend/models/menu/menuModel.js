import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;
const MenuSchema=new Schema({
 name:{type:String,required:true,trim:true,index:true},
 description:{type:String,trim:true,default:""},
 category:{type:String,trim:true,default:""},
 pricePerGuest:{type:Number,default:0,min:0},
 minimumGuests:{type:Number,default:1,min:1},
 maximumGuests:{type:Number,default:0,min:0},
 status:{type:String,enum:["draft","active","inactive"],default:"draft",index:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"menus"});

export default businessInfoConnection.models.Menu||businessInfoConnection.model("Menu",MenuSchema);
