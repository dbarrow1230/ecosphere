// backend/models/master/VendorIngredientPriceModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const VendorIngredientPriceSchema=new Schema({
 business:{type:Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 vendor:{type:Schema.Types.ObjectId,ref:"Vendor",required:true,index:true},
 ingredient:{type:Schema.Types.ObjectId,ref:"Ingredient",required:true,index:true},

 productCategoryPath:[{type:Schema.Types.ObjectId,ref:"ProductCategory"}],
 productCategory:{type:Schema.Types.ObjectId,ref:"ProductCategory",default:null},
 brand:{type:String,trim:true,default:""},
 packSizeName:{type:String,trim:true,default:""},

 imperialQuantity:{type:Number,default:null},
 imperialUnit:{type:Schema.Types.ObjectId,ref:"ImperialUnit",default:null},
 imperialDisplay:{type:String,trim:true,default:""},

 metricQuantity:{type:Number,default:null},
 metricUnit:{type:Schema.Types.ObjectId,ref:"MetricUnit",default:null},
 metricDisplay:{type:String,trim:true,default:""},

 availablePacks:{type:Number,default:null,min:0},
 allergenInformation:{type:Schema.Types.Mixed,default:null},
 allergenHistory:[{type:Schema.Types.Mixed}],
 packCost:{type:Number,required:true,min:0},
 unitCost:{type:Number,default:0,min:0},

 sku:{type:String,trim:true,default:""},
 itemCode:{type:String,trim:true,default:""},
 notes:[{type:String,trim:true}],

 effectiveDate:{type:Date,default:Date.now},
 priceHistory:[{
  imperialDisplay:String,metricDisplay:String,packSizeName:String,imperialQuantity:Number,metricQuantity:Number,imperialUnit:Schema.Types.ObjectId,metricUnit:Schema.Types.ObjectId,
  packCost:{type:Number,required:true,min:0},
  unitCost:{type:Number,default:0,min:0},
  effectiveDate:{type:Date,default:Date.now},
  recordedAt:{type:Date,default:Date.now}
 }],
 isPreferred:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true}
},{
 timestamps:true,
 collection:"vendor_ingredient_prices"
});

VendorIngredientPriceSchema.index({business:1,vendor:1,ingredient:1,brand:1,packSizeName:1});

export default businessInfoConnection.models.VendorIngredientPrice||businessInfoConnection.model("VendorIngredientPrice",VendorIngredientPriceSchema);