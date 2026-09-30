//backend/models/planner/plotStructureStoryPlanningModel.js
import mongoose from "mongoose";

const textBlockSchema=new mongoose.Schema({
 text:{type:String,trim:true,default:""},
 sortOrder:{type:Number,default:0}
},{_id:true});

const actSummarySchema=new mongoose.Schema({
 act:{type:String,trim:true,default:""},
 keyEventsPurpose:{type:String,trim:true,default:""},
 sortOrder:{type:Number,default:0}
},{_id:true});

const majorPlotPointSchema=new mongoose.Schema({
 stage:{type:String,trim:true,default:""},
 eventTurningPoint:{type:String,trim:true,default:""},
 sortOrder:{type:Number,default:0}
},{_id:true});

const storyOutlineSchema=new mongoose.Schema({
 storyTitle:{type:String,trim:true,default:""},
 mainStoryGoalPremise:{type:String,trim:true,default:""},
 actStructureSummary:{type:[actSummarySchema],default:[
  {act:"Act I - Beginning",keyEventsPurpose:"",sortOrder:1},
  {act:"Act II - Conflict/Confrontation",keyEventsPurpose:"",sortOrder:2},
  {act:"Act III - Resolution/End",keyEventsPurpose:"",sortOrder:3}
 ]},
 majorPlotPoints:{type:[majorPlotPointSchema],default:[
  {stage:"Inciting Incident",eventTurningPoint:"",sortOrder:1},
  {stage:"First Plot Point",eventTurningPoint:"",sortOrder:2},
  {stage:"Midpoint",eventTurningPoint:"",sortOrder:3},
  {stage:"Climax",eventTurningPoint:"",sortOrder:4},
  {stage:"Falling Action",eventTurningPoint:"",sortOrder:5},
  {stage:"Resolution / Ending",eventTurningPoint:"",sortOrder:6}
 ]},
 subplotsConnections:{type:[String],default:[]},
 notesIdeas:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const introductionSchema=new mongoose.Schema({
 introductionNotes:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const incitingIncidentSchema=new mongoose.Schema({
 whatHappensThatDisruptsOrdinaryWorld:{type:String,trim:true,default:""},
 externalOrInternalCause:{type:String,trim:true,default:""},
 protagonistInitialReaction:{type:String,trim:true,default:""},
 newQuestionOrProblemIntroduced:{type:String,trim:true,default:""},
 whenEventOccurs:{type:String,trim:true,default:""},
 howLongEffectLasts:{type:String,trim:true,default:""},
 connectionToMainConflict:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const keyPlotPointEntrySchema=new mongoose.Schema({
 plotPointName:{type:String,trim:true,default:""},
 descriptionWhatHappens:{type:String,trim:true,default:""},
 chapterAct:{type:String,trim:true,default:""},
 effectOnCharactersOrStory:{type:String,trim:true,default:""}
},{_id:true});

const keyPlotPointsSchema=new mongoose.Schema({
 plotPoints:{type:[keyPlotPointEntrySchema],default:[]},
 additionalNotes:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const eventListPageSchema=new mongoose.Schema({
 events:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const subplotEntrySchema=new mongoose.Schema({
 subplotNumber:{type:String,trim:true,default:""},
 subplotTitle:{type:String,trim:true,default:""},
 characters:{type:String,trim:true,default:""},
 connectionToMainPlot:{type:String,trim:true,default:""},
 beginning:{type:String,trim:true,default:""},
 development:{type:String,trim:true,default:""},
 resolution:{type:String,trim:true,default:""}
},{_id:true});

const subplotOverviewSchema=new mongoose.Schema({
 subplots:{type:[subplotEntrySchema],default:[]},
 notesIdeas:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const epilogueSnapshotSchema=new mongoose.Schema({
 timeJump:{type:String,trim:true,default:""},
 settingOfEpilogue:{type:String,trim:true,default:""}
},{_id:false});

const epilogueCharacterUpdatesSchema=new mongoose.Schema({
 protagonist:{type:String,trim:true,default:""},
 supportingCharacters:{type:String,trim:true,default:""},
 antagonist:{type:String,trim:true,default:""}
},{_id:false});

const epilogueSchema=new mongoose.Schema({
 epilogueSnapshot:{type:epilogueSnapshotSchema,default:()=>({})},
 characterUpdates:{type:epilogueCharacterUpdatesSchema,default:()=>({})},
 mainMessageOrClosure:{type:String,trim:true,default:""},
 optionalElements:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const foreshadowingSchema=new mongoose.Schema({
 foreshadowingElement:{type:String,trim:true,default:""},
 sceneChapter:{type:String,trim:true,default:""},
 pageParagraph:{type:String,trim:true,default:""},
 whatItForeshadows:{type:[String],default:[]},
 subtletyLevel:{type:String,trim:true,default:""},
 whereAndHowTwistHappens:{type:[String],default:[]},
 notesConnections:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const conflictResolutionEntrySchema=new mongoose.Schema({
 conflict:{type:String,trim:true,default:""},
 charactersInvolved:{type:String,trim:true,default:""},
 howIsItResolved:{type:String,trim:true,default:""},
 outcomeImpact:{type:String,trim:true,default:""}
},{_id:true});

const conflictResolutionSchema=new mongoose.Schema({
 conflicts:{type:[conflictResolutionEntrySchema],default:[]},
 finalReflection:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:false});

const lessonLearnedEntrySchema=new mongoose.Schema({
 characterGroup:{type:String,trim:true,default:""},
 whatDidTheyLearnOrRealize:{type:String,trim:true,default:""},
 howDidThisChangeThem:{type:String,trim:true,default:""}
},{_id:true});

const lessonsLearnedSchema=new mongoose.Schema({
 lessons:{type:[lessonLearnedEntrySchema],default:[]},
 overallMessageMoral:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const openingLineBrainstormSchema=new mongoose.Schema({
 openingLineGoals:{type:[String],default:[]},
 brainstormLines:{type:[String],default:[]},
 topChoiceFinalDraft:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:false});

const questionResponseSchema=new mongoose.Schema({
 question:{type:String,trim:true,default:""},
 response:{type:String,trim:true,default:""},
 sortOrder:{type:Number,default:0}
},{_id:true});

const questionsThatCanHelpSchema=new mongoose.Schema({
 storyDevelopment:{type:[questionResponseSchema],default:[
  {question:"What is the central message or theme of my story?",response:"",sortOrder:1},
  {question:"What would happen if the main character made the opposite choice?",response:"",sortOrder:2},
  {question:"What's at stake if the protagonist fails?",response:"",sortOrder:3}
 ]},
 characterBuilding:{type:[questionResponseSchema],default:[
  {question:"What does my character want vs. what do they need?",response:"",sortOrder:1},
  {question:"What's their greatest fear?",response:"",sortOrder:2},
  {question:"What memory still haunts them?",response:"",sortOrder:3}
 ]},
 worldBuilding:{type:[questionResponseSchema],default:[
  {question:"What are the unspoken rules of this world?",response:"",sortOrder:1},
  {question:"How does this world shape the characters' choices?",response:"",sortOrder:2},
  {question:"What makes this setting unique or symbolic?",response:"",sortOrder:3}
 ]},
 dialogueStyle:{type:[questionResponseSchema],default:[
  {question:"Can I hear the character's voice in this scene?",response:"",sortOrder:1},
  {question:"Is the dialogue moving the story forward?",response:"",sortOrder:2},
  {question:"Does the tone match the emotion?",response:"",sortOrder:3}
 ]},
 notes:{type:[String],default:[]}
},{_id:false});

const questionsAboutPlotSchema=new mongoose.Schema({
 coreQuestions:{type:[questionResponseSchema],default:[
  {question:"What is the main conflict driving the story?",response:"",sortOrder:1},
  {question:"What are the stakes for the protagonist?",response:"",sortOrder:2},
  {question:"What motivates each major plot decision?",response:"",sortOrder:3}
 ]},
 structureFlow:{type:[questionResponseSchema],default:[
  {question:"Does each scene push the story forward?",response:"",sortOrder:1},
  {question:"Are there any plot holes or unresolved threads?",response:"",sortOrder:2},
  {question:"Is the pacing consistent and engaging?",response:"",sortOrder:3}
 ]},
 conflictTension:{type:[questionResponseSchema],default:[
  {question:"What obstacles are in the protagonist's way?",response:"",sortOrder:1},
  {question:"Does the tension rise steadily toward the climax?",response:"",sortOrder:2},
  {question:"Is the antagonist's goal believable and strong?",response:"",sortOrder:3}
 ]},
 endingResolution:{type:[questionResponseSchema],default:[
  {question:"Does the ending satisfy the story's central questions?",response:"",sortOrder:1},
  {question:"Are all major arcs resolved or intentionally left open?",response:"",sortOrder:2},
  {question:"What is the emotional impact of the final scenes?",response:"",sortOrder:3}
 ]},
 notes:{type:[String],default:[]}
},{_id:false});

const actStructureSetupSchema=new mongoose.Schema({
 actOneOpeningScene:{
  scenePlace:{type:String,trim:true,default:""},
  tone:{type:String,trim:true,default:""},
  introduceProtagonistOrdinaryWorld:{type:String,trim:true,default:""},
  establishSettingToneAtmosphere:{type:String,trim:true,default:""},
  setupProtagonistGoalsDesireConflicts:{type:String,trim:true,default:""}
 },
 actOneDevelopment:{
  introduceImportantSecondaryCharacters:{type:String,trim:true,default:""},
  protagonistInitialAttemptsToAddressConflict:{type:String,trim:true,default:""},
  raiseStakesLeadingToActTwo:{type:String,trim:true,default:""}
 },
 notes:{type:[String],default:[]}
},{_id:false});

const actStructureConfrontationSchema=new mongoose.Schema({
 actTwoMidpointComplications:{
  revelationChangesDirectionOrUnderstanding:{type:String,trim:true,default:""},
  shiftProtagonistGoalsMotivationPerspective:{type:String,trim:true,default:""},
  introduceNewObstaclesConflictsAntagonisticForce:{type:String,trim:true,default:""},
  increaseTensionRaiseStakesFurther:{type:String,trim:true,default:""},
  testProtagonistResolveSkillsBeliefs:{type:String,trim:true,default:""}
 },
 actTwoRisingAction:{
  presentSeriesOfChallenges:{type:String,trim:true,default:""},
  introduceSubplotsAndComplexNarrative:{type:String,trim:true,default:""},
  deepenCharacterRelationshipsAndEscalateConflict:{type:String,trim:true,default:""}
 },
 notes:{type:[String],default:[]}
},{_id:false});

const actStructureResolutionSchema=new mongoose.Schema({
 actThreeFallingAction:{
  resolveSubplotsTieLooseEnds:{type:String,trim:true,default:""},
  revealConsequence:{type:String,trim:true,default:""},
  provideClosureToCharacterArcAndRelationship:{type:String,trim:true,default:""}
 },
 actThreeClimax:{
  finalConfrontationBetweenProtagonistAndAntagonist:{type:String,trim:true,default:""},
  highestPointOfTensionOutcomeAtStake:{type:String,trim:true,default:""},
  showProtagonistGrowthLossOrConsequences:{type:String,trim:true,default:""}
 },
 actThreeResolution:{
  ultimateTriumphOrResolutionOfMainConflict:{type:String,trim:true,default:""},
  reflectThemesMessagesLessons:{type:String,trim:true,default:""},
  closure:{type:String,trim:true,default:""}
 },
 notes:{type:[String],default:[]}
},{_id:false});

const actWritingPageSchema=new mongoose.Schema({
 act:{type:String,trim:true,default:""},
 sceneNumberName:{type:String,trim:true,default:""},
 sceneSummary:{type:String,trim:true,default:""},
 setting:{type:String,trim:true,default:""},
 characters:{type:String,trim:true,default:""},
 writingNotes:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:true});

const plotStructureStoryPlanningSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 user_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"User"},
 book_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Book"},

 storyOutline:{type:storyOutlineSchema,default:()=>({})},
 introduction:{type:introductionSchema,default:()=>({})},
 incitingIncident:{type:incitingIncidentSchema,default:()=>({})},
 keyPlotPoints:{type:keyPlotPointsSchema,default:()=>({})},
 risingActions:{type:eventListPageSchema,default:()=>({})},
 fallingActions:{type:eventListPageSchema,default:()=>({})},
 climax:{type:eventListPageSchema,default:()=>({})},
 resolution:{type:eventListPageSchema,default:()=>({})},
 subplotOverview:{type:subplotOverviewSchema,default:()=>({})},
 epilogue:{type:epilogueSchema,default:()=>({})},
 foreshadowing:{type:foreshadowingSchema,default:()=>({})},
 conflictResolution:{type:conflictResolutionSchema,default:()=>({})},
 lessonsLearned:{type:lessonsLearnedSchema,default:()=>({})},
 openingLineBrainstorm:{type:openingLineBrainstormSchema,default:()=>({})},
 questionsThatCanHelp:{type:questionsThatCanHelpSchema,default:()=>({})},
 questionsAboutPlot:{type:questionsAboutPlotSchema,default:()=>({})},
 actStructureSetup:{type:actStructureSetupSchema,default:()=>({})},
 actStructureConfrontation:{type:actStructureConfrontationSchema,default:()=>({})},
 actStructureResolution:{type:actStructureResolutionSchema,default:()=>({})},
 actWritingPages:{type:[actWritingPageSchema],default:[]},

 notes:{type:[String],default:[]},
 isActive:{type:Boolean,default:true,index:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true}
},{timestamps:true,collection:"plot_structure_story_plannings"});

plotStructureStoryPlanningSchema.index({business_id:1,user_id:1,book_id:1},{unique:true});
plotStructureStoryPlanningSchema.index({business_id:1,user_id:1,isActive:1});

const PlotStructureStoryPlanning=mongoose.models.PlotStructureStoryPlanning||mongoose.model("PlotStructureStoryPlanning",plotStructureStoryPlanningSchema);

export default PlotStructureStoryPlanning;