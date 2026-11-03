import mongoose from "mongoose";

const visionItemSchema=new mongoose.Schema({
 title:{type:String,default:""},
 description:{type:String,default:""},
 itemType:{type:String,enum:["image","quote","goal","note","affirmation","link","other"],default:"note"},
 imageUrl:{type:String,default:""},
 linkUrl:{type:String,default:""},
 sortOrder:{type:Number,default:0},
 linkedGoal:{type:mongoose.Schema.Types.ObjectId,ref:"Goal"},
 lifeArea:{type:mongoose.Schema.Types.ObjectId,ref:"LifeArea"}
},{_id:false});

const visionBoardSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 title:{type:String,required:true,trim:true},
 description:{type:String,default:""},
 boardType:{type:String,enum:["personal","yearly","monthly","goal","career","health","creative","relationship","financial","spiritual","custom"],default:"personal"},
 year:{type:Number},
 month:{type:Number,min:1,max:12},
 isActive:{type:Boolean,default:true},
 isPrivate:{type:Boolean,default:true},
 items:[visionItemSchema],
 lifeArea:{type:mongoose.Schema.Types.ObjectId,ref:"LifeArea"},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"Category"},
 tags:[{type:mongoose.Schema.Types.ObjectId,ref:"Tag"}]
},{ timestamps:true, collection:"visionboards"});

visionBoardSchema.index({user:1,boardType:1,isActive:1});
visionBoardSchema.index({user:1,year:1,month:1});
visionBoardSchema.index({user:1,isPrivate:1});

const VisionBoard=mongoose.model("VisionBoard",visionBoardSchema);

export default VisionBoard;