import mongoose from "mongoose";
import {createHash} from "node:crypto";

const {Schema}=mongoose;

const hydroSystemPodSchema=new Schema({
 plantedItemName:{type:String,trim:true,default:""},
 seedCount:{type:Number,min:0,default:null,validate:value=>value==null||Number.isInteger(value)},
 maxGerminationDays:{type:Number,min:0,default:null},
 germinationStatus:{type:String,enum:["awaiting","germinated","failed"]},
 germinatedAt:{type:Date,default:null},
 failedAt:{type:Date,default:null},
 removedAt:{type:Date,default:null},
 retryOf:{type:Schema.Types.ObjectId},
 retryRun:{type:Schema.Types.ObjectId,ref:"HydroSystem"},
 positionHistory:[{fromDevice:{type:Schema.Types.ObjectId},from:Number,toDevice:{type:Schema.Types.ObjectId},to:Number,at:{type:Date,required:true}}],
 position:{type:Number,required:true},
 label:{type:String,trim:true,default:""},
 seed:{type:Schema.Types.ObjectId,ref:"Seed",default:null},
 plantedDate:{type:Date,default:null},
 notes:{type:String,trim:true,default:""}
},{_id:true});

const hydroSystemDeviceSchema=new Schema({
 isActive:{type:Boolean,default:true},
 readings:[{recordedAt:{type:Date,required:true},waterLevel:{type:Number,min:0,max:100,default:null},phLevel:{type:Number,min:0,max:14,default:null},temperature:{type:Number,default:null},nutrientsLevel:{type:Number,min:0,max:100,default:null}}],
 equipment:{type:Schema.Types.ObjectId,ref:"Equipment",default:null},
 name:{type:String,trim:true,required:true},
 systemType:{type:String,trim:true,default:"hydroponic"},
 brand:{type:String,trim:true,default:""},
 model:{type:String,trim:true,default:""},
 serialNumber:{type:String,trim:true,default:""},
 productUrl:{type:String,trim:true,default:""},
 location:{type:String,trim:true,default:""},
 podCount:{type:Number,default:0,min:0},
 reservoirCapacity:{type:String,trim:true,default:""},
 lightType:{
  type:String,
  trim:true,
  enum:["","led","full-spectrum","white","red-blue","warm-white","cool-white","sunlike","none","other"],
  default:""
 },
 pumpType:{type:String,trim:true,default:""},
 waterLevel:{type:Number,default:null,min:0,max:100},
 phLevel:{type:Number,default:null,min:0,max:14},
 temperature:{type:Number,default:null},
 nutrientsLevel:{type:Number,default:null,min:0,max:100},
 lastReadingAt:{type:Date,default:null},
 notes:{type:String,trim:true,default:""},
 pods:[hydroSystemPodSchema]
},{_id:true});

const hydroSystemSchema=new Schema({
 // Internal index projection of retained retryOf links. This permits one
 // atomic target-run save with uniqueness across runs on standalone MongoDB.
 retryClaims:[{type:Schema.Types.ObjectId}],
 completedAt:{type:Date,default:null},
 name:{type:String,trim:true,required:true},
 garden:{type:Schema.Types.ObjectId,ref:"Garden",default:null,index:true},
 systemType:{type:String,trim:true,default:"hydroponic",index:true},
 brand:{type:String,trim:true,default:""},
 model:{type:String,trim:true,default:""},
 serialNumber:{type:String,trim:true,default:""},
 productUrl:{type:String,trim:true,default:""},
 location:{type:String,trim:true,default:""},
 startedDate:{type:Date,default:null},
 podCount:{type:Number,default:0,min:0},
 reservoirCapacity:{type:String,trim:true,default:""},
 lightType:{
  type:String,
  trim:true,
  enum:["","led","full-spectrum","white","red-blue","warm-white","cool-white","sunlike","none","other"],
  default:""
 },

 pumpType:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},
 pods:[hydroSystemPodSchema],
 devices:[hydroSystemDeviceSchema],
 createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"hydro_systems",optimisticConcurrency:true});

// Legacy pods had no identity beyond their position. Give them reproducible
// identifiers on hydration without assigning outcomes or writing on reads.
hydroSystemSchema.pre("init",record=>{
 const stableId=value=>new mongoose.Types.ObjectId(createHash("sha256").update(value).digest("hex").slice(0,24));
 if(!record.devices?.length&&record.podCount){
  record.devices=[{...record,_id:stableId(`${record._id}:device`),name:record.name}];
 }
 for(const [index,device] of (record.devices||[]).entries()){
  if(!device._id)device._id=stableId(`${record._id}:device:${index}`);
  for(const pod of device.pods||[]){
   const planted=pod.plantedDate?new Date(pod.plantedDate):null;
   const date=planted&&!Number.isNaN(planted.getTime())?planted.toISOString():String(pod.plantedDate||"");
   if(!pod._id)pod._id=stableId(`${record._id}:${device._id}:${pod.position}:${pod.seed||""}:${date}`);
  }
 }
});

hydroSystemSchema.index({name:1,systemType:1});
hydroSystemSchema.index({createdBy:1,isActive:1});
hydroSystemSchema.index({retryClaims:1},{name:"unique_hydro_retry_source",unique:true,partialFilterExpression:{"retryClaims.0":{$exists:true}}});
hydroSystemSchema.pre("validate",function(){
 const retryClaims=new Set();
 for(const device of this.devices){
  const occupied=new Set();
  for(const pod of device.pods){
   if(pod.retryOf){
    const key=String(pod.retryOf);
    if(retryClaims.has(key))this.invalidate("devices","A failed attempt can only be retried once");
    retryClaims.add(key);
   }
   if(pod.seed&&!pod.removedAt&&pod.germinationStatus!=="failed"){
    if(!Number.isInteger(pod.position)||pod.position<1||pod.position>device.podCount)this.invalidate("devices","Active pod is outside its device layout");
    if(occupied.has(pod.position))this.invalidate("devices","Two plantings cannot occupy the same position");
    occupied.add(pod.position);
   }
   if(pod.germinationStatus==="failed"&&(!pod.failedAt||!pod.removedAt))this.invalidate("devices","Confirmed failures require a timestamp and removal from active display");
   if(pod.germinationStatus==="germinated"&&!pod.germinatedAt)this.invalidate("devices","Confirmed germination requires a timestamp");
  }
 }
 this.retryClaims=[...retryClaims];
});

const HydroSystem=mongoose.models.HydroSystem||mongoose.model("HydroSystem",hydroSystemSchema);

export default HydroSystem;
