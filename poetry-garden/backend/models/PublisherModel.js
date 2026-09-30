// backend/models/PublisherModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../db/businessInfoConnection.js";

const PublisherModelSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,index:true},
 publisherType:{type:String,enum:["domestic","international"],required:true},

 country:{type:mongoose.Schema.Types.ObjectId,ref:"Country",required:true},
 state:{type:mongoose.Schema.Types.ObjectId,ref:"State",default:null},
 city:{type:String,trim:true,default:""},

 imprint:{type:String,trim:true,default:""},

 contact:{type:String,trim:true,default:""},
 phone:{type:String,trim:true,default:"",validate:{validator:function(v){return v===""||/^\+?[0-9\s\-().]{7,20}$/.test(v);},message:"Invalid phone number"}},
 fax:{type:String,trim:true,default:"",validate:{validator:function(v){return v===""||/^\+?[0-9\s\-().]{7,20}$/.test(v);},message:"Invalid fax number"}},
 email:{type:String,trim:true,lowercase:true,default:"",validate:{validator:function(v){return v===""||/^\S+@\S+\.\S+$/.test(v);},message:"Invalid email address"}},
 website:{type:String,trim:true,default:"",validate:{validator:function(v){return v===""||/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[^\s]*)?$/.test(v);},message:"Invalid website URL"}},

 logo:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"publishers"});

const PublisherModel=businessInfoConnection.models.Publisher||businessInfoConnection.model("Publisher",PublisherModelSchema);

export default PublisherModel;