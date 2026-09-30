// backend/models/inventoryTransactionModel.js
import mongoose from "mongoose";

const inventoryTransactionSchema=new mongoose.Schema({
 inventory:{type:mongoose.Schema.Types.ObjectId,ref:"Inventory",required:true},
 event:{type:mongoose.Schema.Types.ObjectId,ref:"Event"},
 order:{type:mongoose.Schema.Types.ObjectId,ref:"Order"},
 supplier:{type:mongoose.Schema.Types.ObjectId,ref:"Supplier"},
 type:{type:String,enum:["purchase","usage","adjustment","waste","return"],required:true},
 quantity:{type:Number,required:true},
 unitCost:{type:mongoose.Schema.Types.Decimal128,default:0},
 totalCost:{type:mongoose.Schema.Types.Decimal128,default:0},
 referenceNumber:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""}
},{
 timestamps:true,
 collection:"inventorytransactions"
});

const InventoryTransaction=mongoose.models.InventoryTransaction||mongoose.model("InventoryTransaction",inventoryTransactionSchema);

export default InventoryTransaction;