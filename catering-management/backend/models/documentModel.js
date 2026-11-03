// backend/models/documentModel.js
import mongoose from "mongoose";

const documentSchema=new mongoose.Schema({
 client:{type:mongoose.Schema.Types.ObjectId,ref:"Client"},
 event:{type:mongoose.Schema.Types.ObjectId,ref:"Event"},
 order:{type:mongoose.Schema.Types.ObjectId,ref:"Order"},
 invoice:{type:mongoose.Schema.Types.ObjectId,ref:"Invoice"},
 name:{type:String,required:true,trim:true},
 fileName:{type:String,required:true,trim:true},
 fileType:{type:String,trim:true,default:""},
 fileUrl:{type:String,required:true,trim:true},
 size:{type:Number,default:0,min:0},
 category:{type:String,enum:["contract","invoice","menu","layout","photo","other"],default:"other"},
 notes:{type:String,trim:true,default:""}
},{ timestamps:true, collection:"documents"});

const Document=mongoose.models.Document||mongoose.model("Document",documentSchema);

export default Document;