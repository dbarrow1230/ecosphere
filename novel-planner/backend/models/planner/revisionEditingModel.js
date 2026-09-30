//backend/models/planner/revisionEditingModel.js
import mongoose from "mongoose";

const revisionNoteEntrySchema=new mongoose.Schema({
 pageNumber:{type:String,trim:true,default:""},
 revisionNote:{type:String,trim:true,default:""}
},{_id:true});

const revisionNotesSchema=new mongoose.Schema({
 revisionNotes:{type:[revisionNoteEntrySchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const checklistItemSchema=new mongoose.Schema({
 question:{type:String,trim:true,default:""},
 status:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]},
 sortOrder:{type:Number,default:0}
},{_id:true});

const revisionChecklistProjectInfoSchema=new mongoose.Schema({
 projectTitle:{type:String,trim:true,default:""},
 dateStarted:{type:Date,default:null},
 dateCompleted:{type:Date,default:null},
 theme:{type:String,trim:true,default:""},
 genre:{type:String,trim:true,default:""},
 expectedWordCount:{type:Number,default:0},
 imageUrl:{type:String,trim:true,default:""}
},{_id:false});

const revisionChecklistSchema=new mongoose.Schema({
 projectInfo:{type:revisionChecklistProjectInfoSchema,default:()=>({})},
 plotStructure:{type:[checklistItemSchema],default:[
  {question:"Does plot flow logically from beginning to end?",status:"",notes:[],sortOrder:1},
  {question:"Are there any plot holes or inconsistencies?",status:"",notes:[],sortOrder:2},
  {question:"Are all subplots resolved satisfactorily?",status:"",notes:[],sortOrder:3},
  {question:"Is the pacing appropriate throughout the story?",status:"",notes:[],sortOrder:4},
  {question:"Are the major turning points and climax effective?",status:"",notes:[],sortOrder:5}
 ]},
 characterDevelopment:{type:[checklistItemSchema],default:[
  {question:"Are the characters well-developed and three-dimensional?",status:"",notes:[],sortOrder:1},
  {question:"Do the characters have clear motivations and arcs?",status:"",notes:[],sortOrder:2},
  {question:"Are the character relationships believable and dynamic?",status:"",notes:[],sortOrder:3},
  {question:"Are there any unnecessary or redundant characters?",status:"",notes:[],sortOrder:4},
  {question:"Do the characters' actions and dialogue remain consistent?",status:"",notes:[],sortOrder:5}
 ]},
 settingWorldBuilding:{type:[checklistItemSchema],default:[
  {question:"Is the setting vividly described and immersive?",status:"",notes:[],sortOrder:1},
  {question:"Does the world-building feel cohesive and believable?",status:"",notes:[],sortOrder:2},
  {question:"Are there any inconsistencies in the setting or world-building?",status:"",notes:[],sortOrder:3},
  {question:"Does the setting enhance the mood and atmosphere of the story?",status:"",notes:[],sortOrder:4},
  {question:"Are there opportunities to further develop the setting?",status:"",notes:[],sortOrder:5}
 ]},
 notes:{type:[String],default:[]}
},{_id:false});

const authorialChecklistProjectInfoSchema=new mongoose.Schema({
 projectTitle:{type:String,trim:true,default:""},
 dateStarted:{type:Date,default:null},
 dateCompleted:{type:Date,default:null},
 theme:{type:String,trim:true,default:""},
 genre:{type:String,trim:true,default:""},
 expectedWordCount:{type:Number,default:0},
 imageUrl:{type:String,trim:true,default:""}
},{_id:false});

const authorialChecklistSchema=new mongoose.Schema({
 projectInfo:{type:authorialChecklistProjectInfoSchema,default:()=>({})},
 preWritingPhase:{type:[checklistItemSchema],default:[
  {question:"Have you identified your target audience?",status:"",notes:[],sortOrder:1},
  {question:"Have you chosen a genre or story theme?",status:"",notes:[],sortOrder:2},
  {question:"Have you brainstormed multiple story ideas?",status:"",notes:[],sortOrder:3},
  {question:"Have you created a basic story concept or logline?",status:"",notes:[],sortOrder:4},
  {question:"Have you defined the story's message or core idea?",status:"",notes:[],sortOrder:5},
  {question:"Have you decided on the story structure?",status:"",notes:[],sortOrder:6}
 ]},
 writingPhase:{type:[checklistItemSchema],default:[
  {question:"Have you outlined the main plot and key turning points?",status:"",notes:[],sortOrder:1},
  {question:"Have you developed your main and secondary characters?",status:"",notes:[],sortOrder:2},
  {question:"Is your setting and world-building clearly detailed?",status:"",notes:[],sortOrder:3},
  {question:"Have you written your opening scene or chapter?",status:"",notes:[],sortOrder:4},
  {question:"Have you completed your first draft?",status:"",notes:[],sortOrder:5},
  {question:"Have you revised your draft for pacing, structure, and flow?",status:"",notes:[],sortOrder:6},
  {question:"Have you done a round of self-editing?",status:"",notes:[],sortOrder:7}
 ]},
 researchInspiration:{type:[checklistItemSchema],default:[
  {question:"Have you researched essential topics or settings for accuracy?",status:"",notes:[],sortOrder:1},
  {question:"Have you documented sources, quotes, or cultural references?",status:"",notes:[],sortOrder:2},
  {question:"Have you gathered visual inspiration or mood boards?",status:"",notes:[],sortOrder:3}
 ]},
 feedbackRevision:{type:[checklistItemSchema],default:[
  {question:"Have you shared your manuscript with critique partners or beta readers?",status:"",notes:[],sortOrder:1},
  {question:"Have you received and reviewed constructive feedback?",status:"",notes:[],sortOrder:2},
  {question:"Have you implemented needed changes based on feedback?",status:"",notes:[],sortOrder:3},
  {question:"Have you completed a final professional or personal edit?",status:"",notes:[],sortOrder:4}
 ]},
 publishingPreparation:{type:[checklistItemSchema],default:[
  {question:"Have you decided on a publishing path?",status:"",notes:[],sortOrder:1},
  {question:"Is your manuscript professionally formatted?",status:"",notes:[],sortOrder:2},
  {question:"Have you written a compelling book blurb and synopsis?",status:"",notes:[],sortOrder:3},
  {question:"Do you have a cover design?",status:"",notes:[],sortOrder:4},
  {question:"Have you acquired ISBN and copyright registration if applicable?",status:"",notes:[],sortOrder:5}
 ]},
 marketingLaunch:{type:[checklistItemSchema],default:[
  {question:"Have you created a basic marketing strategy or plan?",status:"",notes:[],sortOrder:1},
  {question:"Have you built a mailing list or reader platform?",status:"",notes:[],sortOrder:2},
  {question:"Have you scheduled promotional content for social media?",status:"",notes:[],sortOrder:3},
  {question:"Have you reached out to ARC readers or reviewers?",status:"",notes:[],sortOrder:4},
  {question:"Have you planned your book launch date and events?",status:"",notes:[],sortOrder:5}
 ]},
 mindsetMotivation:{type:[checklistItemSchema],default:[
  {question:"Are you writing from a place of purpose or inspiration?",status:"",notes:[],sortOrder:1},
  {question:"Do you have a realistic and flexible writing schedule?",status:"",notes:[],sortOrder:2},
  {question:"Are you taking breaks to prevent burnout?",status:"",notes:[],sortOrder:3},
  {question:"Have you set personal goals or affirmations for writing?",status:"",notes:[],sortOrder:4},
  {question:"Are you allowing yourself to grow without perfectionism?",status:"",notes:[],sortOrder:5}
 ]},
 notes:{type:[String],default:[]}
},{_id:false});

const revisionEditingSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 user_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"User"},
 book_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Book"},

 revisionNotes:{type:revisionNotesSchema,default:()=>({})},
 revisionChecklist:{type:revisionChecklistSchema,default:()=>({})},
 authorialChecklist:{type:authorialChecklistSchema,default:()=>({})},

 notes:{type:[String],default:[]},
 isActive:{type:Boolean,default:true,index:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true}
},{timestamps:true,collection:"revision_editings"});

revisionEditingSchema.index({business_id:1,user_id:1,book_id:1},{unique:true});
revisionEditingSchema.index({business_id:1,user_id:1,isActive:1});

const RevisionEditing=mongoose.models.RevisionEditing||mongoose.model("RevisionEditing",revisionEditingSchema);

export default RevisionEditing;