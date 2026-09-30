//backend/models/core/businessProfileModel.js
import mongoose from "mongoose";

const businessProfileSchema=new mongoose.Schema({
 clientBusiness:{type:mongoose.Schema.Types.ObjectId,ref:"ClientBusiness",required:true},
 concept:{type:String,trim:true,default:""},
 serviceStyle:{type:String,trim:true,default:""},
 cuisineFocus:{type:String,trim:true,default:""},
 businessType:{type:String,trim:true,default:""},
 openingStage:{type:String,enum:["idea","planning","pre-opening","open","reworking","paused"],default:"planning"},
 serviceModel:[{type:String,trim:true}],
 mealPeriods:[{type:String,trim:true}],
 seatingCapacity:{type:Number,default:0,min:0},
 averageTicket:{type:Number,default:0,min:0},
 menuCount:{type:Number,default:0,min:0},
 hasBar:{type:Boolean,default:false},
 hasCatering:{type:Boolean,default:false},
 hasTakeout:{type:Boolean,default:false},
 hasDelivery:{type:Boolean,default:false},
 hasPrivateDining:{type:Boolean,default:false},
 kitchenSetup:{
  summary:{type:String,trim:true,default:""},
  strengths:{type:String,trim:true,default:""},
  constraints:{type:String,trim:true,default:""}
 },
 staffing:{
  fohCount:{type:Number,default:0,min:0},
  bohCount:{type:Number,default:0,min:0},
  leadershipNotes:{type:String,trim:true,default:""}
 },
 operations:{
  prepStyle:{type:String,trim:true,default:""},
  serviceFlow:{type:String,trim:true,default:""},
  orderingStyle:{type:String,trim:true,default:""},
  costingProcess:{type:String,trim:true,default:""}
 },
 goals:[{type:String,trim:true}],
 currentChallenges:[{type:String,trim:true}],
 notes:{type:String,trim:true,default:""},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"business_profiles"});

businessProfileSchema.index({clientBusiness:1},{unique:true});
businessProfileSchema.index({openingStage:1});
businessProfileSchema.index({businessType:1});
businessProfileSchema.index({isActive:1});

const BusinessProfile=mongoose.models.BusinessProfile||mongoose.model("BusinessProfile",businessProfileSchema);

export default BusinessProfile;