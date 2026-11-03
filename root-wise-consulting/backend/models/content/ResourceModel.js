//backend/models/content/resourceModel.js
import mongoose from "mongoose";

const resourceSchema=new mongoose.Schema({
 title:{type:String,required:true,trim:true},
 slug:{type:String,trim:true,lowercase:true,default:""},
 resourceType:{type:String,enum:["article","guide","checklist","download","template","faq","other"],default:"article"},
 category:{type:String,trim:true,default:""},
 summary:{type:String,trim:true,default:""},
 content:{type:String,trim:true,default:""},

 coverImage:{type:String,trim:true,default:""},
 fileName:{type:String,trim:true,default:""},
 fileUrl:{type:String,trim:true,default:""},
 externalUrl:{type:String,trim:true,default:""},

 tags:[{type:String,trim:true}],
 publishedAt:{type:Date,default:null},
 isFeatured:{type:Boolean,default:false},
 isPublished:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true},

 notes:{type:String,trim:true,default:""},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"resources"});

resourceSchema.index({slug:1});
resourceSchema.index({resourceType:1});
resourceSchema.index({category:1});
resourceSchema.index({isFeatured:1});
resourceSchema.index({isPublished:1});
resourceSchema.index({isActive:1});

const Resource=mongoose.models.Resource||mongoose.model("Resource",resourceSchema);

export default Resource;