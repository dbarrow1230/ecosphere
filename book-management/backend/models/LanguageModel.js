// backend/models/LanguageModel.js
import mongoose from "mongoose";

const LanguageModelSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,unique:true,index:true}
},{timestamps:true,collection:"languages"});

const LanguageModel=mongoose.models.Language||mongoose.model("Language",LanguageModelSchema);

export default LanguageModel;