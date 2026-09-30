import mongoose from "mongoose";

const tenCodeSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},

 code:{type:String,required:true,trim:true},
 title:{type:String,required:true,trim:true},
 meaning:{type:String,required:true,trim:true},
 category:{type:String,trim:true,default:"General",index:true},

 city:{type:String,required:true,trim:true,index:true},
 state:{type:String,trim:true,uppercase:true,default:"",index:true},
 agency:{type:String,trim:true,default:"",index:true},
 jurisdiction:{type:String,trim:true,default:""},

 sourceName:{type:String,trim:true,default:""},
 sourceUrl:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},

 aliases:{type:[String],default:[]},

 isActive:{type:Boolean,default:true,index:true},
 isSystem:{type:Boolean,default:false}
},{timestamps:true,collection:"ten_codes"});

tenCodeSchema.index({business_id:1,city:1,state:1,agency:1,code:1},{unique:true});
tenCodeSchema.index({business_id:1,city:1,state:1,agency:1});
tenCodeSchema.index({business_id:1,category:1});
tenCodeSchema.index({business_id:1,isActive:1});

const TenCode=mongoose.models.TenCode||mongoose.model("TenCode",tenCodeSchema);

export default TenCode;