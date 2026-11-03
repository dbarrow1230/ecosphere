import mongoose from "mongoose";

const trackingFields={
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 book_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Book"},
 user_id:{type:mongoose.Schema.Types.ObjectId,default:null,index:true,ref:"User"},
 isActive:{type:Boolean,default:true,index:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
};

const bookGoalSchema=new mongoose.Schema({
 ...trackingFields,
 title:{type:String,trim:true,default:"Writing Goal"},
 goalType:{type:String,trim:true,default:"Word Count"},
 targetValue:{type:Number,default:0},
 currentValue:{type:Number,default:0},
 dueDate:{type:Date,default:null},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"book_goals"});

const bookDeadlineSchema=new mongoose.Schema({
 ...trackingFields,
 title:{type:String,trim:true,default:"Draft Deadline"},
 deadlineType:{type:String,trim:true,default:"Draft"},
 deadlineDate:{type:Date,default:null},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"book_deadlines"});

const bookSessionSchema=new mongoose.Schema({
 ...trackingFields,
 startedAt:{type:Date,default:Date.now},
 endedAt:{type:Date,default:null},
 wordsWritten:{type:Number,default:0},
 minutesWritten:{type:Number,default:0},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"book_sessions"});

bookGoalSchema.index({business_id:1,book_id:1,isActive:1});
bookDeadlineSchema.index({business_id:1,book_id:1,isActive:1});
bookSessionSchema.index({business_id:1,book_id:1,startedAt:-1});

const BookGoal=mongoose.models.BookGoal||mongoose.model("BookGoal",bookGoalSchema);
const BookDeadline=mongoose.models.BookDeadline||mongoose.model("BookDeadline",bookDeadlineSchema);
const BookSession=mongoose.models.BookSession||mongoose.model("BookSession",bookSessionSchema);

export {BookGoal,BookDeadline,BookSession};
