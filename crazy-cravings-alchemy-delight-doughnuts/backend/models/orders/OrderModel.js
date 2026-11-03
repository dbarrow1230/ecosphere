// backend/models/orders/Order.js
import mongoose from "mongoose";

const orderItemSchema=new mongoose.Schema({
 menuItem:{type:mongoose.Schema.Types.ObjectId,ref:"MenuItem",required:true,index:true},
 quantity:{type:Number,required:true,min:1},
 unitPrice:{type:Number,required:true,min:0},
 subtotal:{type:Number,required:true,min:0},
 notes:{type:String,trim:true,default:""}
},{_id:false});

const orderStatusHistorySchema=new mongoose.Schema({
 status:{type:String,required:true,trim:true},
 note:{type:String,trim:true,default:""},
 changedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 changedAt:{type:Date,default:Date.now}
},{_id:false});

const addressSchema=new mongoose.Schema({
 line1:{type:String,trim:true,default:""},
 line2:{type:String,trim:true,default:""},
 city:{type:String,trim:true,default:""},
 state:{type:String,trim:true,default:""},
 postalCode:{type:String,trim:true,default:""},
 country:{type:String,trim:true,default:"US"},
 instructions:{type:String,trim:true,default:""}
},{_id:false});

const orderSchema=new mongoose.Schema({
 orderNumber:{type:String,required:true,unique:true,index:true},

 customer:{type:mongoose.Schema.Types.ObjectId,ref:"Customer",required:true,index:true},

 items:{
  type:[orderItemSchema],
  required:true,
  validate:{
   validator:v=>Array.isArray(v)&&v.length>0,
   message:"Order must contain at least one item"
  }
 },

 status:{type:String,enum:["cart","pending","confirmed","preparing","ready","completed","cancelled","refunded"],default:"pending",index:true},

 fulfillmentType:{type:String,enum:["pickup","delivery"],required:true,default:"pickup",index:true},
 deliveryAddress:{type:addressSchema,default:null},
 scheduledFor:{type:Date,default:null},

 subtotal:{type:Number,required:true,default:0,min:0},
 tax:{type:Number,default:0,min:0},
 discount:{type:Number,default:0,min:0},
 deliveryFee:{type:Number,default:0,min:0},
 tip:{type:Number,default:0,min:0},
 total:{type:Number,required:true,default:0,min:0},
 currency:{type:String,trim:true,default:"USD"},

 paymentStatus:{type:String,enum:["unpaid","authorized","paid","failed","partially-refunded","refunded"],default:"unpaid",index:true},

 customerNotes:{type:String,trim:true,default:""},
 internalNotes:{type:String,trim:true,default:""},

 statusHistory:{type:[orderStatusHistorySchema],default:[]},

 placedAt:{type:Date,default:Date.now,index:true},
 completedAt:{type:Date,default:null},
 cancelledAt:{type:Date,default:null},

 isActive:{type:Boolean,default:true,index:true}
},{timestamps:true, collection:"orders"});

orderSchema.index({customer:1,status:1,createdAt:-1});
orderSchema.index({status:1,paymentStatus:1,placedAt:-1});

export default mongoose.model("Order",orderSchema);