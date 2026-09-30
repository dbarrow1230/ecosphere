// backend/models/lookups/libraryItemTypeModel.js
import mongoose from "mongoose";

const libraryItemTypeSchema=new mongoose.Schema({
 title:{type:String,required:true,trim:true},
 slug:{type:String,required:true,trim:true,lowercase:true,unique:true},
 description:{type:String,trim:true,default:""},
 icon:{type:String,trim:true,default:""},
 color:{type:String,trim:true,default:""},
 active:{type:Boolean,default:true},
 sortOrder:{type:Number,default:0}
},{ timestamps:true, collection:"library_item_types"});

export default mongoose.models.LibraryItemType||mongoose.model("LibraryItemType",libraryItemTypeSchema);