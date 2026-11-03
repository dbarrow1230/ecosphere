import mongoose from "mongoose";

const schema=new mongoose.Schema({
 name:{type:String,trim:true,required:true},
 description:{type:String,trim:true,default:""},
 year:{type:Number,min:0,default:null},
 quantity:{type:Number,min:0,default:1},
 unitCost:{type:Number,min:0,default:0},
 allottedBudget:{type:Number,min:0,default:0},
 currency:{type:String,trim:true,default:"USD"},
 totalCost:{type:Number,min:0,default:0},
 remainingBudget:{type:Number,default:0}
},{timestamps:true,collection:"garden_budgets"});

schema.pre("validate",function(){
 this.totalCost=this.quantity*this.unitCost;
 this.remainingBudget=this.allottedBudget-this.totalCost;
});

export default mongoose.models.GardenBudget||mongoose.model("GardenBudget",schema);
