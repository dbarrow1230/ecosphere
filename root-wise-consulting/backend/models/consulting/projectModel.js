//backend/models/consulting/projectModel.js
import mongoose from "mongoose";

const projectSchema=new mongoose.Schema({
 clientBusiness:{type:mongoose.Schema.Types.ObjectId,ref:"ClientBusiness",required:true},
 businessProfile:{type:mongoose.Schema.Types.ObjectId,ref:"BusinessProfile",default:null},

 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,default:""},
 projectType:{type:String,enum:["menu-review","menu-development","opening-support","operations-review","costing","training","multi-service","other"],default:"other"},
 stage:{type:String,enum:["discovery","assessment","proposal","approved","in-progress","review","completed","paused","cancelled"],default:"discovery"},
 priority:{type:String,enum:["low","normal","high","urgent"],default:"normal"},

 services:[{type:mongoose.Schema.Types.ObjectId,ref:"Service"}],

 problemSummary:{type:String,trim:true,default:""},
 scopeSummary:{type:String,trim:true,default:""},
 goals:[{type:String,trim:true}],
 successMeasures:[{type:String,trim:true}],

 startDate:{type:Date,default:null},
 targetDate:{type:Date,default:null},
 endDate:{type:Date,default:null},

 budget:{type:Number,default:0,min:0},
 estimatedValue:{type:Number,default:0,min:0},

 clientSummary:{type:String,trim:true,default:""},
 internalNotes:{type:String,trim:true,default:""},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"projects"});

projectSchema.index({clientBusiness:1});
projectSchema.index({businessProfile:1});
projectSchema.index({projectType:1});
projectSchema.index({stage:1});
projectSchema.index({isActive:1});

const Project=mongoose.models.Project||mongoose.model("Project",projectSchema);

export default Project;