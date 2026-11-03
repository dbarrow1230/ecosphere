// backend/models/lookups/studyCategoryModel.js
import mongoose from "mongoose";

const studyCategorySchema=new mongoose.Schema({
 title:{type:String,required:true,trim:true},
 slug:{type:String,required:true,trim:true,lowercase:true,unique:true},
 subtitle:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},
 icon:{type:String,trim:true,default:""},
 color:{type:String,trim:true,default:""},
 active:{type:Boolean,default:true},
 sortOrder:{type:Number,default:0}
},{ timestamps:true, collection:"study_categories"});

export default mongoose.models.StudyCategory||mongoose.model("StudyCategory",studyCategorySchema);