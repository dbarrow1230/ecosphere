// backend/models/AcquisitionMethodModel.js
import mongoose from "mongoose";

const AcquisitionMethodModelSchema=new mongoose.Schema({
 name:{type:String,trim:true,required:true,unique:true,index:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"acquisition_methods"});

AcquisitionMethodModelSchema.pre("validate",function(){
 this.name=(this.name||"").trim();
 this.notes=(this.notes||"").trim();
});

const AcquisitionMethodModel=mongoose.models.AcquisitionMethod||mongoose.model("AcquisitionMethod",AcquisitionMethodModelSchema);

export default AcquisitionMethodModel;