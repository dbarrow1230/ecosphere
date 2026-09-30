//backend/models/core/contactInquiryModel.js
import mongoose from "mongoose";

const contactInquirySchema=new mongoose.Schema({
 firstName:{type:String,required:true,trim:true},
 lastName:{type:String,trim:true,default:""},
 email:{type:String,required:true,trim:true,lowercase:true},
 phone:{type:String,trim:true,default:""},

 businessName:{type:String,trim:true,default:""},
 subject:{type:String,trim:true,default:""},
 message:{type:String,required:true,trim:true},

 source:{type:String,enum:["website","email","phone","referral","social","other"],default:"website"},
 status:{type:String,enum:["new","reviewed","replied","converted","closed","spam"],default:"new"},

 clientBusiness:{type:mongoose.Schema.Types.ObjectId,ref:"ClientBusiness",default:null},
 notes:{type:String,trim:true,default:""},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 isActive:{type:Boolean,default:true}

},{timestamps:true,collection:"contact_inquiries"});

contactInquirySchema.index({email:1});
contactInquirySchema.index({status:1});
contactInquirySchema.index({businessName:1});

const ContactInquiry=mongoose.models.ContactInquiry||mongoose.model("ContactInquiry",contactInquirySchema);

export default ContactInquiry;