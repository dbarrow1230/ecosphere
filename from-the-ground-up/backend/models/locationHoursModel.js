import mongoose from "mongoose";

const locationHourSchema=new mongoose.Schema({
 day:{type:String,required:true,trim:true},
 open:{type:String,default:""},
 close:{type:String,default:""},
 closed:{type:Boolean,default:false}
},{_id:true});

const locationSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 slug:{type:String,trim:true,lowercase:true},
 address:{type:String,trim:true},
 phone:{type:String,trim:true},
 overnightPhone:{type:String,trim:true},
 onCallPerson:{type:String,trim:true},
 onCallPhone:{type:String,trim:true},
 email:{type:String,trim:true,lowercase:true},
 borough:{type:mongoose.Schema.Types.ObjectId,ref:"Borough",required:false},
 county:{type:mongoose.Schema.Types.ObjectId,ref:"County",required:false},
 state:{type:mongoose.Schema.Types.ObjectId,ref:"State",required:false},
 country:{type:mongoose.Schema.Types.ObjectId,ref:"Country",required:false},
 hours:[locationHourSchema],
 active:{type:Boolean,default:true}
},{timestamps:true,collection:"locations"});

const Location=mongoose.model("Location",locationSchema);
export default Location;