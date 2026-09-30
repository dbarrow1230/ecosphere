//backend/models/employee/shiftLocationsModel.js
import mongoose from "mongoose";

const noteSchema=new mongoose.Schema({
 date:{type:Date,default:Date.now},
 text:{type:String,trim:true}
},{_id:false});

const shiftLocationSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},

 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true},

 notes:{type:[noteSchema],default:[]}
},{timestamps:true,collection:"shift_locations"});

shiftLocationSchema.index({business:1,name:1},{unique:true});
shiftLocationSchema.index({business:1,code:1},{unique:true,sparse:true});
shiftLocationSchema.index({business:1,isActive:1});

const ShiftLocation=mongoose.models.ShiftLocation||mongoose.model("ShiftLocation",shiftLocationSchema);

export default ShiftLocation;