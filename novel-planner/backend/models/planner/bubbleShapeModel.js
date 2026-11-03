//backend/models/planner/bubbleShapeModel.js
import mongoose from "mongoose";

const bubbleShapeSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 user_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"User"},
 name:{type:String,trim:true,required:true},
 shapeKey:{type:String,trim:true,required:true},
 cssClass:{type:String,trim:true,default:""},
 customCss:{type:String,trim:true,default:""},
 backgroundToken:{type:String,trim:true,default:"surface2"},
 textToken:{type:String,trim:true,default:"text"},
 textColor:{type:String,trim:true,default:""},
 fontSize:{type:Number,min:8,max:72,default:16},
 svgPath:{type:String,trim:true,default:""},
 imageUrl:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true,index:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true}
},{timestamps:true,collection:"bubble_shapes"});

bubbleShapeSchema.index({business_id:1,user_id:1,name:1},{unique:true});
bubbleShapeSchema.index({business_id:1,user_id:1,isActive:1});

const BubbleShape=mongoose.models.BubbleShape||mongoose.model("BubbleShape",bubbleShapeSchema);

export default BubbleShape;
