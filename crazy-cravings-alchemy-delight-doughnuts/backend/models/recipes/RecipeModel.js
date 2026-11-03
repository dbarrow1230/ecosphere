// backend/models/recipes/RecipeModel.js
import mongoose from "mongoose";

const recipeIngredientSchema=new mongoose.Schema({
 ingredient:{type:mongoose.Schema.Types.ObjectId,ref:"Ingredient",required:true,index:true},
 quantity:{type:Number,required:true,min:0},
 unit:{type:String,required:true,trim:true,default:"g"},
 notes:{type:String,trim:true,default:""}
},{_id:false});

const recipeStepSchema=new mongoose.Schema({
 stepNumber:{type:Number,required:true,min:1},
 instruction:{type:String,required:true,trim:true}
},{_id:false});

const recipeSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,index:true},
 description:{type:String,trim:true,default:""},
 yieldQty:{type:Number,required:true,min:0},
 yieldUnit:{type:String,required:true,trim:true,default:"each"},
 prepTime:{type:Number,default:0,min:0},
 cookTime:{type:Number,default:0,min:0},
 ingredients:{type:[recipeIngredientSchema],default:[]},
 steps:{type:[recipeStepSchema],default:[]},
 notes:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true,index:true}
},{
 timestamps:true,
 collection:"recipes"
});

export default mongoose.model("Recipe",recipeSchema);