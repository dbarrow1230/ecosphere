import mongoose from "mongoose";

const supplyCategorySchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},
 parentCategory:{type:mongoose.Schema.Types.ObjectId,ref:"SupplyCategory",default:null},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"supply_categories"});

const SupplyCategory=mongoose.models.SupplyCategory||mongoose.model("SupplyCategory",supplyCategorySchema);

export default SupplyCategory;
