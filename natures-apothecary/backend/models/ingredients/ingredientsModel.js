// backend/models/ingredients/ingredientsModel.js
import mongoose from "mongoose";
import "../reference/partsModel.js";
import "../reference/formsModel.js";
import "../reference/statusModel.js";

const ingredientSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 slug:{type:String,trim:true,lowercase:true,unique:true,sparse:true},
 botanicalName:{type:String,trim:true,default:""},
 inciName:{type:String,trim:true,default:""},
 part:{type:mongoose.Schema.Types.ObjectId,ref:"Part",required:true},
 form:{type:mongoose.Schema.Types.ObjectId,ref:"Form",required:true},
 metricUnit:{type:mongoose.Schema.Types.ObjectId,ref:"MetricUnit",required:true},
 imperialUnit:{type:mongoose.Schema.Types.ObjectId,ref:"ImperialUnit",required:true},
 description:{type:String,trim:true,default:""},
 image:{type:[String],default:[]},
 notes:{type:[String],default:[]},
 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status",required:true}
},{timestamps:true,collection:"ingredients"});

ingredientSchema.index({name:1});
ingredientSchema.index({botanicalName:1});
ingredientSchema.index({part:1});
ingredientSchema.index({form:1});
ingredientSchema.index({status:1});

export default mongoose.models.Ingredient||mongoose.model("Ingredient",ingredientSchema);