// src/pages/habit/HabitForm.jsx
import {useEffect,useState} from "react";
import LifeboardFormPage from "../../components/lifeboard/LifeboardFormPage.jsx";

function HabitForm({record=null,embedded=false,onCancel,onSaved}){

 const [lifeAreas,setLifeAreas]=useState([]);
 const [categories,setCategories]=useState([]);
 const [tags,setTags]=useState([]);

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

 const normalizeRecords=data=>{
  if(Array.isArray(data))return data;
  if(Array.isArray(data?.data))return data.data;
  if(Array.isArray(data?.records))return data.records;
  if(Array.isArray(data?.lifeAreas))return data.lifeAreas;
  if(Array.isArray(data?.categories))return data.categories;
  if(Array.isArray(data?.tags))return data.tags;
  return [];
 };

 const formatDateForInput=value=>{
  if(!value)return "";
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return "";
  return date.toISOString().slice(0,10);
 };

 const normalizeRepeatDays=value=>{
  if(!Array.isArray(value))return [];

  return value
   .map(item=>String(item||"").trim().toLowerCase())
   .filter(Boolean);
 };

 const normalizeTimeSlots=(slots,targetCount,startTime="",endTime="")=>{
  const count=Math.max(1,Number(targetCount)||1);
  const existingSlots=Array.isArray(slots)&&slots.length?slots:[{startTime,endTime}];
  const normalized=[];

  for(let index=0;index<count;index+=1){
   normalized.push({
    startTime:existingSlots[index]?.startTime||"",
    endTime:existingSlots[index]?.endTime||""
   });
  }

  return normalized;
 };

 const toOptions=(records,placeholder)=>{
  return [
   {value:"",label:placeholder},
   ...records.map(item=>({
    value:normalizeId(item?._id)||normalizeId(item?.id),
    label:item?.name||item?.title||item?.label||"Untitled"
   })).filter(item=>item.value)
  ];
 };

 const toMultiOptions=records=>{
  return records.map(item=>({
   value:normalizeId(item?._id)||normalizeId(item?.id),
   label:item?.name||item?.title||item?.label||"Untitled"
  })).filter(item=>item.value);
 };

 useEffect(()=>{
  let ignore=false;

  const loadReferences=async()=>{
   try{
    const token=getToken();
    const headers={
     "Content-Type":"application/json",
     ...(token?{Authorization:`Bearer ${token}`}:{})
    };

    const [lifeAreaRes,categoryRes,tagRes]=await Promise.all([
     fetch("/api/life-areas",{headers}),
     fetch("/api/categories",{headers}),
     fetch("/api/tags",{headers}).catch(()=>null)
    ]);

    const lifeAreaData=lifeAreaRes?await lifeAreaRes.json().catch(()=>({})):{};
    const categoryData=categoryRes?await categoryRes.json().catch(()=>({})):{};
    const tagData=tagRes?await tagRes.json().catch(()=>({})):{};

    if(!ignore){
     setLifeAreas(normalizeRecords(lifeAreaData));
     setCategories(normalizeRecords(categoryData));
     setTags(normalizeRecords(tagData));
    }
   }catch(err){
    console.error("Failed to load habit reference fields",err);
   }
  };

  loadReferences();

  return()=>{
   ignore=true;
  };
 },[]);

 const currentUser=getStoredUser();
 const userId=normalizeId(currentUser?._id)||normalizeId(currentUser?.id);
 const recordId=normalizeId(record?._id)||normalizeId(record?.id);
 const targetCount=record?.targetCount||1;

 const cleanOptionalNumber=value=>{
  if(value===""||value===null||value===undefined)return undefined;

  const numberValue=Number(value);

  return Number.isNaN(numberValue)?undefined:numberValue;
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

 const transformHabitPayload=payload=>{
  const normalizedTargetCount=Math.max(1,Number(payload.targetCount)||1);
  const normalizedTimeSlots=normalizeTimeSlots(payload.timeSlots,normalizedTargetCount,payload.startTime,payload.endTime);
  const next={
   ...payload,
   user:payload.user||userId,
   targetCount:normalizedTargetCount,
   allDay:payload.allDay===true,
   tags:Array.isArray(payload.tags)?payload.tags.filter(Boolean):[],
   repeatDays:Array.isArray(payload.repeatDays)?payload.repeatDays.filter(Boolean):[],
   timeSlots:normalizedTimeSlots
  };

  if(next.frequency!=="weekly"){
   next.repeatDays=[];
  }

  if(next.frequency!=="monthly"){
   delete next.repeatDayOfMonth;
  }else{
   next.repeatDayOfMonth=cleanOptionalNumber(next.repeatDayOfMonth);
  }

  if(next.frequency!=="yearly"){
   delete next.repeatMonth;
   delete next.repeatDayOfYear;
  }else{
   next.repeatMonth=cleanOptionalNumber(next.repeatMonth);
   next.repeatDayOfYear=cleanOptionalNumber(next.repeatDayOfYear);
  }

  if(next.allDay){
   next.startTime="";
   next.endTime="";
   next.timeSlots=[];
  }else{
   next.timeSlots=next.timeSlots.filter(slot=>slot.startTime||slot.endTime);
   next.startTime=next.timeSlots[0]?.startTime||"";
   next.endTime=next.timeSlots[0]?.endTime||"";
  }

  if(!next.startDate)delete next.startDate;
  if(!next.endDate)delete next.endDate;
  if(!next.repeatDayOfMonth)delete next.repeatDayOfMonth;
  if(!next.repeatMonth)delete next.repeatMonth;
  if(!next.repeatDayOfYear)delete next.repeatDayOfYear;

  return next;
 };

 return(
  <LifeboardFormPage
   title={recordId?"Edit Habit":"New Habit"}
   eyebrow="Habits"
   text="Create a recurring behavior to track over time."
   endpoint={recordId?`/api/habits/${recordId}`:"/api/habits"}
   method={recordId?"PUT":"POST"}
   redirectPath="/habits"
   submitLabel={recordId?"Update Habit":"Save Habit"}
   embedded={embedded}
   inlineLabels={true}
   onCancel={onCancel}
   onSaved={onSaved}
   onReferenceCreated={handleReferenceCreated}
   initialValues={{
    user:normalizeId(record?.user)||userId,
    title:record?.title||"",
    description:record?.description||"",
    frequency:record?.frequency||"daily",
    targetCount,
    unit:record?.unit||"times",
    startDate:formatDateForInput(record?.startDate),
    endDate:formatDateForInput(record?.endDate),
    startTime:record?.startTime||"",
    endTime:record?.endTime||"",
    timeSlots:normalizeTimeSlots(record?.timeSlots,targetCount,record?.startTime||"",record?.endTime||""),
    allDay:record?.allDay===true,
    repeatDays:normalizeRepeatDays(record?.repeatDays),
    repeatDayOfMonth:record?.repeatDayOfMonth||"",
    repeatMonth:record?.repeatMonth||"",
    repeatDayOfYear:record?.repeatDayOfYear||"",
    status:record?.status||"active",
    lifeArea:normalizeId(record?.lifeArea),
    category:normalizeId(record?.category),
    tags:Array.isArray(record?.tags)?record.tags.map(item=>normalizeId(item)).filter(Boolean):[]
   }}
   transformPayload={transformHabitPayload}
   fields={[
    {name:"user",label:"User",type:"hidden"},
    {name:"title",label:"Title",required:true},
    {name:"frequency",label:"Frequency",type:"select",options:[
     {value:"daily",label:"Daily"},
     {value:"weekly",label:"Weekly"},
     {value:"monthly",label:"Monthly"},
     {value:"yearly",label:"Yearly"}
    ]},
    {name:"targetCount",label:"Target Count",type:"number",min:"1"},
    {name:"unit",label:"Unit"},
    {name:"status",label:"Status",type:"select",options:[
     {value:"active",label:"Active"},
     {value:"paused",label:"Paused"},
     {value:"completed",label:"Completed"},
     {value:"archived",label:"Archived"}
    ]},
    {name:"startDate",label:"Start Date",type:"date"},
    {name:"endDate",label:"End Date",type:"date"},
    {name:"allDay",label:"All Day",type:"checkbox",checkboxLabel:"This habit is an all-day habit"},
    {name:"timeSlots",label:"Time Slots",type:"timeSlots",countField:"targetCount",full:true,hiddenWhen:form=>form.allDay===true,helpText:"The number of time slots matches the target count."},
    {name:"repeatDays",label:"Weekly Days",type:"multiselect",full:true,helpText:"Used when Frequency is Weekly.",hiddenWhen:form=>form.frequency!=="weekly",options:[
     {value:"sunday",label:"Sunday"},
     {value:"monday",label:"Monday"},
     {value:"tuesday",label:"Tuesday"},
     {value:"wednesday",label:"Wednesday"},
     {value:"thursday",label:"Thursday"},
     {value:"friday",label:"Friday"},
     {value:"saturday",label:"Saturday"}
    ]},
    {name:"repeatDayOfMonth",label:"Monthly Day",type:"number",min:"1",max:"31",placeholder:"1-31",hiddenWhen:form=>form.frequency!=="monthly"},
    {name:"repeatMonth",label:"Yearly Month",type:"number",min:"1",max:"12",placeholder:"1-12",hiddenWhen:form=>form.frequency!=="yearly"},
    {name:"repeatDayOfYear",label:"Yearly Day",type:"number",min:"1",max:"31",placeholder:"1-31",hiddenWhen:form=>form.frequency!=="yearly"},
    {name:"lifeArea",label:"Life Area",type:"select",options:toOptions(lifeAreas,"Select life area"),allowCreate:true,createLabel:"Life Area",createEndpoint:"/api/life-areas",createResponseKey:"lifeArea",refreshEndpoint:"/api/life-areas",createPayload:value=>({name:value,user:userId})},
    {name:"category",label:"Category",type:"select",options:toOptions(categories,"Select category"),allowCreate:true,createLabel:"Category",createEndpoint:"/api/categories",createResponseKey:"category",refreshEndpoint:"/api/categories",createPayload:value=>({name:value,user:userId})},
    {name:"tags",label:"Tags",type:"multiselect",options:toMultiOptions(tags),allowCreate:true,createLabel:"Tag",createEndpoint:"/api/tags",createResponseKey:"tag",refreshEndpoint:"/api/tags",createPayload:value=>({name:value,user:userId}),helpText:"Hold Ctrl to select more than one tag."},
    {name:"description",label:"Description",type:"textarea",rows:5,full:true}
   ]}
  />
 );
}

export default HabitForm;