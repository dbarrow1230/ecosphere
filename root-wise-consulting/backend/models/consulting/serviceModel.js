//backend/models/consulting/serviceModel.js
import mongoose from "mongoose";

const serviceSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 slug:{type:String,trim:true,lowercase:true,default:""},
 category:{type:String,enum:["menu","operations","opening","strategy","training","other"],default:"other"},
 description:{type:String,trim:true,default:""},
 scope:[{type:String,trim:true}],
 deliverables:[{type:String,trim:true}],
 pricingType:{type:String,enum:["flat","hourly","daily","custom"],default:"custom"},
 baseRate:{type:Number,default:0,min:0},
 estimatedHours:{type:Number,default:0,min:0},
 estimatedDays:{type:Number,default:0,min:0},
 sortOrder:{type:Number,default:0},
 notes:{type:String,trim:true,default:""},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"services"});

serviceSchema.index({name:1});
serviceSchema.index({slug:1});
serviceSchema.index({category:1});
serviceSchema.index({isActive:1});

const Service=mongoose.models.Service||mongoose.model("Service",serviceSchema);

export default Service;