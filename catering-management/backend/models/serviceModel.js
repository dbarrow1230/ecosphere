// backend/models/serviceModel.js
import mongoose from "mongoose";

const serviceSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 category:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},
 priceType:{type:String,enum:["flat","per-guest","hourly"],default:"flat"},
 price:{type:mongoose.Schema.Types.Decimal128,default:0},
 unit:{type:String,trim:true,default:""},
 status:{type:String,enum:["active","inactive","draft"],default:"active"},
 notes:{type:String,trim:true,default:""}
},{
 timestamps:true,
 collection:"services"
});

const Service=mongoose.models.Service||mongoose.model("Service",serviceSchema);

export default Service;