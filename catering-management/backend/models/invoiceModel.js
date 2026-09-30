// backend/models/invoiceModel.js
import mongoose from "mongoose";

const invoiceSchema=new mongoose.Schema({
 client:{type:mongoose.Schema.Types.ObjectId,ref:"Client",required:true},
 event:{type:mongoose.Schema.Types.ObjectId,ref:"Event"},
 order:{type:mongoose.Schema.Types.ObjectId,ref:"Order",required:true},
 invoiceNumber:{type:String,required:true,trim:true},
 issueDate:{type:Date,required:true},
 dueDate:{type:Date},
 subtotal:{type:mongoose.Schema.Types.Decimal128,default:0},
 tax:{type:mongoose.Schema.Types.Decimal128,default:0},
 discount:{type:mongoose.Schema.Types.Decimal128,default:0},
 total:{type:mongoose.Schema.Types.Decimal128,default:0},
 balanceDue:{type:mongoose.Schema.Types.Decimal128,default:0},
 status:{type:String,enum:["draft","sent","partial","paid","overdue","cancelled"],default:"draft"},
 notes:{type:String,trim:true,default:""}
},{
 timestamps:true,
 collection:"invoices"
});

const Invoice=mongoose.models.Invoice||mongoose.model("Invoice",invoiceSchema);

export default Invoice;