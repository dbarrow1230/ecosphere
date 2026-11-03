import mongoose from "mongoose";

const schema=new mongoose.Schema({
 name:{type:String,trim:true,required:true},
 variety:{type:String,trim:true,default:""},
 location:{type:String,trim:true,default:""},
 sowMonths:[{type:Number,min:1,max:12}],
 plantMonths:[{type:Number,min:1,max:12}],
 harvestMonths:[{type:Number,min:1,max:12}],
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"fruit_calendar"});

schema.pre("validate",function(){
 if(!this.sowMonths.length&&!this.plantMonths.length&&!this.harvestMonths.length)this.invalidate("sowMonths","Select at least one sowing, planting, or harvest month");
});

export default mongoose.models.FruitCalendar||mongoose.model("FruitCalendar",schema);
