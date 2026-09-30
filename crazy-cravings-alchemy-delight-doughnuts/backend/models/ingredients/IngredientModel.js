// backend/models/ingredients/IngredientModel.js
import mongoose from "mongoose";

const ingredientSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,index:true},
 description:{type:String,trim:true,default:""},
 sku:{type:String,trim:true,default:""},
 unit:{type:String,required:true,trim:true,default:"g"}, // g, kg, ml, l, each
 category:{type:String,trim:true,default:""},
 vendorItems:[{type:mongoose.Schema.Types.ObjectId,ref:"VendorItem"}],
 isActive:{type:Boolean,default:true,index:true},
 notes:{type:String,trim:true,default:""}
},{
 timestamps:true,
 collection:"ingredients"
});

export default mongoose.model("Ingredient",ingredientSchema);