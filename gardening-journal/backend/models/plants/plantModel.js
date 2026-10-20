// backend/models/plants/plantModel.js
import mongoose from "mongoose";
const {Schema,model}=mongoose;

const noteSchema=new Schema({
note:{type:String,trim:true,default:""},
date:{type:Date,default:Date.now},
createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null}
},{_id:false});

const plantSchema=new Schema({
careCard:{variety:{type:String,trim:true,default:""},lifespan:{type:String,trim:true,default:""},plantCategory:{type:String,trim:true,default:""},currentHeight:{type:String,trim:true,default:""},matureHeight:{type:String,trim:true,default:""},currentWidth:{type:String,trim:true,default:""},matureWidth:{type:String,trim:true,default:""},soilPh:{type:String,trim:true,default:""},pruningNeeds:{type:String,trim:true,default:""},bloomCharacteristics:{type:String,trim:true,default:""},foliageCharacteristics:{type:String,trim:true,default:""},bloomMonths:{type:String,trim:true,default:""},edibleLifecycle:{type:String,trim:true,default:""},sunExposure:{type:String,trim:true,default:""},vendor:{type:String,trim:true,default:""},purchaseCost:{type:String,trim:true,default:""},purchaseDate:{type:String,trim:true,default:""},fertilizers:{type:String,trim:true,default:""},repellingPests:{type:String,trim:true,default:""},repellentFor:{type:String,trim:true,default:""},attractorFor:{type:String,trim:true,default:""},compatible:{type:String,trim:true,default:""},incompatible:{type:String,trim:true,default:""},careNotes:{type:String,trim:true,default:""}},

name:{type:String,trim:true,default:""},
scientificName:{type:String,trim:true,default:""},

seed:{type:Schema.Types.ObjectId,ref:"Seed",default:null},

family:{type:String,trim:true,default:""},
type:{type:Schema.Types.ObjectId,ref:"PlantType",default:null},

description:{type:String,trim:true,default:""},

growingConditions:{
sunlight:{type:String,trim:true,default:""},
water:{type:String,trim:true,default:""},
soil:{type:String,trim:true,default:""},
temperature:{type:String,trim:true,default:""}
},

spacing:{
metric:{type:Number,default:null},
imperial:{type:Number,default:null}
},

growthDurationDays:{type:Number,default:null},

notes:[noteSchema],
images:[String],
tags:[String],

status:{type:String,trim:true,enum:["active","inactive","archived"],default:"active",index:true},
createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null},
isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"plants"});

const Plant=mongoose.models.Plant||mongoose.model("Plant",plantSchema);

export default Plant;
