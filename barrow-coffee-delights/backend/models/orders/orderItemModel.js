// backend/models/orders/orderItemModel.js
import mongoose from "mongoose";

const orderItemSchema=new mongoose.Schema({
 order:{type:mongoose.Schema.Types.ObjectId,ref:"Order",required:true},
 menuItem:{type:mongoose.Schema.Types.ObjectId,ref:"MenuItem",required:true},
 name:{type:String,required:true},
 price:{type:Number,required:true},
 quantity:{type:Number,default:1}
},{timestamps:true,collection:"order_items"});

const OrderItem=mongoose.model("OrderItem",orderItemSchema);
export default OrderItem;