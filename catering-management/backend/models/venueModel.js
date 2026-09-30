// backend/models/venueModel.js
import mongoose from "mongoose";

const venueSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 contactName:{type:String,trim:true,default:""},
 email:{type:String,trim:true,lowercase:true,default:""},
 phone:{type:String,trim:true,default:""},
 address1:{type:String,trim:true,default:""},
 address2:{type:String,trim:true,default:""},
 city:{type:String,trim:true,default:""},
 state:{type:mongoose.Schema.Types.ObjectId,ref:"State"},
 country:{type:mongoose.Schema.Types.ObjectId,ref:"Country"},
 postalCode:{type:String,trim:true,default:""},
 indoorCapacity:{type:Number,default:0,min:0},
 outdoorCapacity:{type:Number,default:0,min:0},
 notes:{type:String,trim:true,default:""},
 status:{type:String,enum:["active","inactive"],default:"active"}
},{ timestamps:true, collection:"venues"});

const Venue=mongoose.models.Venue||mongoose.model("Venue",venueSchema);

export default Venue;