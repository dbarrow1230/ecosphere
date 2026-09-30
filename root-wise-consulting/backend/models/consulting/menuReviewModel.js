//backend/models/consulting/menuReviewModel.js
import mongoose from "mongoose";

const menuReviewItemSchema=new mongoose.Schema({
 section:{type:String,trim:true,default:""},
 itemName:{type:String,required:true,trim:true},
 itemType:{type:String,trim:true,default:""},
 price:{type:Number,default:0,min:0},
 estimatedFoodCost:{type:Number,default:0,min:0},
 estimatedFoodCostPercent:{type:Number,default:0,min:0},
 popularity:{type:String,enum:["unknown","low","medium","high"],default:"unknown"},
 margin:{type:String,enum:["unknown","low","medium","high"],default:"unknown"},
 prepLoad:{type:String,enum:["low","medium","high"],default:"medium"},
 issueType:{type:String,enum:["none","pricing","placement","naming","redundancy","execution","portion","cost","clarity","other"],default:"none"},
 keepAction:{type:String,enum:["keep","revise","remove","add","test"],default:"keep"},
 observation:{type:String,trim:true,default:""},
 recommendation:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""}
},{_id:false});

const menuReviewSchema=new mongoose.Schema({
 project:{type:mongoose.Schema.Types.ObjectId,ref:"Project",required:true},
 reviewTitle:{type:String,trim:true,default:""},
 menuName:{type:String,trim:true,default:""},
 menuVersion:{type:String,trim:true,default:""},
 reviewDate:{type:Date,default:Date.now},
 menuType:{type:String,enum:["main","brunch","lunch","dinner","bar","dessert","seasonal","catering","other"],default:"main"},
 summary:{type:String,trim:true,default:""},
 sections:[{type:String,trim:true}],
 items:[menuReviewItemSchema],
 pricingNotes:{type:String,trim:true,default:""},
 structureNotes:{type:String,trim:true,default:""},
 executionNotes:{type:String,trim:true,default:""},
 recommendations:[{type:String,trim:true}],
 notes:{type:String,trim:true,default:""},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"menu_reviews"});

menuReviewSchema.index({project:1});
menuReviewSchema.index({reviewDate:1});
menuReviewSchema.index({menuType:1});
menuReviewSchema.index({isActive:1});

const MenuReview=mongoose.models.MenuReview||mongoose.model("MenuReview",menuReviewSchema);

export default MenuReview;