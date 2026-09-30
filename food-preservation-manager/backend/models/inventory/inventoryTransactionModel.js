// backend/models/inventory/inventoryTransactionModel.js
import mongoose from "mongoose";

const inventoryTransactionSchema=new mongoose.Schema({
 inventory:{type:mongoose.Schema.Types.ObjectId,ref:"Inventory",required:true},

 type:{type:String,required:true,trim:true}, // production_in, reserve, release, sale_out, spoilage, damage, transfer, adjustment_increase, adjustment_decrease, purchase_in

 quantityChange:{type:Number,required:true,default:0},
 quantityBefore:{type:Number,default:0},
 quantityAfter:{type:Number,default:0},

 sourceRefs:{
  productBatch:{type:mongoose.Schema.Types.ObjectId,ref:"ProductBatch"},
  order:{type:mongoose.Schema.Types.ObjectId,ref:"Order"},
  orderItem:{type:mongoose.Schema.Types.ObjectId,ref:"OrderItem"},
  supplierInvoice:{type:mongoose.Schema.Types.ObjectId,ref:"SupplierInvoice"},
  purchaseOrder:{type:mongoose.Schema.Types.ObjectId,ref:"PurchaseOrder"},
  processRef:{type:mongoose.Schema.Types.ObjectId}
 },

 date:{type:Date,default:Date.now},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"inventory_transactions"});

const InventoryTransaction=mongoose.models.InventoryTransaction||mongoose.model("InventoryTransaction",inventoryTransactionSchema);

export default InventoryTransaction;