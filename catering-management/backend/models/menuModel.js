// backend/models/menuModel.js
import mongoose from "mongoose";

const menuSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},
 category:{type:String,trim:true,default:""},
 serviceStyle:{type:String,trim:true,default:""},
 occasionTypes:{type:String,trim:true,default:""},
 cuisine:{type:String,trim:true,default:""},
 pricePerGuest:{type:mongoose.Schema.Types.Decimal128,default:0},
 minimumGuests:{type:Number,default:1},
 maximumGuests:{type:Number,default:0},
 foodCostTargetPercent:{type:Number,default:0,min:0,max:100},
 laborHoursPerGuest:{type:Number,default:0,min:0},
 setupMinutes:{type:Number,default:0,min:0},
 serviceMinutes:{type:Number,default:0,min:0},
 dietaryCoverage:{type:String,trim:true,default:""},
 allergenNotes:{type:String,trim:true,default:""},
 includedServices:{type:String,trim:true,default:""},
 excludedServices:{type:String,trim:true,default:""},
 equipmentRequirements:{type:String,trim:true,default:""},
 productionNotes:{type:String,trim:true,default:""},
 seasonalAvailability:{type:String,trim:true,default:""},
 items:[{
  item:{type:mongoose.Schema.Types.ObjectId,ref:"MenuItem",required:true},
  section:{type:String,trim:true,default:""},
  sortOrder:{type:Number,default:0}
 }],
 status:{type:String,enum:["active","inactive","draft"],default:"active"},
 notes:{type:String,trim:true,default:""}
},{
 timestamps:true,
 collection:"menus"
});

const Menu=mongoose.models.Menu||mongoose.model("Menu",menuSchema);

export default Menu;
