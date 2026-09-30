import mongoose from "mongoose";
const schema=new mongoose.Schema({
 owner:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
 name:{type:String,required:true,trim:true,maxLength:200},
 description:{type:String,trim:true,default:"",maxLength:10000},
 location:{type:String,trim:true,default:"",maxLength:500},
 date:{type:Date,default:null}
},{timestamps:true,collection:"photography_albums"});
export default mongoose.models.PhotoAlbum||mongoose.model("PhotoAlbum",schema);
