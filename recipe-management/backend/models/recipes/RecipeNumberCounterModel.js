import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;
const RecipeNumberCounterSchema=new Schema({
 business:{type:Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 prefix:{type:String,required:true,trim:true,uppercase:true,index:true},
 sequence:{type:Number,required:true,default:0,min:0}
},{timestamps:true,collection:"recipe_number_counters"});

RecipeNumberCounterSchema.index({business:1,prefix:1},{unique:true});
export default businessInfoConnection.models.RecipeNumberCounter||businessInfoConnection.model("RecipeNumberCounter",RecipeNumberCounterSchema);
