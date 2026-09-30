// backend/models/master/VendorCategoryModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const VendorCategorySchema=new Schema({
 name:{type:String,required:true,trim:true,unique:true,index:true},
 slug:{type:String,trim:true,unique:true,sparse:true,index:true},
 code:{type:String,trim:true,uppercase:true,unique:true,sparse:true},
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{
 timestamps:true,
 collection:"vendor_categories"
});

export default businessInfoConnection.models.VendorCategory||
 businessInfoConnection.model("VendorCategory",VendorCategorySchema);
