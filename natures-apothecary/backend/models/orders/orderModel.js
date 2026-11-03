import mongoose from "mongoose";

const orderSchema=new mongoose.Schema({
 client:{type:mongoose.Schema.Types.ObjectId,ref:"Client",required:true},
 event:{type:mongoose.Schema.Types.ObjectId,ref:"Event",required:true},
 orderNumber:{type:String,required:true,trim:true,uppercase:true,unique:true},
 status:{type:String,enum:["draft","pending","confirmed","in-prep","completed","cancelled"],default:"draft"},
 serviceType:{type:String,enum:["pickup","delivery","full-service"],default:"delivery"},
 subtotal:{type:mongoose.Schema.Types.Decimal128,default:0},
 tax:{type:mongoose.Schema.Types.Decimal128,default:0},
 discount:{type:mongoose.Schema.Types.Decimal128,default:0},
 total:{type:mongoose.Schema.Types.Decimal128,default:0},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"orders"});

orderSchema.index({client:1});
orderSchema.index({event:1});
orderSchema.index({status:1});

export default mongoose.models.Order||mongoose.model("Order",orderSchema);
