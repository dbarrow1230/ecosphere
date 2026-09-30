// backend/models/vendors/VendorItemPriceModel.js
import mongoose from "mongoose";

const vendorItemPriceSchema=new mongoose.Schema({
 vendor:{type:mongoose.Schema.Types.ObjectId,ref:"Vendor",required:true,index:true},
 vendorItem:{type:mongoose.Schema.Types.ObjectId,ref:"VendorItem",required:true,index:true},
 ingredient:{type:mongoose.Schema.Types.ObjectId,ref:"Ingredient",default:null,index:true},

 unitCost:{type:Number,required:true,min:0}, // cost for the purchased pack
 minimumOrderQty:{type:Number,default:0,min:0},
 leadTimeDays:{type:Number,default:0,min:0},

 effectiveFrom:{type:Date,default:Date.now,index:true},
 effectiveTo:{type:Date,default:null},

 isCurrent:{type:Boolean,default:true,index:true},
 isAvailable:{type:Boolean,default:true,index:true},

 notes:{type:String,trim:true,default:""}
},{ timestamps:true, collection:"vendor_item_prices"});

vendorItemPriceSchema.index({vendorItem:1,isCurrent:1});
vendorItemPriceSchema.index({ingredient:1,isCurrent:1,unitCost:1});

export default mongoose.model("VendorItemPrice",vendorItemPriceSchema);