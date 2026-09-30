//backend/models/purchasing/purchaseOrderModel.js
import mongoose from "mongoose";

const purchaseOrderSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 poNumber:{type:String,required:true,trim:true,uppercase:true},
 vendorRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Vendor"},
 locationRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Location"},
 status:{type:String,required:true,enum:["draft","submitted","approved","sent","partialReceived","received","cancelled","closed"],default:"draft",index:true},
 orderDate:{type:Date,required:true,index:true},
 expectedDate:{type:Date,default:null},
 currency:{type:String,trim:true,default:"USD"},
 subtotal:{type:Number,default:0,min:0},
 tax:{type:Number,default:0,min:0},
 shipping:{type:Number,default:0,min:0},
 total:{type:Number,default:0,min:0},
 notes:{type:String,trim:true,default:""},
 approvedAt:{type:Date,default:null},
 createdByRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"User"},
 approvedByRef:{type:mongoose.Schema.Types.ObjectId,default:null,ref:"User"}
},{ timestamps:true, collection:"purchase_orders"});

purchaseOrderSchema.index({business_id:1,poNumber:1},{unique:true});
purchaseOrderSchema.index({business_id:1,vendorRef:1,status:1});
purchaseOrderSchema.index({business_id:1,locationRef:1,orderDate:-1});
purchaseOrderSchema.index({business_id:1,status:1});

const PurchaseOrder=mongoose.models.PurchaseOrder||mongoose.model("PurchaseOrder",purchaseOrderSchema);

export default PurchaseOrder;