// backend/models/orders/orderModel.js
import mongoose from "mongoose";

const orderSchema=new mongoose.Schema({
 orderNumber:{type:String,required:true},
 status:{type:String,default:"pending"},
 total:{type:Number,required:true},
 paymentStatus:{type:String,default:"unpaid"},
 paymentMethod:{type:String},
 customerName:{type:String,trim:true},
 customerPhone:{type:String,trim:true}
},{timestamps:true,collection:"orders"});

const Order=mongoose.model("Order",orderSchema);
export default Order;