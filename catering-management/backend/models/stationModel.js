import mongoose from "mongoose";

const stationSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},
 active:{type:Boolean,default:true},
 sortOrder:{type:Number,default:0}
},{timestamps:true,collection:"stations"});

const Station=mongoose.models.Station||mongoose.model("Station",stationSchema);

export default Station;