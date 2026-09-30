import mongoose from "mongoose";

const beverageSchema=new mongoose.Schema({
    order:{type:Number,required:true},
    beverageType:{type:String,enum:["wine","beer","cider","spirit","other"],required:true},
    vintageOrYear:{type:String,trim:true,default:""},
    name:{type:String,trim:true,required:true},
    producer:{type:String,trim:true,default:""},
    region:{type:String,trim:true,default:""},
    style:{type:String,trim:true,default:""},
    producerNotes:{type:String,trim:true,default:""},
    personalNotes:{type:String,trim:true,default:""},
    rating:{type:String,enum:["love","like","leave",""],default:""}
});

const beverageTastingSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    title:{type:String,trim:true,required:true},
    tastingDate:{type:Date,required:true},
    venue:{type:String,trim:true,default:""},
    location:{type:String,trim:true,default:""},
    beverages:{type:[beverageSchema],default:[]},
    overallNotes:{type:String,trim:true,default:""}
},{timestamps:true});

const BeverageTasting=mongoose.model("BeverageTasting",beverageTastingSchema);

export default BeverageTasting;