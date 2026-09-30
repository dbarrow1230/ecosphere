// backend/models/orders/PurchaseOrderModel.js
import mongoose from "mongoose";

const purchaseOrderItemSchema=new mongoose.Schema({
 itemType:{type:String,enum:["ingredient","supply","packaging","equipment","other"],required:true},
 itemRef:{type:mongoose.Schema.Types.ObjectId,default:null},
 name:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},
 sku:{type:String,trim:true,default:""},
 quantity:{type:Number,required:true,min:0},
 unit:{type:String,trim:true,default:""},
 unitCost:{type:Number,required:true,min:0},
 subtotal:{type:Number,required:true,min:0},
 notes:{type:String,trim:true,default:""}
},{_id:false});

const purchaseOrderStatusHistorySchema=new mongoose.Schema({
 status:{type:String,required:true,trim:true},
 note:{type:String,trim:true,default:""},
 changedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 changedAt:{type:Date,default:Date.now}
},{_id:false});

const vendorSnapshotSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 contactName:{type:String,trim:true,default:""},
 email:{type:String,trim:true,default:""},
 phone:{type:String,trim:true,default:""},
 address1:{type:String,trim:true,default:""},
 address2:{type:String,trim:true,default:""},
 city:{type:String,trim:true,default:""},
 state:{type:String,trim:true,default:""},
 postalCode:{type:String,trim:true,default:""},
 country:{type:String,trim:true,default:""}
},{_id:false});

const purchaseOrderSchema=new mongoose.Schema({
 orderNumber:{type:String,required:true,unique:true,index:true},

 vendor:{type:mongoose.Schema.Types.ObjectId,ref:"Vendor",required:true,index:true},
 vendorSnapshot:{type:vendorSnapshotSchema,required:true},

 items:{
  type:[purchaseOrderItemSchema],
  required:true,
  validate:{
   validator:v=>Array.isArray(v)&&v.length>0,
   message:"Purchase order must contain at least one item"
  }
 },

 status:{type:String,enum:["draft","submitted","approved","ordered","partially-received","received","cancelled","closed"],default:"draft",index:true},

 orderedAt:{type:Date,default:null},
 expectedAt:{type:Date,default:null},
 receivedAt:{type:Date,default:null},
 cancelledAt:{type:Date,default:null},
 closedAt:{type:Date,default:null},

 subtotal:{type:Number,required:true,default:0,min:0},
 tax:{type:Number,default:0,min:0},
 shippingCost:{type:Number,default:0,min:0},
 discount:{type:Number,default:0,min:0},
 total:{type:Number,required:true,default:0,min:0},
 currency:{type:String,trim:true,default:"USD"},

 paymentStatus:{type:String,enum:["unpaid","partial","paid","failed","refunded"],default:"unpaid",index:true},

 notes:{type:String,trim:true,default:""},
 internalNotes:{type:String,trim:true,default:""},

 statusHistory:{type:[purchaseOrderStatusHistorySchema],default:[]},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 approvedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},

 isActive:{type:Boolean,default:true,index:true}
},{ timestamps:true, collection:"purchase_orders"});

purchaseOrderSchema.index({vendor:1,status:1,createdAt:-1});
purchaseOrderSchema.index({status:1,paymentStatus:1,createdAt:-1});

export default mongoose.model("PurchaseOrder",purchaseOrderSchema);