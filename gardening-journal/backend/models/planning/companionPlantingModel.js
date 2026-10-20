import mongoose from "mongoose";

const companionSchema=new mongoose.Schema({
 name:{type:String,trim:true,required:true},
 relationship:{type:String,enum:["compatible","incompatible","attractor","repellent"],required:true},
 source:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""}
},{_id:false});

const schema=new mongoose.Schema({
 name:{type:String,trim:true,required:true},
 libraryType:{type:String,enum:["seed","plant",null],default:null},
 libraryId:{type:mongoose.Schema.Types.ObjectId,default:null},
 companions:{type:[companionSchema],validate:{validator:function(rows){return rows.length>0||!!this.libraryId;},message:"Add at least one companion plant"}},
 notes:{type:String,trim:true,default:""},
 // Read old single-companion records without discarding their information.
 companion:{type:String,trim:true},
 relationship:{type:String},
 source:{type:String}
},{timestamps:true,collection:"companion_planting"});

schema.pre("validate",function(){
 if(!this.companions.length&&this.companion){
  this.companions=[{name:this.companion,relationship:this.relationship,source:this.source,notes:this.notes}];
 }
});

export default mongoose.models.CompanionPlanting||mongoose.model("CompanionPlanting",schema);
