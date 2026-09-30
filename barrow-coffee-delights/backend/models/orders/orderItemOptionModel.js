// backend/models/orders/orderItemOptionModel.js
import mongoose from "mongoose";

const orderItemOptionSchema=new mongoose.Schema({
 orderItem:{type:mongoose.Schema.Types.ObjectId,ref:"OrderItem",required:true},
 optionGroup:{type:mongoose.Schema.Types.ObjectId,ref:"MenuOptionGroup"},
 option:{type:mongoose.Schema.Types.ObjectId,ref:"MenuOption"},
 name:{type:String},
 price:{type:Number,default:0}
},{timestamps:true,collection:"order_item_options"});

const OrderItemOption=mongoose.model("OrderItemOption",orderItemOptionSchema);
export default OrderItemOption;