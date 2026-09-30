// backend/models/order/orderItemModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const orderItemSchema=new mongoose.Schema({
 order:{type:mongoose.Schema.Types.ObjectId,ref:"Order",required:true},

 product:{type:mongoose.Schema.Types.ObjectId,ref:"Product",required:true},
 productBatch:{type:mongoose.Schema.Types.ObjectId,ref:"ProductBatch"},

 name:{type:String,trim:true,default:""},

 quantity:{type:Number,required:true,default:0},

 unitPrice:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
 totalPrice:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},

 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status"},

 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"order_items"});

const OrderItem=mongoose.models.OrderItem||mongoose.model("OrderItem",orderItemSchema);

export default OrderItem;