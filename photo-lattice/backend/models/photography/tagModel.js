import mongoose from "mongoose";
const schema=new mongoose.Schema({
 owner:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
 name:{type:String,required:true,trim:true,maxLength:100},
 description:{type:String,trim:true,default:"",maxLength:10000}
},{timestamps:true,collection:"photography_tags"});
schema.index({owner:1,name:1},{unique:true});
export default mongoose.models.PhotoTag||mongoose.model("PhotoTag",schema);
