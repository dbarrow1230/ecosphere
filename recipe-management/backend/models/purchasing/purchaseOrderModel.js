//backend/models/purchasing/purchaseOrderModel.js
import mongoose from "mongoose";

const orderLineSnapshotSchema=new mongoose.Schema({
 lineNumber:Number,ingredientRef:{type:mongoose.Schema.Types.ObjectId,default:null},vendorIngredientPriceRef:{type:mongoose.Schema.Types.ObjectId,default:null},productName:{type:String,required:true},brand:String,packDisplay:String,purchaseUnit:String,packBaseQuantity:Number,baseUnit:String,orderedQty:{type:Number,required:true,min:0},receivedQty:{type:Number,default:0},rejectedQty:{type:Number,default:0},notFilledQty:{type:Number,default:0},unitCost:{type:Number,min:0},lineTotal:{type:Number,min:0},sourceAvailability:String,quantityNeedsReview:Boolean,status:String
},{strict:false});
const purchaseOrderSchema=new mongoose.Schema({
 orderType:{type:String,enum:["purchase","grocery"],default:"purchase"},
 orderReference:{type:String,default:""},orderReferenceKey:String,taxState:String,
 flow:String,lineStorage:String,receiptVersion:{type:Number,default:0},hasReceipts:Boolean,
 lines:[orderLineSnapshotSchema],receipts:[mongoose.Schema.Types.Mixed],
 calculatedSubtotal:Number,sourceTotal:Number,importedText:String,
 deliveryFee:{type:Number,default:0,min:0},serviceFee:{type:Number,default:0,min:0},otherFees:{type:Number,default:0,min:0},
 tip:{type:Number,default:0,min:0,validate:{validator:function(value){return !value||this.orderType==="grocery";},message:"Tips are only available for grocery orders."}},
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 poNumber:{type:String,required:true,trim:true,uppercase:true},
 vendorRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Vendor"},
 locationRef:{type:mongoose.Schema.Types.ObjectId,default:null,index:true,ref:"Location"},
 status:{type:String,required:true,enum:["draft","submitted","approved","sent","partialReceived","received","cancelled","closed"],default:"draft",index:true},
 orderDate:{type:Date,required:true,index:true},
 expectedDate:{type:Date,default:null},
 currency:{type:String,trim:true,default:"USD"},
 subtotal:{type:Number,default:0,min:0},
 taxRateRef:{type:mongoose.Schema.Types.ObjectId,ref:"TaxRate"},taxRate:Number,sourceTax:Number,
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