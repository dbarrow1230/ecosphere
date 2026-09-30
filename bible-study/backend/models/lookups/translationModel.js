// backend/models/lookups/translationModel.js
import mongoose from "mongoose";

const translationSchema=new mongoose.Schema({
 title:{type:String,required:true,trim:true},
 slug:{type:String,required:true,trim:true,lowercase:true,unique:true},
 abbreviation:{type:String,required:true,trim:true,unique:true,uppercase:true},
 description:{type:String,trim:true,default:""},
 language:{type:String,trim:true,default:"English"},
 type:{type:String,required:true,trim:true},
 copyright:{type:String,trim:true,default:""},
 source:{type:String,trim:true,default:""},
 active:{type:Boolean,default:true},
 sortOrder:{type:Number,default:0}
},{timestamps:true,collection:"translations"});

export default mongoose.models.Translation||mongoose.model("Translation",translationSchema);
