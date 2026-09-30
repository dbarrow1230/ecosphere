// backend/models/product/productBatchModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const productBatchSchema=new mongoose.Schema({
 batchNumber:{type:String,required:true,trim:true,unique:true},
 lotNumber:{type:String,trim:true,default:""},
 code:{type:String,trim:true,default:"",unique:true,sparse:true},

 product:{type:mongoose.Schema.Types.ObjectId,ref:"Product",required:true},
 preservationProject:{type:mongoose.Schema.Types.ObjectId,ref:"PreservationProject"},

 sourceProcessModel:{type:String,trim:true,enum:["DehydrationProcess","CanningProcess","FermentationProcess"],default:"DehydrationProcess"},
 sourceProcess:{type:mongoose.Schema.Types.ObjectId,refPath:"sourceProcessModel"},
 sourceOutputModel:{type:String,trim:true,default:""},
 sourceOutput:{type:mongoose.Schema.Types.ObjectId,refPath:"sourceOutputModel"},

 packaging:{
  containerType:{type:mongoose.Schema.Types.ObjectId,ref:"ContainerType"},
  size:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  unit:{type:String,trim:true,default:""},
  packageCount:{type:Number,default:0}
 },

 quantities:{
  produced:{type:Number,default:0},
  onHand:{type:Number,default:0},
  reserved:{type:Number,default:0},
  available:{type:Number,default:0},
  sold:{type:Number,default:0},
  damaged:{type:Number,default:0},
  discarded:{type:Number,default:0}
 },

 dates:{
  productionDate:{type:Date},
  packagedDate:{type:Date},
  availableDate:{type:Date},
  expiryDate:{type:Date}
 },

 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status"},
 outcomes:[{type:mongoose.Schema.Types.ObjectId,ref:"Outcome"}],
 flags:[{
  label:{type:String,trim:true,default:""},
  note:{type:String,trim:true,default:""}
 }],

 costing:{
  totalCost:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  costPerUnit:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d}
 },

 storage:{
  location:{type:mongoose.Schema.Types.ObjectId,ref:"StorageLocation"},
  method:{type:String,trim:true,default:""},
  notes:{type:String,trim:true,default:""}
 },

 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"product_batches"});

productBatchSchema.pre("validate",function(){
 const onHand=Number(this.quantities?.onHand||0);
 const reserved=Number(this.quantities?.reserved||0);
 this.quantities.available=Math.max(onHand-reserved,0);
});

const ProductBatch=mongoose.models.ProductBatch||mongoose.model("ProductBatch",productBatchSchema);

export default ProductBatch;
