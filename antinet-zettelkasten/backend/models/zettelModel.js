import mongoose from "mongoose";

const zettelSchema=new mongoose.Schema({
 userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
 domainId:{type:mongoose.Schema.Types.ObjectId,ref:"Domain",default:null,index:true},
 projectId:{type:mongoose.Schema.Types.ObjectId,ref:"Project",default:null,index:true},
 projectIds:[{type:mongoose.Schema.Types.ObjectId,ref:"Project"}],
 zettelId:{type:String,required:true,trim:true},
 subjectCode:{type:String,trim:true,uppercase:true,default:""},
 title:{type:String,required:true,trim:true},
 mainIdea:{type:String,required:true,trim:true},
 body:{type:String,default:""},
 subtype:[{type:mongoose.Schema.Types.ObjectId,ref:"RecordSubtype"}],
 idSubtype:{type:String,trim:true,uppercase:true,default:""},
 sourceIds:[{type:mongoose.Schema.Types.ObjectId,ref:"Source"}],
 entityIds:[{type:mongoose.Schema.Types.ObjectId,ref:"Entity"}],
 originFleetingNoteId:{type:mongoose.Schema.Types.ObjectId,ref:"FleetingNote",default:null},
 futureUse:{type:[String],default:[]},
 questions:{type:[String],default:[]},
 needsResearchQuestions:{type:[String],default:[]},
 researchedQuestions:{type:[String],default:[]},
 questionAnswers:{type:[{_id:false,question:{type:String,required:true},answer:{type:String,default:""}}],default:[]},
 tags:{type:[String],default:[]},
 status:{type:String,enum:["draft","active","reviewed","archived"],default:"draft",index:true},
 isFavorite:{type:Boolean,default:false}
},{timestamps:true,collection:"zettels"});

zettelSchema.index({userId:1,zettelId:1},{unique:true});
zettelSchema.index({userId:1,projectId:1,subtype:1,status:1});
zettelSchema.index({userId:1,projectIds:1,status:1});

const Zettel=mongoose.model("Zettel",zettelSchema);

export default Zettel;
