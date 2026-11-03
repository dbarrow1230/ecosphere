// backend/models/lookups/difficultyLevelModel.js
import mongoose from "mongoose";

const difficultyLevelSchema=new mongoose.Schema({
 title:{type:String,required:true,trim:true},
 slug:{type:String,required:true,trim:true,lowercase:true,unique:true},
 description:{type:String,trim:true,default:""},
 color:{type:String,trim:true,default:""},
 active:{type:Boolean,default:true},
 sortOrder:{type:Number,default:0}
},{ timestamps:true, collection:"difficulty_levels"});

export default mongoose.models.DifficultyLevel||mongoose.model("DifficultyLevel",difficultyLevelSchema);