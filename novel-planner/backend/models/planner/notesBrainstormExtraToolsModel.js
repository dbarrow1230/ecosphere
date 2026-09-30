//backend/models/planner/notesBrainstormExtraToolsModel.js
import mongoose from "mongoose";

const brainstormingIdeasSchema=new mongoose.Schema({
 ideaDump:{type:[String],default:[]},
 ideaCategories:{
  plotTwists:{type:[String],default:[]},
  characterMoments:{type:[String],default:[]},
  sceneConcepts:{type:[String],default:[]},
  dialogueSnippets:{type:[String],default:[]}
 },
 ideasToExploreMoreDeeply:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const feedbackLogEntrySchema=new mongoose.Schema({
 date:{type:Date,default:null},
 from:{type:String,trim:true,default:""},
 sectionChapter:{type:String,trim:true,default:""},
 feedbackSummary:{type:String,trim:true,default:""},
 actionsToTake:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:true});

const feedbackLogSchema=new mongoose.Schema({
 feedback:{type:[feedbackLogEntrySchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const publishingTimelineEntrySchema=new mongoose.Schema({
 step:{type:String,trim:true,default:""},
 targetDate:{type:Date,default:null},
 status:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:true});

const publishingBudgetEntrySchema=new mongoose.Schema({
 task:{type:String,trim:true,default:""},
 estimatedCost:{type:Number,default:0},
 actualCost:{type:Number,default:0},
 paidStatus:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:true});

const publishingPlanSchema=new mongoose.Schema({
 typeOfPublishing:{type:String,trim:true,default:""},
 whyThisPath:{type:String,trim:true,default:""},
 toDoList:{type:[String],default:[]},
 publishingTimeline:{type:[publishingTimelineEntrySchema],default:[]},
 distributionPlatforms:{type:[String],default:[]},
 budgetOverview:{type:[publishingBudgetEntrySchema],default:[]},
 totalBudget:{type:Number,default:0},
 notes:{type:[String],default:[]}
},{_id:false});

const marketingIdeaEntrySchema=new mongoose.Schema({
 idea:{type:String,trim:true,default:""},
 whereWho:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]},
 status:{type:String,trim:true,default:""}
},{_id:true});

const promotionalIdeaEntrySchema=new mongoose.Schema({
 idea:{type:String,trim:true,default:""},
 cost:{type:Number,default:0},
 description:{type:String,trim:true,default:""},
 deadline:{type:Date,default:null},
 notes:{type:[String],default:[]}
},{_id:true});

const marketingTimelineEntrySchema=new mongoose.Schema({
 marketingStep:{type:String,trim:true,default:""},
 startDate:{type:Date,default:null},
 endDate:{type:Date,default:null},
 status:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:true});

const marketingIdeasSchema=new mongoose.Schema({
 brainstormZone:{type:[String],default:[]},
 digitalMarketing:{type:[marketingIdeaEntrySchema],default:[]},
 communityOutreach:{type:[marketingIdeaEntrySchema],default:[]},
 promotionalIdeas:{type:[promotionalIdeaEntrySchema],default:[]},
 timelineForExecution:{type:[marketingTimelineEntrySchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const fileInventoryEntrySchema=new mongoose.Schema({
 fileName:{type:String,trim:true,default:""},
 type:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},
 lastEdited:{type:Date,default:null},
 notes:{type:[String],default:[]}
},{_id:true});

const backupLocationEntrySchema=new mongoose.Schema({
 fileName:{type:String,trim:true,default:""},
 locationService:{type:String,trim:true,default:""},
 backupDate:{type:Date,default:null},
 method:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:true});

const backupScheduleEntrySchema=new mongoose.Schema({
 frequency:{type:String,trim:true,default:""},
 task:{type:String,trim:true,default:""},
 responsible:{type:String,trim:true,default:""},
 nextDueDate:{type:Date,default:null},
 notes:{type:[String],default:[]}
},{_id:true});

const backupLogFileTrackerSchema=new mongoose.Schema({
 fileInventory:{type:[fileInventoryEntrySchema],default:[]},
 backupLocations:{type:[backupLocationEntrySchema],default:[]},
 backupSchedule:{type:[backupScheduleEntrySchema],default:[]},
 backupChecklist:{type:[String],default:[
  "Backup new versions weekly",
  "Save to at least two locations",
  "Encrypt sensitive documents"
 ]},
 customBackupChecklist:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const mindMapNodeSchema=new mongoose.Schema({
 label:{type:String,trim:true,default:""},
 text:{type:String,trim:true,default:""},
 parentKey:{type:String,trim:true,default:""},
 nodeKey:{type:String,trim:true,default:""},
 sortOrder:{type:Number,default:0},
 notes:{type:[String],default:[]}
},{_id:true});

const mindMapSchema=new mongoose.Schema({
 mainIdea:{type:String,trim:true,default:""},
 nodes:{type:[mindMapNodeSchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const quoteEntrySchema=new mongoose.Schema({
 quote:{type:String,trim:true,default:""},
 authorSource:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]},
 sortOrder:{type:Number,default:0}
},{_id:true});

const quotesCollectionSchema=new mongoose.Schema({
 quotes:{type:[quoteEntrySchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const notesSchema=new mongoose.Schema({
 linedNotes:{type:[String],default:[]},
 dottedNotes:{type:String,trim:true,default:""},
 gridNotes:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:false});

const notesBrainstormExtraToolsSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 user_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"User"},
 book_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Book"},

 brainstormingIdeas:{type:brainstormingIdeasSchema,default:()=>({})},
 feedbackLog:{type:feedbackLogSchema,default:()=>({})},
 publishingPlan:{type:publishingPlanSchema,default:()=>({})},
 marketingIdeas:{type:marketingIdeasSchema,default:()=>({})},
 backupLogFileTracker:{type:backupLogFileTrackerSchema,default:()=>({})},
 mindMap:{type:mindMapSchema,default:()=>({})},
 quotesCollection:{type:quotesCollectionSchema,default:()=>({})},
 notesPages:{type:notesSchema,default:()=>({})},

 notes:{type:[String],default:[]},
 isActive:{type:Boolean,default:true,index:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true}
},{timestamps:true,collection:"notes_brainstorm_extra_tools"});

notesBrainstormExtraToolsSchema.index({business_id:1,user_id:1,book_id:1},{unique:true});
notesBrainstormExtraToolsSchema.index({business_id:1,user_id:1,isActive:1});

const NotesBrainstormExtraTools=mongoose.models.NotesBrainstormExtraTools||mongoose.model("NotesBrainstormExtraTools",notesBrainstormExtraToolsSchema);

export default NotesBrainstormExtraTools;