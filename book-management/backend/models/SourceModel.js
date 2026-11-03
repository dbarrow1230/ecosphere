// backend/models/SourceModel.js
import mongoose from "mongoose";

const SourceModelSchema=new mongoose.Schema({
 name:{type:String,trim:true,required:true,unique:true,index:true},
 type:{type:String,trim:true,default:""},
 domestic:{type:Boolean,default:true},
 addressLine1:{type:String,trim:true,default:""},
 addressLine2:{type:String,trim:true,default:""},
 city:{type:String,trim:true,default:""},
 state:{type:mongoose.Schema.Types.ObjectId,ref:"State",default:null},
 postalCode:{type:String,trim:true,default:""},
 country:{type:mongoose.Schema.Types.ObjectId,ref:"Country",default:null},
 website:{type:String,trim:true,default:""},
 contactName:{type:String,trim:true,default:""},
 email:{type:String,trim:true,lowercase:true,default:"",validate:{validator:v=>!v||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),message:"Invalid email address"}},
 phone:{type:String,trim:true,default:"",validate:{validator:v=>!v||/^[0-9+\-().\s]{7,20}$/.test(v),message:"Invalid phone number"}},
 notes:[{type:String,trim:true}]
},{timestamps:true, collection:"sources"});

SourceModelSchema.index({name:"text"});

const SourceModel=mongoose.models.Source||mongoose.model("Source",SourceModelSchema);

export default SourceModel;