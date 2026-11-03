// backend/models/AcquisitionSourceModel.js
import mongoose from "mongoose";

const AcquisitionSourceModelSchema=new mongoose.Schema({
 name:{type:String,trim:true,required:true,unique:true,index:true},
 website:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"acquisition_sources"});

AcquisitionSourceModelSchema.pre("validate",function(){
 this.name=(this.name||"").trim();
 this.website=(this.website||"").trim();
 this.notes=(this.notes||"").trim();
});

const AcquisitionSourceModel=mongoose.models.AcquisitionSource||mongoose.model("AcquisitionSource",AcquisitionSourceModelSchema);

export default AcquisitionSourceModel;