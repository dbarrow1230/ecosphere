import mongoose from "mongoose";

const fileLookupSchema=new mongoose.Schema({
 kind:{type:String,enum:["type","category"],required:true,index:true},
 name:{type:String,required:true,trim:true},
 value:{type:String,required:true,trim:true,lowercase:true},
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"file_lookups"});

fileLookupSchema.index({kind:1,value:1},{unique:true});

export default mongoose.model("FileLookup",fileLookupSchema);
