// backend/models/reference/equipmentModel.js
import mongoose from "mongoose";
import "./equipmentCategoryModel.js";
const {Schema,model,models}=mongoose;

const equipmentSchema=new Schema({
 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,uppercase:true,default:""},
 serviceType:{type:Schema.Types.ObjectId,ref:"ServiceType",default:null},
 category:{type:Schema.Types.ObjectId,ref:"EquipmentCategory",required:true},

 brand:{type:String,trim:true,default:""},
 modelName:{type:String,trim:true,default:""},
 equipmentType:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},

 serialNumber:{type:String,trim:true,default:""},
 assetTag:{type:String,trim:true,default:""},
 condition:{type:String,trim:true,default:""},
 status:{type:String,trim:true,default:""},

 frequencyRange:{type:String,trim:true,default:""},
 bands:[{type:Schema.Types.ObjectId,ref:"BandReference"}],
 modes:[{type:Schema.Types.ObjectId,ref:"ModeReference"}],
 channels:[{type:String,trim:true}],
 maxPowerWatts:{type:Number,default:0},
 powerSource:{type:String,trim:true,default:""},
 connectorType:{type:String,trim:true,default:""},

 location:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true},
 notes:{type:String,trim:true,default:""},
 createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"equipment"});

equipmentSchema.index({name:1});
equipmentSchema.index({code:1},{unique:true,sparse:true});
equipmentSchema.index({serviceType:1});
equipmentSchema.index({category:1});
equipmentSchema.index({brand:1});
equipmentSchema.index({modelName:1});
equipmentSchema.index({status:1});
equipmentSchema.index({condition:1});
equipmentSchema.index({serialNumber:1},{sparse:true});
equipmentSchema.index({assetTag:1},{unique:true,sparse:true});
equipmentSchema.index({isActive:1});

const Equipment=models.Equipment||model("Equipment",equipmentSchema);

export default Equipment;