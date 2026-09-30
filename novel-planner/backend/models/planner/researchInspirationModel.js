//backend/models/planner/researchInspirationModel.js
import mongoose from "mongoose";

const researchTopicEntrySchema=new mongoose.Schema({
 topicIdea:{type:String,trim:true,default:""},
 researchQuestion:{type:String,trim:true,default:""},
 priority:{type:String,trim:true,default:""},
 category:{type:String,trim:true,default:""}
},{_id:true});

const researchTopicsSchema=new mongoose.Schema({
 topics:{type:[researchTopicEntrySchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const researchNotesSchema=new mongoose.Schema({
 researchTopic:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]},
 expandedNotes:{type:String,trim:true,default:""}
},{_id:false});

const sourceReferenceSchema=new mongoose.Schema({
 source:{type:String,trim:true,default:""},
 type:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""}
},{_id:true});

const researchLogSchema=new mongoose.Schema({
 topicTitle:{type:String,trim:true,default:""},
 whatDoINeedToKnow:{type:[String],default:[]},
 keyFindings:{type:[String],default:[]},
 sourcesReferences:{type:[sourceReferenceSchema],default:[]},
 howItRelatesToMyProject:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:false});

const authorInfluenceSchema=new mongoose.Schema({
 title:{type:String,trim:true,default:""},
 author:{type:String,trim:true,default:""},
 whatItContributed:{type:String,trim:true,default:""}
},{_id:true});

const mediaInfluenceSchema=new mongoose.Schema({
 title:{type:String,trim:true,default:""},
 source:{type:String,trim:true,default:""},
 whatItContributed:{type:String,trim:true,default:""}
},{_id:true});

const inspirationsInfluencesSchema=new mongoose.Schema({
 authorsPeopleThatInfluencedYou:{type:[authorInfluenceSchema],default:[]},
 filmsShowsGamesThatInspiredYou:{type:[mediaInfluenceSchema],default:[]},
 visualCulturalLifeInfluences:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const inspiringBookSchema=new mongoose.Schema({
 title:{type:String,trim:true,default:""},
 coverImageUrl:{type:String,trim:true,default:""},
 genre:{type:String,trim:true,default:""},
 author:{type:String,trim:true,default:""},
 publisher:{type:String,trim:true,default:""},
 bestQuote:{type:String,trim:true,default:""},
 thingThatInspireYou:{type:String,trim:true,default:""},
 rating:{type:Number,default:0},
 notes:{type:[String],default:[]}
},{_id:true});

const inspiringBooksSchema=new mongoose.Schema({
 books:{type:[inspiringBookSchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const publicationEntrySchema=new mongoose.Schema({
 title:{type:String,trim:true,default:""},
 author:{type:String,trim:true,default:""},
 publicationYear:{type:String,trim:true,default:""},
 topicGenre:{type:String,trim:true,default:""},
 keyTakeawaysNotes:{type:String,trim:true,default:""},
 howItsUsefulForMyProject:{type:String,trim:true,default:""}
},{_id:true});

const booksPublicationsSchema=new mongoose.Schema({
 publications:{type:[publicationEntrySchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const documentedQuoteSchema=new mongoose.Schema({
 quote:{type:String,trim:true,default:""},
 authorSource:{type:String,trim:true,default:""},
 bookArticle:{type:String,trim:true,default:""},
 topicGenre:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:true});

const documentedQuotesSchema=new mongoose.Schema({
 quotes:{type:[documentedQuoteSchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const questionResponseSchema=new mongoose.Schema({
 question:{type:String,trim:true,default:""},
 response:{type:String,trim:true,default:""},
 sortOrder:{type:Number,default:0}
},{_id:true});

const questionsThatHelpSchema=new mongoose.Schema({
 topicClarity:{type:[questionResponseSchema],default:[
  {question:"What exactly am I trying to learn or understand?",response:"",sortOrder:1},
  {question:"Why is this topic important to my story or world?",response:"",sortOrder:2},
  {question:"What do I already know — and what’s missing?",response:"",sortOrder:3}
 ]},
 sourceEvaluation:{type:[questionResponseSchema],default:[
  {question:"Does it offer unique insights or just common knowledge?",response:"",sortOrder:1},
  {question:"Is this source reliable and relevant?",response:"",sortOrder:2},
  {question:"Can I cross-check this information with other materials?",response:"",sortOrder:3}
 ]},
 applicationToStory:{type:[questionResponseSchema],default:[
  {question:"How does this detail enrich my plot, setting, or characters?",response:"",sortOrder:1},
  {question:"Can this real-world fact inspire a fictional twist?",response:"",sortOrder:2},
  {question:"Where can I insert this research naturally into the story?",response:"",sortOrder:3}
 ]},
 others:{type:[questionResponseSchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const inspirationGalleryItemSchema=new mongoose.Schema({
 imageUrl:{type:String,trim:true,default:""},
 quote:{type:String,trim:true,default:""},
 colorPalette:{type:[String],default:[]},
 texture:{type:String,trim:true,default:""},
 symbol:{type:String,trim:true,default:""},
 represents:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]},
 sortOrder:{type:Number,default:0}
},{_id:true});

const inspirationGallerySchema=new mongoose.Schema({
 galleryItems:{type:[inspirationGalleryItemSchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const inspirationNotesSchema=new mongoose.Schema({
 quoteThatMovedMe:{type:[String],default:[]},
 visualIKeepPicturing:{type:[String],default:[]},
 feelingIWantToCapture:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const inspirationalQuoteSchema=new mongoose.Schema({
 quote:{type:String,trim:true,default:""},
 authorSource:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]},
 sortOrder:{type:Number,default:0}
},{_id:true});

const inspirationalQuotesSchema=new mongoose.Schema({
 quotes:{type:[inspirationalQuoteSchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const researchInspirationSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 user_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"User"},
 book_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Book"},

 researchTopics:{type:researchTopicsSchema,default:()=>({})},
 researchNotes:{type:researchNotesSchema,default:()=>({})},
 researchLog:{type:researchLogSchema,default:()=>({})},
 inspirationsInfluences:{type:inspirationsInfluencesSchema,default:()=>({})},
 inspiringBooks:{type:inspiringBooksSchema,default:()=>({})},
 booksPublications:{type:booksPublicationsSchema,default:()=>({})},
 documentedQuotes:{type:documentedQuotesSchema,default:()=>({})},
 questionsThatHelp:{type:questionsThatHelpSchema,default:()=>({})},
 inspirationGallery:{type:inspirationGallerySchema,default:()=>({})},
 inspirationNotes:{type:inspirationNotesSchema,default:()=>({})},
 inspirationalQuotes:{type:inspirationalQuotesSchema,default:()=>({})},

 notes:{type:[String],default:[]},
 isActive:{type:Boolean,default:true,index:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true}
},{timestamps:true,collection:"research_inspirations"});

researchInspirationSchema.index({business_id:1,user_id:1,book_id:1},{unique:true});
researchInspirationSchema.index({business_id:1,user_id:1,isActive:1});

const ResearchInspiration=mongoose.models.ResearchInspiration||mongoose.model("ResearchInspiration",researchInspirationSchema);

export default ResearchInspiration;