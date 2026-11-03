// backend/models/order/invoiceModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const invoiceSchema=new mongoose.Schema({
 order:{type:mongoose.Schema.Types.ObjectId,ref:"Order",required:true},

 invoiceNumber:{type:String,required:true,trim:true,unique:true},

 issueDate:{type:Date,default:Date.now},
 dueDate:{type:Date},

 totals:{
  subtotal:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  tax:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  total:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d}
 },

 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status"},

 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"invoices"});

const Invoice=mongoose.models.Invoice||mongoose.model("Invoice",invoiceSchema);

export default Invoice;