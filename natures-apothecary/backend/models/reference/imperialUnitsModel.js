// backend/models/reference/imperialUnitsModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const imperialUnitSchema=new mongoose.Schema({
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
},{timestamps:true,collection:"imperial_units"});

imperialUnitSchema.index({name:1});
imperialUnitSchema.index({unitType:1});

export default businessInfoConnection.models.ImperialUnit||businessInfoConnection.model("ImperialUnit",imperialUnitSchema);