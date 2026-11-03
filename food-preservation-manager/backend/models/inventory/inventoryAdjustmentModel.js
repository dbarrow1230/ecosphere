// backend/models/inventory/inventoryAdjustmentModel.js
import mongoose from "mongoose";

const inventoryAdjustmentSchema=new mongoose.Schema({
 inventory:{type:mongoose.Schema.Types.ObjectId,ref:"Inventory",required:true},

 type:{type:String,required:true,trim:true}, // count_correction, damage, spoilage, expiry, loss, manual_fix

 quantityAdjusted:{type:Number,required:true,default:0},
 reason:{type:String,trim:true,default:""},

 user:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
 note:{type:String,trim:true,default:""},
 date:{type:Date,default:Date.now}
},{timestamps:true,collection:"inventory_adjustments"});

const InventoryAdjustment=mongoose.models.InventoryAdjustment||mongoose.model("InventoryAdjustment",inventoryAdjustmentSchema);

export default InventoryAdjustment;