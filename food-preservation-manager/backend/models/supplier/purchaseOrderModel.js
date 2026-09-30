// backend/models/supplier/purchaseOrderModel.js
import mongoose from "mongoose";

const purchaseOrderSchema=new mongoose.Schema({
 supplier:{type:mongoose.Schema.Types.ObjectId,ref:"Supplier",required:true},

 orderNumber:{type:String,required:true,trim:true,unique:true},

 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status"},

 orderDate:{type:Date},
 expectedDate:{type:Date},

 totalAmount:{type:mongoose.Schema.Types.Decimal128},

 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"purchase_orders"});

const PurchaseOrder=mongoose.models.PurchaseOrder||mongoose.model("PurchaseOrder",purchaseOrderSchema);

export default PurchaseOrder;