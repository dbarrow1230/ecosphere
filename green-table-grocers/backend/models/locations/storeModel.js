import mongoose from "mongoose";
const schema=new mongoose.Schema({name:{type:String,required:true,trim:true},status:{type:String,default:"active",trim:true},notes:{type:String,default:"",trim:true}},{timestamps:true});
export default mongoose.models.GroceryStore||mongoose.model("GroceryStore",schema);
