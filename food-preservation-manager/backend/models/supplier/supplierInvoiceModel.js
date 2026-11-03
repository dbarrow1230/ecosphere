// backend/models/supplier/supplierInvoiceModel.js
import mongoose from "mongoose";

const supplierInvoiceSchema=new mongoose.Schema({
 supplier:{type:mongoose.Schema.Types.ObjectId,ref:"Supplier",required:true},

 invoiceNumber:{type:String,required:true,trim:true},
 purchaseOrder:{type:mongoose.Schema.Types.ObjectId,ref:"PurchaseOrder"},

 invoiceDate:{type:Date},
 dueDate:{type:Date},

 totalAmount:{type:mongoose.Schema.Types.Decimal128},

 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status"},

 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"supplier_invoices"});

const SupplierInvoice=mongoose.models.SupplierInvoice||mongoose.model("SupplierInvoice",supplierInvoiceSchema);

export default SupplierInvoice;