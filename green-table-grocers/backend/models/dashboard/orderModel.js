import mongoose from "mongoose";
const schema=new mongoose.Schema({name:{type:String,required:true,trim:true},quantity:{type:Number,default:0,min:0},price:{type:Number,default:0,min:0},status:{type:String,default:"pending",trim:true},notes:{type:String,default:"",trim:true}},{timestamps:true});
export default mongoose.models.GroceryOrder||mongoose.model("GroceryOrder",schema);
