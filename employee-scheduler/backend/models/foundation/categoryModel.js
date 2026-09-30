// /backend/models/foundation/categoryModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const noteSchema=new mongoose.Schema({
 date:{type:Date,default:Date.now},
 text:{type:String,trim:true}
},{_id:false});

const categorySchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,default:""},

 parentCategory:{type:mongoose.Schema.Types.ObjectId,ref:"Category",default:null,index:true},

 description:{type:String,trim:true,default:""},
 color:{type:String,trim:true,default:""},
 icon:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true},

 notes:{type:[noteSchema],default:[]}
},{timestamps:true,collection:"categories"});

categorySchema.index({business:1,name:1});
categorySchema.index({business:1,code:1},{unique:true,sparse:true});
categorySchema.index({business:1,parentCategory:1});
categorySchema.index({business:1,isActive:1});

const Category=businessInfoConnection.models.Category||businessInfoConnection.model("Category",categorySchema);

export default Category;