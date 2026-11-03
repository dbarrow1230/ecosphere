// /src/pages/forms/methods/BibleStudyMethodForm.jsx
import {useEffect,useMemo,useState} from "react";
import {useNavigate,useParams} from "react-router-dom";

const API_BASE="/api/methods";
const CATEGORY_API="/api/lookups/study-categories";
const DIFFICULTY_API="/api/lookups/difficulty-levels";

const createInitialState=()=>({
 title:"",
 slug:"",
 subtitle:"",
 icon:"",
 category:"",
 difficulty:"",
 skillLevel:"",
 timeRequired:"",
 effortLevel:"",
 bestSetting:[],
 methodFamily:"",
 isMainMethod:true,
 subMethods:[],
 description:"",
 overview:"",
 purpose:"",
 whenToUse:"",
 whatIsThisMethod:"",
 whyUseThisMethod:"",
 biblicalBasis:"",
 hermeneuticalBasis:"",
 whyThisMethodIsValidInScripture:"",
 bestUseCases:[],
 whenNotToUse:"",
 howToThinkAboutIt:"",
 analogy:"",
 mainOutcome:"",
 audience:[],
 bestFor:[],
 goals:[],
 learningOutcomes:[],
 idealStudyContexts:[],
 complementaryMethods:[],
 lessIdealFor:[],
 steps:[],
 stepOverview:"",
 requirements:[],
 tools:[],
 requiredTools:[],
 optionalTools:[],
 preparationTips:[],
 studyTips:[],
 beforeYouBegin:[],
 heartPosture:[],
 spiritualPreparation:[],
 guardrails:[],
 variations:[],
 observationPrompts:[],
 interpretationPrompts:[],
 applicationPrompts:[],
 reflectionQuestions:[],
 keyQuestions:[],
 observationGuide:[],
 interpretationGuide:[],
 applicationGuide:[],
 interpretationPitfalls:[],
 prayerPrompts:[],
 prayerFocus:[],
 prayerPoints:[],
 prayerGuide:[],
 prayer:"",
 memoryVerse:"",
 memorizationTips:[],
 journalingPrompts:[],
 recordYourFindings:"",
 recordFormats:[],
 journalingGuidance:[],
 strengths:[],
 benefits:[],
 cautions:[],
 commonMistakes:[],
 commonMisconceptions:[],
 unrealisticExpectations:[],
 whatNotToDo:[],
 limitations:[],
 accuracyChecks:[],
 soundDoctrineChecks:[],
 application:"",
 spiritualOutcome:"",
 coreSpiritualOutcome:"",
 disciplineReminder:"",
 transformationMarkers:[],
 methodImages:[],
 relatedMethods:[],
 relatedTopics:[],
 relatedPractices:[],
 relatedScriptures:[],
 crossReferences:[],
 followUpMethods:[],
 suggestedPassages:[],
 tags:[],
 example:{
  reference:"",
  summary:"",
  observation:"",
  interpretation:"",
  application:"",
  prayer:"",
  memoryVerse:"",
  journal:""
 },
 howThisMethodFitsInACompleteStudySystem:"",
 roleInOverallBibleStudy:"",
 notes:[],
 closing:"",
 finalThought:""
});

const createStep=()=>({title:"",content:"",order:0});
const createSubMethod=()=>({title:"",slug:"",description:"",purpose:"",whenToUse:"",notes:"",order:0});
const createPrayerPrompt=()=>({title:"",prompt:""});
const createInterpretationPitfall=()=>({title:"",description:""});
const createAccuracyCheck=()=>({title:"",checks:[]});
const createTransformationMarker=()=>({category:"",markers:[]});
const createMethodImage=()=>({url:"",caption:"",alt:"",type:"example",order:0,isPrimary:false});

function safeArray(value){
 return Array.isArray(value)?value:[];
}

function slugify(value){
 return String(value||"").toLowerCase().trim().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-");
}

function normalizeLookupList(payload){
 if(Array.isArray(payload))return payload;
 if(Array.isArray(payload?.data))return payload.data;
 if(Array.isArray(payload?.items))return payload.items;
 if(Array.isArray(payload?.results))return payload.results;
 return [];
}

function normalizeMethodData(data){
 return{
  ...createInitialState(),
  ...data,
  category:data?.category?data.category._id||data.category:"",
  difficulty:data?.difficulty?data.difficulty._id||data.difficulty:"",
  methodFamily:data?.methodFamily?data.methodFamily._id||data.methodFamily:"",
  relatedMethods:safeArray(data?.relatedMethods).map(item=>item?item._id||item:""),
  bestSetting:safeArray(data?.bestSetting),
  bestUseCases:safeArray(data?.bestUseCases),
  audience:safeArray(data?.audience),
  bestFor:safeArray(data?.bestFor),
  goals:safeArray(data?.goals),
  learningOutcomes:safeArray(data?.learningOutcomes),
  idealStudyContexts:safeArray(data?.idealStudyContexts),
  complementaryMethods:safeArray(data?.complementaryMethods),
  lessIdealFor:safeArray(data?.lessIdealFor),
  requirements:safeArray(data?.requirements),
  tools:safeArray(data?.tools),
  requiredTools:safeArray(data?.requiredTools),
  optionalTools:safeArray(data?.optionalTools),
  preparationTips:safeArray(data?.preparationTips),
  studyTips:safeArray(data?.studyTips),
  beforeYouBegin:safeArray(data?.beforeYouBegin),
  heartPosture:safeArray(data?.heartPosture),
  spiritualPreparation:safeArray(data?.spiritualPreparation),
  guardrails:safeArray(data?.guardrails),
  variations:safeArray(data?.variations),
  observationPrompts:safeArray(data?.observationPrompts),
  interpretationPrompts:safeArray(data?.interpretationPrompts),
  applicationPrompts:safeArray(data?.applicationPrompts),
  reflectionQuestions:safeArray(data?.reflectionQuestions),
  keyQuestions:safeArray(data?.keyQuestions),
  observationGuide:safeArray(data?.observationGuide),
  interpretationGuide:safeArray(data?.interpretationGuide),
  applicationGuide:safeArray(data?.applicationGuide),
  prayerFocus:safeArray(data?.prayerFocus),
  prayerPoints:safeArray(data?.prayerPoints),
  prayerGuide:safeArray(data?.prayerGuide),
  memorizationTips:safeArray(data?.memorizationTips),
  journalingPrompts:safeArray(data?.journalingPrompts),
  recordFormats:safeArray(data?.recordFormats),
  journalingGuidance:safeArray(data?.journalingGuidance),
  strengths:safeArray(data?.strengths),
  benefits:safeArray(data?.benefits),
  cautions:safeArray(data?.cautions),
  commonMistakes:safeArray(data?.commonMistakes),
  commonMisconceptions:safeArray(data?.commonMisconceptions),
  unrealisticExpectations:safeArray(data?.unrealisticExpectations),
  whatNotToDo:safeArray(data?.whatNotToDo),
  limitations:safeArray(data?.limitations),
  soundDoctrineChecks:safeArray(data?.soundDoctrineChecks),
  relatedTopics:safeArray(data?.relatedTopics),
  relatedPractices:safeArray(data?.relatedPractices),
  relatedScriptures:safeArray(data?.relatedScriptures),
  crossReferences:safeArray(data?.crossReferences),
  followUpMethods:safeArray(data?.followUpMethods),
  suggestedPassages:safeArray(data?.suggestedPassages),
  tags:safeArray(data?.tags),
  notes:safeArray(data?.notes),
  steps:safeArray(data?.steps).map(item=>({...createStep(),...item})),
  subMethods:safeArray(data?.subMethods).map(item=>({...createSubMethod(),...item})),
  prayerPrompts:safeArray(data?.prayerPrompts).map(item=>({...createPrayerPrompt(),...item})),
  interpretationPitfalls:safeArray(data?.interpretationPitfalls).map(item=>({...createInterpretationPitfall(),...item})),
  accuracyChecks:safeArray(data?.accuracyChecks).map(item=>({...createAccuracyCheck(),...item,checks:safeArray(item?.checks)})),
  transformationMarkers:safeArray(data?.transformationMarkers).map(item=>({...createTransformationMarker(),...item,markers:safeArray(item?.markers)})),
  methodImages:safeArray(data?.methodImages).map(item=>({...createMethodImage(),...item})),
  example:{...createInitialState().example,...(data?.example||{})}
 };
}

function TextInput({label,name,value,onChange,type="text",placeholder="",colClass="col-md-6 mb-3"}){
 return(
  <div className={colClass}>
   <label className="form-label">{label}</label>
   <input type={type} className="form-control" name={name} value={value||""} onChange={onChange} placeholder={placeholder}/>
  </div>
 );
}

function TextArea({label,name,value,onChange,rows=4,placeholder=""}){
 return(
  <div className="mb-3">
   <label className="form-label">{label}</label>
   <textarea className="form-control" name={name} value={value||""} onChange={onChange} rows={rows} placeholder={placeholder}/>
  </div>
 );
}

function SectionTabs({tabs,activeTab,onChange}){
 return(
  <ul className="nav method-section-tabs mb-3">
   {tabs.map(tab=>(
    <li className="nav-item" key={tab.key}>
     <button type="button" className={`nav-link ${activeTab===tab.key?"active":""}`} onClick={()=>onChange(tab.key)}>
      {tab.label}
     </button>
    </li>
   ))}
  </ul>
 );
}

function CardBlock({title,children}){
 return(
  <div className="card mb-4">
   <div className="card-header"><strong>{title}</strong></div>
   <div className="card-body">{children}</div>
  </div>
 );
}

function ItemControls({onAdd,onRemove,removeLabel="Remove"}){
 return(
  <div className="d-flex justify-content-end gap-2 mt-2">
   <button type="button" className="btn btn-outline-primary btn-sm" onClick={onAdd}>+</button>
   <button type="button" className="btn btn-outline-danger btn-sm" onClick={onRemove}>{removeLabel}</button>
  </div>
 );
}

function AddAfterList({onAdd,label,hasItems}){
 return(
  <div className={`d-flex ${hasItems?"justify-content-end":"justify-content-start"} mt-2`}>
   <button type="button" className="btn btn-outline-primary btn-sm" onClick={onAdd}>{hasItems?`Add ${label}`:`Add First ${label}`}</button>
  </div>
 );
}

function InlineArrayField({label,name,value,onChange,placeholder="Add item"}){
 const[input,setInput]=useState("");
 const items=safeArray(value);
 const addItem=()=>{
  const nextValue=input.trim();
  if(!nextValue)return;
  onChange({target:{name,value:[...items,nextValue]}});
  setInput("");
 };
 const removeItem=index=>{
  onChange({target:{name,value:items.filter((_,itemIndex)=>itemIndex!==index)}});
 };
 return(
  <div className="mb-3">
   <label className="form-label">{label}</label>
   <div className="d-flex gap-2">
    <input className="form-control" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addItem();}}} placeholder={placeholder}/>
    <button type="button" className="btn btn-outline-primary" onClick={addItem}>Add</button>
   </div>
   {!!items.length&&(
    <div className="d-flex flex-column gap-2 mt-2">
     {items.map((item,index)=>(
      <div className="input-group" key={`${name}-${index}`}>
       <input className="form-control" value={item||""} onChange={e=>{
        const next=items.map((current,currentIndex)=>currentIndex===index?e.target.value:current);
        onChange({target:{name,value:next}});
       }}/>
       <button type="button" className="btn btn-outline-danger" onClick={()=>removeItem(index)}>-</button>
      </div>
     ))}
    </div>
   )}
  </div>
 );
}

function LookupField({label,name,value,options,onChange,onCreate,onRefresh,multiple=false,excludeId=""}){
 const[creating,setCreating]=useState(false);
 const[newTitle,setNewTitle]=useState("");
 const list=multiple?safeArray(value):value||"";
 const items=safeArray(options);
 const saveNew=async()=>{
  const title=newTitle.trim();
  if(!title||!onCreate)return;
  const created=await onCreate(title);
  if(!created)return;
  setNewTitle("");
  setCreating(false);
 };
 return(
  <div className="mb-3">
   <label className="form-label">{label}</label>
   <div className="d-flex gap-2 mb-2">
    <select className="form-select" name={name} multiple={multiple} value={list} onChange={onChange} size={multiple?8:1}>
     {!multiple&&<option value="">Select {label}</option>}
     {items.filter(item=>item?._id!==excludeId).map(item=>(
      <option key={item._id} value={item._id}>{item.title||item.name}</option>
     ))}
    </select>
    <div className="d-flex flex-column gap-2">
     <button type="button" className="btn btn-outline-primary btn-sm" onClick={()=>setCreating(current=>!current)}>{creating?"Close":"Add New"}</button>
     <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onRefresh}>Refresh</button>
    </div>
   </div>
   {creating&&(
    <div className="input-group">
     <input className="form-control" value={newTitle} onChange={e=>setNewTitle(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();saveNew();}}} placeholder={`New ${label}`}/>
     <button type="button" className="btn btn-primary" onClick={saveNew}>Save</button>
    </div>
   )}
  </div>
 );
}

function MultiLookupField({label,name,value,options,onChange,onCreate,onRefresh,excludeId=""}){
 return(
  <LookupField label={label} name={name} value={value} options={options} onChange={onChange} onCreate={onCreate} onRefresh={onRefresh} multiple excludeId={excludeId}/>
 );
}

function StepsEditor({value,onChange}){
 const items=safeArray(value);
 const updateItem=(index,key,nextValue)=>onChange(items.map((item,itemIndex)=>itemIndex===index?{...item,[key]:nextValue}:item));
 const removeItem=index=>onChange(items.filter((_,itemIndex)=>itemIndex!==index));
 const addItem=(index=items.length)=>{
  const next=[...items];
  next.splice(index,0,{...createStep(),order:index+1});
  onChange(next.map((item,itemIndex)=>({...item,order:item.order||itemIndex+1})));
 };
 return(
  <div className="mb-3">
   <label className="form-label">Steps</label>
   {!items.length&&<div className="text-muted small mb-2">No steps added.</div>}
   {items.map((item,index)=>(
    <div className="card mb-3" key={index}>
     <div className="card-body">
      <div className="row">
       <TextInput label="Title" name={`steps-title-${index}`} value={item.title} onChange={e=>updateItem(index,"title",e.target.value)}/>
       <TextInput label="Order" name={`steps-order-${index}`} type="number" value={item.order} onChange={e=>updateItem(index,"order",Number(e.target.value)||0)}/>
      </div>
      <TextArea label="Content" name={`steps-content-${index}`} value={item.content} onChange={e=>updateItem(index,"content",e.target.value)} rows={4}/>
      <ItemControls onAdd={()=>addItem(index+1)} onRemove={()=>removeItem(index)} removeLabel="Remove Step"/>
     </div>
    </div>
   ))}
   <AddAfterList onAdd={()=>addItem(items.length)} label="Step" hasItems={!!items.length}/>
  </div>
 );
}

function SubMethodsEditor({value,onChange}){
 const items=safeArray(value);
 const updateItem=(index,key,nextValue)=>onChange(items.map((item,itemIndex)=>itemIndex===index?{...item,[key]:nextValue}:item));
 const removeItem=index=>onChange(items.filter((_,itemIndex)=>itemIndex!==index));
 const addItem=(index=items.length)=>{
  const next=[...items];
  next.splice(index,0,{...createSubMethod(),order:index+1});
  onChange(next.map((item,itemIndex)=>({...item,order:item.order||itemIndex+1})));
 };
 return(
  <div className="mb-3">
   <label className="form-label">Sub Methods</label>
   {!items.length&&<div className="text-muted small mb-2">No sub methods added.</div>}
   {items.map((item,index)=>(
    <div className="card mb-3" key={index}>
     <div className="card-body">
      <div className="row">
       <TextInput label="Title" name={`submethods-title-${index}`} value={item.title} onChange={e=>updateItem(index,"title",e.target.value)}/>
       <TextInput label="Slug" name={`submethods-slug-${index}`} value={item.slug} onChange={e=>updateItem(index,"slug",e.target.value)}/>
       <TextInput label="Order" name={`submethods-order-${index}`} type="number" value={item.order} onChange={e=>updateItem(index,"order",Number(e.target.value)||0)}/>
      </div>
      <TextArea label="Description" name={`submethods-description-${index}`} value={item.description} onChange={e=>updateItem(index,"description",e.target.value)} rows={3}/>
      <TextArea label="Purpose" name={`submethods-purpose-${index}`} value={item.purpose} onChange={e=>updateItem(index,"purpose",e.target.value)} rows={3}/>
      <TextArea label="When To Use" name={`submethods-whentouse-${index}`} value={item.whenToUse} onChange={e=>updateItem(index,"whenToUse",e.target.value)} rows={3}/>
      <TextArea label="Notes" name={`submethods-notes-${index}`} value={item.notes} onChange={e=>updateItem(index,"notes",e.target.value)} rows={3}/>
      <ItemControls onAdd={()=>addItem(index+1)} onRemove={()=>removeItem(index)} removeLabel="Remove Sub Method"/>
     </div>
    </div>
   ))}
   <AddAfterList onAdd={()=>addItem(items.length)} label="Sub Method" hasItems={!!items.length}/>
  </div>
 );
}

function PrayerPromptsEditor({value,onChange}){
 const items=safeArray(value);
 const updateItem=(index,key,nextValue)=>onChange(items.map((item,itemIndex)=>itemIndex===index?{...item,[key]:nextValue}:item));
 const removeItem=index=>onChange(items.filter((_,itemIndex)=>itemIndex!==index));
 const addItem=(index=items.length)=>{
  const next=[...items];
  next.splice(index,0,createPrayerPrompt());
  onChange(next);
 };
 return(
  <div className="mb-3">
   <label className="form-label">Prayer Prompts</label>
   {!items.length&&<div className="text-muted small mb-2">No prayer prompts added.</div>}
   {items.map((item,index)=>(
    <div className="card mb-3" key={index}>
     <div className="card-body">
      <div className="row">
       <TextInput label="Title" name={`prayerprompts-title-${index}`} value={item.title} onChange={e=>updateItem(index,"title",e.target.value)}/>
      </div>
      <TextArea label="Prompt" name={`prayerprompts-prompt-${index}`} value={item.prompt} onChange={e=>updateItem(index,"prompt",e.target.value)} rows={3}/>
      <ItemControls onAdd={()=>addItem(index+1)} onRemove={()=>removeItem(index)} removeLabel="Remove Prayer Prompt"/>
     </div>
    </div>
   ))}
   <AddAfterList onAdd={()=>addItem(items.length)} label="Prayer Prompt" hasItems={!!items.length}/>
  </div>
 );
}

function InterpretationPitfallsEditor({value,onChange}){
 const items=safeArray(value);
 const updateItem=(index,key,nextValue)=>onChange(items.map((item,itemIndex)=>itemIndex===index?{...item,[key]:nextValue}:item));
 const removeItem=index=>onChange(items.filter((_,itemIndex)=>itemIndex!==index));
 const addItem=(index=items.length)=>{
  const next=[...items];
  next.splice(index,0,createInterpretationPitfall());
  onChange(next);
 };
 return(
  <div className="mb-3">
   <label className="form-label">Interpretation Pitfalls</label>
   {!items.length&&<div className="text-muted small mb-2">No interpretation pitfalls added.</div>}
   {items.map((item,index)=>(
    <div className="card mb-3" key={index}>
     <div className="card-body">
      <div className="row">
       <TextInput label="Title" name={`pitfalls-title-${index}`} value={item.title} onChange={e=>updateItem(index,"title",e.target.value)}/>
      </div>
      <TextArea label="Description" name={`pitfalls-description-${index}`} value={item.description} onChange={e=>updateItem(index,"description",e.target.value)} rows={3}/>
      <ItemControls onAdd={()=>addItem(index+1)} onRemove={()=>removeItem(index)} removeLabel="Remove Pitfall"/>
     </div>
    </div>
   ))}
   <AddAfterList onAdd={()=>addItem(items.length)} label="Pitfall" hasItems={!!items.length}/>
  </div>
 );
}

function AccuracyChecksEditor({value,onChange}){
 const items=safeArray(value);
 const updateItem=(index,key,nextValue)=>onChange(items.map((item,itemIndex)=>itemIndex===index?{...item,[key]:nextValue}:item));
 const removeItem=index=>onChange(items.filter((_,itemIndex)=>itemIndex!==index));
 const addItem=(index=items.length)=>{
  const next=[...items];
  next.splice(index,0,createAccuracyCheck());
  onChange(next);
 };
 const handleChecksChange=(index,event)=>updateItem(index,"checks",event.target.value);
 return(
  <div className="mb-3">
   <label className="form-label">Accuracy Checks</label>
   {!items.length&&<div className="text-muted small mb-2">No accuracy checks added.</div>}
   {items.map((item,index)=>(
    <div className="card mb-3" key={index}>
     <div className="card-body">
      <div className="row">
       <TextInput label="Title" name={`accuracy-title-${index}`} value={item.title} onChange={e=>updateItem(index,"title",e.target.value)}/>
      </div>
      <InlineArrayField label="Checks" name={`accuracy-checks-${index}`} value={item.checks} onChange={event=>handleChecksChange(index,event)} placeholder="Add check"/>
      <ItemControls onAdd={()=>addItem(index+1)} onRemove={()=>removeItem(index)} removeLabel="Remove Accuracy Check"/>
     </div>
    </div>
   ))}
   <AddAfterList onAdd={()=>addItem(items.length)} label="Accuracy Check" hasItems={!!items.length}/>
  </div>
 );
}

function TransformationMarkersEditor({value,onChange}){
 const items=safeArray(value);
 const updateItem=(index,key,nextValue)=>onChange(items.map((item,itemIndex)=>itemIndex===index?{...item,[key]:nextValue}:item));
 const removeItem=index=>onChange(items.filter((_,itemIndex)=>itemIndex!==index));
 const addItem=(index=items.length)=>{
  const next=[...items];
  next.splice(index,0,createTransformationMarker());
  onChange(next);
 };
 const handleMarkersChange=(index,event)=>updateItem(index,"markers",event.target.value);
 return(
  <div className="mb-3">
   <label className="form-label">Transformation Markers</label>
   {!items.length&&<div className="text-muted small mb-2">No transformation markers added.</div>}
   {items.map((item,index)=>(
    <div className="card mb-3" key={index}>
     <div className="card-body">
      <div className="row">
       <TextInput label="Category" name={`markers-category-${index}`} value={item.category} onChange={e=>updateItem(index,"category",e.target.value)}/>
      </div>
      <InlineArrayField label="Markers" name={`markers-items-${index}`} value={item.markers} onChange={event=>handleMarkersChange(index,event)} placeholder="Add marker"/>
      <ItemControls onAdd={()=>addItem(index+1)} onRemove={()=>removeItem(index)} removeLabel="Remove Marker Group"/>
     </div>
    </div>
   ))}
   <AddAfterList onAdd={()=>addItem(items.length)} label="Transformation Marker Group" hasItems={!!items.length}/>
  </div>
 );
}

function MethodImagesEditor({value,onChange}){
 const items=safeArray(value);
 const updateItem=(index,key,nextValue)=>{
  let next=items.map((item,itemIndex)=>itemIndex===index?{...item,[key]:nextValue}:item);
  if(key==="isPrimary"&&nextValue)next=next.map((item,itemIndex)=>({...item,isPrimary:itemIndex===index}));
  onChange(next);
 };
 const removeItem=index=>onChange(items.filter((_,itemIndex)=>itemIndex!==index));
 const addItem=(index=items.length)=>{
  const next=[...items];
  next.splice(index,0,{...createMethodImage(),order:index+1});
  onChange(next.map((item,itemIndex)=>({...item,order:item.order||itemIndex+1})));
 };
 return(
  <div className="mb-3">
   <label className="form-label">Method Images</label>
   {!items.length&&<div className="text-muted small mb-2">No images added.</div>}
   {items.map((item,index)=>(
    <div className="card mb-3" key={index}>
     <div className="card-body">
      <div className="row">
       <TextInput label="URL" name={`images-url-${index}`} value={item.url} onChange={e=>updateItem(index,"url",e.target.value)}/>
       <TextInput label="Alt" name={`images-alt-${index}`} value={item.alt} onChange={e=>updateItem(index,"alt",e.target.value)}/>
       <TextInput label="Order" name={`images-order-${index}`} type="number" value={item.order} onChange={e=>updateItem(index,"order",Number(e.target.value)||0)}/>
       <div className="col-md-6 mb-3">
        <label className="form-label">Type</label>
        <select className="form-select" value={item.type||"example"} onChange={e=>updateItem(index,"type",e.target.value)}>
         <option value="example">example</option>
         <option value="worksheet">worksheet</option>
         <option value="diagram">diagram</option>
         <option value="notes">notes</option>
         <option value="reference">reference</option>
        </select>
       </div>
       <div className="col-md-6 mb-3 d-flex align-items-end">
        <div className="form-check">
         <input className="form-check-input" type="checkbox" checked={!!item.isPrimary} onChange={e=>updateItem(index,"isPrimary",e.target.checked)}/>
         <label className="form-check-label">Is Primary</label>
        </div>
       </div>
      </div>
      <TextArea label="Caption" name={`images-caption-${index}`} value={item.caption} onChange={e=>updateItem(index,"caption",e.target.value)} rows={3}/>
      <ItemControls onAdd={()=>addItem(index+1)} onRemove={()=>removeItem(index)} removeLabel="Remove Image"/>
     </div>
    </div>
   ))}
   <AddAfterList onAdd={()=>addItem(items.length)} label="Image" hasItems={!!items.length}/>
  </div>
 );
}

export default function BibleStudyMethodForm({mode,methodId,initialData,isModal=false,onSaved,onCancel}={}){
 const navigate=useNavigate();
 const params=useParams();
 const resolvedId=methodId||params.id||"";
 const isEdit=mode==="edit"||!!resolvedId;
 const[form,setForm]=useState(normalizeMethodData(initialData||createInitialState()));
 const[loading,setLoading]=useState(false);
 const[saving,setSaving]=useState(false);
 const[error,setError]=useState("");
 const[activeSection,setActiveSection]=useState("foundation");
 const[categories,setCategories]=useState([]);
 const[difficulties,setDifficulties]=useState([]);
 const[methodOptions,setMethodOptions]=useState([]);

 const sections=useMemo(()=>[
  {key:"foundation",label:"Foundation"},
  {key:"process",label:"Process"},
  {key:"study",label:"Study Thinking"},
  {key:"prayer",label:"Prayer, Memory, and Journaling"},
  {key:"guardrails",label:"Guardrails"},
  {key:"example",label:"Example and Related"},
  {key:"synthesis",label:"Synthesis and Final Notes"}
 ],[]);

 useEffect(()=>{
  setForm(normalizeMethodData(initialData||createInitialState()));
 },[initialData]);

 useEffect(()=>{
  loadLookups();
 },[]);

 useEffect(()=>{
  if(isEdit&&resolvedId&&!initialData)loadMethod();
 },[isEdit,resolvedId,initialData]);

 const loadLookups=async()=>{
  try{
   const[categoryRes,difficultyRes,methodRes]=await Promise.all([
    fetch(CATEGORY_API),
    fetch(DIFFICULTY_API),
    fetch(`${API_BASE}?isMainMethod=true`)
   ]);
   const[categoryData,difficultyData,methodData]=await Promise.all([
    categoryRes.ok?categoryRes.json():Promise.resolve({data:[]}),
    difficultyRes.ok?difficultyRes.json():Promise.resolve({data:[]}),
    methodRes.ok?methodRes.json():Promise.resolve({data:[]})
   ]);
   setCategories(normalizeLookupList(categoryData));
   setDifficulties(normalizeLookupList(difficultyData));
   setMethodOptions(normalizeLookupList(methodData));
  }catch(err){
   setError(err.message||"Failed to load lookups");
  }
 };

 const refreshCategories=async()=>{
  const res=await fetch(CATEGORY_API);
  const data=res.ok?await res.json():{data:[]};
  setCategories(normalizeLookupList(data));
 };

 const refreshDifficulties=async()=>{
  const res=await fetch(DIFFICULTY_API);
  const data=res.ok?await res.json():{data:[]};
  setDifficulties(normalizeLookupList(data));
 };

 const refreshMethods=async()=>{
  const res=await fetch(`${API_BASE}?isMainMethod=true`);
  const data=res.ok?await res.json():{data:[]};
  setMethodOptions(normalizeLookupList(data));
 };

 const createCategory=async title=>{
  const res=await fetch(CATEGORY_API,{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({title,name:title,slug:slugify(title)})
  });
  const data=await res.json();
  const item=data?.data||data?.item||data;
  if(item?._id){
   await refreshCategories();
   setForm(current=>({...current,category:item._id}));
   return item;
  }
  return null;
 };

 const createDifficulty=async title=>{
  const res=await fetch(DIFFICULTY_API,{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({title,name:title,slug:slugify(title)})
  });
  const data=await res.json();
  const item=data?.data||data?.item||data;
  if(item?._id){
   await refreshDifficulties();
   setForm(current=>({...current,difficulty:item._id}));
   return item;
  }
  return null;
 };

 const createMethodOption=async title=>{
  const payload=normalizeMethodData({...createInitialState(),title,slug:slugify(title),description:title||"Method description",isMainMethod:true});
  const res=await fetch(API_BASE,{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify(payload)
  });
  const data=await res.json();
  const item=data?.data||data?.item||data;
  if(item?._id){
   await refreshMethods();
   return item;
  }
  return null;
 };

 const createMethodFamily=async title=>{
  const item=await createMethodOption(title);
  if(item?._id)setForm(current=>({...current,methodFamily:item._id}));
  return item;
 };

 const createRelatedMethod=async title=>{
  const item=await createMethodOption(title);
  if(item?._id)setForm(current=>({...current,relatedMethods:[...safeArray(current.relatedMethods),item._id]}));
  return item;
 };

 const loadMethod=async()=>{
  try{
   setLoading(true);
   setError("");
   const res=await fetch(`${API_BASE}/${resolvedId}`);
   const data=await res.json();
   setForm(normalizeMethodData(data?.data||data?.item||data));
  }catch(err){
   setError(err.message||"Failed to load method");
  }finally{
   setLoading(false);
  }
 };

 const handleInputChange=e=>{
  const{name,type,checked,value}=e.target;
  setForm(current=>{
   const next={...current,[name]:type==="checkbox"?checked:value};
   if(name==="title"&&!isEdit&&!current.slug)next.slug=slugify(value);
   return next;
  });
 };

 const handleArrayChange=e=>{
  const{name,value}=e.target;
  setForm(current=>({...current,[name]:safeArray(value)}));
 };

 const handleCollectionChange=(name,value)=>{
  setForm(current=>({...current,[name]:value}));
 };

 const handleExampleChange=e=>{
  const{name,value}=e.target;
  setForm(current=>({...current,example:{...current.example,[name]:value}}));
 };

 const handleRelatedMethodsChange=e=>{
  const values=Array.from(e.target.selectedOptions).map(option=>option.value);
  setForm(current=>({...current,relatedMethods:values}));
 };

const handleSubmit=async e=>{
 e.preventDefault();
 try{
  setSaving(true);
  setError("");
  const payload={
   ...form,
   title:form.title||"",
   slug:slugify(form.slug||form.title||""),
   description:form.description||"",
   category:form.category||null,
   difficulty:form.difficulty||null,
   methodFamily:form.methodFamily||null,
   relatedMethods:safeArray(form.relatedMethods).filter(Boolean),
   bestSetting:safeArray(form.bestSetting),
   bestUseCases:safeArray(form.bestUseCases),
   audience:safeArray(form.audience),
   bestFor:safeArray(form.bestFor),
   goals:safeArray(form.goals),
   learningOutcomes:safeArray(form.learningOutcomes),
   idealStudyContexts:safeArray(form.idealStudyContexts),
   complementaryMethods:safeArray(form.complementaryMethods),
   lessIdealFor:safeArray(form.lessIdealFor),
   requirements:safeArray(form.requirements),
   tools:safeArray(form.tools),
   requiredTools:safeArray(form.requiredTools),
   optionalTools:safeArray(form.optionalTools),
   preparationTips:safeArray(form.preparationTips),
   studyTips:safeArray(form.studyTips),
   beforeYouBegin:safeArray(form.beforeYouBegin),
   heartPosture:safeArray(form.heartPosture),
   spiritualPreparation:safeArray(form.spiritualPreparation),
   guardrails:safeArray(form.guardrails),
   variations:safeArray(form.variations),
   observationPrompts:safeArray(form.observationPrompts),
   interpretationPrompts:safeArray(form.interpretationPrompts),
   applicationPrompts:safeArray(form.applicationPrompts),
   reflectionQuestions:safeArray(form.reflectionQuestions),
   keyQuestions:safeArray(form.keyQuestions),
   observationGuide:safeArray(form.observationGuide),
   interpretationGuide:safeArray(form.interpretationGuide),
   applicationGuide:safeArray(form.applicationGuide),
   prayerFocus:safeArray(form.prayerFocus),
   prayerPoints:safeArray(form.prayerPoints),
   prayerGuide:safeArray(form.prayerGuide),
   memorizationTips:safeArray(form.memorizationTips),
   journalingPrompts:safeArray(form.journalingPrompts),
   recordFormats:safeArray(form.recordFormats),
   journalingGuidance:safeArray(form.journalingGuidance),
   strengths:safeArray(form.strengths),
   benefits:safeArray(form.benefits),
   cautions:safeArray(form.cautions),
   commonMistakes:safeArray(form.commonMistakes),
   commonMisconceptions:safeArray(form.commonMisconceptions),
   unrealisticExpectations:safeArray(form.unrealisticExpectations),
   whatNotToDo:safeArray(form.whatNotToDo),
   limitations:safeArray(form.limitations),
   soundDoctrineChecks:safeArray(form.soundDoctrineChecks),
   relatedTopics:safeArray(form.relatedTopics),
   relatedPractices:safeArray(form.relatedPractices),
   relatedScriptures:safeArray(form.relatedScriptures),
   crossReferences:safeArray(form.crossReferences),
   followUpMethods:safeArray(form.followUpMethods),
   suggestedPassages:safeArray(form.suggestedPassages),
   tags:safeArray(form.tags),
   notes:safeArray(form.notes),
   steps:safeArray(form.steps).map((item,index)=>({
    ...createStep(),
    ...item,
    title:item?.title||"",
    content:item?.content||"",
    order:Number(item?.order)||index+1
   })),
   subMethods:safeArray(form.subMethods).map((item,index)=>({
    ...createSubMethod(),
    ...item,
    title:item?.title||"",
    slug:slugify(item?.slug||item?.title||""),
    description:item?.description||"",
    purpose:item?.purpose||"",
    whenToUse:item?.whenToUse||"",
    notes:item?.notes||"",
    order:Number(item?.order)||index+1
   })),
   prayerPrompts:safeArray(form.prayerPrompts).map(item=>({
    ...createPrayerPrompt(),
    ...item,
    title:item?.title||"",
    prompt:item?.prompt||""
   })),
   interpretationPitfalls:safeArray(form.interpretationPitfalls).map(item=>({
    ...createInterpretationPitfall(),
    ...item,
    title:item?.title||"",
    description:item?.description||""
   })),
   accuracyChecks:safeArray(form.accuracyChecks).map(item=>({
    ...createAccuracyCheck(),
    ...item,
    title:item?.title||"",
    checks:safeArray(item?.checks)
   })),
   transformationMarkers:safeArray(form.transformationMarkers).map(item=>({
    ...createTransformationMarker(),
    ...item,
    category:item?.category||"",
    markers:safeArray(item?.markers)
   })),
   methodImages:safeArray(form.methodImages).filter(item=>item?.url?.trim()).map((item,index)=>({
    ...createMethodImage(),
    ...item,
    url:item.url.trim(),
    caption:item?.caption||"",
    alt:item?.alt||"",
    type:item?.type||"example",
    order:Number(item?.order)||index+1,
    isPrimary:!!item?.isPrimary
   })),
   example:{
    ...createInitialState().example,
    ...form.example,
    reference:form.example?.reference||"",
    summary:form.example?.summary||"",
    observation:form.example?.observation||"",
    interpretation:form.example?.interpretation||"",
    application:form.example?.application||"",
    prayer:form.example?.prayer||"",
    memoryVerse:form.example?.memoryVerse||"",
    journal:form.example?.journal||""
   }
  };
  const url=isEdit?`${API_BASE}/${resolvedId}`:API_BASE;
  const method=isEdit?"PUT":"POST";
  const res=await fetch(url,{
   method,
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify(payload)
  });
  const data=await res.json();
  if(!res.ok)throw new Error(data?.error||data?.message||"Failed to save method");
  if(onSaved)onSaved(data?.data||data?.item||data);
  if(!isModal)navigate("/methods/bible-study-methods");
 }catch(err){
  setError(err.message||"Failed to save method");
 }finally{
  setSaving(false);
 }
};

 if(loading)return<div className="container py-4">Loading...</div>;

 return(
  <div className={isModal?"":"container py-4"}>
   {!isModal&&<h1 className="mb-4">{isEdit?"Edit Bible Study Method":"Add Bible Study Method"}</h1>}
   {!!error&&<div className="alert alert-danger">{error}</div>}
   <form onSubmit={handleSubmit}>
    <SectionTabs tabs={sections} activeTab={activeSection} onChange={setActiveSection}/>

    {activeSection==="foundation"&&(
     <CardBlock title="Foundation">
      <div className="row">
       <TextInput label="Title" name="title" value={form.title} onChange={handleInputChange}/>
       <TextInput label="Slug" name="slug" value={form.slug} onChange={handleInputChange}/>
       <TextInput label="Subtitle" name="subtitle" value={form.subtitle} onChange={handleInputChange}/>
       <TextInput label="Icon" name="icon" value={form.icon} onChange={handleInputChange}/>
       <LookupField label="Category" name="category" value={form.category} options={categories} onChange={handleInputChange} onCreate={createCategory} onRefresh={refreshCategories}/>
       <LookupField label="Difficulty" name="difficulty" value={form.difficulty} options={difficulties} onChange={handleInputChange} onCreate={createDifficulty} onRefresh={refreshDifficulties}/>
       <TextInput label="Skill Level" name="skillLevel" value={form.skillLevel} onChange={handleInputChange}/>
       <TextInput label="Time Required" name="timeRequired" value={form.timeRequired} onChange={handleInputChange}/>
       <TextInput label="Effort Level" name="effortLevel" value={form.effortLevel} onChange={handleInputChange}/>
       <LookupField label="Method Family" name="methodFamily" value={form.methodFamily} options={methodOptions} onChange={handleInputChange} onCreate={createMethodFamily} onRefresh={refreshMethods} excludeId={resolvedId}/>
       <div className="col-md-6 mb-3 d-flex align-items-end">
        <div className="form-check">
         <input className="form-check-input" type="checkbox" name="isMainMethod" checked={!!form.isMainMethod} onChange={handleInputChange}/>
         <label className="form-check-label">Is Main Method</label>
        </div>
       </div>
      </div>
      <InlineArrayField label="Best Setting" name="bestSetting" value={form.bestSetting} onChange={handleArrayChange} placeholder="Add best setting"/>
      <TextArea label="Description" name="description" value={form.description} onChange={handleInputChange} rows={4}/>
      <TextArea label="Overview" name="overview" value={form.overview} onChange={handleInputChange} rows={4}/>
      <TextArea label="Purpose" name="purpose" value={form.purpose} onChange={handleInputChange} rows={4}/>
      <TextArea label="When To Use" name="whenToUse" value={form.whenToUse} onChange={handleInputChange} rows={4}/>
      <TextArea label="What Is This Method" name="whatIsThisMethod" value={form.whatIsThisMethod} onChange={handleInputChange} rows={4}/>
      <TextArea label="Why Use This Method" name="whyUseThisMethod" value={form.whyUseThisMethod} onChange={handleInputChange} rows={4}/>
      <TextArea label="Biblical Basis" name="biblicalBasis" value={form.biblicalBasis} onChange={handleInputChange} rows={4}/>
      <TextArea label="Hermeneutical Basis" name="hermeneuticalBasis" value={form.hermeneuticalBasis} onChange={handleInputChange} rows={4}/>
      <TextArea label="Why This Method Is Valid In Scripture" name="whyThisMethodIsValidInScripture" value={form.whyThisMethodIsValidInScripture} onChange={handleInputChange} rows={4}/>
      <InlineArrayField label="Best Use Cases" name="bestUseCases" value={form.bestUseCases} onChange={handleArrayChange} placeholder="Add use case"/>
      <TextArea label="When Not To Use" name="whenNotToUse" value={form.whenNotToUse} onChange={handleInputChange} rows={4}/>
      <TextArea label="How To Think About It" name="howToThinkAboutIt" value={form.howToThinkAboutIt} onChange={handleInputChange} rows={4}/>
      <TextArea label="Analogy" name="analogy" value={form.analogy} onChange={handleInputChange} rows={4}/>
      <TextArea label="Main Outcome" name="mainOutcome" value={form.mainOutcome} onChange={handleInputChange} rows={4}/>
      <InlineArrayField label="Audience" name="audience" value={form.audience} onChange={handleArrayChange} placeholder="Add audience"/>
      <InlineArrayField label="Best For" name="bestFor" value={form.bestFor} onChange={handleArrayChange} placeholder="Add best for"/>
      <InlineArrayField label="Goals" name="goals" value={form.goals} onChange={handleArrayChange} placeholder="Add goal"/>
      <InlineArrayField label="Learning Outcomes" name="learningOutcomes" value={form.learningOutcomes} onChange={handleArrayChange} placeholder="Add learning outcome"/>
      <InlineArrayField label="Ideal Study Contexts" name="idealStudyContexts" value={form.idealStudyContexts} onChange={handleArrayChange} placeholder="Add study context"/>
      <InlineArrayField label="Complementary Methods" name="complementaryMethods" value={form.complementaryMethods} onChange={handleArrayChange} placeholder="Add complementary method"/>
      <InlineArrayField label="Less Ideal For" name="lessIdealFor" value={form.lessIdealFor} onChange={handleArrayChange} placeholder="Add less ideal context"/>
      <SubMethodsEditor value={form.subMethods} onChange={next=>handleCollectionChange("subMethods",next)}/>
     </CardBlock>
    )}

    {activeSection==="process"&&(
     <CardBlock title="Process">
      <TextArea label="Step Overview" name="stepOverview" value={form.stepOverview} onChange={handleInputChange} rows={4}/>
      <InlineArrayField label="Requirements" name="requirements" value={form.requirements} onChange={handleArrayChange} placeholder="Add requirement"/>
      <InlineArrayField label="Tools" name="tools" value={form.tools} onChange={handleArrayChange} placeholder="Add tool"/>
      <InlineArrayField label="Required Tools" name="requiredTools" value={form.requiredTools} onChange={handleArrayChange} placeholder="Add required tool"/>
      <InlineArrayField label="Optional Tools" name="optionalTools" value={form.optionalTools} onChange={handleArrayChange} placeholder="Add optional tool"/>
      <InlineArrayField label="Preparation Tips" name="preparationTips" value={form.preparationTips} onChange={handleArrayChange} placeholder="Add preparation tip"/>
      <InlineArrayField label="Study Tips" name="studyTips" value={form.studyTips} onChange={handleArrayChange} placeholder="Add study tip"/>
      <InlineArrayField label="Before You Begin" name="beforeYouBegin" value={form.beforeYouBegin} onChange={handleArrayChange} placeholder="Add before-you-begin item"/>
      <InlineArrayField label="Heart Posture" name="heartPosture" value={form.heartPosture} onChange={handleArrayChange} placeholder="Add heart posture"/>
      <InlineArrayField label="Spiritual Preparation" name="spiritualPreparation" value={form.spiritualPreparation} onChange={handleArrayChange} placeholder="Add spiritual preparation item"/>
      <InlineArrayField label="Guardrails" name="guardrails" value={form.guardrails} onChange={handleArrayChange} placeholder="Add guardrail"/>
      <InlineArrayField label="Variations" name="variations" value={form.variations} onChange={handleArrayChange} placeholder="Add variation"/>
      <StepsEditor value={form.steps} onChange={next=>handleCollectionChange("steps",next)}/>
     </CardBlock>
    )}

    {activeSection==="study"&&(
     <CardBlock title="Study Thinking">
      <InlineArrayField label="Observation Prompts" name="observationPrompts" value={form.observationPrompts} onChange={handleArrayChange} placeholder="Add observation prompt"/>
      <InlineArrayField label="Interpretation Prompts" name="interpretationPrompts" value={form.interpretationPrompts} onChange={handleArrayChange} placeholder="Add interpretation prompt"/>
      <InlineArrayField label="Application Prompts" name="applicationPrompts" value={form.applicationPrompts} onChange={handleArrayChange} placeholder="Add application prompt"/>
      <InlineArrayField label="Reflection Questions" name="reflectionQuestions" value={form.reflectionQuestions} onChange={handleArrayChange} placeholder="Add reflection question"/>
      <InlineArrayField label="Key Questions" name="keyQuestions" value={form.keyQuestions} onChange={handleArrayChange} placeholder="Add key question"/>
      <InlineArrayField label="Observation Guide" name="observationGuide" value={form.observationGuide} onChange={handleArrayChange} placeholder="Add observation guide item"/>
      <InlineArrayField label="Interpretation Guide" name="interpretationGuide" value={form.interpretationGuide} onChange={handleArrayChange} placeholder="Add interpretation guide item"/>
      <InlineArrayField label="Application Guide" name="applicationGuide" value={form.applicationGuide} onChange={handleArrayChange} placeholder="Add application guide item"/>
      <TextArea label="Application" name="application" value={form.application} onChange={handleInputChange} rows={4}/>
      <InterpretationPitfallsEditor value={form.interpretationPitfalls} onChange={next=>handleCollectionChange("interpretationPitfalls",next)}/>
     </CardBlock>
    )}

    {activeSection==="prayer"&&(
     <>
      <CardBlock title="Prayer Response">
       <InlineArrayField label="Prayer Focus" name="prayerFocus" value={form.prayerFocus} onChange={handleArrayChange} placeholder="Add prayer focus"/>
       <InlineArrayField label="Prayer Points" name="prayerPoints" value={form.prayerPoints} onChange={handleArrayChange} placeholder="Add prayer point"/>
       <InlineArrayField label="Prayer Guide" name="prayerGuide" value={form.prayerGuide} onChange={handleArrayChange} placeholder="Add prayer guide item"/>
       <TextArea label="Prayer" name="prayer" value={form.prayer} onChange={handleInputChange} rows={4}/>
       <PrayerPromptsEditor value={form.prayerPrompts} onChange={next=>handleCollectionChange("prayerPrompts",next)}/>
      </CardBlock>
      <CardBlock title="Memorization and Journaling">
       <TextInput label="Memory Verse" name="memoryVerse" value={form.memoryVerse} onChange={handleInputChange}/>
       <InlineArrayField label="Memorization Tips" name="memorizationTips" value={form.memorizationTips} onChange={handleArrayChange} placeholder="Add memorization tip"/>
       <InlineArrayField label="Journaling Prompts" name="journalingPrompts" value={form.journalingPrompts} onChange={handleArrayChange} placeholder="Add journaling prompt"/>
       <TextArea label="Record Your Findings" name="recordYourFindings" value={form.recordYourFindings} onChange={handleInputChange} rows={4}/>
       <InlineArrayField label="Record Formats" name="recordFormats" value={form.recordFormats} onChange={handleArrayChange} placeholder="Add record format"/>
       <InlineArrayField label="Journaling Guidance" name="journalingGuidance" value={form.journalingGuidance} onChange={handleArrayChange} placeholder="Add journaling guidance"/>
      </CardBlock>
     </>
    )}

    {activeSection==="guardrails"&&(
     <>
      <CardBlock title="Guardrails">
       <InlineArrayField label="Strengths" name="strengths" value={form.strengths} onChange={handleArrayChange} placeholder="Add strength"/>
       <InlineArrayField label="Benefits" name="benefits" value={form.benefits} onChange={handleArrayChange} placeholder="Add benefit"/>
       <InlineArrayField label="Cautions" name="cautions" value={form.cautions} onChange={handleArrayChange} placeholder="Add caution"/>
       <InlineArrayField label="Common Mistakes" name="commonMistakes" value={form.commonMistakes} onChange={handleArrayChange} placeholder="Add common mistake"/>
       <InlineArrayField label="Common Misconceptions" name="commonMisconceptions" value={form.commonMisconceptions} onChange={handleArrayChange} placeholder="Add common misconception"/>
       <InlineArrayField label="Unrealistic Expectations" name="unrealisticExpectations" value={form.unrealisticExpectations} onChange={handleArrayChange} placeholder="Add unrealistic expectation"/>
       <InlineArrayField label="What Not To Do" name="whatNotToDo" value={form.whatNotToDo} onChange={handleArrayChange} placeholder="Add what-not-to-do item"/>
       <InlineArrayField label="Limitations" name="limitations" value={form.limitations} onChange={handleArrayChange} placeholder="Add limitation"/>
       <InlineArrayField label="Sound Doctrine Checks" name="soundDoctrineChecks" value={form.soundDoctrineChecks} onChange={handleArrayChange} placeholder="Add doctrine check"/>
       <AccuracyChecksEditor value={form.accuracyChecks} onChange={next=>handleCollectionChange("accuracyChecks",next)}/>
      </CardBlock>
      <CardBlock title="Growth and Discipline">
       <TextArea label="Spiritual Outcome" name="spiritualOutcome" value={form.spiritualOutcome} onChange={handleInputChange} rows={4}/>
       <TextArea label="Core Spiritual Outcome" name="coreSpiritualOutcome" value={form.coreSpiritualOutcome} onChange={handleInputChange} rows={4}/>
       <TextArea label="Discipline Reminder" name="disciplineReminder" value={form.disciplineReminder} onChange={handleInputChange} rows={4}/>
       <TransformationMarkersEditor value={form.transformationMarkers} onChange={next=>handleCollectionChange("transformationMarkers",next)}/>
      </CardBlock>
     </>
    )}

    {activeSection==="example"&&(
     <>
      <CardBlock title="Media and Related Material">
       <MethodImagesEditor value={form.methodImages} onChange={next=>handleCollectionChange("methodImages",next)}/>
       <MultiLookupField label="Related Methods" name="relatedMethods" value={form.relatedMethods} options={methodOptions} onChange={handleRelatedMethodsChange} onCreate={createRelatedMethod} onRefresh={refreshMethods} excludeId={resolvedId}/>
       <InlineArrayField label="Related Topics" name="relatedTopics" value={form.relatedTopics} onChange={handleArrayChange} placeholder="Add related topic"/>
       <InlineArrayField label="Related Practices" name="relatedPractices" value={form.relatedPractices} onChange={handleArrayChange} placeholder="Add related practice"/>
       <InlineArrayField label="Related Scriptures" name="relatedScriptures" value={form.relatedScriptures} onChange={handleArrayChange} placeholder="Add related scripture"/>
       <InlineArrayField label="Cross References" name="crossReferences" value={form.crossReferences} onChange={handleArrayChange} placeholder="Add cross reference"/>
       <InlineArrayField label="Follow Up Methods" name="followUpMethods" value={form.followUpMethods} onChange={handleArrayChange} placeholder="Add follow-up method"/>
       <InlineArrayField label="Suggested Passages" name="suggestedPassages" value={form.suggestedPassages} onChange={handleArrayChange} placeholder="Add suggested passage"/>
       <InlineArrayField label="Tags" name="tags" value={form.tags} onChange={handleArrayChange} placeholder="Add tag"/>
      </CardBlock>
      <CardBlock title="Example Demonstration">
       <div className="row">
        <TextInput label="Reference" name="reference" value={form.example.reference} onChange={handleExampleChange}/>
        <TextInput label="Memory Verse" name="memoryVerse" value={form.example.memoryVerse} onChange={handleExampleChange}/>
       </div>
       <TextArea label="Summary" name="summary" value={form.example.summary} onChange={handleExampleChange} rows={3}/>
       <TextArea label="Observation" name="observation" value={form.example.observation} onChange={handleExampleChange} rows={3}/>
       <TextArea label="Interpretation" name="interpretation" value={form.example.interpretation} onChange={handleExampleChange} rows={3}/>
       <TextArea label="Application" name="application" value={form.example.application} onChange={handleExampleChange} rows={3}/>
       <TextArea label="Prayer" name="prayer" value={form.example.prayer} onChange={handleExampleChange} rows={3}/>
       <TextArea label="Journal" name="journal" value={form.example.journal} onChange={handleExampleChange} rows={3}/>
      </CardBlock>
     </>
    )}

    {activeSection==="synthesis"&&(
     <CardBlock title="Synthesis and Final Notes">
      <TextArea label="How This Method Fits In A Complete Study System" name="howThisMethodFitsInACompleteStudySystem" value={form.howThisMethodFitsInACompleteStudySystem} onChange={handleInputChange} rows={4}/>
      <TextArea label="Role In Overall Bible Study" name="roleInOverallBibleStudy" value={form.roleInOverallBibleStudy} onChange={handleInputChange} rows={4}/>
      <InlineArrayField label="Notes" name="notes" value={form.notes} onChange={handleArrayChange} placeholder="Add note"/>
      <TextArea label="Closing" name="closing" value={form.closing} onChange={handleInputChange} rows={4}/>
      <TextArea label="Final Thought" name="finalThought" value={form.finalThought} onChange={handleInputChange} rows={4}/>
     </CardBlock>
    )}

    <div className="d-flex justify-content-end gap-2">
     {isModal&&<button type="button" className="btn btn-outline-secondary" onClick={()=>onCancel?onCancel():null} disabled={saving}>Back</button>}
     <button type="submit" className="btn btn-primary" disabled={saving}>{saving?"Saving...":isEdit?"Update Method":"Create Method"}</button>
    </div>
   </form>
  </div>
 );
}