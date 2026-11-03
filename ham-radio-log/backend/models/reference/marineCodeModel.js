import mongoose from "mongoose";

const marineCodeSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},

 code:{type:String,required:true,trim:true},
 title:{type:String,required:true,trim:true},
 meaning:{type:String,required:true,trim:true},
 category:{type:String,trim:true,default:"General",index:true},

 frequency:{type:String,trim:true,default:""},
 channel:{type:String,trim:true,default:""},
 usage:{type:String,trim:true,default:""},
 procedure:{type:String,trim:true,default:""},

 sourceName:{type:String,trim:true,default:""},
 sourceUrl:{type:String,trim:true,default:""},
 jurisdiction:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},

 aliases:{type:[String],default:[]},

 isActive:{type:Boolean,default:true,index:true},
 isSystem:{type:Boolean,default:false}
},{timestamps:true,collection:"marine_codes"});

marineCodeSchema.index({business_id:1,code:1},{unique:true});
marineCodeSchema.index({business_id:1,category:1});
marineCodeSchema.index({business_id:1,isActive:1});

const MarineCode=mongoose.models.MarineCode||mongoose.model("MarineCode",marineCodeSchema);

export default MarineCode;