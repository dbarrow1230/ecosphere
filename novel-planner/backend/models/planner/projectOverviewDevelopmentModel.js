//backend/models/planner/projectOverviewDevelopmentModel.js
import mongoose from "mongoose";

const pitchBuilderSchema=new mongoose.Schema({
 protagonistMainCharacters:{type:String,trim:true,default:""},
 whatDoTheyWant:{type:String,trim:true,default:""},
 standingInTheirWayConflict:{type:String,trim:true,default:""},
 stakesIfTheyFail:{type:String,trim:true,default:""}
},{_id:false});

const elevatorPitchSchema=new mongoose.Schema({
 pitchBuilder:{type:pitchBuilderSchema,default:()=>({})},
 elevatorPitchDraft:{type:String,trim:true,default:""},
 styleConsistency:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const genreSubGenreSchema=new mongoose.Schema({
 primaryGenre:{type:String,trim:true,default:""},
 subgenres:{type:[String],default:[]},
 whyThisGenre:{type:String,trim:true,default:""},
 genreExpectationsTropes:{type:[String],default:[]},
 genreSpecificIdeasToInclude:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const titleOptionSchema=new mongoose.Schema({
 title:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:true});

const genreAudienceFitSchema=new mongoose.Schema({
 status:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:false});

const nameYourStorySchema=new mongoose.Schema({
 mainTitle:{type:String,trim:true,default:""},
 tagline:{type:String,trim:true,default:""},
 whyThisTitle:{type:String,trim:true,default:""},
 doesItFitGenreAudience:{type:genreAudienceFitSchema,default:()=>({})},
 workingTitles:{type:[titleOptionSchema],default:[]},
 futureTitleIdeas:{type:[titleOptionSchema],default:[]},
 compareWithOtherTitles:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:false});

const draftStageSchema=new mongoose.Schema({
 stage:{type:String,trim:true,default:""},
 status:{type:String,trim:true,default:""},
 sortOrder:{type:Number,default:0},
 notes:{type:[String],default:[]}
},{_id:true});

const themeToneSchema=new mongoose.Schema({
 centralThemes:{type:String,trim:true,default:""},
 toneMood:{type:String,trim:true,default:""}
},{_id:false});

const mainCharacterOverviewSchema=new mongoose.Schema({
 characterName:{type:String,trim:true,default:""},
 role:{type:String,trim:true,default:""},
 arcStatus:{type:String,trim:true,default:""},
 character_profile_id:{type:mongoose.Schema.Types.ObjectId,ref:"CharacterProfile",default:null,index:true}
},{_id:true});

const storyDashboardSchema=new mongoose.Schema({
 title:{type:String,trim:true,default:""},
 workingTitle:{type:String,trim:true,default:""},
 tagline:{type:String,trim:true,default:""},
 additionInfo:{type:String,trim:true,default:""},
 genre:{type:String,trim:true,default:""},
 subGenre:{type:String,trim:true,default:""},
 wordCountGoal:{type:Number,default:0},
 targetCompletionDate:{type:Date,default:null},
 draftStages:{type:[draftStageSchema],default:[
  {stage:"Outline",status:"",sortOrder:1,notes:[]},
  {stage:"First Draft",status:"",sortOrder:2,notes:[]},
  {stage:"Editing",status:"",sortOrder:3,notes:[]},
  {stage:"Finalizing",status:"",sortOrder:4,notes:[]}
 ]},
 themeTone:{type:themeToneSchema,default:()=>({})},
 targetAudience:{type:[String],default:[]},
 collaboration:{type:[String],default:[]},
 primaryGoal:{type:String,trim:true,default:""},
 mainCharactersOverview:{type:[mainCharacterOverviewSchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const timelineEntrySchema=new mongoose.Schema({
 chapterAct:{type:String,trim:true,default:""},
 event:{type:String,trim:true,default:""},
 timeDateEra:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:true});

const storyTimelineSchema=new mongoose.Schema({
 timeline:{type:[timelineEntrySchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const demographicProfileSchema=new mongoose.Schema({
 fictionalName:{type:String,trim:true,default:""},
 ageRange:{type:String,trim:true,default:""},
 genderIdentity:{type:String,trim:true,default:""},
 location:{type:String,trim:true,default:""},
 lifestyleInterests:{type:[String],default:[]},
 readingHabits:{type:String,trim:true,default:""},
 lookingForInBook:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:true});

const targetAudienceDemographicsSchema=new mongoose.Schema({
 demographics:{type:[demographicProfileSchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const motifSymbolSchema=new mongoose.Schema({
 motifSymbol:{type:String,trim:true,default:""},
 represents:{type:String,trim:true,default:""},
 whereItAppearsInStory:{type:String,trim:true,default:""}
},{_id:true});

const themesMotifsSchema=new mongoose.Schema({
 mainThemes:{type:[String],default:[]},
 motifsSymbols:{type:[motifSymbolSchema],default:[]},
 themeShowMethods:{type:[String],default:[]},
 reflection:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:false});

const moodSnapshotSchema=new mongoose.Schema({
 thisStoryFeelsLike:{type:String,trim:true,default:""},
 readerShouldFeel:{type:String,trim:true,default:""}
},{_id:false});

const toneStyleSchema=new mongoose.Schema({
 primaryTone:{type:String,trim:true,default:""},
 secondaryTone:{type:String,trim:true,default:""},
 moodSnapshot:{type:moodSnapshotSchema,default:()=>({})},
 narrativeStyles:{type:[String],default:[]},
 pointOfViews:{type:[String],default:[]},
 whatMakesYourStyleUnique:{type:String,trim:true,default:""},
 styleConsistency:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const wordCountTrackerEntrySchema=new mongoose.Schema({
 dateDay:{type:String,trim:true,default:""},
 wordsWritten:{type:Number,default:0},
 dailyNote:{type:String,trim:true,default:""}
},{_id:true});

const wordCountGoalTrackerSchema=new mongoose.Schema({
 totalWordCountGoal:{type:Number,default:0},
 dailyWordCountGoal:{type:Number,default:0},
 weeklyWordCountGoal:{type:Number,default:0},
 monthlyWordCountGoal:{type:Number,default:0},
 targetDeadline:{type:Date,default:null},
 wordCountTracker:{type:[wordCountTrackerEntrySchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const writingStyleSchema=new mongoose.Schema({
 styleCues:{type:[String],default:[]},
 toneMood:{type:[String],default:[]},
 sentenceStyle:{type:[String],default:[]},
 stylePitfallsToAvoid:{type:[String],default:[]},
 styleRemindersToSelf:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const futurePlanningNotesSchema=new mongoose.Schema({
 futureIdeas:{type:[String],default:[]},
 sequelIdeas:{type:[String],default:[]},
 expansionIdeas:{type:[String],default:[]},
 revisionIdeas:{type:[String],default:[]},
 marketingIdeas:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const randomThoughtSchema=new mongoose.Schema({
 thought:{type:String,trim:true,default:""},
 bubble_shape_id:{type:mongoose.Schema.Types.ObjectId,ref:"BubbleShape",default:null,index:true},
 sortOrder:{type:Number,default:0}
},{_id:true});

const randomThoughtsSchema=new mongoose.Schema({
 thoughts:{type:[randomThoughtSchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const projectOverviewDevelopmentSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 user_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"User"},
 book_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Book"},

 storyDashboard:{type:storyDashboardSchema,default:()=>({})},
 nameYourStory:{type:nameYourStorySchema,default:()=>({})},
 genreSubGenre:{type:genreSubGenreSchema,default:()=>({})},
 targetAudienceDemographics:{type:targetAudienceDemographicsSchema,default:()=>({})},
 elevatorPitch:{type:elevatorPitchSchema,default:()=>({})},
 themesMotifs:{type:themesMotifsSchema,default:()=>({})},
 toneStyle:{type:toneStyleSchema,default:()=>({})},
 writingStyle:{type:writingStyleSchema,default:()=>({})},
 storyTimeline:{type:storyTimelineSchema,default:()=>({})},
 wordCountGoalTracker:{type:wordCountGoalTrackerSchema,default:()=>({})},
 futurePlanningNotes:{type:futurePlanningNotesSchema,default:()=>({})},
 randomThoughts:{type:randomThoughtsSchema,default:()=>({})},

 notes:{type:[String],default:[]},
 isActive:{type:Boolean,default:true,index:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true}
},{timestamps:true,collection:"project_overview_developments"});

projectOverviewDevelopmentSchema.index({business_id:1,user_id:1,book_id:1},{unique:true});
projectOverviewDevelopmentSchema.index({business_id:1,user_id:1,isActive:1});

const ProjectOverviewDevelopment=mongoose.models.ProjectOverviewDevelopment||mongoose.model("ProjectOverviewDevelopment",projectOverviewDevelopmentSchema);

export default ProjectOverviewDevelopment;
