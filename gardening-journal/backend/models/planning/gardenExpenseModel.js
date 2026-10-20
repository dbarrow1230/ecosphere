import mongoose from "mongoose";

const schema=new mongoose.Schema({
 name:{type:String,trim:true,required:true},
 purchaseDate:{type:Date,default:null},
 vendor:{type:String,trim:true,default:""},
 warranty:{type:String,trim:true,default:""},
 quantity:{type:Number,min:0,default:1},
 unitCost:{type:Number,min:0,default:0},
 savedAmount:{type:Number,min:0,default:0},
 currency:{type:String,trim:true,default:"USD"},
 notes:{type:String,trim:true,default:""},
 totalCost:{type:Number,min:0,default:0}
},{timestamps:true,collection:"garden_expenses"});

schema.pre("validate",function(){
 this.totalCost=this.quantity*this.unitCost-this.savedAmount;
 if(this.savedAmount>this.quantity*this.unitCost)this.invalidate("savedAmount","Savings cannot exceed purchase cost");
});

export default mongoose.models.GardenExpense||mongoose.model("GardenExpense",schema);
