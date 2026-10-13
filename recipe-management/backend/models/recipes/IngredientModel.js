import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const IngredientSchema=new Schema({
 allergenInformation:{type:Schema.Types.Mixed,default:null},
 allergenHistory:[{type:Schema.Types.Mixed}],
 business:{type:Schema.Types.ObjectId,ref:"Business",default:null,index:true},
 ingredientName:{type:String,trim:true},
 category:{type:Schema.Types.ObjectId,ref:"Category",default:null},
 isCostingIngredient:{type:Boolean,default:false,index:true},
 recordType:{type:String,enum:["ingredient","label","instruction"],default:"ingredient",index:true},
 legacyNames:[String],
 name:{type:String,required:true,trim:true,index:true},
 description:{type:String,trim:true,default:""},
 unit:{type:String,required:true,trim:true,default:"g"},
 notes:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true,index:true}
},{timestamps:true,collection:"ingredients"});

export default businessInfoConnection.models.Ingredient||businessInfoConnection.model("Ingredient",IngredientSchema);
