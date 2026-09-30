// backend/models/time/overtimeRuleModel.js
import mongoose from "mongoose";

const noteSchema=new mongoose.Schema({
 date:{type:Date,default:Date.now},
 text:{type:String,trim:true}
},{_id:false});

const overtimeRuleSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 department:{type:mongoose.Schema.Types.ObjectId,ref:"Department",default:null,index:true},
 role:{type:mongoose.Schema.Types.ObjectId,ref:"Role",default:null,index:true},

 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,uppercase:true,default:""},

 dailyOvertimeAfterMinutes:{type:Number,default:480,min:0},
 weeklyOvertimeAfterMinutes:{type:Number,default:2400,min:0},
 doubleTimeAfterMinutes:{type:Number,default:0,min:0},

 overtimeMultiplier:{type:Number,default:1.5,min:0},
 doubleTimeMultiplier:{type:Number,default:2,min:0},

 requiresApproval:{type:Boolean,default:true},
 isActive:{type:Boolean,default:true},

 notes:{type:[noteSchema],default:[]}
},{timestamps:true,collection:"overtime_rules"});

overtimeRuleSchema.index({business:1,name:1},{unique:true});
overtimeRuleSchema.index({business:1,code:1},{unique:true,sparse:true});
overtimeRuleSchema.index({business:1,department:1,role:1,isActive:1});

const OvertimeRule=mongoose.models.OvertimeRule||mongoose.model("OvertimeRule",overtimeRuleSchema);

export default OvertimeRule;