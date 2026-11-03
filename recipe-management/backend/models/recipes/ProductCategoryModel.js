// backend/models/master/ProductCategoryModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const ProductCategorySchema=new Schema({
 name:{type:String,required:true,trim:true},
 slug:{type:String,trim:true},
 code:{type:String,trim:true,uppercase:true,unique:true,sparse:true},
 nameKey:{type:String,unique:true,sparse:true},
 parents:[{type:Schema.Types.ObjectId,ref:"ProductCategory",default:null}],
 parent:{type:Schema.Types.ObjectId,ref:"ProductCategory",default:null,index:true},
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{
 timestamps:true,
 collection:"product_categories"
});




export default businessInfoConnection.models.ProductCategory||
 businessInfoConnection.model("ProductCategory",ProductCategorySchema);
