// /backend/models/returnModel.js
import mongoose from 'mongoose';

const returnSchema=new mongoose.Schema({
user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
store:{type:mongoose.Schema.Types.ObjectId,ref:'Store',default:null},
order:{type:mongoose.Schema.Types.ObjectId,ref:'Order',default:null},
purchase:{type:mongoose.Schema.Types.ObjectId,ref:'Purchase',default:null},
receipt:{type:mongoose.Schema.Types.ObjectId,ref:'Receipt',default:null},
returnNumber:{type:String,required:true,trim:true},
returnDate:{type:Date,default:Date.now},
status:{type:mongoose.Schema.Types.ObjectId,ref:'Status',default:null},
refundStatus:{type:mongoose.Schema.Types.ObjectId,ref:'Status',default:null},
refundMethod:{type:mongoose.Schema.Types.ObjectId,ref:'Status',default:null},
carrier:{type:String,trim:true,default:''},
trackingNumber:{type:String,trim:true,default:''},
trackingUrl:{type:String,trim:true,default:''},
reason:{type:String,trim:true,default:''},
refundTotal:{type:Number,default:0},
requestedAt:{type:Date,default:Date.now},
approvedAt:{type:Date,default:null},
shippedAt:{type:Date,default:null},
receivedAt:{type:Date,default:null},
completedAt:{type:Date,default:null},
notes:{type:String,trim:true,default:''}
},{timestamps:true,collection:'returns'});

export default mongoose.models.Return||mongoose.model('Return',returnSchema);