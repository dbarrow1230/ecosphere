import mongoose from "mongoose";

const phoneticAlphabetReferenceSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},

 symbol:{type:String,required:true,trim:true},
 word:{type:String,required:true,trim:true},
 key:{type:String,trim:true,lowercase:true,index:true},
 category:{type:String,required:true,trim:true},

 pronunciation:{type:String,trim:true,default:""},
 definition:{type:String,trim:true,default:""},
 example:{type:String,trim:true,default:""},

 sourceName:{type:String,trim:true,default:""},
 sourceUrl:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true},
 isSystem:{type:Boolean,default:false},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"phonetic_alphabet_references"});

phoneticAlphabetReferenceSchema.pre("save",function(next){
 if(this.symbol)this.key=this.symbol.trim().toLowerCase();
 next();
});

phoneticAlphabetReferenceSchema.index({business:1,key:1},{unique:true});

export default mongoose.model("PhoneticAlphabetReference",phoneticAlphabetReferenceSchema);