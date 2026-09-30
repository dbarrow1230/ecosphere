import Business from "../reference/businessModel.js";
import Category from "../master/CategoryModel.js";
import Vendor from "../reference/vendorModel.js";
import Brand from "../reference/brandModel.js";
import UnitOfMeasure from "../reference/unitOfMeasureModel.js";
//backend/models/beverages/beverageItemModel.js
import mongoose from "mongoose";

const beverageItemSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:Business},
 categoryRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:Category},
 brandRef:{type:mongoose.Schema.Types.ObjectId,default:null,index:true,ref:Brand},
 preferredVendorRef:{type:mongoose.Schema.Types.ObjectId,default:null,index:true,ref:Vendor},
 uomRef:{type:mongoose.Schema.Types.ObjectId,required:true,ref:UnitOfMeasure},
 sku:{type:String,required:true,trim:true,uppercase:true},
 barcode:{type:String,trim:true,default:""},
 name:{type:String,required:true,trim:true},
 displayName:{type:String,trim:true,default:""},
 beverageType:{type:String,required:true,trim:true,index:true},
 packageType:{type:String,trim:true,default:""},
 packageSize:{type:String,trim:true,default:""},
 sellingPrice:{type:Number,default:0,min:0},
 standardCost:{type:Number,default:0,min:0},
 lastCost:{type:Number,default:0,min:0},
 avgCost:{type:Number,default:0,min:0},
 reorderPoint:{type:Number,default:0,min:0},
 reorderQty:{type:Number,default:0,min:0},
 minLevel:{type:Number,default:0,min:0},
 maxLevel:{type:Number,default:0,min:0},
 parLevel:{type:Number,default:0,min:0},
 isAlcohol:{type:Boolean,default:false},
 requiresColdStorage:{type:Boolean,default:false},
 isBatchTracked:{type:Boolean,default:false},
 shelfLifeDays:{type:Number,default:0,min:0},
 isActive:{type:Boolean,default:true,index:true},
 notes:{type:String,trim:true,default:""}
},{ timestamps:true, collection:"beverage_items"});

beverageItemSchema.index({business_id:1,sku:1},{unique:true});
beverageItemSchema.index({business_id:1,barcode:1});
beverageItemSchema.index({business_id:1,name:1});
beverageItemSchema.index({business_id:1,beverageType:1});
beverageItemSchema.index({business_id:1,isActive:1});

const BeverageItem=mongoose.models.BeverageItem||mongoose.model("BeverageItem",beverageItemSchema);

export default BeverageItem;