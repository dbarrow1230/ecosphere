// backend/models/paymentModel.js
import mongoose from "mongoose";

const paymentSchema=new mongoose.Schema({
 client:{type:mongoose.Schema.Types.ObjectId,ref:"Client",required:true},
 event:{type:mongoose.Schema.Types.ObjectId,ref:"Event"},
 order:{type:mongoose.Schema.Types.ObjectId,ref:"Order"},
 invoice:{type:mongoose.Schema.Types.ObjectId,ref:"Invoice"},
 paymentNumber:{type:String,trim:true,default:""},
 amount:{type:mongoose.Schema.Types.Decimal128,required:true,default:0},
 method:{type:String,enum:["cash","card","bank-transfer","check","online"],required:true},
 status:{type:String,enum:["pending","completed","failed","refunded","cancelled"],default:"pending"},
 transactionId:{type:String,trim:true,default:""},
 paidAt:{type:Date},
 notes:{type:String,trim:true,default:""}
},{
 timestamps:true,
 collection:"payments"
});

const Payment=mongoose.models.Payment||mongoose.model("Payment",paymentSchema);

export default Payment;