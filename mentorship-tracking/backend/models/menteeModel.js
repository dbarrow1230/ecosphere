// backend/models/menteeModel.js
import mongoose from "mongoose";

const menteeNoteSchema=new mongoose.Schema({
 note:{type:String,required:true,trim:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,_id:true});

const menteeModel=new mongoose.Schema({
 firstName:{type:String,required:true,trim:true},
 lastName:{type:String,required:true,trim:true},
 email:{type:String,trim:true,lowercase:true},
 phone:{type:String,trim:true},
 image:{type:String,trim:true},
 businessName:{type:String,trim:true},
 website:{type:String,trim:true},
 address1:{type:String,trim:true},
 address2:{type:String,trim:true},
 city:{type:String,trim:true},
 state:{type:mongoose.Schema.Types.ObjectId,ref:"State",default:null},
 country:{type:mongoose.Schema.Types.ObjectId,ref:"Country",default:null},
 postalCode:{type:String,trim:true},
 hoursNeeded:{type:Number,default:150},
 externshipStartDate:{type:Date,default:null},
 externshipEndDate:{type:Date,default:null},
 preferredMeetingDay:{type:String,enum:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],trim:true,default:null},
 preferredMeetingTime:{type:String,trim:true,default:null},
 meetingDuration:{type:Number,default:30},
 meetingFrequency:{type:String,enum:["Weekly","bi-weekly"],default:"Weekly"},
 meetingMethod:{type:mongoose.Schema.Types.ObjectId,ref:"MeetingMethod",default:null},
 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status",default:null},
 isFlagged:{type:Boolean,default:false},
 flagReason:{type:String,trim:true,default:""},
 riskLevel:{type:String,trim:true,default:"low",enum:["low","medium","high"]},
 currentGoalProgress:{type:String,trim:true,default:null,enum:["on-track","needs-revision",null]},
 meetingRegularity:{type:String,trim:true,default:null,enum:["consistent","infrequent",null]},
 finalVerification:{type:String,trim:true,default:null,enum:["portal-complete","manual-sheet-needed",null]},
 mentorAgreementStatus:{type:String,trim:true,default:"not-started",enum:["not-started","waiting-for-mentee-signature","waiting-for-career-services","waiting-for-mentor-signature","signed"]},
 mentorAgreementCompleted:{type:Boolean,default:false},
 mentorAgreementCompletedDate:{type:Date,default:null},
 notes:{type:[menteeNoteSchema],default:[]},
 programs:[{type:mongoose.Schema.Types.ObjectId,ref:"Program"}],
 courses:[{
  program:{type:mongoose.Schema.Types.ObjectId,ref:"Program",required:true},
  course:{type:mongoose.Schema.Types.ObjectId,required:true}
 }],
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
},{timestamps:true,collection:"mentees"});

menteeModel.virtual("fullName").get(function(){
 return `${this.firstName||""} ${this.lastName||""}`.trim();
});

menteeModel.set("toJSON",{virtuals:true});
menteeModel.set("toObject",{virtuals:true});

const Mentee=mongoose.model("Mentee",menteeModel);

export default Mentee;
