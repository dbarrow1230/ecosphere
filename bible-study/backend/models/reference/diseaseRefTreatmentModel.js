import mongoose from "mongoose";
const {Schema,model}=mongoose;

const diseaseRefTreatmentSchema=new Schema({
name:{type:String,trim:true,default:""},
description:{type:String,trim:true,default:""},

type:{type:Schema.Types.ObjectId,ref:"TreatmentType",default:null},

applicationMethod:{type:String,trim:true,default:""},
dosage:{type:String,trim:true,default:""},
frequency:{type:String,trim:true,default:""},
duration:{type:String,trim:true,default:""},

notes:[{
note:{type:String,trim:true,default:""},
date:{type:Date,default:Date.now},
createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null}
}],

isActive:{type:Boolean,default:true},
createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null}

},{timestamps:true,collection:"disease_ref_treatments"});

const DiseaseRefTreatment=mongoose.models.DiseaseRefTreatment||mongoose.model("DiseaseRefTreatment",diseaseRefTreatmentSchema);

export default DiseaseRefTreatment;