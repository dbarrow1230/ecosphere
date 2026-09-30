// backend/models/payments/PaymentModel.js
import mongoose from "mongoose";

const refundSchema=new mongoose.Schema({
 amount:{type:Number,required:true,min:0},
 reason:{type:String,trim:true,default:""},
 status:{type:String,enum:["pending","processed","failed"],default:"pending"},
 refundedAt:{type:Date,default:null},
 metadata:{type:mongoose.Schema.Types.Mixed,default:{}}
},{timestamps:true});

const paymentEventSchema=new mongoose.Schema({
 type:{type:String,required:true,trim:true},
 status:{type:String,trim:true,default:""},
 amount:{type:Number,default:0,min:0},
 note:{type:String,trim:true,default:""},
 metadata:{type:mongoose.Schema.Types.Mixed,default:{}},
 createdAt:{type:Date,default:Date.now}
},{_id:false});

const paymentSchema=new mongoose.Schema({
 order:{type:mongoose.Schema.Types.ObjectId,ref:"Order",required:true,index:true},
 customer:{type:mongoose.Schema.Types.ObjectId,ref:"Customer",required:true,index:true},

 method:{type:String,enum:["card","cash","apple-pay","google-pay","paypal","zelle","cashapp","other"],required:true},
 provider:{type:String,trim:true,default:""},
 reference:{type:String,trim:true,default:""},

 amount:{type:Number,required:true,min:0},
 currency:{type:String,trim:true,default:"USD"},

 status:{type:String,enum:["pending","authorized","paid","failed","cancelled","partially-refunded","refunded"],default:"pending",index:true},

 paidAt:{type:Date,default:null},
 failedAt:{type:Date,default:null},
 cancelledAt:{type:Date,default:null},

 refunds:{type:[refundSchema],default:[]},
 events:{type:[paymentEventSchema],default:[]},

 notes:{type:String,trim:true,default:""},
 metadata:{type:mongoose.Schema.Types.Mixed,default:{}},

 isActive:{type:Boolean,default:true,index:true}
},{timestamps:true, collection:"payments"});

paymentSchema.index({order:1,status:1,createdAt:-1});
paymentSchema.index({customer:1,createdAt:-1});

export default mongoose.model("Payment",paymentSchema);