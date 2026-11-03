// backend/models/production/ProductionCostingModel.js
import mongoose from "mongoose";

const ingredientCostSchema=new mongoose.Schema({
 ingredient:{type:mongoose.Schema.Types.ObjectId,ref:"Ingredient",required:true,index:true},
 vendorItem:{type:mongoose.Schema.Types.ObjectId,ref:"VendorItem",default:null},
 vendorItemPrice:{type:mongoose.Schema.Types.ObjectId,ref:"VendorItemPrice",default:null},

 quantity:{type:Number,required:true,min:0},
 unit:{type:String,required:true,trim:true,default:""},
 baseQuantity:{type:Number,required:true,min:0},
 baseUnit:{type:String,required:true,trim:true,default:""},

 packCost:{type:Number,required:true,min:0},
 packSize:{type:Number,required:true,min:0},
 packUnit:{type:String,required:true,trim:true,default:""},
 costPerBaseUnit:{type:Number,required:true,min:0},
 totalCost:{type:Number,required:true,min:0}
},{_id:false});

const costingItemSchema=new mongoose.Schema({
 menuItem:{type:mongoose.Schema.Types.ObjectId,ref:"MenuItem",required:true,index:true},
 recipe:{type:mongoose.Schema.Types.ObjectId,ref:"Recipe",required:true,index:true},
 costModel:{type:mongoose.Schema.Types.ObjectId,ref:"CostModel",default:null,index:true},

 batchQty:{type:Number,required:true,min:0},
 batchUnit:{type:String,required:true,trim:true,default:"each"},

 ingredients:{type:[ingredientCostSchema],default:[]},

 ingredientCostTotal:{type:Number,required:true,min:0,default:0},
 laborCost:{type:Number,default:0,min:0},
 overheadCost:{type:Number,default:0,min:0},

 totalCost:{type:Number,required:true,min:0,default:0},
 costPerUnit:{type:Number,required:true,min:0,default:0},

 markupPercent:{type:Number,default:0,min:0},
 suggestedMenuPrice:{type:Number,default:0,min:0},
 contributionMargin:{type:Number,default:0}
},{_id:false});

const productionCostingSchema=new mongoose.Schema({
 productionBatch:{type:mongoose.Schema.Types.ObjectId,ref:"ProductionBatch",required:true,index:true},

 items:{
  type:[costingItemSchema],
  required:true,
  validate:{
   validator:v=>Array.isArray(v)&&v.length>0,
   message:"Production costing must contain at least one item"
  }
 },

 calculatedAt:{type:Date,default:Date.now},
 version:{type:Number,default:1,index:true},

 notes:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true,index:true}
},{timestamps:true,collection:"production_costings"});

productionCostingSchema.index({productionBatch:1,version:-1});
productionCostingSchema.index({"items.costModel":1});
productionCostingSchema.index({"items.menuItem":1,"items.recipe":1});

export default mongoose.model("ProductionCosting",productionCostingSchema);