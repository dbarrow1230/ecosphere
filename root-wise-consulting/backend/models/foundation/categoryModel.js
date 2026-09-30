//backend/models/foundation/categoryModel.js
import mongoose from "mongoose";

const categorySchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 slug:{type:String,trim:true,lowercase:true,default:""},

 parent:{type:mongoose.Schema.Types.ObjectId,ref:"Category",default:null},

 type:{type:String,enum:["service","menu","content","general"],default:"general"},

 description:{type:String,trim:true,default:""},

 sortOrder:{type:Number,default:0},

 isActive:{type:Boolean,default:true},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}

},{timestamps:true,collection:"categories"});

categorySchema.index({name:1});
categorySchema.index({slug:1});
categorySchema.index({parent:1});
categorySchema.index({type:1});
categorySchema.index({isActive:1});

const Category=mongoose.models.Category||mongoose.model("Category",categorySchema);

export default Category;