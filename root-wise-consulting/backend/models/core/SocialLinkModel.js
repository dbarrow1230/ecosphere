//backend/models/core/socialLinkModel.js
import mongoose from "mongoose";

const socialLinkSchema=new mongoose.Schema({
 clientBusiness:{type:mongoose.Schema.Types.ObjectId,ref:"ClientBusiness",required:true},
 platform:{type:String,enum:["instagram","facebook","twitter","tiktok","linkedin","youtube","website","other"],required:true},

 label:{type:String,trim:true,default:""},
 url:{type:String,required:true,trim:true},

 isPrimary:{type:Boolean,default:false},
 sortOrder:{type:Number,default:0},

 notes:{type:String,trim:true,default:""},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 isActive:{type:Boolean,default:true}

},{timestamps:true,collection:"social_links"});

socialLinkSchema.index({clientBusiness:1});
socialLinkSchema.index({platform:1});
socialLinkSchema.index({isPrimary:1});

const SocialLink=mongoose.models.SocialLink||mongoose.model("SocialLink",socialLinkSchema);

export default SocialLink;