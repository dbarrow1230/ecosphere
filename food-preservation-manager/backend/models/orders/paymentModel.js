// backend/models/order/paymentModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const paymentSchema=new mongoose.Schema({
 order:{type:mongoose.Schema.Types.ObjectId,ref:"Order",required:true},

 paymentNumber:{type:String,trim:true,default:"",unique:true,sparse:true},

 method:{type:String,trim:true,default:""}, // cash, card, online

 amount:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},

 paymentDate:{type:Date,default:Date.now},

 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status"},

 reference:{type:String,trim:true,default:""},

 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"payments"});

const Payment=mongoose.models.Payment||mongoose.model("Payment",paymentSchema);

export default Payment;