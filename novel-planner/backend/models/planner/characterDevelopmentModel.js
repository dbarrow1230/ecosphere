//backend/models/planner/characterDevelopmentModel.js
import mongoose from "mongoose";

const characterListEntrySchema=new mongoose.Schema({
 characterName:{type:String,trim:true,default:""},
 roleInStory:{type:String,trim:true,default:""},
 type:{type:String,trim:true,enum:["Main","Side","Minor"],default:"Minor"},
 firstAppearance:{type:String,trim:true,default:""}
},{_id:true});

const physicalDescriptionSchema=new mongoose.Schema({
 height:{type:String,trim:true,default:""},
 weight:{type:String,trim:true,default:""},
 build:{type:String,trim:true,default:""},
 clothingStyle:{type:String,trim:true,default:""},
 hair:{type:String,trim:true,default:""},
 eyes:{type:String,trim:true,default:""},
 distinctFeatures:{type:String,trim:true,default:""},
 appearance:{type:String,trim:true,default:""}
},{_id:false});

const personalitySchema=new mongoose.Schema({
 personalityTraits:{type:[String],default:[]},
 strengths:{type:[String],default:[]},
 weaknesses:{type:[String],default:[]},
 habits:{type:[String],default:[]},
 quirks:{type:[String],default:[]},
 fears:{type:[String],default:[]},
 hobbies:{type:[String],default:[]},
 interests:{type:[String],default:[]},
 values:{type:[String],default:[]},
 goals:{type:[String],default:[]},
 likes:{type:[String],default:[]},
 dislikes:{type:[String],default:[]},
 motivation:{type:String,trim:true,default:""},
 favoriteQuote:{type:String,trim:true,default:""}
},{_id:false});

const storyConflictSchema=new mongoose.Schema({
 challenges:{type:[String],default:[]},
 obstacles:{type:[String],default:[]},
 internalConflict:{type:String,trim:true,default:""},
 externalConflict:{type:String,trim:true,default:""}
},{_id:false});

const relationshipToCharacterSchema=new mongoose.Schema({
 characterName:{type:String,trim:true,default:""},
 relationshipType:{type:String,trim:true,default:""},
 relationshipDescription:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:true});

const backgroundSchema=new mongoose.Schema({
 earlyLife:{type:String,trim:true,default:""},
 educationCareer:{type:String,trim:true,default:""},
 currentPosition:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:false});

const keyRelationshipsSchema=new mongoose.Schema({
 family:{type:[String],default:[]},
 colleagues:{type:[String],default:[]},
 himself:{type:[String],default:[]},
 partners:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const profileVisualReferenceSchema=new mongoose.Schema({
 imageUrl:{type:String,trim:true,default:""},
 caption:{type:String,trim:true,default:""}
},{_id:false});

const characterProfileEntrySchema=new mongoose.Schema({
 character_role_id:{type:mongoose.Schema.Types.ObjectId,ref:"CharacterRole",default:null,index:true},
 fullName:{type:String,trim:true,default:""},
 nickName:{type:String,trim:true,default:""},
 residence:{type:String,trim:true,default:""},
 age:{type:String,trim:true,default:""},
 gender:{type:String,trim:true,default:""},
 pronouns:{type:String,trim:true,default:""},
 nationality:{type:String,trim:true,default:""},
 ethnicity:{type:String,trim:true,default:""},
 placeOfBirth:{type:String,trim:true,default:""},
 maritalStatus:{type:String,trim:true,default:""},
 physicalDescription:{type:physicalDescriptionSchema,default:()=>({})},
 personality:{type:personalitySchema,default:()=>({})},
 storyConflict:{type:storyConflictSchema,default:()=>({})},
 relationshipsToOtherCharacters:{type:[relationshipToCharacterSchema],default:[]},
 background:{type:backgroundSchema,default:()=>({})},
 keyRelationships:{type:keyRelationshipsSchema,default:()=>({})},
 visualReference:{type:profileVisualReferenceSchema,default:()=>({})},
 notes:{type:[String],default:[]}
},{_id:true});

const arcPointSchema=new mongoose.Schema({
 text:{type:String,trim:true,default:""},
 sortOrder:{type:Number,default:0}
},{_id:true});

const internalChangeSchema=new mongoose.Schema({
 element:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},
 sortOrder:{type:Number,default:0}
},{_id:true});

const arcStageSchema=new mongoose.Schema({
 stage:{type:String,trim:true,default:""},
 keyMomentShift:{type:String,trim:true,default:""},
 sortOrder:{type:Number,default:0}
},{_id:true});

const characterArcEntrySchema=new mongoose.Schema({
 character_profile_id:{type:mongoose.Schema.Types.ObjectId,default:null,index:true},
 characterName:{type:String,trim:true,default:""},
 startingPoint:{type:[arcPointSchema],default:[]},
 endingPoint:{type:[arcPointSchema],default:[]},
 internalChange:{type:[internalChangeSchema],default:[
  {element:"Core Flaw",notes:"",sortOrder:1},
  {element:"Core Desire",notes:"",sortOrder:2},
  {element:"Need (True Goal)",notes:"",sortOrder:3},
  {element:"Emotional Wound",notes:"",sortOrder:4},
  {element:"Trigger Event",notes:"",sortOrder:5}
 ]},
 arcStagesBreakdown:{type:[arcStageSchema],default:[
  {stage:"Setup",keyMomentShift:"",sortOrder:1},
  {stage:"Inciting Incident",keyMomentShift:"",sortOrder:2},
  {stage:"First Shift",keyMomentShift:"",sortOrder:3},
  {stage:"Midpoint Realization",keyMomentShift:"",sortOrder:4},
  {stage:"Final Test",keyMomentShift:"",sortOrder:5},
  {stage:"Resolution",keyMomentShift:"",sortOrder:6}
 ]},
 developmentJourney:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:true});

const storyOverviewRoleFunctionSchema=new mongoose.Schema({
 roleInStory:{type:String,trim:true,default:""},
 functionInPlot:{type:String,trim:true,default:""},
 relationshipToMainConflict:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:false});

const storyOverviewMotivationGoalSchema=new mongoose.Schema({
 motivation:{type:String,trim:true,default:""},
 goal:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:false});

const storyOverviewConflictObstacleSchema=new mongoose.Schema({
 internalConflict:{type:String,trim:true,default:""},
 externalConflict:{type:String,trim:true,default:""},
 obstacles:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const storyCharacterOverviewEntrySchema=new mongoose.Schema({
 overviewType:{type:String,trim:true,enum:["Protagonist","Antagonist"],required:true},
 character_profile_id:{type:mongoose.Schema.Types.ObjectId,default:null,index:true},
 characterName:{type:String,trim:true,default:""},
 roleFunction:{type:storyOverviewRoleFunctionSchema,default:()=>({})},
 motivationGoal:{type:storyOverviewMotivationGoalSchema,default:()=>({})},
 conflictObstacle:{type:storyOverviewConflictObstacleSchema,default:()=>({})},
 strengths:{type:[String],default:[]},
 weaknesses:{type:[String],default:[]},
 keyScenes:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:true});

const relationshipInteractionEntrySchema=new mongoose.Schema({
 characterOne_profile_id:{type:mongoose.Schema.Types.ObjectId,default:null,index:true},
 characterTwo_profile_id:{type:mongoose.Schema.Types.ObjectId,default:null,index:true},
 characterOneName:{type:String,trim:true,default:""},
 characterTwoName:{type:String,trim:true,default:""},
 relationshipType:{type:String,trim:true,default:""},
 relationshipDynamic:{type:String,trim:true,default:""},
 conflictBetweenThem:{type:String,trim:true,default:""},
 howRelationshipChanges:{type:[String],default:[]},
 keyInteractions:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:true});

const visualReferenceEntrySchema=new mongoose.Schema({
 character_profile_id:{type:mongoose.Schema.Types.ObjectId,default:null,index:true},
 characterName:{type:String,trim:true,default:""},
 imageUrl:{type:String,trim:true,default:""},
 sketchUrl:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},
 appearanceNotes:{type:[String],default:[]},
 styleNotes:{type:[String],default:[]},
 vibeNotes:{type:[String],default:[]},
 facialFeatureNotes:{type:[String],default:[]},
 outfitNotes:{type:[String],default:[]},
 expressionNotes:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:true});

const characterDevelopmentSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 user_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"User"},
 book_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Book"},

 characterList:{
  characters:{type:[characterListEntrySchema],default:[]},
  notesReminder:{type:[String],default:[]},
  notes:{type:[String],default:[]}
 },

 characterProfiles:{type:[characterProfileEntrySchema],default:[]},
 characterArcs:{type:[characterArcEntrySchema],default:[]},
 storyCharacterOverviews:{type:[storyCharacterOverviewEntrySchema],default:[]},
 relationshipInteractions:{type:[relationshipInteractionEntrySchema],default:[]},
 visualReferences:{type:[visualReferenceEntrySchema],default:[]},

 notes:{type:[String],default:[]},
 isActive:{type:Boolean,default:true,index:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true}
},{timestamps:true,collection:"character_developments"});

characterDevelopmentSchema.index({business_id:1,user_id:1,book_id:1},{unique:true});
characterDevelopmentSchema.index({business_id:1,user_id:1,isActive:1});

const CharacterDevelopment=mongoose.models.CharacterDevelopment||mongoose.model("CharacterDevelopment",characterDevelopmentSchema);

export default CharacterDevelopment;