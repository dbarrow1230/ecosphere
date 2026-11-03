import DailyNote from "../../models/studies/dailyNoteModel.js";
import MemoryVerse from "../../models/studies/memoryVerseModel.js";
import Study from "../../models/studies/studyModel.js";
import StudyTask from "../../models/studies/studyTaskModel.js";
import "../../models/lookups/taskPriorityModel.js";
import "../../models/lookups/taskStatusModel.js";

const getRange=(period,reportDate)=>{
 if(period==="all")return {start:null,end:null};

 const date=reportDate instanceof Date&&!Number.isNaN(reportDate.getTime())?reportDate:new Date();
 const start=new Date(date);
 const end=new Date(date);

 if(period==="year"){
  start.setMonth(0,1);
  start.setHours(0,0,0,0);
  end.setMonth(11,31);
  end.setHours(23,59,59,999);
  return {start,end};
 }

 if(period==="month"){
  start.setDate(1);
  start.setHours(0,0,0,0);
  end.setMonth(end.getMonth()+1,0);
  end.setHours(23,59,59,999);
  return {start,end};
 }

 start.setHours(0,0,0,0);
 end.setHours(23,59,59,999);
 return {start,end};
};

const inRangeQuery=(field,start,end)=>start&&end?({
 [field]:{$gte:start,$lte:end}
}):{};

const getUserFilter=user=>user?{user}:{};

const inSelectedRange=(fields,start,end)=>start&&end?({
 $or:fields.map(field=>inRangeQuery(field,start,end))
}):{};

const combineFilters=(baseFilter,...filters)=>{
 const activeFilters=filters.filter(filter=>filter&&Object.keys(filter).length);
 if(!activeFilters.length)return baseFilter;
 return {
  ...baseFilter,
  $and:activeFilters
 };
};

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(value._id)return String(value._id);
 return "";
};

const getMethodTitle=method=>method?.title||"";

const buildMethodSummary=studies=>{
 const methodsById=new Map();

 studies.forEach(study=>{
  const methods=[
   study.method,
   ...(Array.isArray(study.methods)?study.methods:[])
  ].filter(Boolean);

  methods.forEach(method=>{
   const id=getObjectId(method);
   const title=getMethodTitle(method);
   if(!id||!title)return;

   const current=methodsById.get(id)||{
    _id:id,
    title,
    slug:method.slug||"",
    count:0
   };

   current.count+=1;
   methodsById.set(id,current);
  });
 });

 return [...methodsById.values()].sort((left,right)=>right.count-left.count||left.title.localeCompare(right.title));
};

const getDashboardDataService=async({period="month",reportDate=new Date(),user=null}={})=>{
 const {start,end}=getRange(period,reportDate);
 const userFilter=getUserFilter(user);
 const studyRangeFilter={...userFilter,...inSelectedRange(["updatedAt","createdAt","startedAt"],start,end)};
 const activeStudyFilter={...studyRangeFilter,active:true};
 const completedStudyFilter=combineFilters(
  userFilter,
  inSelectedRange(["updatedAt","createdAt","startedAt"],start,end),
  {$or:[{completedAt:{$ne:null}},{progressPercent:100}]}
 );
 const dailyNoteRangeFilter={...userFilter,...inRangeQuery("journalDate",start,end)};
 const taskRangeFilter={...userFilter,...inSelectedRange(["dueDate","completedAt","createdAt","updatedAt"],start,end)};
 const pendingTaskRangeFilter={...taskRangeFilter,completed:{$ne:true}};
 const completedTaskRangeFilter={...taskRangeFilter,completed:true};
 const memoryVerseRangeFilter={...userFilter,...inSelectedRange(["nextReviewAt","lastReviewedAt","createdAt","updatedAt"],start,end)};

 const [
  totalStudies,
  activeStudies,
  completedStudies,
  dailyNotes,
  dailyNotesCount,
  totalTasks,
  pendingTasks,
  completedTasks,
  memoryVersesCount,
  memoryVersesInProgress,
  memoryVersesMemorized,
  studies,
  studiesForBreakdown,
  tasks,
  memoryVerses
 ]=await Promise.all([
  Study.countDocuments(studyRangeFilter),
  Study.countDocuments(activeStudyFilter),
  Study.countDocuments(completedStudyFilter),
  DailyNote.find(dailyNoteRangeFilter).sort({journalDate:-1,updatedAt:-1}).limit(10).lean(),
  DailyNote.countDocuments(dailyNoteRangeFilter),
  StudyTask.countDocuments(taskRangeFilter),
  StudyTask.countDocuments(pendingTaskRangeFilter),
  StudyTask.countDocuments(completedTaskRangeFilter),
  MemoryVerse.countDocuments(memoryVerseRangeFilter),
  MemoryVerse.countDocuments({...memoryVerseRangeFilter,memorized:{$ne:true}}),
  MemoryVerse.countDocuments({...memoryVerseRangeFilter,memorized:true}),
  Study.find(studyRangeFilter)
   .populate("method","title slug")
   .populate("methods","title slug")
   .sort({updatedAt:-1,createdAt:-1})
   .limit(10)
   .lean(),
  Study.find(studyRangeFilter)
   .select("method methods")
   .populate("method","title slug")
   .populate("methods","title slug")
   .lean(),
  StudyTask.find(taskRangeFilter)
   .populate("study","title")
   .populate("priority","title slug color sortOrder")
   .populate("status","title slug color sortOrder")
   .sort({dueDate:1,updatedAt:-1})
   .limit(10)
   .lean(),
  MemoryVerse.find(memoryVerseRangeFilter)
   .sort({nextReviewAt:1,updatedAt:-1})
   .limit(10)
   .lean()
 ]);

 const methods=buildMethodSummary(studiesForBreakdown);

 return{
  period,
  reportDate,
  range:{start,end},
  summary:{
   totalStudies,
   activeStudies,
   completedStudies,
   dailyNotes:dailyNotesCount,
   dailyNotesInRange:dailyNotes.length,
   totalTasks,
   pendingTasks,
   completedTasks,
   memoryVerses:memoryVersesCount,
   memoryVersesInProgress,
   memoryVersesMemorized,
   studyTypeBreakdown:methods.map(method=>({
    label:method.title,
    value:method.count
   }))
  },
  studies,
  dailyNotes,
  tasks,
  memoryVerses,
  methods
 };
};

export default getDashboardDataService;