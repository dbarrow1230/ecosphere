//backend/models/content/caseStudyModel.js
import mongoose from "mongoose";

const caseStudySchema=new mongoose.Schema({
 project:{type:mongoose.Schema.Types.ObjectId,ref:"Project",default:null},
 clientBusiness:{type:mongoose.Schema.Types.ObjectId,ref:"ClientBusiness",default:null},

 title:{type:String,required:true,trim:true},
 slug:{type:String,trim:true,lowercase:true,default:""},
 summary:{type:String,trim:true,default:""},

 challenge:[{type:String,trim:true}],
 approach:[{type:String,trim:true}],
 solution:[{type:String,trim:true}],
 outcome:[{type:String,trim:true}],

 services:[{type:mongoose.Schema.Types.ObjectId,ref:"Service"}],
 deliverables:[{type:mongoose.Schema.Types.ObjectId,ref:"Deliverable"}],

 metrics:[{
  label:{type:String,trim:true,default:""},
  value:{type:String,trim:true,default:""}
 }],

 featuredImage:{type:String,trim:true,default:""},
 gallery:[{type:String,trim:true}],

 publishedAt:{type:Date,default:null},
 isFeatured:{type:Boolean,default:false},
 isPublished:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true},

 notes:{type:String,trim:true,default:""},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"case_studies"});

caseStudySchema.index({project:1});
caseStudySchema.index({clientBusiness:1});
caseStudySchema.index({slug:1});
caseStudySchema.index({isFeatured:1});
caseStudySchema.index({isPublished:1});
caseStudySchema.index({isActive:1});

const CaseStudy=mongoose.models.CaseStudy||mongoose.model("CaseStudy",caseStudySchema);

export default CaseStudy;