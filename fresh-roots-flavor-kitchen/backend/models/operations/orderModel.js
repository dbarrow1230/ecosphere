import mongoose from "mongoose";

const orderSchema=new mongoose.Schema({
 client:{type:mongoose.Schema.Types.ObjectId,ref:"Client",required:true,index:true},
 event:{type:mongoose.Schema.Types.ObjectId,ref:"Event",required:true,index:true},
 orderNumber:{type:String,required:true,trim:true,uppercase:true},
 status:{type:String,enum:["draft","pending","confirmed","in-prep","completed","cancelled"],default:"draft",index:true},
 serviceType:{type:String,enum:["pickup","delivery","full-service"],default:"delivery"},
 subtotal:{type:Number,default:0,min:0},
 tax:{type:Number,default:0,min:0},
 discount:{type:Number,default:0,min:0},
 total:{type:Number,required:true,min:0},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"orders"});

orderSchema.index({orderNumber:1},{unique:true});
orderSchema.index({createdAt:-1,status:1});

const Order=mongoose.models.Order||mongoose.model("Order",orderSchema);

export default Order;
