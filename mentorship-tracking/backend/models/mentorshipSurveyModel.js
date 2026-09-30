// backend/models/mentorshipSurveyModel.js
import mongoose from "mongoose";

const mentorshipSurveyModel=new mongoose.Schema({
 mentee:{type:mongoose.Schema.Types.ObjectId,ref:"Mentee",required:true},
 mentor:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 surveyDate:{type:Date,default:Date.now},
 overallExperience:{type:String,required:true,enum:["very-satisfied","satisfied","neutral","dissatisfied","very-dissatisfied"]},
 understandsGoals:{type:String,required:true,enum:["always","often","sometimes","rarely","never"]},
 relevantGuidance:{type:String,required:true,enum:["always","often","sometimes","rarely","never"]},
 communication:{type:String,required:true,enum:["excellent","good","fair","poor","very-poor"]},
 clearCommunication:{type:String,required:true,enum:["always","often","sometimes","rarely","never"]},
 comfortableAskingQuestions:{type:String,required:true,enum:["always","often","sometimes","rarely","never"]},
 listensToConcerns:{type:String,required:true,enum:["always","often","sometimes","rarely","never"]},
 helpsSetGoals:{type:String,required:true,enum:["always","often","sometimes","rarely","never"]},
 usefulFeedback:{type:String,required:true,enum:["always","often","sometimes","rarely","never"]},
 encouragesIndependentThinking:{type:String,required:true,enum:["always","often","sometimes","rarely","never"]},
 providesResources:{type:String,required:true,enum:["always","often","sometimes","rarely","never"]},
 accountability:{type:String,required:true,enum:["always","often","sometimes","rarely","never"]},
 preparedForMeetings:{type:String,required:true,enum:["always","often","sometimes","rarely","never"]},
 respectsTime:{type:String,required:true,enum:["always","often","sometimes","rarely","never"]},
 respectsIdeas:{type:String,required:true,enum:["always","often","sometimes","rarely","never"]},
 increasedConfidence:{type:String,required:true,enum:["significantly","moderately","somewhat","very-little","not-at-all"]},
 progressTowardGoals:{type:String,required:true,enum:["significantly","moderately","somewhat","very-little","not-at-all"]},
 mentorshipValue:{type:String,required:true,enum:["extremely-valuable","very-valuable","somewhat-valuable","slightly-valuable","not-valuable"]},
 mentorStrengths:{type:String,trim:true,default:""},
 areasForImprovement:{type:String,trim:true,default:""},
 wantMoreOf:{type:String,trim:true,default:""},
 wantLessOf:{type:String,trim:true,default:""},
 mostValuableAspect:{type:String,trim:true,default:""},
 additionalComments:{type:String,trim:true,default:""},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
},{timestamps:true,collection:"mentorship_surveys"});

const MentorshipSurvey=mongoose.model("MentorshipSurvey",mentorshipSurveyModel);

export default MentorshipSurvey;