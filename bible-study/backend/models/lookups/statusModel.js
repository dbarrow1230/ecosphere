// backend/models/lookups/statusModel.js
import mongoose from "mongoose";

const statusSchema=new mongoose.Schema({
 title:{type:String,required:true,trim:true},
 slug:{type:String,required:true,trim:true,lowercase:true,unique:true},
 description:{type:String,trim:true,default:""},
 category:{type:String,trim:true,default:""},
 color:{type:String,trim:true,default:""},
 icon:{type:String,trim:true,default:""},
 active:{type:Boolean,default:true},
 sortOrder:{type:Number,default:0}
},{ timestamps:true, collection:"statuses"});

export default mongoose.models.Status||mongoose.model("Status",statusSchema);