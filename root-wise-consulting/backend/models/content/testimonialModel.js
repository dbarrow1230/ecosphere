//backend/models/content/testimonialModel.js
import mongoose from "mongoose";

const testimonialSchema=new mongoose.Schema({
 title:{type:String,trim:true,default:""},
 name:{type:String,required:true,trim:true},
 role:{type:String,trim:true,default:""},
 company:{type:String,trim:true,default:""},
 quote:{type:String,required:true,trim:true},
 rating:{type:Number,default:5,min:1,max:5},

 project:{type:mongoose.Schema.Types.ObjectId,ref:"Project",default:null},
 clientBusiness:{type:mongoose.Schema.Types.ObjectId,ref:"ClientBusiness",default:null},

 image:{type:String,trim:true,default:""},
 isFeatured:{type:Boolean,default:false},
 isPublished:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true},

 notes:{type:String,trim:true,default:""},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"testimonials"});

testimonialSchema.index({project:1});
testimonialSchema.index({clientBusiness:1});
testimonialSchema.index({isFeatured:1});
testimonialSchema.index({isPublished:1});
testimonialSchema.index({isActive:1});

const Testimonial=mongoose.models.Testimonial||mongoose.model("Testimonial",testimonialSchema);

export default Testimonial;