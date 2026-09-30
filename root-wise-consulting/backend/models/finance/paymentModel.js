//backend/models/finance/paymentModel.js
import mongoose from "mongoose";

const paymentSchema=new mongoose.Schema({
 invoice:{type:mongoose.Schema.Types.ObjectId,ref:"Invoice",required:true},
 project:{type:mongoose.Schema.Types.ObjectId,ref:"Project",required:true},
 clientBusiness:{type:mongoose.Schema.Types.ObjectId,ref:"ClientBusiness",required:true},

 paymentNumber:{type:String,trim:true,default:""},
 paymentDate:{type:Date,default:Date.now},
 amount:{type:Number,required:true,min:0},

 method:{type:String,enum:["cash","check","card","bank-transfer","zelle","paypal","stripe","other"],default:"other"},
 referenceNumber:{type:String,trim:true,default:""},
 depositTo:{type:String,trim:true,default:""},

 status:{type:String,enum:["pending","completed","failed","refunded","void"],default:"completed"},

 notes:{type:String,trim:true,default:""},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"payments"});

paymentSchema.index({invoice:1});
paymentSchema.index({project:1});
paymentSchema.index({clientBusiness:1});
paymentSchema.index({paymentDate:1});
paymentSchema.index({status:1});
paymentSchema.index({isActive:1});

const Payment=mongoose.models.Payment||mongoose.model("Payment",paymentSchema);

export default Payment;