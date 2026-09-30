// backend/models/electricityAccountModel.js
import mongoose from "mongoose";

const electricityAccountSchema=new mongoose.Schema({
 provider:{type:String,trim:true,required:true},
 accountNumber:{type:String,trim:true,required:true},
 meterNumber:{type:String,trim:true,default:""},
 nickname:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"electricity_accounts"});

const ElectricityAccount=mongoose.models.ElectricityAccount||mongoose.model("ElectricityAccount",electricityAccountSchema);

export default ElectricityAccount;