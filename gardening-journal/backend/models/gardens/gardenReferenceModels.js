import mongoose from "mongoose";

const {Schema}=mongoose;

const referenceSchema=new Schema({
 name:{type:String,required:true,trim:true,unique:true},
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{timestamps:true});

const modelFor=(name,collection)=>mongoose.models[name]||mongoose.model(name,referenceSchema,collection);

export const GardenType=modelFor("GardenType","garden_types");
export const GardenPurpose=modelFor("GardenPurpose","garden_purposes");
export const GardenReason=modelFor("GardenReason","garden_reasons");
export const GardenLocationType=modelFor("GardenLocationType","garden_location_types");
