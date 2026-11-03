import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const goodsReceiptSchema=new Schema({
 business_id:{type:Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 receiptNumber:{type:String,required:true,trim:true,index:true},
 purchaseOrderRef:{type:Schema.Types.ObjectId,ref:"PurchaseOrder",default:null,index:true},
 vendorRef:{type:Schema.Types.ObjectId,ref:"Vendor",default:null,index:true},
 locationRef:{type:Schema.Types.ObjectId,ref:"Location",default:null,index:true},
 receivedAt:{type:Date,default:Date.now,index:true},
 status:{type:String,enum:["draft","received","qualityHold","posted","voided"],default:"draft",index:true},
 createdByRef:{type:Schema.Types.ObjectId,ref:"User",default:null},
 postedByRef:{type:Schema.Types.ObjectId,ref:"User",default:null},
 postedAt:{type:Date,default:null},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"goods_receipts"});

goodsReceiptSchema.index({business_id:1,receiptNumber:1},{unique:true});

export default businessInfoConnection.models.GoodsReceipt||businessInfoConnection.model("GoodsReceipt",goodsReceiptSchema);
