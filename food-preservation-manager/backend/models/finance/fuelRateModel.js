// backend/models/fuelRateModel.js
import mongoose from "mongoose";

const d3=v=>v==null?v:mongoose.Types.Decimal128.fromString(Number(v).toFixed(3));

const fuelRateSchema=new mongoose.Schema({
 fuelAccount:{type:mongoose.Schema.Types.ObjectId,ref:"FuelAccount",required:true},
 billingStartDate:{type:Date,required:true},
 billingEndDate:{type:Date,required:true},
 dueDate:{type:Date},
 ratePerUnit:{type:mongoose.Schema.Types.Decimal128,required:true,set:d3},
 deliveryRate:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0.000"),set:d3},
 systemBenefitCharge:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0.000"),set:d3},
 usageUnit:{type:String,  enum:["therms","ccf","mcf","gallons","liters","kg","lb","other"],  required:true },
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"fuel_rates"});

const FuelRate=mongoose.models.FuelRate||mongoose.model("FuelRate",fuelRateSchema);

export default FuelRate;