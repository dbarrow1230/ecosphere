import mongoose from "mongoose";

const frequencyReferenceSchema=new mongoose.Schema({
 business:{ type:mongoose.Schema.Types.ObjectId,  ref:"Business",  required:true,  index:true },
 service:{  type:String,  required:true,  trim:true,  index:true },
 band:{ type:String, trim:true },
 channel:{ type:String,  trim:true },
 frequency:{ type:String,  required:true,  trim:true },
 frequencyMHz:{ type:Number },
 frequencyRangeStartMHz:{  type:Number },
 frequencyRangeEndMHz:{  type:Number },
 mode:{  type:String,  trim:true },
 bandwidth:{  type:String,  trim:true },
 usage:{  type:String,  trim:true },
 description:{  type:String,  trim:true },
 licenseRequired:{  type:Boolean,  default:false },
 powerLimit:{  type:String,  trim:true },
 region:{  type:String,  trim:true,  default:"United States" },
 notes:{  type:String,  trim:true },
 sourceName:{  type:String,  trim:true },
 sourceUrl:{  type:String,  trim:true },
 aliases:[{  type:String,  trim:true }],
 isSystem:{  type:Boolean,  default:false },
 isActive:{  type:Boolean,  default:true }
},{ timestamps:true, collection:"frequency_references"});

frequencyReferenceSchema.index({business:1,service:1,frequencyMHz:1});
frequencyReferenceSchema.index({business:1,service:1,channel:1});
frequencyReferenceSchema.index({business:1,band:1});

export default mongoose.model("FrequencyReference",frequencyReferenceSchema);