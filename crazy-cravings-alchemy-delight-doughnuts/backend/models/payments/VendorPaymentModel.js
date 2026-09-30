// backend/models/payments/VendorPaymentModel.js
import mongoose from "mongoose";

const vendorPaymentEventSchema=new mongoose.Schema({
 type:{type:String,required:true,trim:true},
 status:{type:String,trim:true,default:""},
 amount:{type:Number,default:0,min:0},
 note:{type:String,trim:true,default:""},
 metadata:{type:mongoose.Schema.Types.Mixed,default:{}},
 createdAt:{type:Date,default:Date.now}
},{_id:false});

const vendorPaymentRefundSchema=new mongoose.Schema({
 amount:{type:Number,required:true,min:0},
 reason:{type:String,trim:true,default:""},
 status:{type:String,enum:["pending","processed","failed"],default:"pending"},
 refundedAt:{type:Date,default:null},
 metadata:{type:mongoose.Schema.Types.Mixed,default:{}}
},{timestamps:true});

const vendorPaymentSchema=new mongoose.Schema({
 purchaseOrder:{type:mongoose.Schema.Types.ObjectId,ref:"PurchaseOrder",required:true,index:true},
 vendor:{type:mongoose.Schema.Types.ObjectId,ref:"Vendor",required:true,index:true},

 method:{type:String,enum:["cash","check","card","bank-transfer","zelle","cashapp","other"],required:true},
 provider:{type:String,trim:true,default:""},
 reference:{type:String,trim:true,default:""},

 amount:{type:Number,required:true,min:0},
 currency:{type:String,trim:true,default:"USD"},

 status:{type:String,enum:["pending","authorized","paid","failed","cancelled","partially-refunded","refunded"],default:"pending",index:true},

 paidAt:{type:Date,default:null},
 failedAt:{type:Date,default:null},
 cancelledAt:{type:Date,default:null},

 refunds:{type:[vendorPaymentRefundSchema],default:[]},
 events:{type:[vendorPaymentEventSchema],default:[]},

 notes:{type:String,trim:true,default:""},
 metadata:{type:mongoose.Schema.Types.Mixed,default:{}},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},

 isActive:{type:Boolean,default:true,index:true}
},{ timestamps:true, collection:"vendor_payments"});

vendorPaymentSchema.index({purchaseOrder:1,status:1,createdAt:-1});
vendorPaymentSchema.index({vendor:1,createdAt:-1});

export default mongoose.model("VendorPayment",vendorPaymentSchema);