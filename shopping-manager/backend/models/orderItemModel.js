// /backend/models/orderItemModel.js
import mongoose from 'mongoose';

const orderItemSchema=new mongoose.Schema({
order:{type:mongoose.Schema.Types.ObjectId,ref:'Order',required:true},
product:{type:mongoose.Schema.Types.ObjectId,ref:'Product',required:true},
shoppingListItem:{type:mongoose.Schema.Types.ObjectId,ref:'ShoppingListItem',default:null},
unit:{type:mongoose.Schema.Types.ObjectId,ref:'Unit',default:null},
store:{type:mongoose.Schema.Types.ObjectId,ref:'Store',default:null},
quantityOrdered:{type:Number,required:true,default:1},
quantityShipped:{type:Number,default:0},
quantityDelivered:{type:Number,default:0},
quantityCancelled:{type:Number,default:0},
quantityReturned:{type:Number,default:0},
unitPrice:{type:Number,required:true,default:0},
discountAmount:{type:Number,default:0},
taxAmount:{type:Number,default:0},
subtotal:{type:Number,required:true,default:0},
status:{type:mongoose.Schema.Types.ObjectId,ref:'Status',default:null},
carrier:{type:String,trim:true,default:''},
trackingNumber:{type:String,trim:true,default:''},
trackingUrl:{type:String,trim:true,default:''},
estimatedDeliveryDate:{type:Date,default:null},
shippedAt:{type:Date,default:null},
deliveredAt:{type:Date,default:null},
notes:{type:String,trim:true,default:''}
},{timestamps:true,collection:'order_items'});

export default mongoose.models.OrderItem||mongoose.model('OrderItem',orderItemSchema);