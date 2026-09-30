// backend/models/diseases/diseaseModel.js
import mongoose from "mongoose";

const treatmentSchema=new mongoose.Schema({
name:{type:String,required:true,trim:true},
description:{type:String,trim:true,default:""},
type:{type:String,trim:true,default:""},
applicationMethod:{type:String,trim:true,default:""},
dosage:{type:String,trim:true,default:""},
frequency:{type:String,trim:true,default:""},
duration:{type:String,trim:true,default:""},
notes:{type:String,trim:true,default:""}
},{_id:false});

const diseaseSchema=new mongoose.Schema({
seed:{type:mongoose.Schema.Types.ObjectId,ref:"Seed",default:null},
plant:{type:mongoose.Schema.Types.ObjectId,ref:"Plant",default:null},
seeds:[{type:mongoose.Schema.Types.ObjectId,ref:"Seed"}],
plants:[{type:mongoose.Schema.Types.ObjectId,ref:"Plant"}],
diseaseName:{type:String,required:true,trim:true},
scientificName:{type:String,trim:true,default:""},
diseaseType:{type:String,trim:true,default:""},
category:{type:String,trim:true,default:""},
description:{type:String,trim:true,default:""},
cause:{type:String,trim:true,default:""},
symptoms:[{type:String,trim:true}],
affectedParts:[{type:String,trim:true}],
spreadMethod:{type:String,trim:true,default:""},
favorableConditions:{type:String,trim:true,default:""},
prevention:[{type:String,trim:true}],
treatment:{type:String,trim:true,default:""},
treatments:[treatmentSchema],
organicTreatment:[{type:String,trim:true}],
chemicalTreatment:[{type:String,trim:true}],
severity:{type:String,enum:["low","moderate","high","severe"],default:"moderate"},
isContagious:{type:Boolean,default:false},
image:{type:String,trim:true,default:""},
references:[{type:String,trim:true}]
},{timestamps:true,collection:"diseases"});

const Disease=mongoose.model("Disease",diseaseSchema);

export default Disease;
