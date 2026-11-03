// backend/models/FileTypeModel.js
import mongoose from "mongoose";

const FileTypeModelSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,unique:true,index:true}
},{timestamps:true,collection:"filetypes"});

const FileTypeModel=mongoose.models.FileType||mongoose.model("FileType",FileTypeModelSchema);

export default FileTypeModel;