// backend/models/order/statementModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const statementSchema=new mongoose.Schema({
 statementNumber:{type:String,required:true,trim:true,unique:true},

 customer:{type:mongoose.Schema.Types.ObjectId,ref:"Customer"},

 periodStart:{type:Date,required:true},
 periodEnd:{type:Date,required:true},
 statementDate:{type:Date,default:Date.now},

 invoices:[{type:mongoose.Schema.Types.ObjectId,ref:"Invoice"}],
 payments:[{type:mongoose.Schema.Types.ObjectId,ref:"Payment"}],
 orders:[{type:mongoose.Schema.Types.ObjectId,ref:"Order"}],

 summary:{
  openingBalance:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  totalInvoiced:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  totalPaid:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  creditTotal:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  closingBalance:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  amountDue:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d}
 },

 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status"},

 notes:{
  customerNotes:{type:String,trim:true,default:""},
  internalNotes:{type:String,trim:true,default:""},
  paymentInstructions:{type:String,trim:true,default:""}
 }
},{timestamps:true,collection:"statements"});

const Statement=mongoose.models.Statement||mongoose.model("Statement",statementSchema);

export default Statement;