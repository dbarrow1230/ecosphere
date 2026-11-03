// backend/models/reference/equipmentCategoryModel.js
import mongoose from "mongoose";
const {Schema,model,models}=mongoose;

const equipmentCategorySchema=new Schema({
 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,uppercase:true,default:""},
 serviceType:{type:Schema.Types.ObjectId,ref:"ServiceType",default:null},
 description:{type:String,trim:true,default:""},
 parentCategory:{type:Schema.Types.ObjectId,ref:"EquipmentCategory",default:null},
 isActive:{type:Boolean,default:true},
 notes:{type:String,trim:true,default:""},
 createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"equipment_categories"});

equipmentCategorySchema.index({name:1,serviceType:1},{unique:true});
equipmentCategorySchema.index({code:1,serviceType:1},{unique:true,sparse:true});
equipmentCategorySchema.index({serviceType:1});
equipmentCategorySchema.index({parentCategory:1});
equipmentCategorySchema.index({isActive:1});

const EquipmentCategory=models.EquipmentCategory||model("EquipmentCategory",equipmentCategorySchema);

export default EquipmentCategory;