//backend/models/foundation/SeoModel.js
import mongoose from "mongoose";

const seoSchema=new mongoose.Schema({
 modelType:{type:String,required:true,trim:true},
 recordId:{type:mongoose.Schema.Types.ObjectId,required:true},

 title:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},
 keywords:[{type:String,trim:true}],
 slug:{type:String,trim:true,lowercase:true,default:""},
 canonicalUrl:{type:String,trim:true,default:""},

 ogTitle:{type:String,trim:true,default:""},
 ogDescription:{type:String,trim:true,default:""},
 ogImage:{type:String,trim:true,default:""},

 twitterTitle:{type:String,trim:true,default:""},
 twitterDescription:{type:String,trim:true,default:""},
 twitterImage:{type:String,trim:true,default:""},

 robots:{type:String,trim:true,default:"index,follow"},
 schemaType:{type:String,trim:true,default:""},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"seo"});

seoSchema.index({modelType:1,recordId:1},{unique:true});
seoSchema.index({slug:1});
seoSchema.index({isActive:1});

const Seo=mongoose.models.Seo||mongoose.model("Seo",seoSchema);

export default Seo;