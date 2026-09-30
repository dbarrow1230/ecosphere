import mongoose from "mongoose";

const domainSchema=new mongoose.Schema({
 userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
 name:{type:String,required:true,trim:true},
 code:{type:String,required:true,trim:true,uppercase:true},
 description:{type:String,default:"",trim:true},
 status:{type:String,enum:["active","archived"],default:"active",index:true}
},{timestamps:true,collection:"domains"});

domainSchema.index({userId:1,code:1},{unique:true});
export default mongoose.model("Domain",domainSchema);
