// backend/models/supplier/supplierInvoiceItemModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const supplierInvoiceItemSchema=new mongoose.Schema({
 supplierInvoice:{type:mongoose.Schema.Types.ObjectId,ref:"SupplierInvoice",required:true},

 purchaseOrderItem:{type:mongoose.Schema.Types.ObjectId,ref:"PurchaseOrderItem"},

 supplierProduct:{type:mongoose.Schema.Types.ObjectId,ref:"SupplierProduct"},

 quantity:{type:Number,required:true,default:0},
 unit:{type:String,trim:true,default:""},

 unitPrice:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
 totalPrice:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},

 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"supplier_invoice_items"});

const SupplierInvoiceItem=mongoose.models.SupplierInvoiceItem||mongoose.model("SupplierInvoiceItem",supplierInvoiceItemSchema);

export default SupplierInvoiceItem;