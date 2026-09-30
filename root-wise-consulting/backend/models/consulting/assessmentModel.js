//backend/models/consulting/assessmentModel.js
import mongoose from "mongoose";

const assessmentFindingSchema=new mongoose.Schema({
 area:{type:String,enum:["menu","pricing","kitchen","prep","flow","service","staffing","inventory","waste","vendor","opening","other"],default:"other"},
 title:{type:String,required:true,trim:true},
 finding:{type:String,trim:true,default:""},
 impact:{type:String,enum:["low","medium","high","critical"],default:"medium"},
 priority:{type:String,enum:["low","medium","high","urgent"],default:"medium"},
 recommendation:{type:String,trim:true,default:""},
 actionType:{type:String,enum:["keep","adjust","replace","remove","add","review"],default:"review"},
 status:{type:String,enum:["identified","reviewed","in-progress","done","dropped"],default:"identified"},
 owner:{type:String,trim:true,default:""},
 dueDate:{type:Date,default:null}
},{_id:false});

const assessmentSchema=new mongoose.Schema({
 project:{type:mongoose.Schema.Types.ObjectId,ref:"Project",required:true},
 title:{type:String,trim:true,default:""},
 assessmentDate:{type:Date,default:Date.now},
 summary:{type:String,trim:true,default:""},
 strengths:[{type:String,trim:true}],
 weaknesses:[{type:String,trim:true}],
 findings:[assessmentFindingSchema],
 nextSteps:[{type:String,trim:true}],
 notes:{type:String,trim:true,default:""},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"assessments"});

assessmentSchema.index({project:1});
assessmentSchema.index({assessmentDate:1});
assessmentSchema.index({"findings.area":1});
assessmentSchema.index({isActive:1});

const Assessment=mongoose.models.Assessment||mongoose.model("Assessment",assessmentSchema);

export default Assessment;