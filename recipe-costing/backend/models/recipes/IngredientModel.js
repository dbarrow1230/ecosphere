import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const IngredientSchema=new Schema({
 business:{type:Schema.Types.ObjectId,ref:"Business",default:null,index:true},
 name:{type:String,trim:true,index:true},
 ingredientName:{type:String,trim:true,index:true},
 category:{type:Schema.Types.ObjectId,ref:"Category",default:null},
 description:{type:String,trim:true,default:""},
 isCostingIngredient:{type:Boolean,default:false,index:true},
 isActive:{type:Boolean,default:true}
},{strict:false,timestamps:true,collection:"ingredients"});

export default businessInfoConnection.models.Ingredient||
 businessInfoConnection.model("Ingredient",IngredientSchema);
