// /backend/models/orderModel.js
import mongoose from 'mongoose';

const orderSchema=new mongoose.Schema({
user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
store:{type:mongoose.Schema.Types.ObjectId,ref:'Store',default:null},
shoppingList:{type:mongoose.Schema.Types.ObjectId,ref:'ShoppingList',default:null},
coupon:{type:mongoose.Schema.Types.ObjectId,ref:'Coupon',default:null},
receipt:{type:mongoose.Schema.Types.ObjectId,ref:'Receipt',default:null},
orderNumber:{type:String,required:true,trim:true},
orderDate:{type:Date,default:Date.now},
type:{type:String,enum:['online','pickup','delivery'],default:'online'},
status:{type:mongoose.Schema.Types.ObjectId,ref:'Status',default:null},
paymentStatus:{type:mongoose.Schema.Types.ObjectId,ref:'Status',default:null},
shippingStatus:{type:mongoose.Schema.Types.ObjectId,ref:'Status',default:null},
carrier:{type:String,trim:true,default:''},
trackingNumber:{type:String,trim:true,default:''},
trackingUrl:{type:String,trim:true,default:''},
shippingAddress1:{type:String,trim:true,default:''},
shippingAddress2:{type:String,trim:true,default:''},
shippingCity:{type:String,trim:true,default:''},
shippingState:{type:mongoose.Schema.Types.ObjectId,ref:'State',default:null},
shippingCountry:{type:mongoose.Schema.Types.ObjectId,ref:'Country',default:null},
shippingPostalCode:{type:String,trim:true,default:''},
billingAddress1:{type:String,trim:true,default:''},
billingAddress2:{type:String,trim:true,default:''},
billingCity:{type:String,trim:true,default:''},
billingState:{type:mongoose.Schema.Types.ObjectId,ref:'State',default:null},
billingCountry:{type:mongoose.Schema.Types.ObjectId,ref:'Country',default:null},
billingPostalCode:{type:String,trim:true,default:''},
subtotal:{type:Number,default:0},
discountTotal:{type:Number,default:0},
taxTotal:{type:Number,default:0},
shippingTotal:{type:Number,default:0},
refundTotal:{type:Number,default:0},
total:{type:Number,default:0},
estimatedDeliveryDate:{type:Date,default:null},
shippedAt:{type:Date,default:null},
deliveredAt:{type:Date,default:null},
cancelledAt:{type:Date,default:null},
notes:{type:String,trim:true,default:''}
},{timestamps:true,collection:'orders'});

export default mongoose.models.Order||mongoose.model('Order',orderSchema);