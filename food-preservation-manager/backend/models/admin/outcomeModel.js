// backend/models/admin/outcomeModel.js
import mongoose from "mongoose";

const outcomeSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 code:{type:String,required:true,trim:true,unique:true},

 method:{type:String,trim:true,default:""}, // dehydration, canning, fermentation

 description:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true},
 sortOrder:{type:Number,default:0}
},{timestamps:true,collection:"outcomes"});

const Outcome=mongoose.models.Outcome||mongoose.model("Outcome",outcomeSchema);

export default Outcome;