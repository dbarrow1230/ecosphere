// backend/models/vendors/VendorItemModel.js
import mongoose from "mongoose";

const vendorItemSchema=new mongoose.Schema({
 vendor:{type:mongoose.Schema.Types.ObjectId,ref:"Vendor",required:true,index:true},
 ingredient:{type:mongoose.Schema.Types.ObjectId,ref:"Ingredient",default:null,index:true},

 itemName:{type:String,required:true,trim:true,index:true},
 itemType:{type:String,enum:["ingredient","supply","packaging","equipment","other"],default:"ingredient",index:true},

 sku:{type:String,trim:true,default:""},
 vendorSku:{type:String,trim:true,default:""},
 brand:{type:String,trim:true,default:""},

 packSize:{type:Number,default:0,min:0}, // numeric amount in purchase unit
 packUnit:{type:String,trim:true,default:""}, // g, kg, ml, l, each
 baseUnit:{type:String,trim:true,default:""}, // g, ml, each
 conversionToBase:{type:Number,default:1,min:0}, // 1 kg => 1000 g

 isAvailable:{type:Boolean,default:true,index:true},
 isPreferred:{type:Boolean,default:false,index:true},

 notes:{type:String,trim:true,default:""}
},{ timestamps:true, collection:"vendor_items"});

vendorItemSchema.index({vendor:1,itemName:1});
vendorItemSchema.index({ingredient:1,isAvailable:1,isPreferred:1});

export default mongoose.model("VendorItem",vendorItemSchema);