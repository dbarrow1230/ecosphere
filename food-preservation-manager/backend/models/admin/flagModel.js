// backend/models/admin/flagModel.js
import mongoose from "mongoose";

const flagSchema=new mongoose.Schema({
 label:{type:String,required:true,trim:true},
 code:{type:String,trim:true,default:"",unique:true,sparse:true},

 method:{type:String,trim:true,default:""}, // optional filter per method

 description:{type:String,trim:true,default:""},

 isSystem:{type:Boolean,default:false}, // default checklist vs user added
 isActive:{type:Boolean,default:true},

 sortOrder:{type:Number,default:0}
},{timestamps:true,collection:"flags"});

const Flag=mongoose.models.Flag||mongoose.model("Flag",flagSchema);

export default Flag;