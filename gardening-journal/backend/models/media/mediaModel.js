// backend/models/media/mediaModel.js
import mongoose from "mongoose";
const {Schema,model}=mongoose;

const mediaSchema=new Schema({
url:{type:String,trim:true,default:""},
fileName:{type:String,trim:true,default:""},
fileType:{type:String,trim:true,default:""}, // image, video, etc
mimeType:{type:String,trim:true,default:""},
size:{type:Number,default:0},

// context links (attach to anything)
garden:{type:Schema.Types.ObjectId,ref:"Garden",default:null},
gardenSection:{type:Schema.Types.ObjectId,ref:"GardenSection",default:null},
planting:{type:Schema.Types.ObjectId,ref:"Planting",default:null},
journalEntry:{type:Schema.Types.ObjectId,ref:"JournalEntry",default:null},
observation:{type:Schema.Types.ObjectId,ref:"Observation",default:null},
activity:{type:Schema.Types.ObjectId,ref:"Activity",default:null},
harvest:{type:Schema.Types.ObjectId,ref:"Harvest",default:null},
diseaseLog:{type:Schema.Types.ObjectId,ref:"DiseaseLog",default:null},
pestLog:{type:Schema.Types.ObjectId,ref:"PestLog",default:null},
tags:[{type:String,trim:true}],
description:{type:String,trim:true,default:""},

createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null},
isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"media"});
const Media=mongoose.models.Media||mongoose.model("Media",mediaSchema);
export default Media;