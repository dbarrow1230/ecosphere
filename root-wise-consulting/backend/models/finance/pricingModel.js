//backend/models/finance/pricingModel.js
import mongoose from "mongoose";

const pricingLineItemSchema=new mongoose.Schema({
 title:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},
 unit:{type:String,enum:["flat","hour","day","week","item","menu","session","custom"],default:"flat"},
 quantity:{type:Number,default:1,min:0},
 unitRate:{type:Number,default:0,min:0},
 total:{type:Number,default:0,min:0},
 isOptional:{type:Boolean,default:false},
 sortOrder:{type:Number,default:0}
},{_id:false});

const pricingSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,default:""},
 service:{type:mongoose.Schema.Types.ObjectId,ref:"Service",default:null},
 category:{type:String,enum:["menu-review","menu-development","opening-support","operations-review","costing","training","retainer","other"],default:"other"},
 pricingType:{type:String,enum:["flat","hourly","daily","custom","package"],default:"custom"},
 description:{type:String,trim:true,default:""},
 lineItems:[pricingLineItemSchema],
 subtotal:{type:Number,default:0,min:0},
 taxRate:{type:Number,default:0,min:0},
 taxAmount:{type:Number,default:0,min:0},
 total:{type:Number,default:0,min:0},
 effectiveDate:{type:Date,default:null},
 expiryDate:{type:Date,default:null},
 notes:{type:String,trim:true,default:""},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"pricing"});

pricingSchema.index({name:1});
pricingSchema.index({service:1});
pricingSchema.index({category:1});
pricingSchema.index({isActive:1});

const Pricing=mongoose.models.Pricing||mongoose.model("Pricing",pricingSchema);

export default Pricing;