import mongoose from "mongoose";

const cwReferenceSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},

 title:{type:String,required:true,trim:true},
 key:{type:String,trim:true,lowercase:true,index:true},
 code:{type:String,required:true,trim:true},
 category:{type:String,required:true,trim:true},

 summary:{type:String,trim:true,default:""},
 definition:{type:String,required:true,trim:true},
 example:{type:String,trim:true,default:""},

 aliases:[{type:String,trim:true}],

 sourceName:{type:String,trim:true,default:""},
 sourceUrl:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true},
 isSystem:{type:Boolean,default:false},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"cw_references"});

cwReferenceSchema.pre("save",function(next){
 if(this.title)this.key=this.title.trim().toLowerCase();
 next();
});

cwReferenceSchema.index({business:1,key:1},{unique:true});

export default mongoose.model("CwReference",cwReferenceSchema);