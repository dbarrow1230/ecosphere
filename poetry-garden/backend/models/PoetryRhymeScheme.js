// backend/models/PoetryRhymeScheme.js
import mongoose from "mongoose";

const poetryRhymeSchemeSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,unique:true,index:true},
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true,index:true}
},{timestamps:true,collection:"poetry_rhyme_schemes"});

const PoetryRhymeScheme=mongoose.models.PoetryRhymeScheme||mongoose.model("PoetryRhymeScheme",poetryRhymeSchemeSchema);

export default PoetryRhymeScheme;