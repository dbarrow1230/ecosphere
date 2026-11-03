// backend/models/favoriteModel.js
import mongoose from "mongoose";

const favoriteSchema=new mongoose.Schema(
{
user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
note:{type:mongoose.Schema.Types.ObjectId,ref:"Note",required:true}
},
{timestamps:true,collection:"favorites"}
);

favoriteSchema.index({user:1,note:1},{unique:true});

const Favorite=mongoose.model("Favorite",favoriteSchema);

export default Favorite;