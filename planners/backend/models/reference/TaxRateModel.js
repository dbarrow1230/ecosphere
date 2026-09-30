// backend/models/reference/TaxRateModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const taxRateSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,lowercase:true,default:""},
 stateRef:{type:mongoose.Schema.Types.ObjectId,ref:"State",required:true,index:true},
 rate:{type:Number,required:true,default:0,min:0,max:100,set:v=>Math.round(v*1000)/1000},
 isDefault:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"tax_rates"});

taxRateSchema.index({stateRef:1,name:1},{unique:true});
taxRateSchema.index({stateRef:1,code:1},{unique:true,sparse:true});
taxRateSchema.index({stateRef:1,isDefault:1});
taxRateSchema.index({isActive:1});

const TaxRate=businessInfoConnection.models.TaxRate||businessInfoConnection.model("TaxRate",taxRateSchema);

export default TaxRate;