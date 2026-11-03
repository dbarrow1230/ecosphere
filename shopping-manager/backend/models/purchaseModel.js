// /backend/models/purchaseModel.js
import mongoose from 'mongoose';

const purchaseSchema=new mongoose.Schema({
user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
store:{type:mongoose.Schema.Types.ObjectId,ref:'Store',default:null},
receipt:{type:mongoose.Schema.Types.ObjectId,ref:'Receipt',default:null},
coupon:{type:mongoose.Schema.Types.ObjectId,ref:'Coupon',default:null},
shoppingList:{type:mongoose.Schema.Types.ObjectId,ref:'ShoppingList',default:null},
purchaseDate:{type:Date,default:Date.now},
subtotal:{type:Number,default:0},
discountTotal:{type:Number,default:0},
taxTotal:{type:Number,default:0},
shippingTotal:{type:Number,default:0},
total:{type:Number,default:0},
paymentMethod:{type:String,trim:true,default:''},
status:{type:mongoose.Schema.Types.ObjectId,ref:'Status',default:null},
notes:{type:String,trim:true,default:''}
},{timestamps:true,collection:'purchases'});

export default mongoose.models.Purchase||mongoose.model('Purchase',purchaseSchema);