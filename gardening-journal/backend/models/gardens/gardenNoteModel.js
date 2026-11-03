// backend/models/gardens/gardenNoteModel.js
import mongoose from "mongoose";
const {Schema,model}=mongoose;

const gardenNoteSchema=new Schema({
garden:{type:Schema.Types.ObjectId,ref:"Garden",required:true},
section:{type:Schema.Types.ObjectId,ref:"GardenSection",default:null},
title:{type:String,trim:true,default:""},
note:{type:String,trim:true,default:""},
tags:[String],
images:[String],
createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null},
isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"garden_notes"});
const GardenNote=mongoose.models.GardenNote||mongoose.model("GardenNote",gardenNoteSchema);

export default GardenNote;