// backend/models/fuelAccountModel.js
import mongoose from "mongoose";

const fuelAccountSchema=new mongoose.Schema({
 provider:{type:String,trim:true,required:true},
 accountNumber:{type:String,trim:true,required:true},
 fuelType:{  type:String,  enum:["natural_gas","propane","heating_oil","diesel","kerosene","other"],  required:true },
 nickname:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"fuel_accounts"});

const FuelAccount=mongoose.models.FuelAccount||mongoose.model("FuelAccount",fuelAccountSchema);

export default FuelAccount;