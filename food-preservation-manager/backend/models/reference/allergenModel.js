import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const allergenSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 code:{type:String,required:true,trim:true,uppercase:true,unique:true},
 emoji:{type:String,trim:true,default:""},
 severityLevel:{
  type:String,
  enum:["Low","Medium","High","Severe"],
  default:"High"
 },
 isMajor:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"allergens"});

allergenSchema.index({name:1});
allergenSchema.index({isActive:1});
allergenSchema.index({isMajor:1});

const Allergen=businessInfoConnection.models.Allergen||businessInfoConnection.model("Allergen",allergenSchema);

export default Allergen;
