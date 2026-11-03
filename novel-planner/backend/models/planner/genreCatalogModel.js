import mongoose from "mongoose";

const genreSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 genre:{type:String,required:true,trim:true,unique:true},
},{timestamps:true,collection:"genres"});

export default mongoose.models.Genre||mongoose.model("Genre",genreSchema);
