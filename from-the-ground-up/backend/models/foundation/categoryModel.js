import mongoose from "mongoose";

const noteSchema=new mongoose.Schema({
 date:{type:Date,default:Date.now},
 text:{type:String,trim:true}
},{_id:false});

const categorySchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,default:""},

 parentCategory:{type:mongoose.Schema.Types.ObjectId,ref:"Category",default:null,index:true},

 description:{type:String,trim:true,default:""},
 color:{type:String,trim:true,default:""},
 icon:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true},

 notes:{type:[noteSchema],default:[]}
},{timestamps:true,collection:"categories"});

categorySchema.index({name:1});
categorySchema.index({parentCategory:1});
categorySchema.index({isActive:1});

const Category=mongoose.models.Category||mongoose.model("Category",categorySchema);

export default Category;