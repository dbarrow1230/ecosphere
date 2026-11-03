//backend/models/purchasing/purchaseOrderLineModel.js
import mongoose from "mongoose";

const purchaseOrderLineSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 purchaseOrderRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"PurchaseOrder"},
 beverageItemRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"BeverageItem"},
 beverageVendorItemRef:{type:mongoose.Schema.Types.ObjectId,default:null,ref:"BeverageVendorItem"},
 uomRef:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"UnitOfMeasure"},
 lineNumber:{type:Number,required:true,min:1},
 orderedQty:{type:Number,required:true,min:0},
 receivedQty:{type:Number,default:0,min:0},
 cancelledQty:{type:Number,default:0,min:0},
 unitCost:{type:Number,required:true,min:0},
 lineTotal:{type:Number,default:0,min:0},
 expectedDate:{type:Date,default:null},
 status:{type:String,enum:["open","partialReceived","received","cancelled"],default:"open",index:true},
 notes:{type:String,trim:true,default:""}
},{ timestamps:true, collection:"purchase_order_lines"});

purchaseOrderLineSchema.index({business_id:1,purchaseOrderRef:1,lineNumber:1},{unique:true});
purchaseOrderLineSchema.index({business_id:1,beverageItemRef:1});
purchaseOrderLineSchema.index({business_id:1,status:1});

const PurchaseOrderLine=mongoose.models.PurchaseOrderLine||mongoose.model("PurchaseOrderLine",purchaseOrderLineSchema);

export default PurchaseOrderLine;