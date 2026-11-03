// backend/models/supplier/creditMemoModel.js
import mongoose from "mongoose";

const creditMemoSchema=new mongoose.Schema({
 supplier:{type:mongoose.Schema.Types.ObjectId,ref:"Supplier",required:true},

 creditNumber:{type:String,required:true,trim:true,unique:true},
 supplierInvoice:{type:mongoose.Schema.Types.ObjectId,ref:"SupplierInvoice"},

 amount:{type:mongoose.Schema.Types.Decimal128},

 reason:{type:String,trim:true,default:""},

 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status"},

 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"credit_memos"});

const CreditMemo=mongoose.models.CreditMemo||mongoose.model("CreditMemo",creditMemoSchema);

export default CreditMemo;