// backend/models/GenreModel.js
import mongoose from "mongoose";

const GenreSectionSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 subsections:[{type:String,trim:true}]
},{_id:false});

const GenreModelSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,unique:true,index:true},
 sections:{type:[GenreSectionSchema],default:[]}
},{timestamps:true,collection:"genres"});

GenreModelSchema.index({name:"text"});

const GenreModel=mongoose.connection.models.Genre||mongoose.connection.model("Genre",GenreModelSchema);

export default GenreModel;
