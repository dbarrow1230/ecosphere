// backend/models/pests/pestmodel.js
import mongoose from "mongoose";
const {Schema,model}=mongoose;

const pestSchema=new Schema({
seed:{type:Schema.Types.ObjectId,ref:"Seed",default:null},
plant:{type:Schema.Types.ObjectId,ref:"Plant",default:null},
seeds:[{type:Schema.Types.ObjectId,ref:"Seed"}],
plants:[{type:Schema.Types.ObjectId,ref:"Plant"}],
name:{type:String,trim:true,default:""},
description:{type:String,trim:true,default:""},
type:{type:Schema.Types.ObjectId,ref:"PestType",default:null},
category:{type:String,trim:true,default:""},
treatmentText:{type:String,trim:true,default:""},
treatment:[{type:Schema.Types.ObjectId,ref:"PestRefTreatment"}],
prevention:{type:String,trim:true,default:""},
isActive:{type:Boolean,default:true},
createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"pests"});

const Pest=mongoose.models.Pest||mongoose.model("Pest",pestSchema);

export default Pest;
