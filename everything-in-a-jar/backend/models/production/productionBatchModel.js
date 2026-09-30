import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const batchMaterialSchema=new Schema({
 itemType:{type:String,enum:["ingredient","packaging","finishedProduct","other"],default:"ingredient"},
 itemName:{type:String,trim:true,default:""},
 ingredientRef:{type:Schema.Types.ObjectId,ref:"Ingredient",default:null},
 productRef:{type:Schema.Types.ObjectId,ref:"Product",default:null},
 inventoryLotRef:{type:Schema.Types.ObjectId,ref:"InventoryLot",default:null},
 quantity:{type:Number,default:0,min:0},
 unit:{type:String,trim:true,default:""},
 unitCost:{type:Number,default:0,min:0},
 totalCost:{type:Number,default:0,min:0}
},{_id:false});

const batchYieldSchema=new Schema({
 plannedQuantity:{type:Number,default:0,min:0},
 actualQuantity:{type:Number,default:0,min:0},
 unit:{type:String,trim:true,default:"jars"},
 cases:{type:Number,default:0,min:0},
 rejects:{type:Number,default:0,min:0}
},{_id:false});

const batchQualitySchema=new Schema({
 ph:{type:Number,default:null},
 brix:{type:Number,default:null},
 saltPercent:{type:Number,default:null},
 cookTemperature:{type:Number,default:null},
 fillTemperature:{type:Number,default:null},
 sealCheck:{type:String,enum:["notChecked","passed","failed"],default:"notChecked"},
 visualCheck:{type:String,trim:true,default:""},
 tasteCheck:{type:String,trim:true,default:""},
 qaNotes:{type:String,trim:true,default:""}
},{_id:false});

const productionBatchSchema=new Schema({
 business_id:{type:Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 batchNumber:{type:String,required:true,trim:true,index:true},
 lotCode:{type:String,trim:true,default:"",index:true},
 productRef:{type:Schema.Types.ObjectId,ref:"Product",required:true,index:true},
 recipeRef:{type:Schema.Types.ObjectId,ref:"Recipe",default:null,index:true},
 status:{
  type:String,
  enum:["planned","inProduction","cooling","packed","qaHold","released","closed","voided"],
  default:"planned",
  index:true
 },
 productionDate:{type:Date,default:Date.now,index:true},
 plannedStartAt:{type:Date,default:null},
 completedAt:{type:Date,default:null},
 releasedAt:{type:Date,default:null},
 bestByDate:{type:Date,default:null,index:true},
 locationRef:{type:Schema.Types.ObjectId,ref:"Location",default:null,index:true},
 yield:batchYieldSchema,
 ingredientsConsumed:[batchMaterialSchema],
 packagingUsed:[batchMaterialSchema],
 quality:batchQualitySchema,
 laborMinutes:{type:Number,default:0,min:0},
 overheadCost:{type:Number,default:0,min:0},
 totalBatchCost:{type:Number,default:0,min:0},
 costPerUnit:{type:Number,default:0,min:0},
 createdByRef:{type:Schema.Types.ObjectId,ref:"User",default:null},
 approvedByRef:{type:Schema.Types.ObjectId,ref:"User",default:null},
 notes:[{type:String,trim:true}]
},{timestamps:true,collection:"production_batches"});

productionBatchSchema.index({business_id:1,batchNumber:1},{unique:true});
productionBatchSchema.index({business_id:1,status:1,productionDate:-1});

export default businessInfoConnection.models.ProductionBatch||businessInfoConnection.model("ProductionBatch",productionBatchSchema);
