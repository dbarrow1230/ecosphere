// backend/models/reference/metricUnitsModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const metricUnitSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 singular:{type:String,trim:true,default:""},
 plural:{type:String,trim:true,default:""},
 symbol:{type:String,required:true,trim:true},
 code:{type:String,trim:true,lowercase:true,unique:true,sparse:true},
 unitType:{type:String,trim:true,lowercase:true,required:true}, // weight, volume
 baseUnit:{type:Boolean,default:false},
 conversionFactor:{type:mongoose.Schema.Types.Decimal128,default:1}, // relative to base
 description:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{timestamps:true,collection:"metric_units"});

metricUnitSchema.index({name:1});
metricUnitSchema.index({unitType:1});

export default businessInfoConnection.models.MetricUnit||businessInfoConnection.model("MetricUnit",metricUnitSchema);