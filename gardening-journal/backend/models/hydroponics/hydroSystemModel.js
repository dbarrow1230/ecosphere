import mongoose from "mongoose";

const {Schema}=mongoose;

const hydroSystemPodSchema=new Schema({
 position:{type:Number,required:true},
 label:{type:String,trim:true,default:""},
 seed:{type:Schema.Types.ObjectId,ref:"Seed",default:null},
 plantedDate:{type:Date,default:null},
 notes:{type:String,trim:true,default:""}
},{_id:false});

const hydroSystemDeviceSchema=new Schema({
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
},{timestamps:true,collection:"hydro_systems"});

hydroSystemSchema.index({name:1,systemType:1});
hydroSystemSchema.index({createdBy:1,isActive:1});

const HydroSystem=mongoose.models.HydroSystem||mongoose.model("HydroSystem",hydroSystemSchema);

export default HydroSystem;
