// backend/models/fuelSourceModel.js
import mongoose from "mongoose";

const d=v=>v==null?v:mongoose.Types.Decimal128.fromString(String(v));

const fuelSourceSchema=new mongoose.Schema({
 name:{type:String,trim:true,required:true},
 fuelType:{
  type:String,
  enum:["electricity","natural_gas","propane","heating_oil","diesel","kerosene","other"],
  required:true
 },
 unit:{
  type:String,
  enum:["kwh","therms","ccf","mcf","gallons","liters","kg","lb","other"],
  required:true
 },
 defaultRatePerUnit:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
 isActive:{type:Boolean,default:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"fuel_sources"});

const FuelSource=mongoose.models.FuelSource||mongoose.model("FuelSource",fuelSourceSchema);

export default FuelSource;