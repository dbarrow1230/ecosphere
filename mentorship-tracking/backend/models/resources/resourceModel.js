// backend/models/resources/resourceModel.js
import mongoose from "mongoose";

const resourceLinkSchema=new mongoose.Schema({
 title:{type:String,required:true,trim:true},
 url:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},
 source:{type:String,trim:true,default:""},
 resourceType:{type:String,trim:true,default:"link",enum:["link","file","ebook","pdf","video","article","website","form","guide","other"]},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"ResourceCategory",default:null},
 state:{type:mongoose.Schema.Types.ObjectId,ref:"State",default:null},
 country:{type:mongoose.Schema.Types.ObjectId,ref:"Country",default:null},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,_id:true});

const resourceModel=new mongoose.Schema({
 title:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},
 topic:{type:String,trim:true,default:""},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"ResourceCategory",default:null},
 links:{type:[resourceLinkSchema],default:[]},
 status:{type:String,trim:true,default:"active",enum:["active","archived"]},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
},{timestamps:true,collection:"resources"});

resourceModel.index({category:1});
resourceModel.index({createdBy:1});
resourceModel.index({status:1});

const Resource=mongoose.model("Resource",resourceModel);

export default Resource;
