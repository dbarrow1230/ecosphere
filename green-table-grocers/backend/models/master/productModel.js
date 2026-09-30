import mongoose from "mongoose";
const schema=new mongoose.Schema({name:{type:String,required:true,trim:true},category:{type:String,default:"",trim:true},sku:{type:String,default:"",trim:true,index:true},price:{type:Number,default:0,min:0},status:{type:String,default:"active",trim:true}},{timestamps:true});
export default mongoose.models.GroceryProduct||mongoose.model("GroceryProduct",schema);
