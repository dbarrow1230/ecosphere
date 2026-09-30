// backend/models/order/orderModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const orderSchema=new mongoose.Schema({
 orderNumber:{type:String,required:true,trim:true,unique:true},

 client:{type:mongoose.Schema.Types.ObjectId,ref:"Customer"},
 event:{type:mongoose.Schema.Types.ObjectId,ref:"Event"},
 customer:{type:mongoose.Schema.Types.ObjectId,ref:"Customer"},

 status:{type:String,enum:["draft","pending","confirmed","in-prep","completed","cancelled"],default:"draft"},
 serviceType:{type:String,enum:["pickup","delivery","full-service"],default:"delivery"},

 orderDate:{type:Date,default:Date.now},
 requiredDate:{type:Date},
 fulfilledDate:{type:Date},

 totals:{
  subtotal:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  tax:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  discount:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  total:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d}
 },

 subtotal:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
 tax:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
 discount:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
 total:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},

 source:{type:String,trim:true,default:""}, // online, in_store, event

 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"orders"});

orderSchema.pre("validate",function(){
 if(this.client&&!this.customer)this.customer=this.client;
 if(this.customer&&!this.client)this.client=this.customer;

 this.totals={
  ...(this.totals||{}),
  subtotal:this.subtotal??this.totals?.subtotal,
  tax:this.tax??this.totals?.tax,
  discount:this.discount??this.totals?.discount,
  total:this.total??this.totals?.total
 };

});

const Order=mongoose.models.Order||mongoose.model("Order",orderSchema);

export default Order;
