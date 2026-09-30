// backend/models/inventory/storageLocationModel.js
import mongoose from "mongoose";

const storageLocationSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,default:"",unique:true,sparse:true},
 type:{type:String,trim:true,default:""}, // pantry, freezer, shelf, market, fridge
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"storage_locations"});

const StorageLocation=mongoose.models.StorageLocation||mongoose.model("StorageLocation",storageLocationSchema);

export default StorageLocation;