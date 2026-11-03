import Business from "../reference/businessModel.js";
import Location from "../reference/LocationModel.js";
// src/backend/models/waste/wasteRecord.js
import mongoose from "mongoose";

const wasteRecordSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:Business},
 beverageItemRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"BeverageItem"},
 locationRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:Location},
 lotRef:{type:mongoose.Schema.Types.ObjectId,default:null,index:true,ref:"InventoryLot"},
 qty:{type:Number,required:true,min:0},
 cost:{type:Number,default:0,min:0},
 reason:{type:String,trim:true,default:""},
 wasteDate:{type:Date,required:true,index:true},
 notes:{type:String,trim:true,default:""},
 createdByRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"User"}
},{ timestamps:true, collection:"waste_records"});

wasteRecordSchema.index({business_id:1,locationRef:1,wasteDate:-1});
wasteRecordSchema.index({business_id:1,beverageItemRef:1});
wasteRecordSchema.index({business_id:1,reason:1});

const WasteRecord=mongoose.models.WasteRecord||mongoose.model("WasteRecord",wasteRecordSchema);

export default WasteRecord;