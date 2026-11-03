// backend/models/pricing/marketPriceModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const marketPriceSchema=new mongoose.Schema({
 item:{type:String,required:true,trim:true},
 product:{type:mongoose.Schema.Types.ObjectId,ref:"Product"},
 supplier:{type:mongoose.Schema.Types.ObjectId,ref:"Supplier"},

 packaging:{
  sizeLabel:{type:String,trim:true,default:""}, // #10 can, 32 oz jar, 50 lb bag, case of 12
  packQuantity:{type:mongoose.Schema.Types.Decimal128,set:d}, // 10, 32, 50, 12
  packUnit:{type:String,trim:true,default:""}, // lb, oz, g, each, can, jar, bag
  unitsPerPack:{type:Number,default:0}, // case of 12
  containerType:{type:mongoose.Schema.Types.ObjectId,ref:"ContainerType"},
  notes:{type:String,trim:true,default:""}
 },

 pricing:{
  pricePerUnit:{
   lb:{type:mongoose.Schema.Types.Decimal128,set:d},
   oz:{type:mongoose.Schema.Types.Decimal128,set:d},
   g:{type:mongoose.Schema.Types.Decimal128,set:d},
   each:{type:mongoose.Schema.Types.Decimal128,set:d},
   case:{type:mongoose.Schema.Types.Decimal128,set:d}
  },
  bulkPrice:{
   quantity:{type:mongoose.Schema.Types.Decimal128,set:d},
   totalCost:{type:mongoose.Schema.Types.Decimal128,set:d}
  }
 },

 source:{
  type:{type:String,trim:true,default:""}, // supplier, manual, market
  reference:{type:String,trim:true,default:""}
 },

 effectiveDate:{type:Date},
 expirationDate:{type:Date},

 isActive:{type:Boolean,default:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"market_prices"});

const MarketPrice=mongoose.models.MarketPrice||mongoose.model("MarketPrice",marketPriceSchema);

export default MarketPrice;