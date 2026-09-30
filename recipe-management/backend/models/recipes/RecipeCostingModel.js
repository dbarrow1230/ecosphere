// backend/models/master/RecipeCostingModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const RecipeCostingSchema=new Schema({
 business:{type:Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 recipe:{type:Schema.Types.ObjectId,ref:"Recipe",required:true,index:true},

 yield:{
  imperialQuantity:{type:Number,default:null},
  imperialUnit:{type:Schema.Types.ObjectId,ref:"ImperialUnit",default:null},
  metricQuantity:{type:Number,default:null},
  metricUnit:{type:Schema.Types.ObjectId,ref:"MetricUnit",default:null}
 },

 ingredients:[{
  ingredient:{type:Schema.Types.ObjectId,ref:"Ingredient",required:true},
  vendor:{type:Schema.Types.ObjectId,ref:"Vendor",default:null},
  vendorIngredientPrice:{type:Schema.Types.ObjectId,ref:"VendorIngredientPrice",default:null},

  imperialQuantity:{type:Number,default:null},
  imperialUnit:{type:Schema.Types.ObjectId,ref:"ImperialUnit",default:null},

  metricQuantity:{type:Number,default:null},
  metricUnit:{type:Schema.Types.ObjectId,ref:"MetricUnit",default:null},

  unitCost:{type:Number,required:true,min:0},
  totalCost:{type:Number,required:true,min:0},

  vendorPackCost:{type:Number,default:0,min:0},
  vendorPackImperialDisplay:{type:String,trim:true,default:""},
  vendorPackMetricDisplay:{type:String,trim:true,default:""}
 }],

 totals:{
  ingredientCost:{type:Number,default:0,min:0},
  laborCost:{type:Number,default:0,min:0},
  overheadCost:{type:Number,default:0,min:0},
  totalCost:{type:Number,default:0,min:0},
  costPerUnit:{type:Number,default:0,min:0}
 },

 pricing:{
  targetFoodCostPercent:{type:Number,default:0},
  suggestedPrice:{type:Number,default:0,min:0},
  actualFoodCostPercent:{type:Number,default:0}
 },

 notes:[{type:String,trim:true}],

 isActive:{type:Boolean,default:true}
},{ timestamps:true, collection:"recipe_costings"});

RecipeCostingSchema.index({business:1,recipe:1},{unique:true});

export default businessInfoConnection.models.RecipeCosting||businessInfoConnection.model("RecipeCosting",RecipeCostingSchema);
