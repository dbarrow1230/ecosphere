//backend /models/reference/appKeyModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const appKeySchema=new mongoose.Schema({
 businessRef:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,unique:true,index:true},
 name:{type:String,required:true,trim:true,unique:true},
 appKey:{type:String,required:true,trim:true,lowercase:true,unique:true},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"app_keys"});

const AppKey=businessInfoConnection.models.AppKey||businessInfoConnection.model("AppKey",appKeySchema);

export default AppKey;