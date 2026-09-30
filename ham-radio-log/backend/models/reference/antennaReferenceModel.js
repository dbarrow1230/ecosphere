import mongoose from "mongoose";

const antennaReferenceSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},

 title:{type:String,required:true,trim:true},
 key:{type:String,trim:true,lowercase:true,index:true},
 category:{type:String,required:true,trim:true},

 summary:{type:String,trim:true,default:""},
 definition:{type:String,required:true,trim:true},
 example:{type:String,trim:true,default:""},

 frequencyRange:{type:String,trim:true,default:""},
 band:{type:String,trim:true,default:""},
 polarization:{type:String,trim:true,default:""},
 radiationPattern:{type:String,trim:true,default:""},
 gain:{type:String,trim:true,default:""},
 impedance:{type:String,trim:true,default:""},

 aliases:[{type:String,trim:true}],

 sourceName:{type:String,trim:true,default:""},
 sourceUrl:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true},
 isSystem:{type:Boolean,default:false},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"antenna_references"});

antennaReferenceSchema.pre("save",function(next){
 if(this.title)this.key=this.title.trim().toLowerCase();
 next();
});

antennaReferenceSchema.index({business:1,key:1},{unique:true});

export default mongoose.model("AntennaReference",antennaReferenceSchema);