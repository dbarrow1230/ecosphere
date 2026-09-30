import mongoose from "mongoose";

const schema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,unique:true},
 description:{type:String,default:"",trim:true},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"brands"});

export default mongoose.models.Brand||mongoose.model("Brand",schema);
