import mongoose from "mongoose";
const {Schema}=mongoose;

const noteSchema=new Schema({note:{type:String,trim:true,default:""},date:{type:Date,default:Date.now},createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null}},{_id:false});

const pestRefTreatmentSchema=new Schema({
name:{type:String,trim:true,default:""},
description:{type:String,trim:true,default:""},
type:{type:Schema.Types.ObjectId,ref:"TreatmentType",default:null},
applicationMethod:{type:String,trim:true,default:""},
dosage:{type:String,trim:true,default:""},
frequency:{type:String,trim:true,default:""},
duration:{type:String,trim:true,default:""},
notes:[noteSchema],
isActive:{type:Boolean,default:true},
createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"pest_ref_treatments"});

const PestRefTreatment=mongoose.models.PestRefTreatment||mongoose.model("PestRefTreatment",pestRefTreatmentSchema);

export default PestRefTreatment;
