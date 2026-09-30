// /backend/models/returnItemModel.js
import mongoose from 'mongoose';

const returnItemSchema=new mongoose.Schema({
return:{type:mongoose.Schema.Types.ObjectId,ref:'Return',required:true},
orderItem:{type:mongoose.Schema.Types.ObjectId,ref:'OrderItem',default:null},
purchaseItem:{type:mongoose.Schema.Types.ObjectId,ref:'PurchaseItem',default:null},
product:{type:mongoose.Schema.Types.ObjectId,ref:'Product',required:true},
unit:{type:mongoose.Schema.Types.ObjectId,ref:'Unit',default:null},
quantity:{type:Number,required:true,default:1},
unitPrice:{type:Number,default:0},
refundAmount:{type:Number,default:0},
reason:{type:mongoose.Schema.Types.ObjectId,ref:'Status',default:null},
condition:{type:mongoose.Schema.Types.ObjectId,ref:'Status',default:null},
resolution:{type:mongoose.Schema.Types.ObjectId,ref:'Status',default:null},
status:{type:mongoose.Schema.Types.ObjectId,ref:'Status',default:null},
notes:{type:String,trim:true,default:''}
},{timestamps:true,collection:'return_items'});

export default mongoose.models.ReturnItem||mongoose.model('ReturnItem',returnItemSchema);