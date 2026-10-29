// backend/models/locations/countryModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const countrySchema=new mongoose.Schema(
{
name:{type:String,required:true,trim:true,unique:true},
iso2:{type:String,required:true,trim:true,uppercase:true,unique:true},
iso3:{type:String,trim:true,uppercase:true},
flag:{type:String,trim:true},
phoneCode:{type:String,trim:true},
currency:{type:String,trim:true,uppercase:true},
timezone:{type:String,trim:true},
utcOffset:{type:String,trim:true}
},
{timestamps:true,collection:"countries"}
);

const Country=businessInfoConnection.models.Country||businessInfoConnection.model("Country",countrySchema);

export default Country;