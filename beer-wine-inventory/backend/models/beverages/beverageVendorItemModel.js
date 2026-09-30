import Business from "../reference/businessModel.js";
import Vendor from "../reference/vendorModel.js";
//backend/models/beverages/beverageVendorItemModel.js
import mongoose from "mongoose";

const beverageVendorItemSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:Business},
 beverageItemRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"BeverageItem"},
 vendorRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:Vendor},
 vendorSku:{type:String,trim:true,default:""},
 vendorItemName:{type:String,trim:true,default:""},
 packSize:{type:String,trim:true,default:""},
 unitCost:{type:Number,default:0,min:0},
 minOrderQty:{type:Number,default:0,min:0},
 orderMultiple:{type:Number,default:1,min:1},
 leadTimeDays:{type:Number,default:0,min:0},
 isPreferred:{type:Boolean,default:false,index:true},
 isActive:{type:Boolean,default:true,index:true}
},{ timestamps:true, collection:"beverage_vendor_items"});

beverageVendorItemSchema.index({business_id:1,vendorRef:1,beverageItemRef:1},{unique:true});
beverageVendorItemSchema.index({business_id:1,vendorSku:1});
beverageVendorItemSchema.index({business_id:1,isPreferred:1});

const BeverageVendorItem=mongoose.models.BeverageVendorItem||mongoose.model("BeverageVendorItem",beverageVendorItemSchema);

export default BeverageVendorItem;