// src/pages/task/TaskForm.jsx
import {useEffect,useState} from "react";
import LifeboardFormPage from "../../components/lifeboard/LifeboardFormPage.jsx";

function TaskForm({
 record=null,
 embedded=false,
 lifeAreas=[],
 categories=[],
 tags=[],
 onCancel,
 onSaved,
 onReferencesChanged
}){

 const [localLifeAreas,setLocalLifeAreas]=useState(lifeAreas);
 const [localCategories,setLocalCategories]=useState(categories);
 const [localTags,setLocalTags]=useState(tags);

 useEffect(()=>{
  setLocalLifeAreas(lifeAreas);
 },[lifeAreas]);

 useEffect(()=>{
  setLocalCategories(categories);
 },[categories]);

 useEffect(()=>{
  setLocalTags(tags);
 },[tags]);

 const normalizeId=value=>{
  if(!value)return "";
  if(typeof value==="object"&&value?.$oid)return String(value.$oid);
  if(typeof value==="object"&&value?._id)return normalizeId(value._id);
  if(typeof value==="object"&&value?.id)return normalizeId(value.id);
  return String(value).trim();
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

 const currentUser=getStoredUser();
 const userId=normalizeId(currentUser?._id)||normalizeId(currentUser?.id);
 const recordId=normalizeId(record?._id)||normalizeId(record?.id);

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

 const initialValues={
  user:normalizeId(record?.user)||userId,
  title:record?.title||"",
  description:record?.description||"",
  taskType:record?.taskType||"daily",
  status:record?.status||"pending",
  priority:record?.priority||"medium",
  startDate:formatDateForInput(record?.startDate),
  dueDate:formatDateForInput(record?.dueDate),
  endDate:formatDateForInput(record?.endDate),
  startTime:record?.startTime||"",
  endTime:record?.endTime||"",
  allDay:record?.allDay!==false,
  repeatDays:normalizeRepeatDays(record?.repeatDays),
  repeatDayOfMonth:record?.repeatDayOfMonth||"",
  repeatMonth:record?.repeatMonth||"",
  repeatDayOfYear:record?.repeatDayOfYear||"",
  lifeArea:normalizeId(record?.lifeArea),
  category:normalizeId(record?.category),
  tags:Array.isArray(record?.tags)?record.tags.map(item=>normalizeId(item)).filter(Boolean):[],
  notes:record?.notes||""
 };

 const handleReferenceCreated=(fieldName,record)=>{
  if(fieldName==="lifeArea"){
   setLocalLifeAreas(prev=>[...prev,record]);

   if(onReferencesChanged){
    onReferencesChanged({lifeArea:record});
   }
  }

  if(fieldName==="category"){
   setLocalCategories(prev=>[...prev,record]);

   if(onReferencesChanged){
    onReferencesChanged({category:record});
   }
  }

  if(fieldName==="tags"){
   setLocalTags(prev=>[...prev,record]);

   if(onReferencesChanged){
    onReferencesChanged({tag:record});
   }
  }
 };

 const cleanOptionalNumber=value=>{
  if(value===""||value===null||value===undefined)return undefined;

  const numberValue=Number(value);

  return Number.isNaN(numberValue)?undefined:numberValue;
 };

 const cleanPayload=payload=>{
  const next={
   ...payload,
   user:payload.user||userId,
   tags:Array.isArray(payload.tags)?payload.tags.filter(Boolean):[],
   repeatDays:Array.isArray(payload.repeatDays)?payload.repeatDays.filter(Boolean):[]
  };

  if(next.taskType!=="weekly"){
   next.repeatDays=[];
  }

  if(next.taskType!=="monthly"){
   delete next.repeatDayOfMonth;
  }else{
   next.repeatDayOfMonth=cleanOptionalNumber(next.repeatDayOfMonth);
  }

  if(next.taskType!=="yearly"){
   delete next.repeatMonth;
   delete next.repeatDayOfYear;
  }else{
   next.repeatMonth=cleanOptionalNumber(next.repeatMonth);
   next.repeatDayOfYear=cleanOptionalNumber(next.repeatDayOfYear);
  }

  if(next.allDay){
   next.startTime="";
   next.endTime="";
  }

  if(!next.endDate){
   delete next.endDate;
  }

  if(!next.dueDate){
   delete next.dueDate;
  }

  if(!next.startDate){
   delete next.startDate;
  }

  if(!next.repeatDayOfMonth){
   delete next.repeatDayOfMonth;
  }

  if(!next.repeatMonth){
   delete next.repeatMonth;
  }

  if(!next.repeatDayOfYear){
   delete next.repeatDayOfYear;
  }

  return next;
 };

 return(
  <LifeboardFormPage
   title={recordId?"Edit Task":"New Task"}
   eyebrow="Tasks"
   text="Create a daily, weekly, monthly, or yearly task."
   endpoint={recordId?`/api/tasks/${recordId}`:"/api/tasks"}
   method={recordId?"PUT":"POST"}
   redirectPath="/tasks"
   submitLabel={recordId?"Update Task":"Save Task"}
   embedded={embedded}
   inlineLabels={true}
   onCancel={onCancel}
   onSaved={onSaved}
   onReferenceCreated={handleReferenceCreated}
   initialValues={initialValues}
   transformPayload={payload=>cleanPayload(payload)}
   fields={[
    {name:"user",label:"User",type:"hidden"},
    {name:"title",label:"Title",required:true},
    {name:"taskType",label:"Task Type",type:"select",options:[
     {value:"daily",label:"Daily"},
     {value:"weekly",label:"Weekly"},
     {value:"monthly",label:"Monthly"},
     {value:"yearly",label:"Yearly"}
    ]},
    {name:"priority",label:"Priority",type:"select",options:[
     {value:"low",label:"Low"},
     {value:"medium",label:"Medium"},
     {value:"high",label:"High"},
     {value:"urgent",label:"Urgent"}
    ]},
    {name:"status",label:"Status",type:"select",options:[
     {value:"pending",label:"Pending"},
     {value:"in-progress",label:"In Progress"},
     {value:"completed",label:"Completed"},
     {value:"cancelled",label:"Cancelled"},
     {value:"archived",label:"Archived"}
    ]},
    {name:"startDate",label:"Start Date",type:"date"},
    {name:"dueDate",label:"Due Date",type:"date"},
    {name:"endDate",label:"Repeat Until",type:"date"},
    {name:"allDay",label:"All Day",type:"checkbox",checkboxLabel:"All-day task"},
    {name:"startTime",label:"Start Time",type:"time"},
    {name:"endTime",label:"End Time",type:"time"},
    {name:"repeatDays",label:"Weekly Days",type:"multiselect",helpText:"Used when Task Type is Weekly.",options:[
     {value:"sunday",label:"Sunday"},
     {value:"monday",label:"Monday"},
     {value:"tuesday",label:"Tuesday"},
     {value:"wednesday",label:"Wednesday"},
     {value:"thursday",label:"Thursday"},
     {value:"friday",label:"Friday"},
     {value:"saturday",label:"Saturday"}
    ]},
    {name:"repeatDayOfMonth",label:"Monthly Day",type:"number",min:"1",max:"31",placeholder:"1-31"},
    {name:"repeatMonth",label:"Yearly Month",type:"number",min:"1",max:"12",placeholder:"1-12"},
    {name:"repeatDayOfYear",label:"Yearly Day",type:"number",min:"1",max:"31",placeholder:"1-31"},
    {
     name:"lifeArea",
     label:"Life Area",
     type:"select",
     options:toOptions(localLifeAreas,"Select life area"),
     allowCreate:true,
     createLabel:"Life Area",
     createEndpoint:"/api/life-areas",
     createResponseKey:"lifeArea",
     createPayload:(name)=>({
      user:userId,
      name,
      description:"",
      color:"",
      icon:"",
      sortOrder:0,
      isActive:true
     })
    },
    {
     name:"category",
     label:"Category",
     type:"select",
     options:toOptions(localCategories,"Select category"),
     allowCreate:true,
     createLabel:"Category",
     createEndpoint:"/api/categories",
     createResponseKey:"category",
     createPayload:(name)=>({
      user:userId,
      name,
      description:"",
      categoryType:"task",
      color:"",
      icon:"",
      isActive:true
     })
    },
    {
     name:"tags",
     label:"Tags",
     type:"multiselect",
     options:toMultiOptions(localTags),
     allowCreate:true,
     createLabel:"Tag",
     createEndpoint:"/api/tags",
     createResponseKey:"tag",
     helpText:"Hold Ctrl to select more than one tag.",
     createPayload:(name)=>({
      user:userId,
      name,
      color:"",
      icon:"",
      isActive:true
     })
    },
    {name:"description",label:"Description",type:"textarea",rows:4,full:true},
    {name:"notes",label:"Notes",type:"textarea",rows:4,full:true}
   ]}
  />
 );
}

export default TaskForm;