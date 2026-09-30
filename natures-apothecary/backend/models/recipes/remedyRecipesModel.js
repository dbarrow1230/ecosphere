// backend/models/recipes/remedyRecipesModel.js
import mongoose from "mongoose";
import "../ingredients/ingredientsModel.js";
import "../reference/metricUnitsModel.js";
import "../reference/imperialUnitsModel.js";

const remedyIngredientSchema=new mongoose.Schema({
 ingredient:{type:mongoose.Schema.Types.ObjectId,ref:"Ingredient",required:true},
 amount:{type:String,trim:true,default:""},
 metricUnit:{type:mongoose.Schema.Types.ObjectId,ref:"MetricUnit",default:null},
 imperialUnit:{type:mongoose.Schema.Types.ObjectId,ref:"ImperialUnit",default:null},
 notes:{type:[String],default:[]}
},{_id:false});

const remedyInstructionSchema=new mongoose.Schema({
 stepNumber:{type:Number,required:true},
 instruction:{type:String,required:true,trim:true}
},{_id:false});

const remedyRecipeSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 slug:{type:String,trim:true,lowercase:true,unique:true,sparse:true},
 description:{type:String,trim:true,default:""},
 ingredients:{type:[remedyIngredientSchema],default:[]},
 instructions:{type:[remedyInstructionSchema],default:[]},
 prepTimeMinutes:{type:Number,default:0,min:0},
 yieldAmount:{
  metricAmount:{type:String,trim:true,default:""},
  metricUnit:{type:mongoose.Schema.Types.ObjectId,ref:"MetricUnit",default:null},
  imperialAmount:{type:String,trim:true,default:""},
  imperialUnit:{type:mongoose.Schema.Types.ObjectId,ref:"ImperialUnit",default:null}
 },
 dosage:{type:String,trim:true,default:""},
 storage:{type:[String],default:[]},
 warnings:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]},
 status:{type:String,enum:["active","inactive","archived"],default:"active",lowercase:true,trim:true}
},{timestamps:true,collection:"remedy_recipes"});

remedyRecipeSchema.index({name:1});
remedyRecipeSchema.index({status:1});

export default mongoose.models.RemedyRecipe||mongoose.model("RemedyRecipe",remedyRecipeSchema);