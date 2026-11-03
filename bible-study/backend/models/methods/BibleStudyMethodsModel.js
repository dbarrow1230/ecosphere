// backend/models/methods/BibleStudyMehtodModel.js
import mongoose from "mongoose";

const stepSchema=new mongoose.Schema({
 title:{type:String,trim:true,default:""},
 content:{type:String,trim:true,default:""},
 order:{type:Number,default:0}
},{_id:false});

const exampleSchema=new mongoose.Schema({
 reference:{type:String,trim:true,default:""},
 summary:{type:String,trim:true,default:""},
 observation:{type:String,trim:true,default:""},
 interpretation:{type:String,trim:true,default:""},
 application:{type:String,trim:true,default:""},
 prayer:{type:String,trim:true,default:""},
 memoryVerse:{type:String,trim:true,default:""},
 journal:{type:String,trim:true,default:""}
},{_id:false});

const prayerPromptSchema=new mongoose.Schema({
 title:{type:String,trim:true,default:""},
 prompt:{type:String,trim:true,default:""}
},{_id:false});

const subMethodSchema=new mongoose.Schema({
 title:{type:String,trim:true,default:""},
 slug:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},
 purpose:{type:String,trim:true,default:""},
 bestFor:[{type:String,trim:true}],
 whenToUse:{type:String,trim:true,default:""},
 keyQuestions:[{type:String,trim:true}],
 strengths:[{type:String,trim:true}],
 cautions:[{type:String,trim:true}],
 relatedScriptures:[{type:String,trim:true}],
 tools:[{type:String,trim:true}],
 tips:[{type:String,trim:true}],
 notes:{type:String,trim:true,default:""},
 order:{type:Number,default:0}
},{_id:false});

const methodImageSchema=new mongoose.Schema({
 url:{type:String,required:true,trim:true},
 caption:{type:String,trim:true,default:""},
 alt:{type:String,trim:true,default:""},
 type:{type:String,enum:["example","worksheet","diagram","notes","reference"],default:"example"},
 order:{type:Number,default:0},
 isPrimary:{type:Boolean,default:false}
},{_id:false});

const transformationMarkerSchema=new mongoose.Schema({
 category:{type:String,trim:true,default:""},
 markers:[{type:String,trim:true}]
},{_id:false});

const accuracyCheckSchema=new mongoose.Schema({
 title:{type:String,trim:true,default:""},
 checks:[{type:String,trim:true}]
},{_id:false});

const interpretationPitfallSchema=new mongoose.Schema({
 title:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""}
},{_id:false});

const bibleStudyMethodSchema=new mongoose.Schema({

 // identity
 title:{type:String,required:true,trim:true},
 slug:{type:String,required:true,trim:true,unique:true,lowercase:true},
 subtitle:{type:String,trim:true,default:""},
 icon:{type:String,trim:true,default:""},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"StudyCategory"},
 difficulty:{type:mongoose.Schema.Types.ObjectId,ref:"DifficultyLevel"},
 skillLevel:{type:String,trim:true,default:""},
 timeRequired:{type:String,trim:true,default:""},
 effortLevel:{type:String,trim:true,default:""},
 bestSetting:[{type:String,trim:true}],
 methodFamily:{type:mongoose.Schema.Types.ObjectId,ref:"BibleStudyMethod",default:null},
 isMainMethod:{type:Boolean,default:true},
 subMethods:[subMethodSchema],

 // explanation
 description:{type:String,required:true,trim:true},
 overview:{type:String,trim:true,default:""},
 purpose:{type:String,trim:true,default:""},
 whenToUse:{type:String,trim:true,default:""},
 whatIsThisMethod:{type:String,trim:true,default:""},
 whyUseThisMethod:{type:String,trim:true,default:""},
 biblicalBasis:{type:String,trim:true,default:""},
 hermeneuticalBasis:{type:String,trim:true,default:""},
 whyThisMethodIsValidInScripture:{type:String,trim:true,default:""},
 bestUseCases:[{type:String,trim:true}],
 whenNotToUse:{type:String,trim:true,default:""},
 howToThinkAboutIt:{type:String,trim:true,default:""},
 analogy:{type:String,trim:true,default:""},
 mainOutcome:{type:String,trim:true,default:""},

 // audience and goals
 audience:[{type:String,trim:true}],
 bestFor:[{type:String,trim:true}],
 goals:[{type:String,trim:true}],
 learningOutcomes:[{type:String,trim:true}],
 idealStudyContexts:[{type:String,trim:true}],
 complementaryMethods:[{type:String,trim:true}],
 lessIdealFor:[{type:String,trim:true}],

 // process
 steps:[stepSchema],
 stepOverview:{type:String,trim:true,default:""},
 requirements:[{type:String,trim:true}],
 tools:[{type:String,trim:true}],
 requiredTools:[{type:String,trim:true}],
 optionalTools:[{type:String,trim:true}],
 preparationTips:[{type:String,trim:true}],
 studyTips:[{type:String,trim:true}],
 beforeYouBegin:[{type:String,trim:true}],
 heartPosture:[{type:String,trim:true}],
 spiritualPreparation:[{type:String,trim:true}],
 guardrails:[{type:String,trim:true}],
 variations:[{type:String,trim:true}],

 // study thinking
 observationPrompts:[{type:String,trim:true}],
 interpretationPrompts:[{type:String,trim:true}],
 applicationPrompts:[{type:String,trim:true}],
 reflectionQuestions:[{type:String,trim:true}],
 keyQuestions:[{type:String,trim:true}],
 observationGuide:[{type:String,trim:true}],
 interpretationGuide:[{type:String,trim:true}],
 applicationGuide:[{type:String,trim:true}],
 interpretationPitfalls:[interpretationPitfallSchema],

 // prayer response
 prayerPrompts:[prayerPromptSchema],
 prayerFocus:[{type:String,trim:true}],
 prayerPoints:[{type:String,trim:true}],
 prayerGuide:[{type:String,trim:true}],
 prayer:{type:String,trim:true,default:""},

 // memorization and journaling
 memoryVerse:{type:String,trim:true,default:""},
 memorizationTips:[{type:String,trim:true}],
 journalingPrompts:[{type:String,trim:true}],
 recordYourFindings:{type:String,trim:true,default:""},
 recordFormats:[{type:String,trim:true}],
 journalingGuidance:[{type:String,trim:true}],

 // strengths and cautions
 strengths:[{type:String,trim:true}],
 benefits:[{type:String,trim:true}],
 cautions:[{type:String,trim:true}],
 commonMistakes:[{type:String,trim:true}],
 commonMisconceptions:[{type:String,trim:true}],
 unrealisticExpectations:[{type:String,trim:true}],
 whatNotToDo:[{type:String,trim:true}],
 limitations:[{type:String,trim:true}],
 accuracyChecks:[accuracyCheckSchema],
 soundDoctrineChecks:[{type:String,trim:true}],

 // growth and discipline
 application:{type:String,trim:true,default:""},
 spiritualOutcome:{type:String,trim:true,default:""},
 coreSpiritualOutcome:{type:String,trim:true,default:""},
 disciplineReminder:{type:String,trim:true,default:""},
 transformationMarkers:[transformationMarkerSchema],

 // media
 methodImages:[methodImageSchema],

 // related material
 relatedMethods:[{type:mongoose.Schema.Types.ObjectId,ref:"BibleStudyMethod"}],
 relatedTopics:[{type:String,trim:true}],
 relatedPractices:[{type:String,trim:true}],
 relatedScriptures:[{type:String,trim:true}],
 crossReferences:[{type:String,trim:true}],
 followUpMethods:[{type:String,trim:true}],
 suggestedPassages:[{type:String,trim:true}],
 tags:[{type:String,trim:true}],

 // example demonstration
 example:{type:exampleSchema,default:()=>({})},

 // synthesis
 howThisMethodFitsInACompleteStudySystem:{type:String,trim:true,default:""},
 roleInOverallBibleStudy:{type:String,trim:true,default:""},

 // final notes
 notes:[{type:String,trim:true}],
 closing:{type:String,trim:true,default:""},
 finalThought:{type:String,trim:true,default:""}

},{
 timestamps:true,
 collection:"bible_study_methods"
});

export default mongoose.models.BibleStudyMethod||mongoose.model("BibleStudyMethod",bibleStudyMethodSchema);
