//backend\models\locations\StorageLocationModel.js
import mongoose from "mongoose";

const storageLocationSchema=new mongoose.Schema({
 location:{type:mongoose.Schema.Types.ObjectId,ref:"Location",required:true},

 storageType:{type:String,enum:["dry","walk-in","reach-in","freezer","wine","bar","other"],default:"dry"},

 temperatureRange:{type:String,trim:true,default:""},
 capacityNotes:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"storage_locations"});

storageLocationSchema.index({location:1},{unique:true});
storageLocationSchema.index({storageType:1});

export default mongoose.models.StorageLocation||mongoose.model("StorageLocation",storageLocationSchema);