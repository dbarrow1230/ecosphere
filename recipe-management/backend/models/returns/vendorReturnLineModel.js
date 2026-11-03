// src/backend/models/returns/vendorReturnLine.js
import mongoose from "mongoose";

const vendorReturnLineSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 vendorReturnRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"VendorReturn"},
 beverageItemRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"BeverageItem"},
 lotRef:{type:mongoose.Schema.Types.ObjectId,default:null,index:true,ref:"InventoryLot"},
 uomRef:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"UnitOfMeasure"},
 qty:{type:Number,required:true,min:0},
 unitCost:{type:Number,default:0,min:0},
 lineTotal:{type:Number,default:0,min:0},
 reasonCode:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""}
},{ timestamps:true, collection:"vendor_return_lines"});

vendorReturnLineSchema.index({business_id:1,vendorReturnRef:1});
vendorReturnLineSchema.index({business_id:1,beverageItemRef:1});

const VendorReturnLine=mongoose.models.VendorReturnLine||mongoose.model("VendorReturnLine",vendorReturnLineSchema);

export default VendorReturnLine;