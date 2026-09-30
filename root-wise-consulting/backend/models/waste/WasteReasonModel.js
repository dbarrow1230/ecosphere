//backend\models\waste\WasteReasonModel.js
import mongoose from "mongoose";

const wasteReasonSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,default:""},
 category:{type:String,enum:["spoilage","overproduction","prep-loss","expired","damage","quality","theft","other"],default:"other"},
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"waste_reasons"});

wasteReasonSchema.index({name:1});
wasteReasonSchema.index({category:1});
wasteReasonSchema.index({isActive:1});

export default mongoose.models.WasteReason||mongoose.model("WasteReason",wasteReasonSchema);