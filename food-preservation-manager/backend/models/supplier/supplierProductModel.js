// backend/models/supplier/supplierProductModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const supplierProductSchema=new mongoose.Schema({
 supplier:{type:mongoose.Schema.Types.ObjectId,ref:"Supplier",required:true},

 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},

 unit:{type:String,trim:true,default:""}, // lb, case, bag, each

 pricing:{
  lastPrice:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  averagePrice:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d}
 },

 isActive:{type:Boolean,default:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"supplier_products"});

const SupplierProduct=mongoose.models.SupplierProduct||mongoose.model("SupplierProduct",supplierProductSchema);

export default SupplierProduct;