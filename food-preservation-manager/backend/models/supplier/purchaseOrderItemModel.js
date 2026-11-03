// backend/models/supplier/purchaseOrderItemModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const purchaseOrderItemSchema=new mongoose.Schema({
 purchaseOrder:{type:mongoose.Schema.Types.ObjectId,ref:"PurchaseOrder",required:true},

 supplierProduct:{type:mongoose.Schema.Types.ObjectId,ref:"SupplierProduct"},

 name:{type:String,trim:true,default:""},

 quantity:{type:Number,required:true,default:0},
 unit:{type:String,trim:true,default:""},

 unitPrice:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
 totalPrice:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},

 receivedQuantity:{type:Number,default:0},

 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"purchase_order_items"});

const PurchaseOrderItem=mongoose.models.PurchaseOrderItem||mongoose.model("PurchaseOrderItem",purchaseOrderItemSchema);

export default PurchaseOrderItem;