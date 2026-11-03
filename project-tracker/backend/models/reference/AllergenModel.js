// backend/models/reference/AllergenModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const allergenSchema=new mongoose.Schema(
{
 name:{type:String,required:true,trim:true},
 code:{type:String,required:true,trim:true,uppercase:true},
 emoji:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},
 severityLevel:{
  type:String,
  trim:true,
  lowercase:true,
  enum:["low","medium","high","severe"],
  default:"medium"
 },
 isMajor:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true}
},
{timestamps:true,collection:"allergens"}
);

allergenSchema.index({name:1},{unique:true});
allergenSchema.index({code:1},{unique:true});
allergenSchema.index({isMajor:1});
allergenSchema.index({isActive:1});

const Allergen=businessInfoConnection.models.Allergen||businessInfoConnection.model("Allergen",allergenSchema);

export default Allergen;