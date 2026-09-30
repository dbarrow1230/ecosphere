import UserSetting from "../../models/userSetting/userSettingModel.js";
import Task from "../../models/task/taskModel.js";
import Priority from "../../models/priority/priorityModel.js";
import Goal from "../../models/goal/goalModel.js";
import Milestone from "../../models/goal/milestoneModel.js";
import Habit from "../../models/habit/habitModel.js";
import HabitLog from "../../models/habit/habitLogModel.js";
import Routine from "../../models/routine/routineModel.js";
import RoutineLog from "../../models/routine/routineLogModel.js";
import JournalEntry from "../../models/journalEntry/journalEntryModel.js";
import MindfulnessEntry from "../../models/mindfulness/mindfulnessEntryModel.js";
import MoodLog from "../../models/moodLog/moodLogModel.js";
import Note from "../../models/note/noteModel.js";
import Memory from "../../models/memory/memoryModel.js";
import TimelineEntry from "../../models/timeline/timelineEntryModel.js";
import Review from "../../models/review/reviewModel.js";
import CalendarEvent from "../../models/calendarEvent/calendarEventModel.js";
import Reminder from "../../models/reminder/reminderModel.js";
import VisionBoard from "../../models/visionBoard/visionBoardModel.js";
import LifeTheme from "../../models/lifeTheme/lifeThemeModel.js";
import Attachment from "../../models/attachment/attachmentModel.js";
import DashboardSnapshot from "../../models/dashboard/dashboardSnapshotModel.js";

const TIME_ZONE="America/New_York";
const LOCALE="en-US";

const startOfDay=date=>{
 const d=new Date(date);
 d.setHours(0,0,0,0);
 return d;
};

const endOfDay=date=>{
 const d=new Date(date);
 d.setHours(23,59,59,999);
 return d;
};

const formatDateTimeNY=date=>{
 if(!date)return "";
 return new Intl.DateTimeFormat(LOCALE,{
  timeZone:TIME_ZONE,
  year:"numeric",
  month:"2-digit",
  day:"2-digit",
  hour:"2-digit",
  minute:"2-digit",
  second:"2-digit",
  hour12:false
 }).format(new Date(date)).replace(",","");
};

const formatDateNY=date=>{
 if(!date)return "";
 return new Intl.DateTimeFormat(LOCALE,{
  timeZone:TIME_ZONE,
  year:"numeric",
  month:"2-digit",
  day:"2-digit"
 }).format(new Date(date));
};

const addDisplayDates=item=>{
 if(!item)return item;

 const formatted={...item};

 [
  "createdAt",
  "updatedAt",
  "dueDate",
  "startDate",
  "completedAt",
  "targetDate",
  "entryDate",
  "noteDate",
  "memoryDate",
  "milestoneDate",
  "logDate",
  "periodStart",
  "periodEnd",
  "sendAt",
  "nextRunAt",
  "lastSentAt",
  "sentAt",
  "startDate",
  "endDate",
  "snapshotDate"
 ].forEach(field=>{
  if(formatted[field]){
   formatted[`${field}Display`]=formatDateTimeNY(formatted[field]);
   formatted[`${field}DateDisplay`]=formatDateNY(formatted[field]);
  }
 });

 return formatted;
};

const addDisplayDatesToList=list=>{
 return Array.isArray(list)?list.map(item=>addDisplayDates(item)):[];
};

const getWeekRange=(date,weekStartsOn="sunday")=>{
 const start=startOfDay(date);
 const day=start.getDay();
 const diff=weekStartsOn==="monday"?(day===0?-6:1-day):-day;
 start.setDate(start.getDate()+diff);

 const end=endOfDay(start);
 end.setDate(start.getDate()+6);

 return {start,end};
};

const getMonthRange=date=>{
 const d=new Date(date);
 const start=new Date(d.getFullYear(),d.getMonth(),1,0,0,0,0);
 const end=new Date(d.getFullYear(),d.getMonth()+1,0,23,59,59,999);
 return {start,end};
};

const getYearRange=date=>{
 const d=new Date(date);
 const start=new Date(d.getFullYear(),0,1,0,0,0,0);
 const end=new Date(d.getFullYear(),11,31,23,59,59,999);
 return {start,end};
};

const getDateRange=(period="daily",date=new Date(),weekStartsOn="sunday")=>{
 if(period==="weekly")return getWeekRange(date,weekStartsOn);
 if(period==="monthly")return getMonthRange(date);
 if(period==="yearly")return getYearRange(date);
 return {start:startOfDay(date),end:endOfDay(date)};
};

const average=values=>{
 return values.length?Number((values.reduce((sum,value)=>sum+value,0)/values.length).toFixed(1)):0;
};

const getUserSettings=async user=>{
 const settings=await UserSetting.findOne({user}).lean();

 return settings||{
  dashboard:{
   defaultView:"daily",
   showPrivateJournalCount:false,
   showMoodSummary:true,
   showHabitProgress:true,
   showUpcomingReminders:true,
   showTimelinePreview:true
  },
  journal:{
   defaultJournalType:"daily",
   defaultPrivate:false,
   showPromptsByDefault:true,
   requireMood:false,
   requireEnergy:false
  },
  mindfulness:{
   showPromptsByDefault:true,
   requireMood:false,
   requireEnergy:false,
   requireStress:false
  },
  reminders:{
   defaultChannels:{
    email:false,
    sms:false,
    inApp:true
   },
   defaultOffsetMinutes:30,
   allowRecurring:true
  },
  calendar:{
   weekStartsOn:"sunday",
   defaultEventView:"month",
   showCompletedEvents:true
  },
  privacy:{
   privateJournalLocked:true,
   hidePrivateEntriesFromTimeline:true,
   hidePrivateEntriesFromDashboard:true
  },
  appearance:{
   theme:"system",
   accentColor:"",
   compactMode:false
  },
  timezone:TIME_ZONE,
  locale:LOCALE,
  dateFormat:"MM/DD/YYYY HH:mm:ss"
 };
};

const getDashboardData=async({user,period="daily",date=new Date()})=>{
 const settings=await getUserSettings(user);
 const {start,end}=getDateRange(period,date,settings?.calendar?.weekStartsOn||"sunday");

 const privateJournalFilter=settings?.privacy?.hidePrivateEntriesFromDashboard?{isPrivate:{$ne:true}}:{};
 const timelinePrivateFilter=settings?.privacy?.hidePrivateEntriesFromTimeline?{isPrivate:{$ne:true}}:{};
 const calendarCompletedFilter=settings?.calendar?.showCompletedEvents?{}:{status:{$ne:"completed"}};

 const [
  tasks,
  priorities,
  activeGoals,
  dueGoals,
  milestones,
  activeHabits,
  habitLogs,
  activeRoutines,
  routineLogs,
  journalEntries,
  mindfulnessEntries,
  moodLogs,
  notes,
  memories,
  timelineEntries,
  reviews,
  calendarEvents,
  reminders,
  visionBoards,
  lifeThemes
 ]=await Promise.all([
  Task.find({user,dueDate:{$gte:start,$lte:end}}).sort({dueDate:1,priority:-1}).lean(),

  Priority.find({user,$or:[{dueDate:{$gte:start,$lte:end}},{startDate:{$gte:start,$lte:end}}]}).sort({dueDate:1,priorityLevel:-1}).lean(),

  Goal.find({user,status:{$in:["not-started","in-progress"]}}).sort({targetDate:1,priority:-1}).lean(),

  Goal.find({user,targetDate:{$gte:start,$lte:end},status:{$ne:"completed"}}).sort({targetDate:1}).lean(),

  Milestone.find({user,milestoneDate:{$gte:start,$lte:end}}).sort({milestoneDate:1}).lean(),

  Habit.find({user,status:"active"}).sort({title:1}).lean(),

  HabitLog.find({user,logDate:{$gte:start,$lte:end}}).sort({logDate:-1}).lean(),

  Routine.find({user,status:"active"}).sort({title:1}).lean(),

  RoutineLog.find({user,logDate:{$gte:start,$lte:end}}).sort({logDate:-1}).lean(),

  JournalEntry.find({user,entryDate:{$gte:start,$lte:end},...privateJournalFilter}).sort({entryDate:-1}).lean(),

  MindfulnessEntry.find({user,entryDate:{$gte:start,$lte:end}}).sort({entryDate:-1}).lean(),

  MoodLog.find({user,logDate:{$gte:start,$lte:end}}).sort({logDate:-1}).lean(),

  Note.find({user,noteDate:{$gte:start,$lte:end}}).sort({noteDate:-1}).lean(),

  Memory.find({user,memoryDate:{$gte:start,$lte:end}}).sort({memoryDate:-1}).lean(),

  TimelineEntry.find({user,entryDate:{$gte:start,$lte:end},...timelinePrivateFilter}).sort({entryDate:-1}).lean(),

  Review.find({user,$or:[{periodStart:{$gte:start,$lte:end}},{periodEnd:{$gte:start,$lte:end}}]}).sort({periodStart:-1}).lean(),

  CalendarEvent.find({user,startDate:{$gte:start,$lte:end},...calendarCompletedFilter}).sort({startDate:1}).lean(),

  Reminder.find({user,sendAt:{$gte:start,$lte:end},status:{$in:["pending","processing","paused"]}}).sort({sendAt:1}).lean(),

  VisionBoard.find({user,isActive:true}).sort({updatedAt:-1}).lean(),

  LifeTheme.find({user,status:"active",$or:[{startDate:{$lte:end},endDate:{$gte:start}},{startDate:{$lte:end},endDate:null}]}).sort({startDate:-1}).lean()
 ]);

 const completedTasks=tasks.filter(item=>item.status==="completed");
 const pendingTasks=tasks.filter(item=>item.status!=="completed");
 const completedHabitLogs=habitLogs.filter(item=>item.completed);
 const completedRoutineLogs=routineLogs.filter(item=>item.completed);

 const moodValues=[
  ...moodLogs.map(item=>item.mood),
  ...journalEntries.map(item=>item.mood),
  ...mindfulnessEntries.map(item=>item.mood)
 ].filter(Boolean);

 const energyValues=[
  ...moodLogs.map(item=>item.energy),
  ...mindfulnessEntries.map(item=>item.energy),
  ...journalEntries.map(item=>item.energy)
 ].filter(value=>typeof value==="number");

 const stressValues=[
  ...moodLogs.map(item=>item.stress),
  ...mindfulnessEntries.map(item=>item.stress)
 ].filter(value=>typeof value==="number");

 const summary={
  period,
  start,
  end,
  startDisplay:formatDateTimeNY(start),
  endDisplay:formatDateTimeNY(end),
  startDateDisplay:formatDateNY(start),
  endDateDisplay:formatDateNY(end),
  totals:{
   tasks:tasks.length,
   completedTasks:completedTasks.length,
   pendingTasks:pendingTasks.length,
   priorities:priorities.length,
   activeGoals:activeGoals.length,
   dueGoals:dueGoals.length,
   milestones:milestones.length,
   activeHabits:activeHabits.length,
   habitLogs:habitLogs.length,
   completedHabits:completedHabitLogs.length,
   activeRoutines:activeRoutines.length,
   routineLogs:routineLogs.length,
   completedRoutines:completedRoutineLogs.length,
   journalEntries:journalEntries.length,
   mindfulnessEntries:mindfulnessEntries.length,
   moodLogs:moodLogs.length,
   notes:notes.length,
   memories:memories.length,
   timelineEntries:timelineEntries.length,
   reviews:reviews.length,
   calendarEvents:calendarEvents.length,
   reminders:reminders.length,
   visionBoards:visionBoards.length,
   lifeThemes:lifeThemes.length
  },
  averages:{
   energy:average(energyValues),
   stress:average(stressValues)
  },
  latestMood:moodValues[0]||""
 };

 return {
  settings,
  range:{
   start,
   end,
   period,
   startDisplay:formatDateTimeNY(start),
   endDisplay:formatDateTimeNY(end),
   startDateDisplay:formatDateNY(start),
   endDateDisplay:formatDateNY(end)
  },
  summary,
  tasks:addDisplayDatesToList(tasks),
  pendingTasks:addDisplayDatesToList(pendingTasks),
  completedTasks:addDisplayDatesToList(completedTasks),
  priorities:addDisplayDatesToList(priorities),
  activeGoals:addDisplayDatesToList(activeGoals),
  dueGoals:addDisplayDatesToList(dueGoals),
  milestones:addDisplayDatesToList(milestones),
  activeHabits:addDisplayDatesToList(activeHabits),
  habitLogs:addDisplayDatesToList(habitLogs),
  completedHabitLogs:addDisplayDatesToList(completedHabitLogs),
  activeRoutines:addDisplayDatesToList(activeRoutines),
  routineLogs:addDisplayDatesToList(routineLogs),
  completedRoutineLogs:addDisplayDatesToList(completedRoutineLogs),
  journalEntries:addDisplayDatesToList(journalEntries),
  mindfulnessEntries:addDisplayDatesToList(mindfulnessEntries),
  moodLogs:addDisplayDatesToList(moodLogs),
  notes:addDisplayDatesToList(notes),
  memories:addDisplayDatesToList(memories),
  timelineEntries:addDisplayDatesToList(timelineEntries),
  reviews:addDisplayDatesToList(reviews),
  calendarEvents:addDisplayDatesToList(calendarEvents),
  reminders:addDisplayDatesToList(reminders),
  visionBoards:addDisplayDatesToList(visionBoards),
  lifeThemes:addDisplayDatesToList(lifeThemes)
 };
};

const getTimelineData=async({user,startDate,endDate,includePrivate=false,limit=100})=>{
 const query={
  user,
  entryDate:{
   $gte:startOfDay(startDate||new Date("1900-01-01")),
   $lte:endOfDay(endDate||new Date())
  }
 };

 if(!includePrivate)query.isPrivate={$ne:true};

 const timelineEntries=await TimelineEntry.find(query).sort({entryDate:-1}).limit(limit).lean();

 return addDisplayDatesToList(timelineEntries);
};

const createTimelineEntry=async({
 user,
 title,
 description="",
 entryDate=new Date(),
 entryType="other",
 sourceModel="",
 sourceId=null,
 lifeArea=null,
 category=null,
 isPrivate=false,
 tags=[]
})=>{
 const timelineEntry=await TimelineEntry.create({
  user,
  title,
  description,
  entryDate,
  entryType,
  sourceModel,
  sourceId,
  lifeArea,
  category,
  isPrivate,
  tags
 });

 return addDisplayDates(timelineEntry.toObject());
};

const createDashboardSnapshot=async({user,period="daily",date=new Date()})=>{
 const dashboard=await getDashboardData({user,period,date});

 const snapshot=await DashboardSnapshot.create({
  user,
  snapshotDate:dashboard.range.start,
  period,
  totals:{
   tasks:dashboard.summary.totals.tasks,
   completedTasks:dashboard.summary.totals.completedTasks,
   habits:dashboard.summary.totals.activeHabits,
   completedHabits:dashboard.summary.totals.completedHabits,
   goals:dashboard.summary.totals.activeGoals,
   completedGoals:dashboard.activeGoals.filter(item=>item.status==="completed").length,
   journalEntries:dashboard.summary.totals.journalEntries,
   privateJournalEntries:0,
   notes:dashboard.summary.totals.notes,
   mindfulnessEntries:dashboard.summary.totals.mindfulnessEntries,
   milestones:dashboard.summary.totals.milestones
  },
  moodAverage:0,
  energyAverage:dashboard.summary.averages.energy,
  stressAverage:dashboard.summary.averages.stress
 });

 return addDisplayDates(snapshot.toObject());
};

const getUpcomingItems=async({user,days=7})=>{
 const start=startOfDay(new Date());
 const end=endOfDay(new Date());
 end.setDate(end.getDate()+days);

 const [tasks,goals,calendarEvents,reminders,milestones]=await Promise.all([
  Task.find({user,dueDate:{$gte:start,$lte:end},status:{$nin:["completed","cancelled","archived"]}}).sort({dueDate:1}).lean(),
  Goal.find({user,targetDate:{$gte:start,$lte:end},status:{$nin:["completed","cancelled","archived"]}}).sort({targetDate:1}).lean(),
  CalendarEvent.find({user,startDate:{$gte:start,$lte:end},status:{$nin:["completed","cancelled"]}}).sort({startDate:1}).lean(),
  Reminder.find({user,sendAt:{$gte:start,$lte:end},status:{$in:["pending","processing","paused"]}}).sort({sendAt:1}).lean(),
  Milestone.find({user,milestoneDate:{$gte:start,$lte:end}}).sort({milestoneDate:1}).lean()
 ]);

 return {
  range:{
   start,
   end,
   startDisplay:formatDateTimeNY(start),
   endDisplay:formatDateTimeNY(end),
   startDateDisplay:formatDateNY(start),
   endDateDisplay:formatDateNY(end)
  },
  tasks:addDisplayDatesToList(tasks),
  goals:addDisplayDatesToList(goals),
  calendarEvents:addDisplayDatesToList(calendarEvents),
  reminders:addDisplayDatesToList(reminders),
  milestones:addDisplayDatesToList(milestones)
 };
};

const getLinkedAttachments=async({user,attachedToType,attachedTo})=>{
 const attachments=await Attachment.find({user,attachedToType,attachedTo}).sort({createdAt:-1}).lean();
 return addDisplayDatesToList(attachments);
};

const lifeboardService={
 getUserSettings,
 getDateRange,
 formatDateTimeNY,
 formatDateNY,
 addDisplayDates,
 addDisplayDatesToList,
 getDashboardData,
 getTimelineData,
 createTimelineEntry,
 createDashboardSnapshot,
 getUpcomingItems,
 getLinkedAttachments
};

export default lifeboardService;