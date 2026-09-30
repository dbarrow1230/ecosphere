// /backend/models/receiptModel.js
import mongoose from 'mongoose';

const receiptSchema=new mongoose.Schema({
user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
purchase:{type:mongoose.Schema.Types.ObjectId,ref:'Purchase',default:null},
store:{type:mongoose.Schema.Types.ObjectId,ref:'Store',default:null},
receiptNumber:{type:String,trim:true,default:''},
image:{type:String,default:''},
purchaseDate:{type:Date,default:Date.now},
subtotal:{type:Number,default:0},
taxTotal:{type:Number,default:0},
discountTotal:{type:Number,default:0},
total:{type:Number,default:0},
currency:{type:mongoose.Schema.Types.ObjectId,ref:'Currency',default:null},
address1:{type:String,trim:true,default:''},
address2:{type:String,trim:true,default:''},
city:{type:String,trim:true,default:''},
state:{type:mongoose.Schema.Types.ObjectId,ref:'State',default:null},
country:{type:mongoose.Schema.Types.ObjectId,ref:'Country',default:null},
postalCode:{type:String,trim:true,default:''},
notes:{type:String,trim:true,default:''}
},{timestamps:true,collection:'receipts'});

export default mongoose.models.Receipt||mongoose.model('Receipt',receiptSchema);