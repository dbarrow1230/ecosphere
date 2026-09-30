// backend/models/harvest/harvestModel.js
import mongoose from "mongoose";
const {Schema,model}=mongoose;

const noteSchema=new Schema({note:{type:String,trim:true,default:""},date:{type:Date,default:Date.now},createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null}},{_id:false});
const weightSchema=new Schema({g:{type:Number,default:0},oz:{type:Number,default:0},lb:{type:Number,default:0}},{_id:false});

const pricingSnapshotSchema=new Schema({
marketPrice:{type:Schema.Types.ObjectId,ref:"MarketPrice",default:null},
gRate:{type:Number,default:0},
ozRate:{type:Number,default:0},
lbRate:{type:Number,default:0},
gValue:{type:Number,default:0},
ozValue:{type:Number,default:0},
lbValue:{type:Number,default:0},
totalValue:{type:Number,default:0},
capturedAt:{type:Date,default:Date.now}
},{_id:false});

const harvestSchema=new Schema({
planting:{type:Schema.Types.ObjectId,ref:"Planting",required:true},
harvestDate:{type:Date,default:Date.now},
lastHarvested:{type:Date,default:null},
daysSinceLastHarvest:{type:Number,default:null},
harvestAmount:weightSchema,
usableAmount:weightSchema,
wasteAmount:weightSchema,
pricingSnapshot:pricingSnapshotSchema,
quality:{type:Schema.Types.ObjectId,ref:"HarvestQualityScale",default:null},
notes:[noteSchema],
images:[String],
createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null},
isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"harvests"});

harvestSchema.pre("save",async function(next){
if(this.isNew){
const last=await mongoose.model("Harvest").findOne({planting:this.planting}).sort({harvestDate:-1}).select("harvestDate");
if(last){
this.lastHarvested=last.harvestDate;
const diff=new Date(this.harvestDate)-new Date(last.harvestDate);
this.daysSinceLastHarvest=Math.floor(diff/(1000*60*60*24));
}
}
next();
});

const Harvest=mongoose.models.Harvest||mongoose.model("Harvest",harvestSchema);
export default Harvest;