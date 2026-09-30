// backend/models/equipment/equipmentModel.js
import mongoose from "mongoose";
const {Schema,model}=mongoose;

const maintenanceSchema=new Schema({
type:{type:String,enum:["maintenance","repair"],required:true},
date:{type:Date,default:Date.now},
description:String,
cost:Number,
vendor:{type:Schema.Types.ObjectId,ref:"EquipmentVendor",default:null},
conditionAfter:{type:String,enum:["new","good","used","needs_repair","replaced"],default:"good"},
notes:String
},{_id:false});

const equipmentSchema=new Schema({name:String,description:String,
category:{type:Schema.Types.ObjectId,ref:"EquipmentCategory",default:null},
vendor:{type:Schema.Types.ObjectId,ref:"EquipmentVendor",default:null},
brand:String,
modelNumber:String,
systemType:{type:String,trim:true,default:"hydroponic"},
serialNumber:{type:String,trim:true,default:""},
productUrl:{type:String,trim:true,default:""},
location:{type:String,trim:true,default:""},
podCount:{type:Number,default:0,min:0},
reservoirCapacity:{type:String,trim:true,default:""},
lightType:{type:String,trim:true,default:""},
pumpType:{type:String,trim:true,default:""},
purchaseDate:Date,
purchasePrice:Number,
condition:{type:String,enum:["new","good","used","needs_repair","replaced"],default:"good"},

maintenanceHistory:[maintenanceSchema],
notes:String,
images:[String],
createdBy:{type:Schema.Types.ObjectId,ref:"User"}
},{timestamps:true,collection:"equipment"});
export default model("Equipment",equipmentSchema);
