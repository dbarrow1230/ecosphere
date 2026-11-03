import mongoose from "mongoose";

const routineStepSchema=new mongoose.Schema({
 title:{type:String,required:true,trim:true},
 description:{type:String,default:""},
 sortOrder:{type:Number,default:0},
 estimatedMinutes:{type:Number,default:0},
 isRequired:{type:Boolean,default:true}
},{_id:false});

const routineSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 title:{type:String,required:true,trim:true},
 description:{type:String,default:""},
 routineType:{type:String,enum:["morning","afternoon","evening","night","weekly-reset","monthly-reset","mindfulness","self-care","work","study","fitness","custom"],default:"custom"},
 frequency:{type:String,enum:["daily","weekly","monthly","yearly","custom"],default:"daily"},
 status:{type:String,enum:["active","paused","completed","archived"],default:"active"},
 startDate:{type:Date},
 endDate:{type:Date},
 steps:[routineStepSchema],
 lifeArea:{type:mongoose.Schema.Types.ObjectId,ref:"LifeArea"},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"Category"},
 linkedGoal:{type:mongoose.Schema.Types.ObjectId,ref:"Goal"},
 tags:[{type:mongoose.Schema.Types.ObjectId,ref:"Tag"}]
},{ timestamps:true, collection:"routines"});

routineSchema.index({user:1,status:1,frequency:1});
routineSchema.index({user:1,routineType:1});
routineSchema.index({user:1,lifeArea:1});

const Routine=mongoose.model("Routine",routineSchema);

export default Routine;