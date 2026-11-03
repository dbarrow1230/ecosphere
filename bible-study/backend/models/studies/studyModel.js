// backend/models/studies/studyModel.js
import mongoose from "mongoose";

const methodWorkspaceSectionSchema=new mongoose.Schema({
 label:{type:String,trim:true,default:""},
 prompt:{type:String,trim:true,default:""},
 response:{type:String,trim:true,default:""},
 type:{type:String,trim:true,default:"field"},
 order:{type:Number,default:0}
},{_id:false});

const methodWorkspaceSchema=new mongoose.Schema({
 method:{type:mongoose.Schema.Types.ObjectId,ref:"BibleStudyMethod",default:null},
 templateKey:{type:String,trim:true,default:""},
 title:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},
 sections:[methodWorkspaceSectionSchema]
},{_id:false});

const scriptureExplorerSectionSchema=new mongoose.Schema({
 title:{type:String,trim:true,default:""},
 content:{type:String,trim:true,default:""},
 order:{type:Number,default:0}
},{_id:false});

const scriptureExplorerSchema=new mongoose.Schema({
 reference:{type:String,trim:true,default:""},
 passageText:{type:String,trim:true,default:""},
 sections:[scriptureExplorerSectionSchema]
},{_id:false});

const studySchema=new mongoose.Schema({

 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 method:{type:mongoose.Schema.Types.ObjectId,ref:"BibleStudyMethod",default:null},
 methods:[{type:mongoose.Schema.Types.ObjectId,ref:"BibleStudyMethod"}],
 methodWorkspaces:[methodWorkspaceSchema],
 scriptureExplorer:{type:scriptureExplorerSchema,default:()=>({})},

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

 section:{type:String,trim:true,default:""},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"StudyCategory",default:null},
 difficulty:{type:mongoose.Schema.Types.ObjectId,ref:"DifficultyLevel",default:null},

 progress:{type:String,trim:true,default:"Not Started"},
 progressPercent:{type:Number,default:0,min:0,max:100},
 health:{type:Number,default:0,min:0,max:100},
 issues:{type:Number,default:0,min:0},

 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status",default:null},
 startedAt:{type:Date,default:Date.now},
 completedAt:{type:Date,default:null},

 tags:[{type:String,trim:true}],
 notes:[{type:String,trim:true}],

 active:{type:Boolean,default:true},
 featured:{type:Boolean,default:false}

},{ timestamps:true, collection:"studies"});

export default mongoose.models.Study||mongoose.model("Study",studySchema);
