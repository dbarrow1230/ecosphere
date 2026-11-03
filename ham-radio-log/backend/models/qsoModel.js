import mongoose from "mongoose";

const qsoSchema=new mongoose.Schema({
 contactDate:{type:Date,required:true,index:true},
 callSign:{type:String,required:true,trim:true,uppercase:true,index:true},
 operatorUserRef:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
 operatorCallSign:{type:String,required:true,trim:true,uppercase:true,index:true},
 operatorIdentityType:{type:String,enum:["ham-radio-call-sign","cb-handle"],required:true,index:true},
 frequencyMHz:{type:Number,default:null,min:0},
 band:{type:String,required:true,trim:true,default:"",index:true},
 mode:{type:String,required:true,trim:true,uppercase:true,index:true},
 rstSent:{type:String,trim:true,default:""},
 rstReceived:{type:String,trim:true,default:""},
 contactName:{type:String,trim:true,default:""},
 qth:{type:String,trim:true,default:""},
 gridSquare:{type:String,trim:true,uppercase:true,default:""},
 countryRef:{type:mongoose.Schema.Types.ObjectId,ref:"Country",default:null,index:true},
 stateRef:{type:mongoose.Schema.Types.ObjectId,ref:"State",default:null,index:true},
 qslStatus:{
  type:String,
  enum:["not-requested","requested","sent","received","confirmed"],
  default:"not-requested",
  index:true
 },
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"qsos"});

qsoSchema.index({operatorCallSign:1,contactDate:-1});
qsoSchema.index({callSign:1,contactDate:-1});

const Qso=mongoose.models.Qso||mongoose.model("Qso",qsoSchema);

export default Qso;
