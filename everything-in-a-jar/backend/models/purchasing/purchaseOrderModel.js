import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const purchaseOrderSchema=new Schema({
 business_id:{type:Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 poNumber:{type:String,required:true,trim:true,index:true},
 vendorRef:{type:Schema.Types.ObjectId,ref:"Vendor",required:true,index:true},
 locationRef:{type:Schema.Types.ObjectId,ref:"Location",default:null,index:true},
 status:{type:String,enum:["draft","submitted","approved","sent","partialReceived","received","cancelled","closed"],default:"draft",index:true},
 orderDate:{type:Date,default:Date.now,index:true},
 expectedDate:{type:Date,default:null},
 subtotal:{type:Number,default:0,min:0},
 tax:{type:Number,default:0,min:0},
 shipping:{type:Number,default:0,min:0},
 total:{type:Number,default:0,min:0},
 createdByRef:{type:Schema.Types.ObjectId,ref:"User",default:null},
 approvedByRef:{type:Schema.Types.ObjectId,ref:"User",default:null},
 approvedAt:{type:Date,default:null},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"purchase_orders"});

purchaseOrderSchema.index({business_id:1,poNumber:1},{unique:true});

export default businessInfoConnection.models.PurchaseOrder||businessInfoConnection.model("PurchaseOrder",purchaseOrderSchema);
