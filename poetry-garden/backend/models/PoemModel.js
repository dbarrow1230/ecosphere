// backend/models/PoemModel.js
import mongoose from "mongoose";

const analysisSchema=new mongoose.Schema({
 formStructure:{type:String,trim:true,default:""},
 theme:[{type:String,trim:true}],
 tone:[{type:String,trim:true}],
 language:[{type:String,trim:true}],
 structure:[{type:String,trim:true}],
 personalInterpretation:[{type:String,trim:true}],
 broaderContextReflection:[{type:String,trim:true}],
 overall:{type:String,trim:true,default:""}
},{_id:false});

const definitionSchema=new mongoose.Schema({
 term:{type:String,trim:true,required:true},
 meaning:{type:String,trim:true,required:true}
},{_id:false});

const backgroundImageSchema=new mongoose.Schema({
 url:{type:String,trim:true,default:""},
 alt:{type:String,trim:true,default:""},
 caption:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{_id:false});

const PoemModelSchema=new mongoose.Schema({
 title:{type:String,required:true,trim:true,index:true},
 subtitle:{type:String,trim:true,default:""},
 slug:{type:String,trim:true,lowercase:true,unique:true,index:true},

 author:{type:mongoose.Schema.Types.ObjectId,ref:"Author",required:true,index:true},
 genre:{type:mongoose.Schema.Types.ObjectId,ref:"Genre",required:true,index:true},
 publisher:{type:mongoose.Schema.Types.ObjectId,ref:"Publisher",index:true},

 collection:{type:String,trim:true,default:"Poems",index:true},
 section:{type:String,trim:true,default:"",index:true},
 subsection:{type:String,trim:true,default:"",index:true},

 copyright:{type:Date,default:null},
 content:{type:String,required:true,trim:true},

 backgroundImage:{type:backgroundImageSchema,default:()=>({})},

 authorNote:{type:String,trim:true,default:""},
 analysis:{type:analysisSchema,default:()=>({})},

 definitions:[definitionSchema],

 status:{
  type:String,
  enum:["draft","in-progress","incomplete","revision","finished","complete","archived"],
  default:"finished",
  index:true
 },
 isFeatured:{type:Boolean,default:false},
 featuredAt:{type:Date,default:null,index:true},
 isPublished:{type:Boolean,default:false},
 publishedWhere:[{type:String,trim:true}]
},{timestamps:true,collection:"poems",suppressReservedKeysWarning:true});

PoemModelSchema.index({
 title:"text",
 subtitle:"text",
 slug:"text",
 collection:"text",
 section:"text",
 subsection:"text",
 status:"text",
 publishedWhere:"text",
 content:"text",
 authorNote:"text",
 "analysis.formStructure":"text",
 "analysis.theme":"text",
 "analysis.tone":"text",
 "analysis.language":"text",
 "analysis.structure":"text",
 "analysis.personalInterpretation":"text",
 "analysis.broaderContextReflection":"text",
 "analysis.overall":"text"
});

PoemModelSchema.index({author:1,genre:1,collection:1,section:1,subsection:1,status:1,title:1});

const PoemModel=mongoose.models.Poem||mongoose.model("Poem",PoemModelSchema);

export default PoemModel;
