import Business from "../reference/businessModel.js";
import UnitOfMeasure from "../reference/unitOfMeasureModel.js";
//backend/models/receiving/goodsReceiptLineModel.js
import mongoose from "mongoose";

const goodsReceiptLineSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:Business},
 goodsReceiptRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"GoodsReceipt"},
 purchaseOrderLineRef:{type:mongoose.Schema.Types.ObjectId,default:null,index:true,ref:"PurchaseOrderLine"},
 beverageItemRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"BeverageItem"},
 uomRef:{type:mongoose.Schema.Types.ObjectId,required:true,ref:UnitOfMeasure},
 receivedQty:{type:Number,required:true,min:0},
 acceptedQty:{type:Number,default:0,min:0},
 rejectedQty:{type:Number,default:0,min:0},
 unitCost:{type:Number,default:0,min:0},
 lineTotal:{type:Number,default:0,min:0},
 lotNumber:{type:String,trim:true,default:""},
 expiryDate:{type:Date,default:null},
 conditionStatus:{type:String,enum:["accepted","damaged","short","rejected"],default:"accepted",index:true},
 notes:{type:String,trim:true,default:""}
},{ timestamps:true, collection:"goods_receipt_lines"});

goodsReceiptLineSchema.index({business_id:1,goodsReceiptRef:1});
goodsReceiptLineSchema.index({business_id:1,purchaseOrderLineRef:1});
goodsReceiptLineSchema.index({business_id:1,beverageItemRef:1});

const GoodsReceiptLine=mongoose.models.GoodsReceiptLine||mongoose.model("GoodsReceiptLine",goodsReceiptLineSchema);

export default GoodsReceiptLine;