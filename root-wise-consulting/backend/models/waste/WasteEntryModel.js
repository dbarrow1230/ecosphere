//backend\models\waste\WasteEntryModel.js
import mongoose from "mongoose";

const wasteEntrySchema=new mongoose.Schema({
 item:{type:mongoose.Schema.Types.ObjectId,ref:"InventoryItem",default:null},
 itemName:{type:String,trim:true,default:""},

 quantity:{type:Number,required:true,min:0},
 unit:{type:String,trim:true,default:""},
 estimatedCost:{type:Number,default:0,min:0},

 reason:{type:mongoose.Schema.Types.ObjectId,ref:"WasteReason",default:null},
 reasonNote:{type:String,trim:true,default:""},

 location:{type:mongoose.Schema.Types.ObjectId,ref:"Location",default:null},

 recordedAt:{type:Date,default:Date.now},
 recordedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},

 notes:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"waste_entries"});

wasteEntrySchema.index({item:1});
wasteEntrySchema.index({reason:1});
wasteEntrySchema.index({location:1});
wasteEntrySchema.index({recordedAt:1});
wasteEntrySchema.index({isActive:1});

export default mongoose.models.WasteEntry||mongoose.model("WasteEntry",wasteEntrySchema);