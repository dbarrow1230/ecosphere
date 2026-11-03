// src/pages/priority/PriorityForm.jsx
import {useEffect,useState} from "react";
import LifeboardFormPage from "../../components/lifeboard/LifeboardFormPage.jsx";

function PriorityForm({record=null,embedded=false,onCancel,onSaved}){

 const [lifeAreas,setLifeAreas]=useState([]);
 const [categories,setCategories]=useState([]);
 const [tags,setTags]=useState([]);
 const [goals,setGoals]=useState([]);
 const [tasks,setTasks]=useState([]);
 const [habits,setHabits]=useState([]);
 const [routines,setRoutines]=useState([]);
 const [reminders,setReminders]=useState([]);
 const [calendarEvents,setCalendarEvents]=useState([]);
 const [milestones,setMilestones]=useState([]);
 const [journals,setJournals]=useState([]);
 const [notes,setNotes]=useState([]);
 const [reviews,setReviews]=useState([]);
 const [lifeThemes,setLifeThemes]=useState([]);
 const [memories,setMemories]=useState([]);
 const [mindfulnessEntries,setMindfulnessEntries]=useState([]);
 const [moodLogs,setMoodLogs]=useState([]);
 const [visionBoards,setVisionBoards]=useState([]);

 const linkedFields=[
  "linkedGoal",
  "linkedTask",
  "linkedHabit",
  "linkedRoutine",
  "linkedReminder",
  "linkedEvent",
  "linkedMilestone",
  "linkedJournal",
  "linkedNote",
  "linkedReview",
  "linkedLifeTheme",
  "linkedMemory",
  "linkedMindfulnessEntry",
  "linkedMoodLog",
  "linkedVisionBoard"
 ];

 const normalizeId=value=>{
  if(!value)return "";
  if(typeof value==="object"&&value?.$oid)return String(value.$oid);
  if(typeof value==="object"&&value?._id)return normalizeId(value._id);
  if(typeof value==="object"&&value?.id)return normalizeId(value.id);
  return String(value).trim();
 };

 const getToken=()=>{
  return localStorage.getItem("token")||sessionStorage.getItem("token")||"";
 };

 const getStoredUser=()=>{
  const keys=["user","userInfo","authUser","currentUser"];

  for(const key of keys){
   try{
    const raw=localStorage.getItem(key)||sessionStorage.getItem(key);
    if(!raw)continue;

    const parsed=JSON.parse(raw);

    if(parsed?._id||parsed?.id||parsed?.username||parsed?.email)return parsed;
    if(parsed?.user?._id||parsed?.user?.id||parsed?.user?.username||parsed?.user?.email)return parsed.user;
    if(parsed?.data?._id||parsed?.data?.id||parsed?.data?.username||parsed?.data?.email)return parsed.data;
   }catch(err){
    console.error(`Failed to parse stored user from ${key}`,err);
   }
  }

  return null;
 };

 const normalizeRecords=(data,key)=>{
  if(Array.isArray(data))return data;
  if(key&&Array.isArray(data?.[key]))return data[key];
  if(Array.isArray(data?.data))return data.data;
  if(Array.isArray(data?.records))return data.records;
  if(Array.isArray(data?.lifeAreas))return data.lifeAreas;
  if(Array.isArray(data?.categories))return data.categories;
  if(Array.isArray(data?.tags))return data.tags;
  if(Array.isArray(data?.goals))return data.goals;
  if(Array.isArray(data?.tasks))return data.tasks;
  if(Array.isArray(data?.habits))return data.habits;
  if(Array.isArray(data?.routines))return data.routines;
  if(Array.isArray(data?.reminders))return data.reminders;
  if(Array.isArray(data?.calendarEvents))return data.calendarEvents;
  if(Array.isArray(data?.events))return data.events;
  if(Array.isArray(data?.milestones))return data.milestones;
  if(Array.isArray(data?.journals))return data.journals;
  if(Array.isArray(data?.journalEntries))return data.journalEntries;
  if(Array.isArray(data?.notes))return data.notes;
  if(Array.isArray(data?.reviews))return data.reviews;
  if(Array.isArray(data?.lifeThemes))return data.lifeThemes;
  if(Array.isArray(data?.lifethemes))return data.lifethemes;
  if(Array.isArray(data?.memories))return data.memories;
  if(Array.isArray(data?.mindfulnessEntries))return data.mindfulnessEntries;
  if(Array.isArray(data?.moodLogs))return data.moodLogs;
  if(Array.isArray(data?.visionBoards))return data.visionBoards;
  if(Array.isArray(data?.visionboards))return data.visionboards;
  return [];
 };

 const formatDateForInput=value=>{
  if(!value)return "";
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return "";
  return date.toISOString().slice(0,10);
 };

 const getOptionLabel=item=>{
  return item?.title||
   item?.name||
   item?.label||
   item?.subject||
   item?.message||
   item?.mood||
   item?.intention||
   item?.summary||
   "Untitled";
 };

 const toOptions=(records,placeholder)=>{
  return [
   {value:"",label:placeholder},
   ...records.map(item=>({
    value:normalizeId(item?._id)||normalizeId(item?.id),
    label:getOptionLabel(item)
   })).filter(item=>item.value)
  ];
 };

 const toMultiOptions=records=>{
  return records.map(item=>({
   value:normalizeId(item?._id)||normalizeId(item?.id),
   label:getOptionLabel(item)
  })).filter(item=>item.value);
 };

 const readEndpoint=async(endpoint,key,headers)=>{
  try{
   const res=await fetch(endpoint,{headers});
   const data=await res.json().catch(()=>({}));

   if(!res.ok){
    console.error(`Failed to load ${endpoint}`,data);
    return [];
   }

   return normalizeRecords(data,key);
  }catch(err){
   console.error(`Failed to load ${endpoint}`,err);
   return [];
  }
 };

 useEffect(()=>{
  let ignore=false;

  const loadReferences=async()=>{
   const token=getToken();
   const headers={
    "Content-Type":"application/json",
    ...(token?{Authorization:`Bearer ${token}`}:{})
   };

   const [
    loadedLifeAreas,
    loadedCategories,
    loadedTags,
    loadedGoals,
    loadedTasks,
    loadedHabits,
    loadedRoutines,
    loadedReminders,
    loadedCalendarEvents,
    loadedMilestones,
    loadedJournals,
    loadedNotes,
    loadedReviews,
    loadedLifeThemes,
    loadedMemories,
    loadedMindfulnessEntries,
    loadedMoodLogs,
    loadedVisionBoards
   ]=await Promise.all([
    readEndpoint("/api/life-areas","lifeAreas",headers),
    readEndpoint("/api/categories","categories",headers),
    readEndpoint("/api/tags","tags",headers),
    readEndpoint("/api/goals","goals",headers),
    readEndpoint("/api/tasks","tasks",headers),
    readEndpoint("/api/habits","habits",headers),
    readEndpoint("/api/routines","routines",headers),
    readEndpoint("/api/reminders","reminders",headers),
    readEndpoint("/api/calendar-events","calendarEvents",headers),
    readEndpoint("/api/milestones","milestones",headers),
    readEndpoint("/api/journal","journalEntries",headers),
    readEndpoint("/api/notes","notes",headers),
    readEndpoint("/api/reviews","reviews",headers),
    readEndpoint("/api/life-themes","lifethemes",headers),
    readEndpoint("/api/memories","memories",headers),
    readEndpoint("/api/mindfulness","mindfulnessEntries",headers),
    readEndpoint("/api/mood-log","moodLogs",headers),
    readEndpoint("/api/vision-boards","visionboards",headers)
   ]);

   if(ignore)return;

   setLifeAreas(loadedLifeAreas);
   setCategories(loadedCategories);
   setTags(loadedTags);
   setGoals(loadedGoals);
   setTasks(loadedTasks);
   setHabits(loadedHabits);
   setRoutines(loadedRoutines);
   setReminders(loadedReminders);
   setCalendarEvents(loadedCalendarEvents);
   setMilestones(loadedMilestones);
   setJournals(loadedJournals);
   setNotes(loadedNotes);
   setReviews(loadedReviews);
   setLifeThemes(loadedLifeThemes);
   setMemories(loadedMemories);
   setMindfulnessEntries(loadedMindfulnessEntries);
   setMoodLogs(loadedMoodLogs);
   setVisionBoards(loadedVisionBoards);
  };

  loadReferences();

  return()=>{
   ignore=true;
  };
 },[]);

 const currentUser=getStoredUser();
 const userId=normalizeId(currentUser?._id)||normalizeId(currentUser?.id);
 const recordId=normalizeId(record?._id)||normalizeId(record?.id);

 const hasLinkedItem=form=>{
  return linkedFields.some(field=>!!form?.[field]);
 };

 const findById=(records,id)=>{
  const targetId=normalizeId(id);

  if(!targetId)return null;

  return records.find(item=>(normalizeId(item?._id)||normalizeId(item?.id))===targetId)||null;
 };

 const getLinkedRecord=(fieldName,value)=>{
  if(fieldName==="linkedGoal")return findById(goals,value);
  if(fieldName==="linkedTask")return findById(tasks,value);
  if(fieldName==="linkedHabit")return findById(habits,value);
  if(fieldName==="linkedRoutine")return findById(routines,value);
  if(fieldName==="linkedReminder")return findById(reminders,value);
  if(fieldName==="linkedEvent")return findById(calendarEvents,value);
  if(fieldName==="linkedMilestone")return findById(milestones,value);
  if(fieldName==="linkedJournal")return findById(journals,value);
  if(fieldName==="linkedNote")return findById(notes,value);
  if(fieldName==="linkedReview")return findById(reviews,value);
  if(fieldName==="linkedLifeTheme")return findById(lifeThemes,value);
  if(fieldName==="linkedMemory")return findById(memories,value);
  if(fieldName==="linkedMindfulnessEntry")return findById(mindfulnessEntries,value);
  if(fieldName==="linkedMoodLog")return findById(moodLogs,value);
  if(fieldName==="linkedVisionBoard")return findById(visionBoards,value);
  return null;
 };

 const getLinkedDateValue=linkedRecord=>{
  return formatDateForInput(
   linkedRecord?.dueDate||
   linkedRecord?.targetDate||
   linkedRecord?.endDate||
   linkedRecord?.sendAt||
   linkedRecord?.remindAt||
   linkedRecord?.eventDate||
   linkedRecord?.milestoneDate||
   linkedRecord?.entryDate||
   linkedRecord?.memoryDate||
   linkedRecord?.logDate||
   linkedRecord?.noteDate||
   linkedRecord?.periodEnd||
   linkedRecord?.startDate||
   ""
  );
 };

 const getLinkedStartDateValue=linkedRecord=>{
  return formatDateForInput(
   linkedRecord?.startDate||
   linkedRecord?.periodStart||
   linkedRecord?.entryDate||
   linkedRecord?.memoryDate||
   linkedRecord?.logDate||
   linkedRecord?.noteDate||
   linkedRecord?.sendAt||
   linkedRecord?.eventDate||
   ""
  );
 };

 const getLinkedDescription=linkedRecord=>{
  return linkedRecord?.description||
   linkedRecord?.notes||
   linkedRecord?.content||
   linkedRecord?.summary||
   linkedRecord?.message||
   linkedRecord?.reflection||
   linkedRecord?.intention||
   "";
 };

 const getLinkedPriorityLevel=linkedRecord=>{
  const value=linkedRecord?.priority||linkedRecord?.priorityLevel||"";

  if(["low","medium","high","urgent"].includes(value))return value;

  return "";
 };

 const getLinkedLifeArea=linkedRecord=>{
  return normalizeId(linkedRecord?.lifeArea);
 };

 const getLinkedCategory=linkedRecord=>{
  return normalizeId(linkedRecord?.category);
 };

 const getLinkedTags=linkedRecord=>{
  if(!Array.isArray(linkedRecord?.tags))return [];

  return linkedRecord.tags.map(tag=>normalizeId(tag)).filter(Boolean);
 };

 const buildLinkedAutofill=(fieldName,value,form)=>{
  const linkedRecord=getLinkedRecord(fieldName,value);
  const clearedLinks={};

  linkedFields.forEach(field=>{
   if(field!==fieldName){
    clearedLinks[field]="";
   }
  });

  if(!value||!linkedRecord){
   return clearedLinks;
  }

  const linkedTitle=getOptionLabel(linkedRecord);
  const linkedDescription=getLinkedDescription(linkedRecord);
  const linkedStartDate=getLinkedStartDateValue(linkedRecord);
  const linkedDueDate=getLinkedDateValue(linkedRecord);
  const linkedLifeArea=getLinkedLifeArea(linkedRecord);
  const linkedCategory=getLinkedCategory(linkedRecord);
  const linkedTags=getLinkedTags(linkedRecord);
  const linkedPriorityLevel=getLinkedPriorityLevel(linkedRecord);

  return {
   ...clearedLinks,
   title:linkedTitle&&linkedTitle!=="Untitled"?linkedTitle:form?.title||"",
   description:linkedDescription||form?.description||"",
   startDate:linkedStartDate||form?.startDate||"",
   dueDate:linkedDueDate||form?.dueDate||"",
   lifeArea:linkedLifeArea||form?.lifeArea||"",
   category:linkedCategory||form?.category||"",
   tags:linkedTags.length?linkedTags:Array.isArray(form?.tags)?form.tags:[],
   priorityLevel:linkedPriorityLevel||form?.priorityLevel||"medium"
  };
 };

 const handleReferenceCreated=(fieldName,record)=>{
  if(fieldName==="lifeArea"){
   setLifeAreas(prev=>{
    const recordId=normalizeId(record?._id)||normalizeId(record?.id);
    if(!recordId)return prev;
    if(prev.some(item=>(normalizeId(item?._id)||normalizeId(item?.id))===recordId))return prev;
    return [...prev,record];
   });
  }

  if(fieldName==="category"){
   setCategories(prev=>{
    const recordId=normalizeId(record?._id)||normalizeId(record?.id);
    if(!recordId)return prev;
    if(prev.some(item=>(normalizeId(item?._id)||normalizeId(item?.id))===recordId))return prev;
    return [...prev,record];
   });
  }

  if(fieldName==="tags"){
   setTags(prev=>{
    const recordId=normalizeId(record?._id)||normalizeId(record?.id);
    if(!recordId)return prev;
    if(prev.some(item=>(normalizeId(item?._id)||normalizeId(item?.id))===recordId))return prev;
    return [...prev,record];
   });
  }
 };

 const getLinkedTitleFromPayload=payload=>{
  const linkedMap=[
   {field:"linkedGoal",records:goals},
   {field:"linkedTask",records:tasks},
   {field:"linkedHabit",records:habits},
   {field:"linkedRoutine",records:routines},
   {field:"linkedReminder",records:reminders},
   {field:"linkedEvent",records:calendarEvents},
   {field:"linkedMilestone",records:milestones},
   {field:"linkedJournal",records:journals},
   {field:"linkedNote",records:notes},
   {field:"linkedReview",records:reviews},
   {field:"linkedLifeTheme",records:lifeThemes},
   {field:"linkedMemory",records:memories},
   {field:"linkedMindfulnessEntry",records:mindfulnessEntries},
   {field:"linkedMoodLog",records:moodLogs},
   {field:"linkedVisionBoard",records:visionBoards}
  ];

  for(const item of linkedMap){
   if(payload[item.field]){
    const linkedRecord=findById(item.records,payload[item.field]);
    const linkedTitle=getOptionLabel(linkedRecord);
    if(linkedTitle&&linkedTitle!=="Untitled")return linkedTitle;
   }
  }

  return "";
 };

 const transformPriorityPayload=payload=>{
  const linkedTitle=getLinkedTitleFromPayload(payload);
  const next={
   ...payload,
   user:payload.user||userId,
   title:String(payload.title||linkedTitle||"").trim(),
   tags:Array.isArray(payload.tags)?payload.tags.filter(Boolean):[]
  };

  linkedFields.forEach(field=>{
   if(!next[field])delete next[field];
  });

  [
   "lifeArea",
   "category"
  ].forEach(field=>{
   if(!next[field])delete next[field];
  });

  if(!next.title){
   throw new Error("Select a linked item or enter a title.");
  }

  if(!next.startDate)delete next.startDate;
  if(!next.dueDate)delete next.dueDate;
  if(!next.completedAt)delete next.completedAt;

  return next;
 };

 return(
  <LifeboardFormPage
   title={recordId?"Edit Priority":"New Priority"}
   eyebrow="Priorities"
   text="Create a priority for daily, weekly, monthly, or yearly focus and connect it to related records."
   endpoint={recordId?`/api/priorities/${recordId}`:"/api/priorities"}
   method={recordId?"PUT":"POST"}
   redirectPath="/priorities"
   submitLabel={recordId?"Update Priority":"Save Priority"}
   embedded={embedded}
   inlineLabels={true}
   onCancel={onCancel}
   onSaved={onSaved}
   onReferenceCreated={handleReferenceCreated}
   initialValues={{
    user:normalizeId(record?.user)||userId,
    title:record?.title||"",
    description:record?.description||"",
    priorityType:record?.priorityType||"daily",
    priorityLevel:record?.priorityLevel||"medium",
    status:record?.status||"active",
    startDate:formatDateForInput(record?.startDate),
    dueDate:formatDateForInput(record?.dueDate),
    completedAt:formatDateForInput(record?.completedAt),
    lifeArea:normalizeId(record?.lifeArea),
    category:normalizeId(record?.category),
    linkedGoal:normalizeId(record?.linkedGoal),
    linkedTask:normalizeId(record?.linkedTask),
    linkedHabit:normalizeId(record?.linkedHabit),
    linkedRoutine:normalizeId(record?.linkedRoutine),
    linkedReminder:normalizeId(record?.linkedReminder),
    linkedEvent:normalizeId(record?.linkedEvent),
    linkedMilestone:normalizeId(record?.linkedMilestone),
    linkedJournal:normalizeId(record?.linkedJournal),
    linkedNote:normalizeId(record?.linkedNote),
    linkedReview:normalizeId(record?.linkedReview),
    linkedLifeTheme:normalizeId(record?.linkedLifeTheme),
    linkedMemory:normalizeId(record?.linkedMemory),
    linkedMindfulnessEntry:normalizeId(record?.linkedMindfulnessEntry),
    linkedMoodLog:normalizeId(record?.linkedMoodLog),
    linkedVisionBoard:normalizeId(record?.linkedVisionBoard),
    notes:record?.notes||"",
    tags:Array.isArray(record?.tags)?record.tags.map(item=>normalizeId(item)).filter(Boolean):[]
   }}
   transformPayload={transformPriorityPayload}
   fields={[
    {name:"user",label:"User",type:"hidden"},
    {name:"title",label:"Title",required:form=>!hasLinkedItem(form),placeholder:"Required only when no linked item is selected"},

    {name:"linkedGoal",label:"Linked Goal",type:"select",options:toOptions(goals,"Select goal"),onValueChange:(value,form)=>buildLinkedAutofill("linkedGoal",value,form)},
    {name:"linkedTask",label:"Linked Task",type:"select",options:toOptions(tasks,"Select task"),onValueChange:(value,form)=>buildLinkedAutofill("linkedTask",value,form)},
    {name:"linkedHabit",label:"Linked Habit",type:"select",options:toOptions(habits,"Select habit"),onValueChange:(value,form)=>buildLinkedAutofill("linkedHabit",value,form)},
    {name:"linkedRoutine",label:"Linked Routine",type:"select",options:toOptions(routines,"Select routine"),onValueChange:(value,form)=>buildLinkedAutofill("linkedRoutine",value,form)},
    {name:"linkedReminder",label:"Linked Reminder",type:"select",options:toOptions(reminders,"Select reminder"),onValueChange:(value,form)=>buildLinkedAutofill("linkedReminder",value,form)},
    {name:"linkedEvent",label:"Linked Event",type:"select",options:toOptions(calendarEvents,"Select calendar event"),onValueChange:(value,form)=>buildLinkedAutofill("linkedEvent",value,form)},
    {name:"linkedMilestone",label:"Linked Milestone",type:"select",options:toOptions(milestones,"Select milestone"),onValueChange:(value,form)=>buildLinkedAutofill("linkedMilestone",value,form)},
    {name:"linkedJournal",label:"Linked Journal",type:"select",options:toOptions(journals,"Select journal"),onValueChange:(value,form)=>buildLinkedAutofill("linkedJournal",value,form)},
    {name:"linkedNote",label:"Linked Note",type:"select",options:toOptions(notes,"Select note"),onValueChange:(value,form)=>buildLinkedAutofill("linkedNote",value,form)},
    {name:"linkedReview",label:"Linked Review",type:"select",options:toOptions(reviews,"Select review"),onValueChange:(value,form)=>buildLinkedAutofill("linkedReview",value,form)},
    {name:"linkedLifeTheme",label:"Linked Life Theme",type:"select",options:toOptions(lifeThemes,"Select life theme"),onValueChange:(value,form)=>buildLinkedAutofill("linkedLifeTheme",value,form)},
    {name:"linkedMemory",label:"Linked Memory",type:"select",options:toOptions(memories,"Select memory"),onValueChange:(value,form)=>buildLinkedAutofill("linkedMemory",value,form)},
    {name:"linkedMindfulnessEntry",label:"Linked Mindfulness",type:"select",options:toOptions(mindfulnessEntries,"Select mindfulness entry"),onValueChange:(value,form)=>buildLinkedAutofill("linkedMindfulnessEntry",value,form)},
    {name:"linkedMoodLog",label:"Linked Mood Log",type:"select",options:toOptions(moodLogs,"Select mood log"),onValueChange:(value,form)=>buildLinkedAutofill("linkedMoodLog",value,form)},
    {name:"linkedVisionBoard",label:"Linked Vision Board",type:"select",options:toOptions(visionBoards,"Select vision board"),onValueChange:(value,form)=>buildLinkedAutofill("linkedVisionBoard",value,form)},

    {name:"priorityType",label:"Priority Type",type:"select",options:[
     {value:"daily",label:"Daily"},
     {value:"weekly",label:"Weekly"},
     {value:"monthly",label:"Monthly"},
     {value:"yearly",label:"Yearly"}
    ]},
    {name:"priorityLevel",label:"Priority Level",type:"select",options:[
     {value:"low",label:"Low"},
     {value:"medium",label:"Medium"},
     {value:"high",label:"High"},
     {value:"urgent",label:"Urgent"}
    ]},
    {name:"status",label:"Status",type:"select",options:[
     {value:"active",label:"Active"},
     {value:"completed",label:"Completed"},
     {value:"paused",label:"Paused"},
     {value:"cancelled",label:"Cancelled"},
     {value:"archived",label:"Archived"}
    ]},
    {name:"startDate",label:"Start Date",type:"date"},
    {name:"dueDate",label:"Due Date",type:"date"},
    {name:"completedAt",label:"Completed At",type:"date",hiddenWhen:form=>form.status!=="completed"},
    {name:"lifeArea",label:"Life Area",type:"select",options:toOptions(lifeAreas,"Select life area"),allowCreate:true,createLabel:"Life Area",createEndpoint:"/api/life-areas",createResponseKey:"lifeArea",refreshEndpoint:"/api/life-areas",createPayload:value=>({name:value,user:userId})},
    {name:"category",label:"Category",type:"select",options:toOptions(categories,"Select category"),allowCreate:true,createLabel:"Category",createEndpoint:"/api/categories",createResponseKey:"category",refreshEndpoint:"/api/categories",createPayload:value=>({name:value,user:userId})},
    {name:"tags",label:"Tags",type:"multiselect",options:toMultiOptions(tags),allowCreate:true,createLabel:"Tag",createEndpoint:"/api/tags",createResponseKey:"tag",refreshEndpoint:"/api/tags",createPayload:value=>({name:value,user:userId}),helpText:"Hold Ctrl to select more than one tag."},
    {name:"description",label:"Description",type:"textarea",rows:4,full:true},
    {name:"notes",label:"Notes",type:"textarea",rows:4,full:true}
   ]}
  />
 );
}

export default PriorityForm;