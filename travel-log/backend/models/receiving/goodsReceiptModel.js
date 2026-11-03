//src/backend/models/receiving/goodsReceiptModel.js
import mongoose from "mongoose";

const goodsReceiptSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 receiptNumber:{type:String,required:true,trim:true,uppercase:true},
 vendorRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Vendor"},
 locationRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Location"},
 purchaseOrderRef:{type:mongoose.Schema.Types.ObjectId,default:null,index:true,ref:"PurchaseOrder"},
 invoiceNumber:{type:String,trim:true,default:""},
 receiptDate:{type:Date,required:true,index:true},
 status:{type:String,enum:["draft","posted","partial","disputed","voided"],default:"draft",index:true},
 subtotal:{type:Number,default:0,min:0},
 tax:{type:Number,default:0,min:0},
 total:{type:Number,default:0,min:0},
 notes:{type:String,trim:true,default:""},
 postedAt:{type:Date,default:null},
 receivedByRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"User"},
 postedByRef:{type:mongoose.Schema.Types.ObjectId,default:null,ref:"User"}
},{
 timestamps:true,
 collection:"goods_receipts"
});

goodsReceiptSchema.index({business_id:1,receiptNumber:1},{unique:true});
goodsReceiptSchema.index({business_id:1,purchaseOrderRef:1});
goodsReceiptSchema.index({business_id:1,vendorRef:1,receiptDate:-1});
goodsReceiptSchema.index({business_id:1,status:1});

const GoodsReceipt=mongoose.models.GoodsReceipt||mongoose.model("GoodsReceipt",goodsReceiptSchema);

export default GoodsReceipt;