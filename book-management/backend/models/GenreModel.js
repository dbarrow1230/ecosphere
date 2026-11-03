// backend/models/GenreModel.js
import mongoose from "mongoose";

const GenreModelSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,unique:true,index:true}
},{timestamps:true,collection:"genres"});

GenreModelSchema.index({name:"text"});

const GenreModel=mongoose.models.Genre||mongoose.model("Genre",GenreModelSchema);

export default GenreModel;