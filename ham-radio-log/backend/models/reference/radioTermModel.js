import mongoose from "mongoose";

const radioTermSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},

 term:{type:String,required:true,trim:true},
 key:{type:String,trim:true,lowercase:true,index:true},
 category:{type:String,required:true,trim:true,lowercase:true,default:"both"},

 abbreviation:{type:String,trim:true,default:""},
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
},{timestamps:true,collection:"radio_terms"});

radioTermSchema.pre("save",function(next){
 if(this.term)this.key=this.term.trim().toLowerCase();
 next();
});

radioTermSchema.index({business:1,key:1},{unique:true});

export default mongoose.model("RadioTerm",radioTermSchema);