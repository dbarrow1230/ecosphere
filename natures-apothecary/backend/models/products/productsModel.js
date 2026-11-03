// backend/models/products/productsModel.js
import mongoose from "mongoose";
import "../reference/categoryModel.js";

const productSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 slug:{type:String,trim:true,lowercase:true,unique:true,sparse:true},
 description:{type:String,trim:true,default:""},
 shortDescription:{type:String,trim:true,default:""},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"Category",required:true},
 price:{type:mongoose.Schema.Types.Decimal128,default:0},
 compareAtPrice:{type:mongoose.Schema.Types.Decimal128,default:null},
 cost:{type:mongoose.Schema.Types.Decimal128,default:null},
 costingRef:{type:mongoose.Schema.Types.ObjectId,ref:"Costing",default:null},
 priceFromCosting:{type:Boolean,default:false},
 markupPercent:{type:mongoose.Schema.Types.Decimal128,default:null},
 sku:{type:String,trim:true,uppercase:true,unique:true,sparse:true},
 barcode:{type:String,trim:true,unique:true,sparse:true,default:""},
 barcodeData:{type:String,trim:true,default:""},
 quantity:{type:Number,default:0,min:0},
 image:{type:[String],default:[]},
 gallery:{type:[String],default:[]},
 featured:{type:Boolean,default:false},
 notes:{type:[String],default:[]},
 details:{
  rawText:{type:String,default:""},
  name:{type:String,default:""},
  description:{type:String,default:""},
  introduction:{type:String,default:""},
  suggestedPriceText:{type:String,default:""},
  suggestedPrice:{type:String,default:""},
  sku:{type:String,default:""},
  sections:{type:[new mongoose.Schema({
   title:{type:String,required:true},
   content:{type:String,default:""},
   tables:{type:[new mongoose.Schema({headers:[String],rows:[[String]]},{_id:false})],default:[]}
  },{_id:false})],default:[]}
 },
 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status",required:true}
},{timestamps:true,collection:"products"});

productSchema.index({name:1});
productSchema.index({category:1});
productSchema.index({status:1});
productSchema.index({featured:1});
productSchema.index({costingRef:1});

export default mongoose.models.Product||mongoose.model("Product",productSchema);
