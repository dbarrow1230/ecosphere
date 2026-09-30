import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const taglineSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 seasonRef:{type:mongoose.Schema.Types.ObjectId,default:null,index:true,ref:"Season"},
 occasionRef:{type:mongoose.Schema.Types.ObjectId,default:null,index:true,ref:"Occasion"},
 name:{type:String,required:true,trim:true},
 text:{type:String,required:true,trim:true},
 isActive:{type:Boolean,default:true,index:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"tag_lines"});

taglineSchema.index({business_id:1,name:1},{unique:true});
taglineSchema.index({business_id:1,seasonRef:1});
taglineSchema.index({business_id:1,occasionRef:1});
taglineSchema.index({business_id:1,isActive:1});

const Tagline=businessInfoConnection.models.Tagline||businessInfoConnection.model("Tagline",taglineSchema);

export default Tagline;