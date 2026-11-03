//backend\models\inventory\VendorItemModel.js
import mongoose from "mongoose";

const vendorItemSchema=new mongoose.Schema({
 item:{type:mongoose.Schema.Types.ObjectId,ref:"InventoryItem",required:true},
 vendorName:{type:String,trim:true,default:""},
 vendorItemCode:{type:String,trim:true,default:""},
 unitCost:{type:Number,default:0,min:0},
 unit:{type:String,trim:true,default:""},
 isPreferred:{type:Boolean,default:false},
 notes:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"vendor_items"});

vendorItemSchema.index({item:1});
vendorItemSchema.index({vendorName:1});

export default mongoose.models.VendorItem||mongoose.model("VendorItem",vendorItemSchema);