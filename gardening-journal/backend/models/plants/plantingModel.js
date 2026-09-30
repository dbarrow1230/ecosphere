// backend/models/plants/plantingModel.js
import mongoose from "mongoose";
const {Schema,model}=mongoose;

const noteSchema=new Schema({note:{type:String,trim:true,default:""},date:{type:Date,default:Date.now},createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null}},{_id:false});

const plantingSchema=new Schema({
instanceName:{type:String,trim:true,default:""},
sourceType:{type:String,trim:true,enum:["seed","plant",""],default:""},
plant:{type:Schema.Types.ObjectId,ref:"Plant",default:null},
seed:{type:Schema.Types.ObjectId,ref:"Seed",default:null},

garden:{type:Schema.Types.ObjectId,ref:"Garden",default:null},
gardenSection:{type:Schema.Types.ObjectId,ref:"GardenSection",default:null},

variety:{type:Schema.Types.ObjectId,ref:"PlantVariety",default:null},
currentStage:{type:Schema.Types.ObjectId,ref:"PlantStage",default:null},

plantedDate:{type:Date,default:null},
expectedHarvestDate:{type:Date,default:null},
endDate:{type:Date,default:null},
deathDate:{type:Date,default:null},

status:{type:String,trim:true,enum:["active","germinating","seedling","transplanted","harvested","failed","dead","archived"],default:"active"},
quantity:{type:Number,default:1,min:0},
location:{type:String,trim:true,default:""},
failureReason:{type:String,trim:true,default:""},
outcomeNotes:{type:String,trim:true,default:""},

notes:[noteSchema],

createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null},
isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"plantings"});

const Planting=mongoose.models.Planting||mongoose.model("Planting",plantingSchema);

export default Planting;
