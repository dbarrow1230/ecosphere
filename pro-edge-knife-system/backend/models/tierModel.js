import mongoose from "mongoose";

const tierItemSchema=new mongoose.Schema({
 knifeTypeRef:{type:mongoose.Schema.Types.ObjectId,ref:"KnifeType",required:true},
 quantity:{type:Number,min:1,default:1}
},{_id:false});

const tierSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 code:{type:String,required:true,enum:["BASIC","PRO","PRO_MAX","CUSTOM"],unique:true},
 level:{type:Number,required:true,min:1,max:4,unique:true},
 shortDescription:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},
 basePrice:{type:Number,min:0,default:0},
 includedItems:{type:[tierItemSchema],default:[]},
 allowCustomization:{type:Boolean,default:false},
 builtInSharpener:{
  included:{type:Boolean,default:true},
  mechanism:{type:String,trim:true,default:"Integrated guided sharpener"},
  abrasive:{type:String,trim:true,default:"Replaceable sharpening cartridge"},
  notes:{type:String,trim:true,default:""}
 },
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"product_tiers"});

export default mongoose.models.ProductTier||mongoose.model("ProductTier",tierSchema);
