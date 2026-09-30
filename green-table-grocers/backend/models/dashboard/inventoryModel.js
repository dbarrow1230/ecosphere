import mongoose from "mongoose";
const schema=new mongoose.Schema({name:{type:String,required:true,trim:true},sku:{type:String,default:"",trim:true,index:true},quantity:{type:Number,default:0,min:0},status:{type:String,default:"active",trim:true},notes:{type:String,default:"",trim:true}},{timestamps:true});
export default mongoose.models.GroceryInventory||mongoose.model("GroceryInventory",schema);
