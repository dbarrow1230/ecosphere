// backend/models/reference/statusModel.js
import mongoose from "mongoose";

const statusSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 code:{type:String,required:true,trim:true,lowercase:true,unique:true},
 description:{type:String,trim:true,default:""},
 color:{type:String,trim:true,default:""},
 isDefault:{type:Boolean,default:false}
},{timestamps:true,collection:"statuses"});

statusSchema.index({name:1});

export default mongoose.models.Status||mongoose.model("Status",statusSchema);