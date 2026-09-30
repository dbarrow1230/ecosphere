import mongoose from "mongoose";

const blogPostSchema=new mongoose.Schema({
 title:{type:String,required:true,trim:true},
 slug:{type:String,required:true,trim:true,lowercase:true,unique:true,index:true},
 excerpt:{type:String,trim:true,default:""},
 content:{type:String,required:true},
 featuredImage:{type:String,trim:true,default:""},
 imageAlt:{type:String,trim:true,default:""},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"BlogCategory",default:null},
 tags:[{type:String,trim:true,lowercase:true}],
 status:{type:String,enum:["draft","published","archived"],default:"draft",index:true},
 author:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
 publishedAt:{type:Date,default:null}
},{timestamps:true,collection:"blogPosts"});

export default mongoose.model("BlogPost",blogPostSchema);
