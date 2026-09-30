//backend/models/planner/worldBuildingSettingModel.js
import mongoose from "mongoose";

const primarySettingSchema=new mongoose.Schema({
 settingName:{type:String,trim:true,default:""},
 locationType:{type:String,trim:true,default:""},
 descriptionVisualFeel:{type:[String],default:[]},
 importanceToStory:{type:String,trim:true,default:""},
 recurringThemesMoods:{type:String,trim:true,default:""},
 keyLandmarksOrFeatures:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:true});

const settingPurposeSchema=new mongoose.Schema({
 actionScene:{type:String,trim:true,default:""},
 revelation:{type:String,trim:true,default:""},
 emotionalMoment:{type:String,trim:true,default:""},
 characterGrowth:{type:String,trim:true,default:""},
 other:{type:[String],default:[]}
},{_id:false});

const sensoryDetailSchema=new mongoose.Schema({
 sights:{type:String,trim:true,default:""},
 sounds:{type:String,trim:true,default:""},
 smells:{type:String,trim:true,default:""},
 texturesFeel:{type:String,trim:true,default:""},
 weatherLighting:{type:String,trim:true,default:""},
 detailOrSymbol:{type:String,trim:true,default:""},
 other:{type:String,trim:true,default:""}
},{_id:false});

const settingDescriptionSchema=new mongoose.Schema({
 settingName:{type:String,trim:true,default:""},
 purposeInStory:{type:settingPurposeSchema,default:()=>({})},
 visualAestheticMoodWords:{type:String,trim:true,default:""},
 visualAestheticMood:{type:sensoryDetailSchema,default:()=>({})},
 description:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const timePeriodFeatureSchema=new mongoose.Schema({
 technologyLevel:{type:String,trim:true,default:""},
 clothingStyle:{type:String,trim:true,default:""},
 socialStructure:{type:String,trim:true,default:""},
 commonLanguageOrSlang:{type:String,trim:true,default:""},
 transportation:{type:String,trim:true,default:""},
 other:{type:String,trim:true,default:""}
},{_id:false});

const timePeriodSchema=new mongoose.Schema({
 timeSetting:{type:String,trim:true,default:""},
 worldTimeType:{type:String,trim:true,default:""},
 keyFeatures:{type:timePeriodFeatureSchema,default:()=>({})},
 importantEventsHappeningDuringThisTime:{type:[String],default:[]},
 howTimeAffectsYourStory:{type:[String],default:[]},
 notesForFutureUse:{type:[String],default:[]}
},{_id:false});

const atmospherePurposeSchema=new mongoose.Schema({
 buildTension:{type:String,trim:true,default:""},
 showRomance:{type:String,trim:true,default:""},
 revealDanger:{type:String,trim:true,default:""},
 createPeace:{type:String,trim:true,default:""},
 other:{type:[String],default:[]}
},{_id:false});

const atmosphereMoodSchema=new mongoose.Schema({
 overallMood:{type:String,trim:true,default:""},
 atmosphereDetails:{type:[String],default:[]},
 purposeOfMood:{type:atmospherePurposeSchema,default:()=>({})},
 charactersReactions:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const culturalSocialContextSchema=new mongoose.Schema({
 beliefSystemsReligions:{type:String,trim:true,default:""},
 socialStructure:{type:String,trim:true,default:""},
 clothingTraditionsCustoms:{type:[String],default:[]},
 languageCommunicationStyle:{type:[String],default:[]},
 lawsRulesJusticeSystem:{type:[String],default:[]},
 economyOccupations:{type:[String],default:[]},
 howThisImpactsThePlotOrCharacters:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:false});

const landmarkSchema=new mongoose.Schema({
 name:{type:String,trim:true,default:""},
 type:{type:String,trim:true,default:""},
 location:{type:String,trim:true,default:""},
 significance:{type:String,trim:true,default:""},
 specialNotes:{type:String,trim:true,default:""}
},{_id:true});

const landmarkOverviewSchema=new mongoose.Schema({
 landmarks:{type:[landmarkSchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const locationPinSchema=new mongoose.Schema({
 label:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},
 x:{type:Number,default:0},
 y:{type:Number,default:0},
 notes:{type:[String],default:[]}
},{_id:true});

const keyLocationsMapSchema=new mongoose.Schema({
 mapImageUrl:{type:String,trim:true,default:""},
 sketchImageUrl:{type:String,trim:true,default:""},
 locationPins:{type:[locationPinSchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const settingVisitorSchema=new mongoose.Schema({
 characterName:{type:String,trim:true,default:""},
 character_profile_id:{type:mongoose.Schema.Types.ObjectId,ref:"CharacterProfile",default:null,index:true},
 notes:{type:[String],default:[]}
},{_id:true});

const settingInteractionSchema=new mongoose.Schema({
 settingName:{type:String,trim:true,default:""},
 charactersWhoVisitThisSetting:{type:[settingVisitorSchema],default:[]},
 whatDoTheyDoHere:{type:[String],default:[]},
 howSettingAffectsMoodOrBehavior:{type:[String],default:[]},
 plotPointsThatOccurHere:{type:[String],default:[]},
 additionalNotes:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const historicalFigureSchema=new mongoose.Schema({
 name:{type:String,trim:true,default:""},
 role:{type:String,trim:true,default:""}
},{_id:true});

const historicalBackgroundSchema=new mongoose.Schema({
 keyHistoricalEvents:{type:[String],default:[]},
 importantFiguresFromThePast:{type:[historicalFigureSchema],default:[]},
 turningPoints:{type:[String],default:[]},
 mythsLegendsStories:{type:[String],default:[]},
 howThisHistoryAffectsTheCurrentStory:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const infrastructureSystemsSchema=new mongoose.Schema({
 transportation:{type:String,trim:true,default:""},
 energyPower:{type:String,trim:true,default:""},
 communication:{type:String,trim:true,default:""},
 primaryFacilities:{type:String,trim:true,default:""},
 other:{type:String,trim:true,default:""}
},{_id:false});

const technologyInfrastructureSchema=new mongoose.Schema({
 technologyLevel:{type:String,trim:true,default:""},
 commonToolsDevicesUsed:{type:[String],default:[]},
 infrastructureSystems:{type:infrastructureSystemsSchema,default:()=>({})},
 technologyAccess:{type:String,trim:true,default:""},
 howItAffectsThePlot:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:false});

const cultureGroupSchema=new mongoose.Schema({
 name:{type:String,trim:true,default:""},
 locationRegion:{type:String,trim:true,default:""},
 specificCharacteristics:{type:String,trim:true,default:""}
},{_id:true});

const traditionCelebrationSchema=new mongoose.Schema({
 culture:{type:String,trim:true,default:""},
 celebration:{type:String,trim:true,default:""},
 whenWhy:{type:String,trim:true,default:""}
},{_id:true});

const culturalDiversitySchema=new mongoose.Schema({
 culturesOrGroupsRepresented:{type:[cultureGroupSchema],default:[]},
 languagesDialects:{type:String,trim:true,default:""},
 traditionsCelebrations:{type:[traditionCelebrationSchema],default:[]},
 foodDressArtStyles:{type:[String],default:[]},
 interculturalRelationships:{type:String,trim:true,default:""},
 howCulturalDiversityEnrichesThePlot:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const worldBuildingSettingSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 user_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"User"},
 book_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Book"},

 primarySettings:{type:[primarySettingSchema],default:[]},
 settingDescription:{type:settingDescriptionSchema,default:()=>({})},
 timePeriod:{type:timePeriodSchema,default:()=>({})},
 atmosphereMood:{type:atmosphereMoodSchema,default:()=>({})},
 culturalSocialContext:{type:culturalSocialContextSchema,default:()=>({})},
 landmarkOverview:{type:landmarkOverviewSchema,default:()=>({})},
 keyLocationsMap:{type:keyLocationsMapSchema,default:()=>({})},
 settingInteraction:{type:settingInteractionSchema,default:()=>({})},
 historicalBackground:{type:historicalBackgroundSchema,default:()=>({})},
 technologyInfrastructure:{type:technologyInfrastructureSchema,default:()=>({})},
 culturalDiversity:{type:culturalDiversitySchema,default:()=>({})},

 notes:{type:[String],default:[]},
 isActive:{type:Boolean,default:true,index:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true}
},{timestamps:true,collection:"world_building_settings"});

worldBuildingSettingSchema.index({business_id:1,user_id:1,book_id:1},{unique:true});
worldBuildingSettingSchema.index({business_id:1,user_id:1,isActive:1});

const WorldBuildingSetting=mongoose.models.WorldBuildingSetting||mongoose.model("WorldBuildingSetting",worldBuildingSettingSchema);

export default WorldBuildingSetting;