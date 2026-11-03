import mongoose from "mongoose";

const dashboardSnapshotSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 snapshotDate:{type:Date,required:true},
 period:{type:String,enum:["daily","weekly","monthly","yearly"],default:"daily"},
 totals:{
  tasks:{type:Number,default:0},
  completedTasks:{type:Number,default:0},
  habits:{type:Number,default:0},
  completedHabits:{type:Number,default:0},
  goals:{type:Number,default:0},
  completedGoals:{type:Number,default:0},
  journalEntries:{type:Number,default:0},
  privateJournalEntries:{type:Number,default:0},
  notes:{type:Number,default:0},
  mindfulnessEntries:{type:Number,default:0},
  milestones:{type:Number,default:0}
 },
 moodAverage:{type:Number,default:0},
 energyAverage:{type:Number,default:0},
 stressAverage:{type:Number,default:0}
},{ timestamps:true, collection:"dashboard_snapshots"});

dashboardSnapshotSchema.index({user:1,snapshotDate:-1,period:1});

const DashboardSnapshot=mongoose.model("DashboardSnapshot",dashboardSnapshotSchema);

export default DashboardSnapshot;