// backend/models/dietaryTagModel.js
import mongoose from "mongoose";

const dietaryTagSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,uppercase:true,default:""},
 description:{type:String,trim:true,default:""},
 status:{type:String,enum:["active","inactive"],default:"active"}
},{
 timestamps:true,
 collection:"dietarytags"
});

const DietaryTag=mongoose.models.DietaryTag||mongoose.model("DietaryTag",dietaryTagSchema);

export default DietaryTag;