import mongoose from "mongoose";

const referenceOrganizationSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},

 name:{type:String,required:true,trim:true},
 key:{type:String,trim:true,lowercase:true,index:true},
 role:{type:String,required:true,trim:true},
 url:{type:String,trim:true,default:""},

 category:{type:String,trim:true,default:"General"},
 jurisdiction:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true},
 isSystem:{type:Boolean,default:false},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"reference_organizations"});

referenceOrganizationSchema.pre("save",function(next){
 if(this.name)this.key=this.name.trim().toLowerCase();
 next();
});

referenceOrganizationSchema.index({business:1,key:1},{unique:true});

export default mongoose.model("ReferenceOrganization",referenceOrganizationSchema);