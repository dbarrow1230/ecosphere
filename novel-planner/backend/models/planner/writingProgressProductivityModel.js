//backend/models/planner/writingProgressProductivityModel.js
import mongoose from "mongoose";

const writingStyleSchema=new mongoose.Schema({
 narrativeVoice:{type:String,trim:true,default:""},
 firstPerson:{type:String,trim:true,default:""},
 secondPerson:{type:String,trim:true,default:""},
 thirdPersonOmniscient:{type:String,trim:true,default:""},
 languageStyles:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const timeBasedGoalEntrySchema=new mongoose.Schema({
 timeframe:{type:String,trim:true,default:""},
 goalDescription:{type:String,trim:true,default:""},
 deadline:{type:Date,default:null},
 status:{type:String,trim:true,default:""}
},{_id:true});

const projectSpecificGoalEntrySchema=new mongoose.Schema({
 projectTitle:{type:String,trim:true,default:""},
 wordCountGoal:{type:Number,default:0},
 pagesToFinish:{type:Number,default:0},
 startDate:{type:Date,default:null},
 deadline:{type:Date,default:null},
 progressNotes:{type:[String],default:[]}
},{_id:true});

const writingGoalsSchema=new mongoose.Schema({
 timeBasedGoals:{type:[timeBasedGoalEntrySchema],default:[]},
 projectSpecificGoals:{type:[projectSpecificGoalEntrySchema],default:[]},
 motivationRewards:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:false});

const writingGoalPlanEntrySchema=new mongoose.Schema({
 goal:{type:String,trim:true,default:""},
 startDate:{type:Date,default:null},
 deadline:{type:Date,default:null},
 completedStatus:{type:String,trim:true,default:""},
 actionSteps:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:true});

const writingGoalPlanSchema=new mongoose.Schema({
 goals:{type:[writingGoalPlanEntrySchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const wordCountTrackerEntrySchema=new mongoose.Schema({
 date:{type:Date,default:null},
 wordCount:{type:Number,default:0},
 target:{type:Number,default:0},
 targetDifference:{type:Number,default:0},
 timeTotal:{type:String,trim:true,default:""},
 totalCount:{type:Number,default:0},
 notes:{type:[String],default:[]}
},{_id:true});

const wordCountTrackerSchema=new mongoose.Schema({
 entries:{type:[wordCountTrackerEntrySchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const yearlyWritingTrackerDaySchema=new mongoose.Schema({
 month:{type:String,trim:true,default:""},
 day:{type:Number,default:0},
 progressAmount:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:true});

const writingTrackerSchema=new mongoose.Schema({
 progressKey:{type:[String],default:[
  "0/-50 Words",
  "50 Words",
  "100 Words",
  "150 Words",
  "1 Page",
  "5 Pages",
  "10+ Pages",
  "Chapter"
 ]},
 customProgressKey:{type:[String],default:[]},
 yearlyProgress:{type:[yearlyWritingTrackerDaySchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const dailyScheduleEntrySchema=new mongoose.Schema({
 time:{type:String,trim:true,default:""},
 task:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:true});

const taskEntrySchema=new mongoose.Schema({
 task:{type:String,trim:true,default:""},
 status:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:true});

const dailyPlannerSchema=new mongoose.Schema({
 date:{type:Date,default:null},
 schedule:{type:[dailyScheduleEntrySchema],default:[]},
 priorities:{type:[String],default:[]},
 toDoList:{type:[taskEntrySchema],default:[]},
 affirmation:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:true});

const weeklyPlannerSchema=new mongoose.Schema({
 week:{type:String,trim:true,default:""},
 monday:{type:String,trim:true,default:""},
 tuesday:{type:String,trim:true,default:""},
 wednesday:{type:String,trim:true,default:""},
 thursday:{type:String,trim:true,default:""},
 friday:{type:String,trim:true,default:""},
 saturday:{type:String,trim:true,default:""},
 sunday:{type:String,trim:true,default:""},
 thisWeekGoals:{type:[String],default:[]},
 toDoList:{type:[taskEntrySchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:true});

const monthlyPlannerDaySchema=new mongoose.Schema({
 dayNumber:{type:Number,default:0},
 weekday:{type:String,trim:true,default:""},
 content:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:true});

const monthlyPlannerSchema=new mongoose.Schema({
 month:{type:String,trim:true,default:""},
 year:{type:Number,default:null},
 days:{type:[monthlyPlannerDaySchema],default:[]},
 monthlyTasks:{type:[taskEntrySchema],default:[]},
 affirmation:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:true});

const toDoListSchema=new mongoose.Schema({
 dailyToDoList:{type:[taskEntrySchema],default:[]},
 weeklyToDoList:{type:[taskEntrySchema],default:[]},
 monthlyToDoList:{type:[taskEntrySchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const pomodoroTaskTodaySchema=new mongoose.Schema({
 task:{type:String,trim:true,default:""},
 target:{type:String,trim:true,default:""},
 actual:{type:String,trim:true,default:""},
 spent:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:true});

const pomodoroTimedTaskSchema=new mongoose.Schema({
 task:{type:String,trim:true,default:""},
 startTime:{type:String,trim:true,default:""},
 endTime:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:true});

const pomodoroTrackerSchema=new mongoose.Schema({
 month:{type:String,trim:true,default:""},
 date:{type:Date,default:null},
 day:{type:String,trim:true,default:""},
 productivityLevel:{type:Number,default:0},
 tasksForToday:{type:[pomodoroTaskTodaySchema],default:[]},
 tasks:{type:[pomodoroTimedTaskSchema],default:[]},
 breaks:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:true});

const chapterProgressEntrySchema=new mongoose.Schema({
 chapterNumber:{type:String,trim:true,default:""},
 titleWorkingTitle:{type:String,trim:true,default:""},
 writingDates:{type:[Date],default:[]},
 wordCount:{type:Number,default:0},
 goalMet:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:true});

const chapterProgressTrackerSchema=new mongoose.Schema({
 chapters:{type:[chapterProgressEntrySchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const projectOverviewEntrySchema=new mongoose.Schema({
 projectTitle:{type:String,trim:true,default:""},
 type:{type:String,trim:true,default:""},
 genre:{type:String,trim:true,default:""},
 startDate:{type:Date,default:null},
 targetDeadline:{type:Date,default:null},
 status:{type:String,trim:true,default:""}
},{_id:true});

const projectMilestoneEntrySchema=new mongoose.Schema({
 projectTitle:{type:String,trim:true,default:""},
 stage:{type:String,trim:true,default:""},
 percentComplete:{type:Number,default:0},
 lastWorkedOn:{type:Date,default:null},
 nextTask:{type:String,trim:true,default:""}
},{_id:true});

const projectOverviewSchema=new mongoose.Schema({
 projects:{type:[projectOverviewEntrySchema],default:[]},
 progressMilestones:{type:[projectMilestoneEntrySchema],default:[]},
 notesIdeas:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const projectTrackerTaskSchema=new mongoose.Schema({
 task:{type:String,trim:true,default:""},
 startDate:{type:Date,default:null},
 endDate:{type:Date,default:null},
 daysWorked:{type:[String],default:[]},
 status:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:true});

const projectTrackerSchema=new mongoose.Schema({
 projectName:{type:String,trim:true,default:""},
 startDate:{type:Date,default:null},
 endDate:{type:Date,default:null},
 tasks:{type:[projectTrackerTaskSchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:true});

const projectTeamMemberSchema=new mongoose.Schema({
 name:{type:String,trim:true,default:""},
 role:{type:String,trim:true,default:""},
 responsibilities:{type:String,trim:true,default:""},
 phone:{type:String,trim:true,default:""},
 email:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:true});

const projectTeamSchema=new mongoose.Schema({
 projectName:{type:String,trim:true,default:""},
 teamMembers:{type:[projectTeamMemberSchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:true});

const writingProgressProductivitySchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 user_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"User"},
 book_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Book"},

 writingStyle:{type:writingStyleSchema,default:()=>({})},
 writingGoals:{type:writingGoalsSchema,default:()=>({})},
 writingGoalPlan:{type:writingGoalPlanSchema,default:()=>({})},
 wordCountTracker:{type:wordCountTrackerSchema,default:()=>({})},
 writingTracker:{type:writingTrackerSchema,default:()=>({})},
 dailyPlanners:{type:[dailyPlannerSchema],default:[]},
 weeklyPlanners:{type:[weeklyPlannerSchema],default:[]},
 monthlyPlanners:{type:[monthlyPlannerSchema],default:[]},
 toDoList:{type:toDoListSchema,default:()=>({})},
 pomodoroTrackers:{type:[pomodoroTrackerSchema],default:[]},
 chapterProgressTracker:{type:chapterProgressTrackerSchema,default:()=>({})},
 projectOverview:{type:projectOverviewSchema,default:()=>({})},
 projectTrackers:{type:[projectTrackerSchema],default:[]},
 projectTeams:{type:[projectTeamSchema],default:[]},

 notes:{type:[String],default:[]},
 isActive:{type:Boolean,default:true,index:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true}
},{timestamps:true,collection:"writing_progress_productivities"});

writingProgressProductivitySchema.index({business_id:1,user_id:1,book_id:1},{unique:true});
writingProgressProductivitySchema.index({business_id:1,user_id:1,isActive:1});

const WritingProgressProductivity=mongoose.models.WritingProgressProductivity||mongoose.model("WritingProgressProductivity",writingProgressProductivitySchema);

export default WritingProgressProductivity;