import mongoose from "mongoose";

const technicalReferenceSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},

 title:{type:String,required:true,trim:true},
 key:{type:String,trim:true,lowercase:true,index:true},
 category:{type:String,required:true,trim:true},

 summary:{type:String,trim:true,default:""},
 definition:{type:String,required:true,trim:true},
 formula:{type:String,trim:true,default:""},
 example:{type:String,trim:true,default:""},

 unit:{type:String,trim:true,default:""},
 relatedBand:{type:String,trim:true,default:""},
 relatedMode:{type:String,trim:true,default:""},

 aliases:[{type:String,trim:true}],

 sourceName:{type:String,trim:true,default:""},
 sourceUrl:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true},
 isSystem:{type:Boolean,default:false},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"technical_references"});

technicalReferenceSchema.pre("save",function(next){
 if(this.title)this.key=this.title.trim().toLowerCase();
 next();
});

technicalReferenceSchema.index({business:1,key:1},{unique:true});

export default mongoose.model("TechnicalReference",technicalReferenceSchema);