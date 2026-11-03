// backend/models/lookups/sessionStatusModel.js
import mongoose from "mongoose";

const sessionStatusSchema=new mongoose.Schema({
 title:{type:String,required:true,trim:true},
 slug:{type:String,required:true,trim:true,lowercase:true,unique:true},
 description:{type:String,trim:true,default:""},
 color:{type:String,trim:true,default:""},
 active:{type:Boolean,default:true},
 sortOrder:{type:Number,default:0}
},{ timestamps:true, collection:"session_statuses"});

export default mongoose.models.SessionStatus||mongoose.model("SessionStatus",sessionStatusSchema);