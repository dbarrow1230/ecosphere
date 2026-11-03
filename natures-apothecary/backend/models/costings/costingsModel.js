// backend/models/costings/costingsModel.js
import mongoose from "mongoose";

const costingItemSchema=new mongoose.Schema({
 ingredient:{type:mongoose.Schema.Types.ObjectId,ref:"Ingredient",required:true},
 metricQuantity:{type:mongoose.Schema.Types.Decimal128,default:null},
 metricUnit:{type:mongoose.Schema.Types.ObjectId,ref:"MetricUnit",default:null},
 imperialQuantity:{type:mongoose.Schema.Types.Decimal128,default:null},
 imperialUnit:{type:mongoose.Schema.Types.ObjectId,ref:"ImperialUnit",default:null},
 cost:{type:mongoose.Schema.Types.Decimal128,default:0},
 notes:{type:[String],default:[]}
},{_id:true});

const costingSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 slug:{type:String,trim:true,lowercase:true,unique:true,sparse:true},
 product:{type:mongoose.Schema.Types.ObjectId,ref:"Product",default:null},
 batchSize:{type:mongoose.Schema.Types.Decimal128,default:null},
 batchYield:{type:mongoose.Schema.Types.Decimal128,default:null},
 metricUnit:{type:mongoose.Schema.Types.ObjectId,ref:"MetricUnit",default:null},
 imperialUnit:{type:mongoose.Schema.Types.ObjectId,ref:"ImperialUnit",default:null},
 items:{type:[costingItemSchema],default:[]},
 materialCost:{type:mongoose.Schema.Types.Decimal128,default:0},
 laborCost:{type:mongoose.Schema.Types.Decimal128,default:0},
 packagingCost:{type:mongoose.Schema.Types.Decimal128,default:0},
 overheadCost:{type:mongoose.Schema.Types.Decimal128,default:0},
 totalCost:{type:mongoose.Schema.Types.Decimal128,default:0},
 unitCost:{type:mongoose.Schema.Types.Decimal128,default:0},
 targetMarginPercent:{type:mongoose.Schema.Types.Decimal128,default:null},
 suggestedPrice:{type:mongoose.Schema.Types.Decimal128,default:null},
 notes:{type:[String],default:[]},
 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status",required:true}
},{timestamps:true,collection:"costings"});

costingSchema.index({name:1});
costingSchema.index({product:1});
costingSchema.index({status:1});

export default mongoose.models.Costing||mongoose.model("Costing",costingSchema);