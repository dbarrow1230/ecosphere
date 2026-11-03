// backend/models/studies/studyRecommendationModel.js
import mongoose from "mongoose";

const studyRecommendationSchema=new mongoose.Schema({

 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 method:{type:mongoose.Schema.Types.ObjectId,ref:"BibleStudyMethod",default:null},

 title:{type:String,required:true,trim:true},
 slug:{type:String,required:true,trim:true,lowercase:true,unique:true},
 subtitle:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},

 reference:{type:String,trim:true,default:""},
 book:{type:String,trim:true,default:""},
 chapterStart:{type:Number,default:null},
 chapterEnd:{type:Number,default:null},
 verseStart:{type:Number,default:null},
 verseEnd:{type:Number,default:null},

 category:{type:mongoose.Schema.Types.ObjectId,ref:"StudyCategory",default:null},
 difficulty:{type:mongoose.Schema.Types.ObjectId,ref:"DifficultyLevel",default:null},
 audience:[{type:String,trim:true}],
 tags:[{type:String,trim:true}],

 reason:{type:String,trim:true,default:""},
 goals:[{type:String,trim:true}],
 outcomes:[{type:String,trim:true}],
 focusAreas:[{type:String,trim:true}],

 estimatedDays:{type:Number,default:0},
 estimatedSessions:{type:Number,default:0},
 estimatedMinutes:{type:Number,default:0},

 icon:{type:String,trim:true,default:""},
 color:{type:String,trim:true,default:""},

 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status",default:null},
 featured:{type:Boolean,default:false},
 active:{type:Boolean,default:true},
 sortOrder:{type:Number,default:0}

},{ timestamps:true, collection:"study_recommendations"});

export default mongoose.models.StudyRecommendation||mongoose.model("StudyRecommendation",studyRecommendationSchema);