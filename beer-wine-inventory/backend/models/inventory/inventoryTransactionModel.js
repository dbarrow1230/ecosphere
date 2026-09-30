import Business from "../reference/businessModel.js";
import Location from "../reference/LocationModel.js";
//backend/models/inventory/inventoryTransactionModel.js
import mongoose from "mongoose";

const inventoryTransactionSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:Business},
 beverageItemRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"BeverageItem"},
 locationRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:Location},
 lotRef:{type:mongoose.Schema.Types.ObjectId,default:null,index:true,ref:"InventoryLot"},
 transactionType:{type:String,required:true,enum:["receipt","issue","adjustment","transferOut","transferIn","returnToVendor","waste","countVariance"],index:true},
 referenceType:{type:String,required:true,enum:["purchaseOrder","goodsReceipt","stockCount","stockTransfer","stockAdjustment","vendorReturn","salesUsage","manual"],index:true},
 referenceId:{type:mongoose.Schema.Types.ObjectId,default:null,index:true},
 qty:{type:Number,required:true},
 unitCost:{type:Number,default:0,min:0},
 totalCost:{type:Number,default:0},
 balanceAfter:{type:Number,default:0},
 reasonCode:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},
 createdByRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"User"}
},{ timestamps:true, collection:"inventory_transactions"});

inventoryTransactionSchema.index({business_id:1,beverageItemRef:1,locationRef:1,createdAt:-1});
inventoryTransactionSchema.index({business_id:1,referenceType:1,referenceId:1});
inventoryTransactionSchema.index({business_id:1,transactionType:1});
inventoryTransactionSchema.index({business_id:1,createdAt:-1});

const InventoryTransaction=mongoose.models.InventoryTransaction||mongoose.model("InventoryTransaction",inventoryTransactionSchema);

export default InventoryTransaction;