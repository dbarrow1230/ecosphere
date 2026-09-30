//backend/menu/OccasionModel.js
import mongoose from "mongoose";

const occasionSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true}, // Halloween, Christmas, etc.
 description:{type:String,trim:true,default:""},

 // optional seasonal logic
 months:[{type:Number,min:1,max:12}], // 1–12
 days:[{type:Number,min:0,max:6}], // 0–6 (Sun–Sat)

 startDate:{type:Date,default:null},
 endDate:{type:Date,default:null},

 isActive:{type:Boolean,default:true}

},{timestamps:true, collation:"occasions"});

export default mongoose.model("Occasion",occasionSchema);