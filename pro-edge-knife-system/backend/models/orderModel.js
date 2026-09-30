import mongoose from "mongoose";

const selectedKnifeSchema=new mongoose.Schema({
 knifeTypeRef:{type:mongoose.Schema.Types.ObjectId,ref:"KnifeType",required:true},
 quantity:{type:Number,min:1,default:1}
},{_id:false});

const orderSchema=new mongoose.Schema({
 orderNumber:{type:String,required:true,unique:true,index:true},
 customer:{
  firstName:{type:String,required:true,trim:true},
  lastName:{type:String,required:true,trim:true},
  email:{type:String,required:true,trim:true,lowercase:true},
  phone:{type:String,trim:true,default:""}
 },
 tierRef:{type:mongoose.Schema.Types.ObjectId,ref:"ProductTier",required:true},
 selectedKnives:{type:[selectedKnifeSchema],default:[]},
 bladeSteel:{type:String,trim:true,default:""},
 handleMaterial:{type:String,trim:true,default:""},
 finish:{type:String,trim:true,default:""},
 engraving:{type:String,trim:true,default:""},
 sharpenerConfiguration:{
  mechanism:{type:String,trim:true,default:"Integrated guided sharpener"},
  abrasive:{type:String,trim:true,default:"Replaceable sharpening cartridge"},
  notes:{type:String,trim:true,default:""}
 },
 quantity:{type:Number,min:1,default:1},
 unitPrice:{type:Number,min:0,default:0},
 total:{type:Number,min:0,default:0},
 status:{type:String,enum:["quote","pending","confirmed","in-production","quality-check","ready","shipped","completed","cancelled"],default:"pending"},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"orders"});

export default mongoose.models.Order||mongoose.model("Order",orderSchema);
