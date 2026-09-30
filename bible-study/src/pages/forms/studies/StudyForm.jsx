import {useMemo,useState,useEffect} from "react";
import {Form,Button,Card,Row,Col,Alert,Spinner,Toast,ToastContainer} from "react-bootstrap";
import {useNavigate,useParams,useSearchParams} from "react-router-dom";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {muiDatePickerSlotProps,toDateObject,toDateValue} from "../../../utils/datePicker.js";
import bibleStudyTemplateImage from "../../../images/bible tmeplate.webp";

const builtInWorkflowTemplates=[{
 templateKey:"bible-study-summary-template",
 title:"Bible Study Summary Template",
 subtitle:"Two-page study and notes workflow",
 description:"Capture the meaning of a Bible verse, what you learned, how it applies, time for meditation, and additional notes.",
 image:bibleStudyTemplateImage,
 steps:[
  {title:"Summary",content:"What is the context of this Scripture?",order:1},
  {title:"Explanation",content:"What does it mean to you?",order:2},
  {title:"Learn",content:"What did you learn from this verse?",order:3},
  {title:"Application",content:"How can you apply this to your life?",order:4},
  {title:"Meditate",content:"Take 5-10 minutes to be silent and commune with God.",order:5},
  {title:"Notes",content:"Add any additional thoughts from today's Bible study.",order:6}
 ]
}];

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(typeof value.$oid==="string")return value.$oid;
 if(typeof value._id==="string")return value._id;
 if(typeof value.id==="string")return value.id;
 if(typeof value._id?.$oid==="string")return value._id.$oid;
 if(typeof value.id?.$oid==="string")return value.id.$oid;
 return "";
};

const getStoredUser=()=>{
 const keys=["userInfo","user","authUser","currentUser"];

 for(const key of keys){
  try{
   const raw=localStorage.getItem(key)||sessionStorage.getItem(key);
   if(!raw)continue;
   const parsed=JSON.parse(raw);
   const candidates=[parsed,parsed?.user,parsed?.data,parsed?.data?.user,parsed?.profile,parsed?.authUser];
   const match=candidates.find(value=>getObjectId(value)||value?.username||value?.email);
   if(match)return match;
  }catch(err){
   console.error(`Failed to parse stored user from ${key}`,err);
  }
 }

 return null;
};

const getStoredUserLabel=user=>{
 if(!user)return "Current user";
 return user.username||user.email||user.name||"Current user";
};

const slugify=value=>String(value||"")
 .toLowerCase()
 .trim()
 .replace(/[^a-z0-9\s-]/g,"")
 .replace(/\s+/g,"-")
 .replace(/-+/g,"-");

const buildTimeOptions=()=>{
 const options=[];
 for(let hour=0;hour<24;hour+=1){
  for(let minute=0;minute<60;minute+=15){
   const value=`${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}`;
   const labelDate=new Date(2000,0,1,hour,minute);
   options.push({
    value,
    label:labelDate.toLocaleTimeString([],{
     hour:"numeric",
     minute:"2-digit"
    })
   });
  }
 }
 return options;
};

const timeOptions=buildTimeOptions();

const splitDateTime=value=>{
 if(!value)return {date:"",time:""};
 const text=String(value);
 const dateMatch=text.match(/^(\d{4}-\d{2}-\d{2})/);
 const timeMatch=text.match(/T(\d{2}:\d{2})/);

 if(dateMatch){
  return{
   date:dateMatch[1],
   time:timeMatch?timeMatch[1]:""
  };
 }

 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return {date:"",time:""};
 const offset=date.getTimezoneOffset();
 const localDate=new Date(date.getTime()-offset*60000);
 const iso=localDate.toISOString();
 return{
  date:iso.slice(0,10),
  time:iso.slice(11,16)
 };
};

const combineDateTime=(date,time)=>{
 if(!date)return null;
 return `${date}T${time||"00:00"}`;
};

const calculateProgressPercent=form=>{
 const fields=[form.chapterStart,form.chapterEnd,form.verseStart,form.verseEnd];
 const filled=fields.filter(value=>String(value??"").trim()!=="").length;
 return Math.round((filled/fields.length)*100);
};

const defaultExplorerSections=[
 "Translations",
 "Key Observation",
 "Original Word Study",
 "Thematic Connections",
 "Cross-References",
 "Topical Links",
 "Thompson Chain Reference Connections",
 "Historical & Cultural Context",
 "Commentary Insights",
 "KJV Study Bible Perspective",
 "Life Application Emphasis",
 "Reese Chronological Bible Perspective",
 "Matthew Henry-Style Practical Insight",
 "Doctrinal Insights",
 "Application & Reflection",
 "Modern-Day Applications",
 "Journaling Prompts",
 "Prayer Points",
 "Meditation Idea",
 "Memorization Helps",
 "Key Verse",
 "Memory Cue",
 "Keyword Cues",
 "Memory Breakdown",
 "Memory Phrase",
 "Visual Aid",
 "Keyword Chain",
 "Contrast to Remember",
 "Memory Prayer"
];

const originalWordStudyTitle="Original Word Study";
const greekWordStudyTitle="Greek Word Study";
const hebrewWordStudyTitle="Hebrew Word Study";
const crossReferencesTitle="Cross-References";
const directVerseCrossRefsTitle="Direct Verse Cross-Refs";
const translationsTitle="Translations";
const keyObservationTitle="Key Observation";
const topicalLinksTitle="Topical Links";
const thompsonConnectionsTitle="Thompson Chain Reference Connections";
const originalWordStudyFields=["overview","greek","hebrew"];
const originalWordStudyLabels={
 overview:"Overview",
 greek:"Greek",
 hebrew:"Hebrew"
};
const missingLanguageNotes={
 greek:"No Greek word study was captured for this passage.",
 hebrew:"No Hebrew word study was captured for this passage."
};

const createExplorerSections=()=>defaultExplorerSections.map((title,index)=>({
 title,
 content:"",
 order:index+1
}));

const parseOriginalWordStudyContent=content=>{
 const result={
  overview:"",
  greek:"",
  hebrew:""
 };
 let activeField="overview";

 String(content||"").split(/\r?\n/).forEach(line=>{
  const trimmed=line.trim();
  const heading=trimmed.replace(/:$/,"").toLowerCase();

  if(heading==="overview"){
   activeField="overview";
   return;
  }

  if(heading==="greek"){
   activeField="greek";
   return;
  }

  if(heading==="hebrew"){
   activeField="hebrew";
   return;
  }

  result[activeField]=result[activeField]?`${result[activeField]}\n${line}`:line;
 });

 return result;
};

const hasOriginalWordStudyMarkers=content=>/^(Overview|Greek|Hebrew):?$/im.test(String(content||""));

const buildOriginalWordStudyContent=fields=>{
 const hasGreek=String(fields.greek||"").trim();
 const hasHebrew=String(fields.hebrew||"").trim();
 const nextFields={
  overview:fields.overview||"",
  greek:hasGreek?fields.greek:hasHebrew?missingLanguageNotes.greek:"",
  hebrew:hasHebrew?fields.hebrew:hasGreek?missingLanguageNotes.hebrew:""
 };

 return originalWordStudyFields
  .map(field=>`${originalWordStudyLabels[field]}:\n${nextFields[field]||""}`.trimEnd())
  .join("\n\n");
};

const normalizeExplorerSections=sections=>{
 const sourceSections=Array.isArray(sections)?sections:[];
 const mergedSections=[];
 const originalFields={
  overview:"",
  greek:"",
  hebrew:""
 };
 let hasOriginalWordStudy=false;

 sourceSections.forEach((section,index)=>{
  const title=section.title||defaultExplorerSections[index]||`Section ${index+1}`;
  const content=section.content||"";

  if(title===originalWordStudyTitle){
   hasOriginalWordStudy=true;
   const parsed=parseOriginalWordStudyContent(content);
   originalFields.overview=parsed.overview||(!hasOriginalWordStudyMarkers(content)?content:"")||originalFields.overview;
   originalFields.greek=parsed.greek||originalFields.greek;
   originalFields.hebrew=parsed.hebrew||originalFields.hebrew;
   return;
  }

  if(title===greekWordStudyTitle){
   hasOriginalWordStudy=true;
   originalFields.greek=content||originalFields.greek;
   return;
  }

  if(title===hebrewWordStudyTitle){
   hasOriginalWordStudy=true;
   originalFields.hebrew=content||originalFields.hebrew;
   return;
  }

  if(title===directVerseCrossRefsTitle){
   const existingCrossReferences=mergedSections.find(item=>item.title===crossReferencesTitle);
   if(existingCrossReferences){
    existingCrossReferences.content=[existingCrossReferences.content,content].filter(Boolean).join("\n");
   }else{
    mergedSections.push({
     title:crossReferencesTitle,
     content,
     order:mergedSections.length+1
    });
   }
   return;
  }

  mergedSections.push({
   title,
   content,
   order:mergedSections.length+1
  });
 });

 const sectionsByTitle=new Map(mergedSections.map(section=>[section.title,section]));
 const normalized=defaultExplorerSections.map((title,index)=>{
  if(title===originalWordStudyTitle){
   return{
    title,
    content:hasOriginalWordStudy?buildOriginalWordStudyContent(originalFields):"",
    order:index+1
   };
  }

  const savedSection=sectionsByTitle.get(title);
  return{
   title,
   content:savedSection?.content||"",
   order:index+1
  };
 });

 mergedSections.forEach(section=>{
  if(!defaultExplorerSections.includes(section.title)){
   normalized.push({
    title:section.title,
    content:section.content||"",
    order:normalized.length+1
   });
  }
 });

 return normalized.map((section,index)=>({
  ...section,
  order:index+1
 }));
};

const normalizeScriptureExplorer=value=>({
 reference:value?.reference||"",
 passageText:value?.passageText||"",
 sections:Array.isArray(value?.sections)&&value.sections.length
  ?normalizeExplorerSections(value.sections)
  :createExplorerSections()
});

const cleanExplorerHeading=value=>String(value||"")
 .replace(/^[^A-Za-z0-9]+/,"")
 .trim();

const normalizeExplorerHeadingKey=value=>cleanExplorerHeading(value)
 .replace(/[:：]\s*$/,"")
 .replace(/[’']/g,"")
 .replace(/&/g,"and")
 .replace(/[^a-zA-Z0-9]+/g," ")
 .trim()
 .toLowerCase();

const scriptureReferencePattern=/\b(?:[1-3]\s*)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+\d{1,3}:\d{1,3}(?:[-–]\d{1,3})?\b/;

const explorerSectionAliases={
 translations:translationsTitle,
 translation:translationsTitle,
 "key observation":keyObservationTitle,
 "original word study":originalWordStudyTitle,
 "original language study":originalWordStudyTitle,
 "greek word study":greekWordStudyTitle,
 greek:greekWordStudyTitle,
 "hebrew word study":hebrewWordStudyTitle,
 hebrew:hebrewWordStudyTitle,
 "thematic connections":"Thematic Connections",
 "naves topical bible themes":"Thematic Connections",
 "nave topical bible themes":"Thematic Connections",
 "cross references":crossReferencesTitle,
 "direct verse cross references":crossReferencesTitle,
 "direct verse cross refs":crossReferencesTitle,
 "topical links":topicalLinksTitle,
 "thompson chain reference system":thompsonConnectionsTitle,
 "thompson chain reference themes":thompsonConnectionsTitle,
 "thompson chain reference connections":thompsonConnectionsTitle,
 "historical and cultural context":"Historical & Cultural Context",
 "historical cultural context":"Historical & Cultural Context",
 "commentary insights":"Commentary Insights",
 "kjv study bible perspective":"KJV Study Bible Perspective",
 "kjv study bible traditional evangelical emphasis":"KJV Study Bible Perspective",
 "life application emphasis":"Life Application Emphasis",
 "life application study bible emphasis":"Life Application Emphasis",
 "reese chronological bible perspective":"Reese Chronological Bible Perspective",
 "reese chronological bible connection":"Reese Chronological Bible Perspective",
 "matthew henry style practical insight":"Matthew Henry-Style Practical Insight",
 "doctrinal insight":"Doctrinal Insights",
 "doctrinal insights":"Doctrinal Insights",
 "application and reflection":"Application & Reflection",
 "modern day applications":"Modern-Day Applications",
 "journaling prompts":"Journaling Prompts",
 "prayer points":"Prayer Points",
 "meditation idea":"Meditation Idea",
 "memorization helps":"Memorization Helps",
 "keyword cues":"Keyword Cues",
 "key verse":"Key Verse",
 "memory cue":"Memory Cue",
 "memory breakdown":"Memory Breakdown",
 "simple memory phrase":"Memory Phrase",
 "memory phrase":"Memory Phrase",
 "visual aid":"Visual Aid",
 "keyword chain":"Keyword Chain",
 "contrast to remember":"Contrast to Remember",
 "memory prayer":"Memory Prayer"
};

const getExplorerSectionTitle=line=>{
 const heading=cleanExplorerHeading(line);
 const key=normalizeExplorerHeadingKey(heading);
 return explorerSectionAliases[key]||defaultExplorerSections.find(title=>normalizeExplorerHeadingKey(title)===key)||"";
};

const splitLabeledExplorerLine=line=>{
 const match=String(line||"").match(/^([^:：]{2,80})[:：]\s*(.*)$/);
 if(!match)return null;
 const title=getExplorerSectionTitle(match[1]);
 if(!title)return null;
 return{
  title,
  content:match[2]||""
 };
};

const extractExplorerReference=lines=>{
 const mainTextLine=lines.find(line=>/^main text\s*:/i.test(cleanExplorerHeading(line)));
 if(mainTextLine)return mainTextLine.replace(/^.*?main text\s*:\s*/i,"").trim();

 const verseTitleLine=lines.find(line=>/^verse title\s*:/i.test(cleanExplorerHeading(line)));
 const referenceMatch=(verseTitleLine||lines.find(Boolean)||"").match(scriptureReferencePattern);
 return referenceMatch?referenceMatch[0]:cleanExplorerHeading(lines.find(Boolean)||"");
};

const getPassageTextFromLines=lines=>{
 const kjvIndex=lines.findIndex(line=>normalizeExplorerHeadingKey(line)==="kjv");
 if(kjvIndex>=0){
  const nextQuotedLine=lines.slice(kjvIndex+1).find(line=>/^["“]/.test(line));
  if(nextQuotedLine)return nextQuotedLine;
 }

 return lines.find(line=>/^["“]/.test(line))||"";
};

const parseScriptureExplorerOutput=rawOutput=>{
 const lines=String(rawOutput||"").split(/\r?\n/).map(line=>line.trim());
 const reference=extractExplorerReference(lines);
 const quoteLine=getPassageTextFromLines(lines);
 const sections=[];
 let currentSection=null;
 let originalWordStudyFieldsValue={
  overview:"",
  greek:"",
  hebrew:""
 };
 let currentOriginalWordStudyField="overview";
 const createSection=title=>{
  const existingSection=sections.find(section=>section.title===title);
  if(existingSection){
   currentSection=existingSection;
   return;
  }

  currentSection={
   title,
   content:"",
   order:sections.length+1
  };
  sections.push(currentSection);
 };
 const ensureOriginalWordStudySection=()=>{
  let section=sections.find(item=>item.title===originalWordStudyTitle);
  if(!section){
   section={
    title:originalWordStudyTitle,
    content:"",
    order:sections.length+1
   };
   sections.push(section);
  }
  currentSection=section;
  return section;
 };
 const appendOriginalWordStudyLine=line=>{
  originalWordStudyFieldsValue[currentOriginalWordStudyField]=originalWordStudyFieldsValue[currentOriginalWordStudyField]
   ?`${originalWordStudyFieldsValue[currentOriginalWordStudyField]}\n${line}`
   :line;
 };
 const appendSectionLine=line=>{
  if(!currentSection){
   createSection(translationsTitle);
  }

  currentSection.content=currentSection.content?`${currentSection.content}\n${line}`:line;
 };

 lines.forEach(line=>{
  if(!line)return;
  const heading=cleanExplorerHeading(line);
  const headingKey=normalizeExplorerHeadingKey(heading);

  if(/^main text\s*:/i.test(heading)||/^verse title\s*:/i.test(heading)){
   return;
  }

  const labeledLine=splitLabeledExplorerLine(line);
  if(labeledLine){
   if(labeledLine.title===originalWordStudyTitle){
    ensureOriginalWordStudySection();
    currentOriginalWordStudyField=/[\u0590-\u05ff]/.test(labeledLine.content)?"hebrew":"overview";
    if(labeledLine.content)appendOriginalWordStudyLine(labeledLine.content);
    return;
   }

   if(labeledLine.title===greekWordStudyTitle||labeledLine.title===hebrewWordStudyTitle){
    ensureOriginalWordStudySection();
    currentOriginalWordStudyField=labeledLine.title===greekWordStudyTitle?"greek":"hebrew";
    if(labeledLine.content)appendOriginalWordStudyLine(labeledLine.content);
    return;
   }

   createSection(labeledLine.title);
   if(labeledLine.content)appendSectionLine(labeledLine.content);
   return;
  }

  if(headingKey===normalizeExplorerHeadingKey(originalWordStudyTitle)){
   ensureOriginalWordStudySection();
   currentOriginalWordStudyField="overview";
   return;
  }

  if(headingKey===normalizeExplorerHeadingKey(greekWordStudyTitle)||headingKey==="greek"){
   ensureOriginalWordStudySection();
   currentOriginalWordStudyField="greek";
   return;
  }

  if(headingKey===normalizeExplorerHeadingKey(hebrewWordStudyTitle)||headingKey==="hebrew"){
   ensureOriginalWordStudySection();
   currentOriginalWordStudyField="hebrew";
   return;
  }

  if(/greek text reads|key words/i.test(line)){
   ensureOriginalWordStudySection();
   currentOriginalWordStudyField="greek";
   appendOriginalWordStudyLine(line);
   return;
  }

  if(currentSection?.title===originalWordStudyTitle&&/[\u0590-\u05ff]/.test(line)){
   currentOriginalWordStudyField="hebrew";
  }

  if(/hebrew text reads|hebrew words|hebrew word study/i.test(line)){
   ensureOriginalWordStudySection();
   currentOriginalWordStudyField="hebrew";
   appendOriginalWordStudyLine(line);
   return;
  }

  const sectionTitle=getExplorerSectionTitle(heading);
  if(sectionTitle){
   if(sectionTitle===greekWordStudyTitle||sectionTitle===hebrewWordStudyTitle){
    ensureOriginalWordStudySection();
    currentOriginalWordStudyField=sectionTitle===greekWordStudyTitle?"greek":"hebrew";
    return;
   }
   createSection(sectionTitle===originalWordStudyTitle?originalWordStudyTitle:sectionTitle);
   return;
  }

  if(!currentSection&&/^(kjv|1611 kjv|nkjv|amp|nlt|ylt)$/i.test(heading)){
   createSection(translationsTitle);
  }

  if(currentSection?.title===originalWordStudyTitle){
   appendOriginalWordStudyLine(line);
   return;
  }

  appendSectionLine(line);
 });

 const originalWordStudySection=sections.find(section=>section.title===originalWordStudyTitle);
 if(originalWordStudySection){
  originalWordStudySection.content=buildOriginalWordStudyContent(originalWordStudyFieldsValue);
 }

 return{
  reference,
  passageText:quoteLine,
  sections:sections.length?normalizeExplorerSections(sections):createExplorerSections()
 };
};

const emptyForm=()=>({
 user:getObjectId(getStoredUser()),
 methods:[],
 methodWorkspaces:[],
 scriptureExplorer:normalizeScriptureExplorer(),
 title:"",
 slug:"",
 subtitle:"",
 description:"",
 reference:"",
 book:"",
 chapterStart:"",
 chapterEnd:"",
 verseStart:"",
 verseEnd:"",
 section:"",
 category:"",
 difficulty:"",
 progress:"",
 progressPercent:0,
 health:0,
 issues:0,
 status:"",
 startedDate:"",
 startedTime:"",
 completedDate:"",
 completedTime:"",
 tags:"",
 notes:"",
 active:true,
 featured:false
});

const getMethodQuestions=method=>{
 return [
  ...(method.keyQuestions||[]),
  ...(method.reflectionQuestions||[]),
  ...(method.observationPrompts||[]),
  ...(method.interpretationPrompts||[]),
  ...(method.applicationPrompts||[]),
  ...(method.journalingPrompts||[])
 ].filter(Boolean);
};

const getTemplateId=template=>{
 if(template?.templateKey)return `template:${template.templateKey}`;
 return getObjectId(template);
};

const getWorkspaceId=(workspace,index=0)=>{
 if(!workspace)return "";
 if(workspace?.templateKey)return `template:${workspace.templateKey}`;
 return getObjectId(workspace?.method)||`${workspace?.title||"workspace"}-${index}`;
};

const buildMethodWorkspace=method=>{
 const sections=[];
 const addSection=(label,prompt,type="field")=>{
  const cleanLabel=String(label||"").trim();
  const cleanPrompt=String(prompt||"").trim();
  if(!cleanLabel&&!cleanPrompt)return;
  sections.push({
   label:cleanLabel||`Section ${sections.length+1}`,
   prompt:cleanPrompt,
   response:"",
   type,
   order:sections.length+1
  });
 };

 if(Array.isArray(method.steps)&&method.steps.length){
  method.steps
   .slice()
   .sort((a,b)=>(a.order||0)-(b.order||0))
   .forEach((step,index)=>{
    addSection(step.title||`Step ${index+1}`,step.content||"", "step");
   });
 }

 const promptGroups=[
  ["Observation",method.observationPrompts],
  ["Interpretation",method.interpretationPrompts],
  ["Application",method.applicationPrompts],
  ["Reflection",method.reflectionQuestions],
  ["Key Question",method.keyQuestions],
  ["Journal",method.journalingPrompts],
  ["Prayer",Array.isArray(method.prayerPrompts)?method.prayerPrompts.map(item=>item.prompt||item.title):[]]
 ];

 promptGroups.forEach(([label,items])=>{
  if(!Array.isArray(items))return;
  items.filter(Boolean).forEach((item,index)=>{
   addSection(`${label} ${index+1}`,item,"prompt");
  });
 });

 if(!sections.length){
  addSection("Study Notes",method.purpose||method.description||method.overview||"Use this space to work through the selected method.","field");
 }

 return{
  method:getObjectId(method),
  templateKey:method.templateKey||"",
  title:method.title||"Selected Method",
  description:method.purpose||method.description||method.overview||"",
  sections
 };
};

const splitNotes=value=>{
 const text=String(value||"").trim();
 if(!text)return [];
 return text.split(/\r?\n/).map(note=>note.trim()).filter(Boolean);
};

const normalizeList=payload=>{
 if(Array.isArray(payload))return payload;
 if(Array.isArray(payload?.data))return payload.data;
 if(Array.isArray(payload?.items))return payload.items;
 if(Array.isArray(payload?.results))return payload.results;
 if(Array.isArray(payload?.studies))return payload.studies;
 return [];
};

const mergeStudies=(items,item)=>{
 const list=normalizeList(items);
 const current=item?.data||item?.study||item;
 if(!current?._id)return list;
 if(list.some(study=>String(study._id)===String(current._id)))return list;
 return [current,...list];
};

const mergeStudyLists=(...lists)=>{
 const map=new Map();
 lists.flatMap(normalizeList).forEach(study=>{
  if(!study?._id)return;
  map.set(String(study._id),study);
 });
 return [...map.values()];
};

const getStudyLabel=study=>{
 if(!study)return "Untitled study";
 return study.title||study.reference||study.slug||study.book||"Untitled study";
};

const getStudyStatusLabel=study=>{
 if(!study?.status)return "-";
 if(typeof study.status==="string")return study.status;
 return study.status.title||study.status.name||"-";
};

const getStudyFieldLabel=value=>{
 if(!value)return "-";
 if(typeof value==="string")return value;
 return value.title||value.name||value.label||value.slug||"-";
};

const normalizeFilterValue=value=>String(value||"").trim().toLowerCase();

const getLookupFilterValue=value=>{
 const id=getObjectId(value);
 if(id)return id;
 return normalizeFilterValue(getStudyFieldLabel(value));
};

const getStudyReference=study=>study?.reference||study?.scriptureExplorer?.reference||"-";

const getStudyActiveLabel=study=>{
 if(study?.completedAt)return "Completed";
 if(study?.active===false)return "Inactive";
 return "Active";
};

const matchesLookupFilter=(value,filterValue)=>{
 if(filterValue==="all")return true;
 return getLookupFilterValue(value)===filterValue;
};

const formatStudyDate=value=>{
 if(!value)return "-";
 const text=String(value);
 const dateOnly=text.match(/^(\d{4})-(\d{2})-(\d{2})/);
 if(dateOnly)return `${dateOnly[2]}/${dateOnly[3]}/${dateOnly[1]}`;
 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return "-";
 return date.toLocaleDateString("en-US",{
  month:"2-digit",
  day:"2-digit",
  year:"numeric"
 });
};

const formatStudyTime=value=>{
 if(!value)return "";
 const match=String(value).match(/^(\d{2}):(\d{2})/);
 if(!match)return String(value);
 const date=new Date(2000,0,1,Number(match[1]),Number(match[2]));
 return date.toLocaleTimeString("en-US",{
  hour:"numeric",
  minute:"2-digit"
 });
};

const formatStudyDateTime=(date,time)=>[
 formatStudyDate(date),
 formatStudyTime(time)
].filter(value=>value&&value!=="-").join(" ");

const hasPrintText=value=>String(value??"").trim()!=="";

function StudyPrintSection({title,children}){
 if(!children)return null;
 return(
  <section className="study-print-section">
   <h3>{title}</h3>
   {children}
  </section>
 );
}

function StudyPrintText({title,text}){
 if(!hasPrintText(text))return null;
 return(
  <StudyPrintSection title={title}>
   <p>{text}</p>
  </StudyPrintSection>
 );
}

const printPageLineLimit=58;
const printTextLineLength=94;
const printMinimumCarryLines=6;

const getPrintLineCount=text=>String(text||"")
 .split(/\r?\n/)
 .reduce((total,line)=>total+Math.max(1,Math.ceil(line.length/printTextLineLength)),0);

const takePrintTextChunk=(text,maxLines)=>{
 const lines=String(text||"").split(/\r?\n/);
 const limit=Math.max(1,maxLines);
 const chunk=[];
 let lineCountTotal=0;
 let consumedLines=0;

 for(const line of lines){
  const lineCount=Math.max(1,Math.ceil(line.length/printTextLineLength));
  if(chunk.length&&lineCountTotal+lineCount>limit)break;

  chunk.push(line);
  lineCountTotal+=lineCount;
  consumedLines+=1;

  if(lineCountTotal>=limit)break;
 }

 return{
  text:chunk.join("\n"),
  rest:lines.slice(consumedLines).join("\n"),
  lines:lineCountTotal
 };
};

const paginatePrintBlocks=blocks=>{
 const pages=[];
 let currentPage=[];
 let currentLines=0;

 const pushPage=()=>{
  if(currentPage.length){
   pages.push(currentPage);
   currentPage=[];
   currentLines=0;
  }
 };

 blocks.forEach(block=>{
  const headingLines=block.headingLines||1;
  const blockLines=headingLines+getPrintLineCount(block.text);

  if(blockLines>printPageLineLimit){
   let remainingText=String(block.text||"");
   let chunkIndex=0;

   while(hasPrintText(remainingText)){
    let availableTextLines=printPageLineLimit-currentLines-headingLines;

    if(currentPage.length&&availableTextLines<printMinimumCarryLines){
     pushPage();
     availableTextLines=printPageLineLimit-headingLines;
    }

    const chunk=takePrintTextChunk(remainingText,availableTextLines);
    const chunkBlock={
     ...block,
     title:chunkIndex===0?block.title:`${block.title} continued`,
     text:chunk.text
    };

    currentPage.push(chunkBlock);
    currentLines+=headingLines+chunk.lines;
    remainingText=chunk.rest;
    chunkIndex+=1;

    if(hasPrintText(remainingText)&&currentLines>=printPageLineLimit-printMinimumCarryLines){
     pushPage();
    }
   }
   return;
  }

  if(currentPage.length&&currentLines+blockLines>printPageLineLimit){
   pushPage();
  }

  currentPage.push(block);
  currentLines+=blockLines;
 });

 pushPage();
 return pages;
};

const getPrintableMethodScopes=study=>(study.methodWorkspaces||[])
 .map((workspace,index)=>({
  id:getWorkspaceId(workspace,index),
  label:workspace.title||`Method ${index+1}`,
  description:workspace.description||"",
  sections:(workspace.sections||[]).filter(section=>hasPrintText(section.response))
 }))
 .filter(workspace=>hasPrintText(workspace.description)||workspace.sections.length);

function StudyPrintPage({study,metaLines,blocks,pageNumber,totalPages}){
 return(
  <article className="study-print-sheet">
   <header className="study-print-header">
    <div>
     <h1>{study.title||"Untitled Study"}</h1>
     {pageNumber===1&&hasPrintText(study.subtitle)?<p>{study.subtitle}</p>:null}
    </div>
    <span>Page {pageNumber} of {totalPages}</span>
   </header>

   {pageNumber===1&&metaLines.length?(
    <div className="study-print-meta">
     {metaLines.map((line,index)=><p key={index}><strong>{line.label}:</strong> {line.value}</p>)}
    </div>
   ):null}

   {blocks.map((block,index)=>(
    <StudyPrintText key={`${block.title}-${index}`} title={block.title} text={block.text}/>
   ))}
  </article>
 );
}

function StudyPrintDocument({study,scope="study"}){
 const scriptureExplorer=normalizeScriptureExplorer(study.scriptureExplorer);
 const visibleExplorerSections=scriptureExplorer.sections.filter(section=>hasPrintText(section.content));
 const visibleWorkspaces=getPrintableMethodScopes(study);
 const selectedWorkspace=scope==="study"?null:visibleWorkspaces.find(workspace=>String(workspace.id)===String(scope));
 const notes=splitNotes(study.notes);
 const tags=Array.isArray(study.tags)?study.tags:String(study.tags||"").split(",");
 const studyMetaLines=[
  hasPrintText(study.reference)?{label:"Reference",value:study.reference}:null,
  hasPrintText(scriptureExplorer.reference)?{label:"Explorer Reference",value:scriptureExplorer.reference}:null,
  hasPrintText(study.book)?{label:"Book",value:study.book}:null,
  hasPrintText(study.section)?{label:"Section",value:study.section}:null,
  hasPrintText(study.progress)?{label:"Progress",value:study.progress}:null
 ].filter(Boolean);
 const methodMetaLines=[
  hasPrintText(study.title)?{label:"Study",value:study.title}:null,
  hasPrintText(study.reference)?{label:"Reference",value:study.reference}:null,
  selectedWorkspace?{label:"Method",value:selectedWorkspace.label}:null
 ].filter(Boolean);
 const studyBlocks=[
  hasPrintText(study.description)?{title:"Description",text:study.description}:null,
  hasPrintText(scriptureExplorer.passageText)?{title:"Passage Text",text:scriptureExplorer.passageText}:null,
  ...visibleExplorerSections.map(section=>({title:section.title,text:section.content})),
  ...visibleWorkspaces.flatMap((workspace,index)=>[
   hasPrintText(workspace.description)?{title:workspace.label||`Method ${index+1}`,text:workspace.description}:null,
   ...workspace.sections.map(section=>({title:`${workspace.label||`Method ${index+1}`} - ${section.label}`,text:section.response}))
  ]).filter(Boolean),
  tags.map(tag=>String(tag||"").trim()).filter(Boolean).length?{title:"Tags",text:tags.map(tag=>String(tag||"").trim()).filter(Boolean).join("\n")}:null,
  notes.length?{title:"Notes",text:notes.join("\n")}:null
 ].filter(Boolean);
 const methodBlocks=selectedWorkspace?[
  hasPrintText(selectedWorkspace.description)?{title:"Method Summary",text:selectedWorkspace.description}:null,
  ...selectedWorkspace.sections.map(section=>({title:section.label,text:section.response}))
 ].filter(Boolean):[];
 const printStudy=selectedWorkspace?{
  ...study,
  title:selectedWorkspace.label,
  subtitle:study.title||""
 }:study;
 const metaLines=selectedWorkspace?methodMetaLines:studyMetaLines;
 const blocks=selectedWorkspace?methodBlocks:studyBlocks;
 const pages=paginatePrintBlocks(blocks);

 return(
  <>
   {pages.map((page,index)=>(
    <StudyPrintPage
     key={index}
     study={printStudy}
     metaLines={metaLines}
     blocks={page}
     pageNumber={index+1}
     totalPages={pages.length}
    />
   ))}
  </>
 );
}

function StudyTextBlock({title,children}){
 if(!children)return null;
 return(
  <section className="study-read-section">
   <h3>{title}</h3>
   {children}
  </section>
 );
}

function StudyTextValue({title,value}){
 if(!hasPrintText(value))return null;
 return(
  <StudyTextBlock title={title}>
   <StudyTextContent value={value}/>
  </StudyTextBlock>
 );
}

function StudyTextContent({value}){
 const lines=String(value||"").split(/\r?\n/);
 return(
  <>
   {lines.map((line,index)=>line.trim()?(
    <p key={index}>{line}</p>
   ):(
    <br key={index}/>
   ))}
  </>
 );
}

const findLookupLabel=(items,id)=>{
 const match=items.find(item=>String(getObjectId(item))===String(id));
 return getStudyFieldLabel(match||id);
};

function StudyForm(){

 const navigate=useNavigate();
 const {id}=useParams();
 const [searchParams]=useSearchParams();
 const isEdit=Boolean(id);
 const isCreateMode=searchParams.get("mode")==="create";
 const isFormEditMode=searchParams.get("edit")==="true";
 const returnToDashboard=searchParams.get("from")==="dashboard";
 const showStudyList=!isEdit&&!isCreateMode;
 const showStudyReadView=isEdit&&!isFormEditMode;

 const [form,setForm]=useState(()=>emptyForm());
 const [studies,setStudies]=useState([]);
 const [users,setUsers]=useState([]);
 const [methods,setMethods]=useState([]);
 const [categories,setCategories]=useState([]);
 const [difficulties,setDifficulties]=useState([]);
 const [statuses,setStatuses]=useState([]);

 const [loading,setLoading]=useState(false);
 const [loadingData,setLoadingData]=useState(true);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [methodDrawerOpen,setMethodDrawerOpen]=useState(false);
 const [methodToApply,setMethodToApply]=useState("");
 const [activeFormTab,setActiveFormTab]=useState("study");
 const [activeReadTab,setActiveReadTab]=useState("study");
 const [activeReadExplorerSection,setActiveReadExplorerSection]=useState("");
 const [activeReadMethod,setActiveReadMethod]=useState("");
 const [activeMethodWorkspace,setActiveMethodWorkspace]=useState("");
 const [rawScriptureExplorerOutput,setRawScriptureExplorerOutput]=useState("");
 const [showPrintPreview,setShowPrintPreview]=useState(false);
 const [printScope,setPrintScope]=useState("study");
 const [studyFilters,setStudyFilters]=useState({
  query:"",
  status:"all",
  activeState:"all",
  category:"all",
  difficulty:"all"
 });

 const availableTemplates=useMemo(()=>[...builtInWorkflowTemplates,...methods],[methods]);

 const selectedMethodDetails=useMemo(()=>{
  if(!methodToApply)return [];
  return availableTemplates.filter(method=>String(getTemplateId(method))===String(methodToApply));
 },[availableTemplates,methodToApply]);

 const calculatedProgressPercent=calculateProgressPercent(form);
 const activeMethodWorkspaceId=activeMethodWorkspace||getWorkspaceId(form.methodWorkspaces[0]);
 const activeWorkspaceIndex=form.methodWorkspaces.findIndex((workspace,index)=>String(getWorkspaceId(workspace,index))===String(activeMethodWorkspaceId));
 const activeWorkspace=activeWorkspaceIndex>=0?form.methodWorkspaces[activeWorkspaceIndex]:null;
 const printableMethodScopes=useMemo(()=>getPrintableMethodScopes({methodWorkspaces:form.methodWorkspaces}),[form.methodWorkspaces]);
 const activePrintScope=printScope==="study"||printableMethodScopes.some(scope=>String(scope.id)===String(printScope))
  ?printScope
  :"study";
 const studyViewUrl=isEdit?`/studies/${id}${returnToDashboard?"?from=dashboard":""}`:"/studies";
 const filteredStudies=useMemo(()=>{
  const query=normalizeFilterValue(studyFilters.query);

  return [...studies]
   .filter(study=>{
    if(query){
     const searchable=[
      getStudyLabel(study),
      getStudyReference(study),
      getStudyStatusLabel(study),
      getStudyFieldLabel(study.category),
      getStudyFieldLabel(study.difficulty),
      study.book,
      study.section,
      Array.isArray(study.tags)?study.tags.join(" "):study.tags
     ].map(value=>String(value||"").toLowerCase()).join(" ");

     if(!searchable.includes(query))return false;
    }

    if(!matchesLookupFilter(study.status,studyFilters.status))return false;
    if(!matchesLookupFilter(study.category,studyFilters.category))return false;
    if(!matchesLookupFilter(study.difficulty,studyFilters.difficulty))return false;

    if(studyFilters.activeState==="active"&&study.active===false)return false;
    if(studyFilters.activeState==="inactive"&&study.active!==false)return false;
    if(studyFilters.activeState==="completed"&&!study.completedAt)return false;
    if(studyFilters.activeState==="featured"&&!study.featured)return false;

    return true;
   })
   .sort((a,b)=>new Date(b.updatedAt||b.createdAt||0)-new Date(a.updatedAt||a.createdAt||0));
 },[studies,studyFilters]);

 const handleStudyFilterChange=event=>{
  const {name,value}=event.target;
  setStudyFilters(prev=>({
   ...prev,
   [name]:value
  }));
 };

 const resetStudyFilters=()=>{
  setStudyFilters({
   query:"",
   status:"all",
   activeState:"all",
   category:"all",
   difficulty:"all"
  });
 };

 useEffect(()=>{
  if(!showPrintPreview)return undefined;

  document.body.classList.add("study-print-preview-active");

  return()=>{
   document.body.classList.remove("study-print-preview-active");
  };
 },[showPrintPreview]);

 useEffect(()=>{
  let isMounted=true;

  const loadData=async()=>{
   try{
    setLoadingData(true);
    setError("");

    const storedUser=getStoredUser();
    const storedUserId=getObjectId(storedUser);

    const [studiesRes,userStudiesRes,methodsRes,categoriesRes,difficultiesRes,statusesRes,itemRes]=await Promise.all([
     fetch("/api/studies"),
     storedUserId?fetch(`/api/studies?user=${encodeURIComponent(storedUserId)}`):Promise.resolve(null),
     fetch("/api/methods"),
     fetch("/api/lookups/study-categories"),
     fetch("/api/lookups/difficulty-levels"),
     fetch("/api/lookups/statuses"),
     isEdit?fetch(`/api/studies/${id}`):Promise.resolve(null)
    ]);

    const [usersData,studiesData,userStudiesData,methodsData,categoriesData,difficultiesData,statusesData,itemData]=await Promise.all([
     fetch("/api/users").then(res=>res.ok?res.json():{data:[]}).catch(()=>({data:[]})),
     studiesRes.ok?studiesRes.json():Promise.resolve({data:[]}),
     userStudiesRes?userStudiesRes.ok?userStudiesRes.json():Promise.resolve({data:[]}):Promise.resolve({data:[]}),
     methodsRes.json(),
     categoriesRes.json(),
     difficultiesRes.json(),
     statusesRes.json(),
     itemRes?itemRes.json():Promise.resolve(null)
    ]);

    if(!isMounted)return;

    const fetchedUsers=Array.isArray(usersData.data)?usersData.data:[];
    const visibleUsers=fetchedUsers.length?fetchedUsers:(storedUserId?[storedUser]:[]);
    const mergedStudies=mergeStudyLists(studiesData,userStudiesData);

    setStudies(mergeStudies(mergedStudies,itemData));
    setUsers(visibleUsers);
    setMethods(methodsData.data||[]);
    setCategories(categoriesData.data||[]);
    setDifficulties(difficultiesData.data||[]);
    setStatuses(statusesData.data||[]);

    if(isEdit&&itemData?.data){
     const item=itemData.data;
     const startedAt=splitDateTime(item.startedAt);
     const completedAt=splitDateTime(item.completedAt);
     const selectedMethods=Array.isArray(item.methods)&&item.methods.length
      ?item.methods.map(method=>getObjectId(method)).filter(Boolean)
      :[getObjectId(item.method)].filter(Boolean);
     const normalizedMethodWorkspaces=Array.isArray(item.methodWorkspaces)?item.methodWorkspaces.map(workspace=>({
     method:getObjectId(workspace.method),
      templateKey:workspace.templateKey||"",
      title:workspace.title||"",
      description:workspace.description||"",
      sections:Array.isArray(workspace.sections)?workspace.sections.map((section,index)=>({
       label:section.label||"",
       prompt:section.prompt||"",
       response:section.response||"",
       type:section.type||"field",
       order:section.order||index+1
      })):[]
     })):[];

     setActiveMethodWorkspace(getWorkspaceId(normalizedMethodWorkspaces[0]));

     setForm({
      user:getObjectId(item.user)||storedUserId,
      methods:selectedMethods,
      methodWorkspaces:normalizedMethodWorkspaces,
      scriptureExplorer:normalizeScriptureExplorer(item.scriptureExplorer),
      title:item.title||"",
      slug:item.slug||"",
      subtitle:item.subtitle||"",
      description:item.description||"",
      reference:item.reference||"",
      book:item.book||"",
      chapterStart:item.chapterStart??"",
      chapterEnd:item.chapterEnd??"",
      verseStart:item.verseStart??"",
      verseEnd:item.verseEnd??"",
      section:item.section||"",
      category:getObjectId(item.category),
      difficulty:getObjectId(item.difficulty),
      progress:item.progress||"",
      progressPercent:calculateProgressPercent(item),
      health:item.health??0,
      issues:item.issues??0,
      status:getObjectId(item.status),
      startedDate:startedAt.date,
      startedTime:startedAt.time,
      completedDate:completedAt.date,
      completedTime:completedAt.time,
      tags:Array.isArray(item.tags)?item.tags.join(", "):"",
      notes:Array.isArray(item.notes)?item.notes.join("\n"):item.notes||"",
      active:item.active!==undefined?Boolean(item.active):true,
      featured:Boolean(item.featured)
     });
    }
   }
   catch(err){
    if(!isMounted)return;
    setError(err.message||"Failed to load form data");
   }
   finally{
    if(isMounted)setLoadingData(false);
   }
  };

  loadData();

  return()=>{isMounted=false;};
 },[id,isEdit]);

 const handleChange=e=>{
  const {name,value,type,checked}=e.target;

  setForm(prev=>({
   ...prev,
   [name]:type==="checkbox"?checked:value,
   ...(name==="title"?{slug:slugify(value)}:{})
  }));
 };

 const handleMethodChange=e=>{
  const selected=e.target.value;
  setMethodToApply(selected);
  if(selected)
  {
   setMethodDrawerOpen(true);
  }
 };

 const clearMethodToApply=()=>{
  setMethodToApply("");
  setMethodDrawerOpen(false);
 };

 const handleScriptureExplorerChange=e=>{
  const {name,value}=e.target;
  setForm(prev=>({
   ...prev,
   scriptureExplorer:{
    ...normalizeScriptureExplorer(prev.scriptureExplorer),
    [name]:value
   }
  }));
 };

 const handleScriptureExplorerSectionChange=(index,value)=>{
  setForm(prev=>{
   const scriptureExplorer=normalizeScriptureExplorer(prev.scriptureExplorer);
   return{
    ...prev,
    scriptureExplorer:{
     ...scriptureExplorer,
     sections:scriptureExplorer.sections.map((section,sectionIndex)=>sectionIndex===index?{
      ...section,
      content:value
     }:section)
    }
   };
  });
 };

 const handleOriginalWordStudyFieldChange=(index,field,value)=>{
  setForm(prev=>{
   const scriptureExplorer=normalizeScriptureExplorer(prev.scriptureExplorer);
   const section=scriptureExplorer.sections[index];
   const originalFields=parseOriginalWordStudyContent(section.content);
   const nextFields={
    ...originalFields,
    [field]:value
   };

   return{
    ...prev,
    scriptureExplorer:{
     ...scriptureExplorer,
     sections:scriptureExplorer.sections.map((currentSection,sectionIndex)=>sectionIndex===index?{
      ...currentSection,
      content:buildOriginalWordStudyContent(nextFields)
     }:currentSection)
    }
   };
  });
 };

 const applyScriptureExplorerParse=()=>{
  setForm(prev=>({
   ...prev,
   scriptureExplorer:parseScriptureExplorerOutput(rawScriptureExplorerOutput)
  }));
 };

 const handleExistingStudyChange=e=>{
  const studyId=e.target.value;
 if(studyId)
 {
   navigate(`/studies/${studyId}`);
  }
 };

 const applyMethodTemplate=method=>{
 const workspace=buildMethodWorkspace(method);

  if(!workspace.sections.length)return;

  setActiveFormTab("methods");
  setActiveMethodWorkspace(getWorkspaceId(workspace));
  setMethodToApply("");
  setMethodDrawerOpen(false);

  setForm(prev=>{
   const existingWorkspaces=Array.isArray(prev.methodWorkspaces)?prev.methodWorkspaces:[];
   const existingMethods=Array.isArray(prev.methods)?prev.methods:[];
   const methodId=getObjectId(workspace.method);
   const workspaceId=getWorkspaceId(workspace);
   const workspaceExists=existingWorkspaces.some((item,index)=>String(getWorkspaceId(item,index))===String(workspaceId));
   const nextWorkspaces=workspaceExists
    ?existingWorkspaces.map((item,index)=>String(getWorkspaceId(item,index))===String(workspaceId)?{
     ...workspace,
     sections:workspace.sections.map(section=>{
      const savedSection=item.sections?.find(saved=>saved.label===section.label&&saved.prompt===section.prompt);
      return savedSection?{...section,response:savedSection.response||""}:section;
     })
    }:item)
    :[...existingWorkspaces,workspace];
   const nextMethods=!methodId||existingMethods.map(String).includes(String(methodId))
    ?existingMethods
    :[...existingMethods,methodId].filter(Boolean);

   return{
    ...prev,
    methods:nextMethods,
    methodWorkspaces:nextWorkspaces
   };
  });
 };

 const handleWorkspaceResponseChange=(workspaceIndex,sectionIndex,value)=>{
  setForm(prev=>({
   ...prev,
   methodWorkspaces:prev.methodWorkspaces.map((workspace,currentWorkspaceIndex)=>currentWorkspaceIndex===workspaceIndex?{
    ...workspace,
    sections:workspace.sections.map((section,currentSectionIndex)=>currentSectionIndex===sectionIndex?{
     ...section,
     response:value
    }:section)
   }:workspace)
  }));
 };

const removeMethodWorkspace=workspaceIndex=>{
 const removedWorkspaceId=getWorkspaceId(form.methodWorkspaces[workspaceIndex],workspaceIndex);
 const removedMethodId=getObjectId(form.methodWorkspaces[workspaceIndex]?.method);
 const nextWorkspaces=form.methodWorkspaces.filter((_,index)=>index!==workspaceIndex);
 const nextActiveMethod=getWorkspaceId(nextWorkspaces[workspaceIndex],workspaceIndex)||getWorkspaceId(nextWorkspaces[workspaceIndex-1],workspaceIndex-1)||"";

  if(String(activeMethodWorkspaceId)===String(removedWorkspaceId)){
   setActiveMethodWorkspace(nextActiveMethod);
  }

  setForm(prev=>({
   ...prev,
   methods:removedMethodId?prev.methods.filter(methodId=>String(methodId)!==String(removedMethodId)):prev.methods,
   methodWorkspaces:prev.methodWorkspaces.filter((_,index)=>index!==workspaceIndex)
  }));
 };

 const handleOpenPrintPreview=()=>{
  setMethodDrawerOpen(false);
  setShowPrintPreview(true);
 };

 const handlePrintStudy=()=>{
  window.setTimeout(()=>window.print(),50);
 };

 const handleClosePrintPreview=()=>{
  setShowPrintPreview(false);
 };

 const handleSubmit=async e=>{
  e.preventDefault();

  const resolvedUser=form.user||getObjectId(getStoredUser());
  const resolvedTitle=String(
   form.title||
   form.reference||
   form.scriptureExplorer?.reference||
   activeWorkspace?.title||
   "Bible Study"
  ).trim();
  const missingStudyFields=[];
  if(!resolvedUser)missingStudyFields.push("user");

  if(missingStudyFields.length){
   setActiveFormTab("study");
   setSuccess("");
   setError(`Complete the required Study ${missingStudyFields.length===1?"field":"fields"}: ${missingStudyFields.join(" and ")}.`);
   return;
  }

  try{
   setLoading(true);
   setError("");
   setSuccess("");

   const payload={
    ...form,
    user:resolvedUser,
    title:resolvedTitle,
    slug:slugify(form.slug||resolvedTitle),
   method:getObjectId(form.methods[0])||null,
   methods:form.methods.map(getObjectId).filter(Boolean),
   methodWorkspaces:form.methodWorkspaces.map(workspace=>({
    ...workspace,
    method:getObjectId(workspace.method)||null
   })),
   scriptureExplorer:normalizeScriptureExplorer(form.scriptureExplorer),
    chapterStart:form.chapterStart===""?null:Number(form.chapterStart),
    chapterEnd:form.chapterEnd===""?null:Number(form.chapterEnd),
    verseStart:form.verseStart===""?null:Number(form.verseStart),
    verseEnd:form.verseEnd===""?null:Number(form.verseEnd),
    category:form.category||null,
    difficulty:form.difficulty||null,
    progressPercent:calculatedProgressPercent,
    health:Number(form.health)||0,
    issues:Number(form.issues)||0,
    status:form.status||null,
    startedAt:combineDateTime(form.startedDate,form.startedTime),
    completedAt:combineDateTime(form.completedDate,form.completedTime),
    tags:form.tags.split(",").map(tag=>tag.trim()).filter(Boolean),
    notes:splitNotes(form.notes)
   };

   const res=await fetch(isEdit?`/api/studies/${id}`:"/api/studies",{
    method:isEdit?"PUT":"POST",
    headers:{
     "Content-Type":"application/json"
    },
    body:JSON.stringify(payload)
   });

   const data=await res.json();

   if(!res.ok){
    throw new Error(data.message||data.error||`Failed to ${isEdit?"update":"create"} study`);
   }

   const savedStudy=data.data||data.study||data;
   if(!savedStudy?._id){
    throw new Error("The study save response did not include a saved study id.");
   }

   setSuccess(`Study ${isEdit?"updated":"created"} successfully`);
   if(savedStudy?._id){
    setStudies(prev=>mergeStudyLists([savedStudy],prev));
   }

   if(!isEdit){
    if(savedStudy?._id)
    {
     navigate(`/studies/${savedStudy._id}`);
    }
    else
    {
     setForm(emptyForm());
    }
   }else{
    setForm(prev=>({
     ...prev,
     progressPercent:calculatedProgressPercent,
     methods:Array.isArray(savedStudy?.methods)&&savedStudy.methods.length
      ?savedStudy.methods.map(method=>getObjectId(method)).filter(Boolean)
      :[getObjectId(savedStudy?.method)].filter(Boolean),
     methodWorkspaces:Array.isArray(savedStudy?.methodWorkspaces)?savedStudy.methodWorkspaces.map(workspace=>({
     method:getObjectId(workspace.method),
     templateKey:workspace.templateKey||"",
     title:workspace.title||"",
      description:workspace.description||"",
      sections:Array.isArray(workspace.sections)?workspace.sections.map((section,index)=>({
       label:section.label||"",
       prompt:section.prompt||"",
       response:section.response||"",
       type:section.type||"field",
       order:section.order||index+1
      })):[]
     })):prev.methodWorkspaces
    }));
    navigate(returnToDashboard?`/studies/${savedStudy._id}?from=dashboard`:`/studies/${savedStudy._id}`);
   }
  }
  catch(err){
   if(/(?:path [`']?(?:title|slug|user)[`']?|title|slug|user).*required/i.test(err.message||"")){
    setActiveFormTab("study");
   }
   setError(err.message);
  }
  finally{
   setLoading(false);
  }
 };

 if(loadingData){
  return(
   <div className="container py-4 text-center">
    <Spinner animation="border"/>
   </div>
  );
 }

 if(showStudyList){
  return(
   <div className="container py-4">
    <Card>
     <Card.Body>
      <div className="card-header">
       <div>
        <h2 className="mb-1">Studies</h2>
        <p className="mb-0">Open an existing study or start a new one.</p>
       </div>
       <div className="d-flex gap-2">
        {returnToDashboard?(
         <Button type="button" variant="secondary" onClick={()=>navigate("/dashboard")}>
          Return to Dashboard
         </Button>
        ):null}
       <Button type="button" onClick={()=>navigate(returnToDashboard?"/studies?mode=create&from=dashboard":"/studies?mode=create")}>
         Create Study
        </Button>
       </div>
      </div>

      {error?<Alert variant="danger">{error}</Alert>:null}

      <div className="study-list-filters">
       <Form.Group>
        <Form.Label>Search</Form.Label>
        <Form.Control
         name="query"
         value={studyFilters.query}
         onChange={handleStudyFilterChange}
         placeholder="Title, reference, book, tag"
        />
       </Form.Group>

       <Form.Group>
        <Form.Label>Status</Form.Label>
        <Form.Select name="status" value={studyFilters.status} onChange={handleStudyFilterChange}>
         <option value="all">All statuses</option>
         {statuses.map(status=>{
          const value=getLookupFilterValue(status);
          return(
           <option key={value} value={value}>{getStudyFieldLabel(status)}</option>
          );
         })}
        </Form.Select>
       </Form.Group>

       <Form.Group>
        <Form.Label>Active State</Form.Label>
        <Form.Select name="activeState" value={studyFilters.activeState} onChange={handleStudyFilterChange}>
         <option value="all">All states</option>
         <option value="active">Active</option>
         <option value="inactive">Inactive</option>
         <option value="completed">Completed</option>
         <option value="featured">Featured</option>
        </Form.Select>
       </Form.Group>

       <Form.Group>
        <Form.Label>Category</Form.Label>
        <Form.Select name="category" value={studyFilters.category} onChange={handleStudyFilterChange}>
         <option value="all">All categories</option>
         {categories.map(category=>{
          const value=getLookupFilterValue(category);
          return(
           <option key={value} value={value}>{getStudyFieldLabel(category)}</option>
          );
         })}
        </Form.Select>
       </Form.Group>

       <Form.Group>
        <Form.Label>Difficulty</Form.Label>
        <Form.Select name="difficulty" value={studyFilters.difficulty} onChange={handleStudyFilterChange}>
         <option value="all">All difficulties</option>
         {difficulties.map(difficulty=>{
          const value=getLookupFilterValue(difficulty);
          return(
           <option key={value} value={value}>{getStudyFieldLabel(difficulty)}</option>
          );
         })}
        </Form.Select>
       </Form.Group>

       <div className="study-list-filter-actions">
        <Button type="button" variant="outline-secondary" onClick={resetStudyFilters}>Reset</Button>
       </div>
      </div>

      <div className="study-list-summary">
       Showing {filteredStudies.length} of {studies.length} studies
      </div>

      <div className="table-wrap">
       <table>
        <thead>
         <tr>
          <th>Title</th>
          <th>Reference</th>
          <th>Status</th>
          <th>State</th>
          <th>Category</th>
          <th>Difficulty</th>
          <th>Updated</th>
          <th>Actions</th>
         </tr>
        </thead>
        <tbody>
         {filteredStudies.length?filteredStudies.map(study=>(
          <tr key={study._id}>
           <td>{getStudyLabel(study)}</td>
           <td>{getStudyReference(study)}</td>
           <td>{getStudyStatusLabel(study)}</td>
           <td>{getStudyActiveLabel(study)}</td>
           <td>{getStudyFieldLabel(study.category)}</td>
           <td>{getStudyFieldLabel(study.difficulty)}</td>
           <td>{formatStudyDate(study.updatedAt||study.createdAt)}</td>
           <td>
            <Button type="button" size="sm" variant="outline-primary" onClick={()=>navigate(returnToDashboard?`/studies/${study._id}?from=dashboard`:`/studies/${study._id}`)}>
             Open
            </Button>
           </td>
          </tr>
         )):(
          <tr>
           <td colSpan="8">No studies found for the selected filters.</td>
          </tr>
         )}
        </tbody>
       </table>
      </div>
     </Card.Body>
    </Card>
   </div>
  );
 }

 if(showPrintPreview){
  return(
   <main className="study-print-preview-page">
    <div className="study-print-toolbar no-print">
     <label className="study-print-scope">
      <span>Print</span>
      <Form.Select value={activePrintScope} onChange={event=>setPrintScope(event.target.value)} aria-label="Print scope">
       <option value="study">Full Study</option>
       {printableMethodScopes.map(scope=>(
        <option key={scope.id} value={scope.id}>{scope.label}</option>
       ))}
      </Form.Select>
     </label>
     <Button type="button" variant="secondary" onClick={handlePrintStudy}>
      {activePrintScope==="study"?"Print Study":"Print Method"}
     </Button>
     <Button type="button" variant="primary" onClick={handleClosePrintPreview}>Cancel</Button>
    </div>
    <StudyPrintDocument study={form} scope={activePrintScope}/>
   </main>
  );
 }

 if(showStudyReadView){
  const scriptureExplorer=normalizeScriptureExplorer(form.scriptureExplorer);
  const visibleExplorerSections=scriptureExplorer.sections.filter(section=>hasPrintText(section.content));
  const visibleWorkspaces=getPrintableMethodScopes(form);
  const tags=Array.isArray(form.tags)?form.tags:String(form.tags||"").split(",");
  const visibleTags=tags.map(tag=>String(tag||"").trim()).filter(Boolean);
  const visibleNotes=splitNotes(form.notes);
  const selectedExplorerSection=visibleExplorerSections.find(section=>section.title===activeReadExplorerSection)||visibleExplorerSections[0]||null;
  const selectedReadMethod=visibleWorkspaces.find(workspace=>String(workspace.id)===String(activeReadMethod))||visibleWorkspaces[0]||null;
  const studyMeta=[
   {label:"Reference",value:getStudyReference(form)},
   {label:"Status",value:findLookupLabel(statuses,form.status)},
   {label:"State",value:getStudyActiveLabel(form)},
   {label:"Category",value:findLookupLabel(categories,form.category)},
   {label:"Difficulty",value:findLookupLabel(difficulties,form.difficulty)},
   {label:"Book",value:form.book},
   {label:"Section",value:form.section},
   {label:"Started",value:formatStudyDateTime(form.startedDate,form.startedTime)},
   {label:"Completed",value:formatStudyDateTime(form.completedDate,form.completedTime)},
   {label:"Progress",value:form.progress||`${calculatedProgressPercent}%`}
  ].filter(item=>hasPrintText(item.value)&&item.value!=="-");
  const editQuery=returnToDashboard?"?edit=true&from=dashboard":"?edit=true";

  return(
   <div className="container py-4 study-read-shell">
    <Card>
     <Card.Body>
      <div className="card-header">
       <div>
        <h2 className="mb-1">{form.title||"Untitled Study"}</h2>
        {hasPrintText(form.subtitle)?<p className="mb-0">{form.subtitle}</p>:null}
       </div>
       <div className="d-flex gap-2">
        <Button type="button" variant="outline-primary" onClick={handleOpenPrintPreview}>
         Print Preview
        </Button>
        <Button type="button" onClick={()=>navigate(`/studies/${id}${editQuery}`)}>
         Edit Study
        </Button>
        <Button type="button" variant="secondary" onClick={()=>navigate(returnToDashboard?"/dashboard":"/studies")}>
         {returnToDashboard?"Return to Dashboard":"All Studies"}
        </Button>
       </div>
      </div>

      {error?<Alert variant="danger">{error}</Alert>:null}

      <div className="study-form-tabs study-read-tabs" role="tablist" aria-label="Study content">
       <button type="button" className={activeReadTab==="study"?"active":""} onClick={()=>setActiveReadTab("study")} role="tab" aria-selected={activeReadTab==="study"}>Study Details</button>
       <button type="button" className={activeReadTab==="scripture"?"active":""} onClick={()=>setActiveReadTab("scripture")} role="tab" aria-selected={activeReadTab==="scripture"}>Scripture Explorer</button>
       <button type="button" className={activeReadTab==="methods"?"active":""} onClick={()=>setActiveReadTab("methods")} role="tab" aria-selected={activeReadTab==="methods"}>Methods</button>
      </div>

      {activeReadTab==="study"?(
       <div className="study-read-tab-panel" role="tabpanel">
        {studyMeta.length?(
         <section className="study-read-section">
          <h3>Study Details</h3>
          <dl className="study-read-details">
           {studyMeta.map(item=>(
            <div key={item.label}>
             <dt>{item.label}</dt>
             <dd>{item.value}</dd>
            </div>
           ))}
          </dl>
         </section>
        ):null}
        <StudyTextValue title="Description" value={form.description}/>
        {visibleTags.length?(
         <StudyTextBlock title="Tags"><p>{visibleTags.join(", ")}</p></StudyTextBlock>
        ):null}
        {visibleNotes.length?(
         <StudyTextBlock title="Notes">{visibleNotes.map((note,index)=><p key={index}>{note}</p>)}</StudyTextBlock>
        ):null}
       </div>
      ):null}

      {activeReadTab==="scripture"?(
       <div className="study-read-tab-panel" role="tabpanel">
        <StudyTextValue title="Passage Text" value={scriptureExplorer.passageText}/>
        {visibleExplorerSections.length?(
         <>
          <div className="study-method-tabs study-read-subtabs" role="tablist" aria-label="Scripture Explorer sections">
           {visibleExplorerSections.map(section=>(
            <button type="button" key={section.title} className={selectedExplorerSection?.title===section.title?"active":""} onClick={()=>setActiveReadExplorerSection(section.title)} role="tab" aria-selected={selectedExplorerSection?.title===section.title}>{section.title}</button>
           ))}
          </div>
          <StudyTextValue title={selectedExplorerSection.title} value={selectedExplorerSection.content}/>
         </>
        ):<p className="study-read-empty">No Scripture Explorer content has been saved for this study.</p>}
       </div>
      ):null}

      {activeReadTab==="methods"?(
       <div className="study-read-tab-panel" role="tabpanel">
        {visibleWorkspaces.length?(
         <>
          <div className="study-method-tabs study-read-subtabs" role="tablist" aria-label="Applied study methods">
           {visibleWorkspaces.map((workspace,index)=>(
            <button type="button" key={workspace.id||index} className={selectedReadMethod?.id===workspace.id?"active":""} onClick={()=>setActiveReadMethod(workspace.id)} role="tab" aria-selected={selectedReadMethod?.id===workspace.id}>{workspace.label||`Method ${index+1}`}</button>
           ))}
          </div>
          <section className="study-read-section">
           <h3>{selectedReadMethod.label||"Method"}</h3>
           {hasPrintText(selectedReadMethod.description)?<StudyTextContent value={selectedReadMethod.description}/>:null}
           {selectedReadMethod.sections.map(section=>(
            <StudyTextValue key={`${selectedReadMethod.id}-${section.label}`} title={section.label} value={section.response}/>
           ))}
          </section>
         </>
        ):<p className="study-read-empty">No method workspace has been saved for this study.</p>}
       </div>
      ):null}
     </Card.Body>
    </Card>
   </div>
  );
 }

 const methodDrawer=selectedMethodDetails.length>0?(
  <>
   <button
    type="button"
    className="method-template-drawer-tab"
    onClick={()=>setMethodDrawerOpen(prev=>!prev)}
    aria-expanded={methodDrawerOpen}
    aria-controls="method-template-drawer"
   >
    Method Template
   </button>

   <aside id="method-template-drawer" className={`method-template-drawer ${methodDrawerOpen?"is-open":""}`}>
    <div className="method-template-drawer-header">
     <h3>Method Reference</h3>
     <button type="button" className="method-template-drawer-close" onClick={()=>setMethodDrawerOpen(false)} aria-label="Close method template">
      ×
     </button>
    </div>

    <div className="method-template-drawer-body">
     {selectedMethodDetails.map(method=>(
      <article key={getTemplateId(method)} className="study-method-reference-card">
       <div className="study-method-reference-card-header">
        <div>
         <h4>{method.title}</h4>
         {method.subtitle?<p>{method.subtitle}</p>:null}
        </div>
        <Button type="button" size="sm" variant="outline-primary" onClick={()=>applyMethodTemplate(method)}>
         Apply Template
        </Button>
       </div>

       {method.image?(
        <img className="study-method-template-image" src={method.image} alt={`${method.title} visual reference`}/>
       ):null}

       {method.purpose||method.description||method.overview?(
        <p className="study-method-reference-summary">
         {method.purpose||method.description||method.overview}
        </p>
       ):null}

       {Array.isArray(method.steps)&&method.steps.length?(
        <div className="study-method-reference-section">
         <h5>Steps</h5>
         <ol>
          {method.steps.map((step,index)=>(
           <li key={`${getTemplateId(method)}-step-${index}`}>
            <strong>{step.title||`Step ${index+1}`}</strong>
            {step.content?<span>{step.content}</span>:null}
           </li>
          ))}
         </ol>
        </div>
       ):null}

       {getMethodQuestions(method).length?(
        <div className="study-method-reference-section">
         <h5>Questions</h5>
         <ul>
          {getMethodQuestions(method).slice(0,8).map((question,index)=>(
           <li key={`${getTemplateId(method)}-question-${index}`}>{question}</li>
          ))}
         </ul>
        </div>
       ):null}
      </article>
     ))}
    </div>
   </aside>
  </>
 ):null;

 return(
  <LocalizationProvider dateAdapter={AdapterDayjs}>
   <>
    <ToastContainer position="top-end" className="position-fixed p-3 study-notification-container">
     <Toast show={Boolean(error)} bg="danger" onClose={()=>setError("")}>
      <Toast.Header closeButton>
       <strong className="me-auto">Study could not be saved</strong>
      </Toast.Header>
      <Toast.Body className="text-white" role="alert" aria-live="assertive">{error}</Toast.Body>
     </Toast>
     <Toast show={Boolean(success)} bg="success" onClose={()=>setSuccess("")} delay={4500} autohide>
      <Toast.Header closeButton>
       <strong className="me-auto">Study saved</strong>
      </Toast.Header>
      <Toast.Body className="text-white" role="status" aria-live="polite">{success}</Toast.Body>
     </Toast>
    </ToastContainer>
    {methodDrawer}
   <div className={`container py-4 study-form-shell ${methodDrawerOpen?"drawer-open":""}`}>
   <Card>
    <Card.Body>
     <h2 className="mb-3">{isEdit?"Edit Study":"Create Study"}</h2>

     <Form
      onSubmit={handleSubmit}
      ref={node=>{
       if(!node)return;
       node.querySelectorAll("select.form-select").forEach(select=>{
        const isRequired=select.name==="user";
        select.required=isRequired;
        if(isRequired){
         delete select.dataset.optional;
        }else{
         select.dataset.optional="true";
         select.classList.remove("is-invalid");
        }
       });
      }}
     >
      <Row className="g-3">

       <Col md={12}>
        <div className="study-form-tabs">
         <button type="button" className={activeFormTab==="study"?"active":""} onClick={()=>setActiveFormTab("study")}>Study</button>
         <button type="button" className={activeFormTab==="scripture"?"active":""} onClick={()=>setActiveFormTab("scripture")}>Scripture Explorer</button>
         <button type="button" className={activeFormTab==="methods"?"active":""} onClick={()=>setActiveFormTab("methods")}>Methods</button>
        </div>
       </Col>

       {activeFormTab==="study"?(
       <>
       <Col md={12}>
        <Form.Group>
         <Form.Label>Existing Study</Form.Label>
         <Form.Select value={isEdit?id:""} onChange={handleExistingStudyChange}>
          <option value="">Create a new study</option>
          {studies.map(study=>(
           <option key={study._id} value={study._id}>{getStudyLabel(study)}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>User</Form.Label>
         <Form.Select name="user" value={form.user} onChange={handleChange} required>
          <option value="">Select user</option>
          {users.map(user=>{
           const userId=getObjectId(user);
           return(
            <option key={userId||getStoredUserLabel(user)} value={userId}>
             {getStoredUserLabel(user)}
            </option>
           );
          })}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={8}>
       <Form.Group>
         <Form.Label>Title</Form.Label>
         <Form.Control name="title" value={form.title} onChange={handleChange} placeholder="Optional — generated from the reference or method"/>
        </Form.Group>
       </Col>

      <Col md={4}>
       <Form.Group>
        <Form.Label>Slug</Form.Label>
        <Form.Control name="slug" value={form.slug} readOnly placeholder="Generated when the study is saved"/>
       </Form.Group>
      </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Subtitle</Form.Label>
         <Form.Control name="subtitle" value={form.subtitle} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Description</Form.Label>
         <Form.Control as="textarea" rows={4} name="description" value={form.description} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Reference</Form.Label>
         <Form.Control name="reference" value={form.reference} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Book</Form.Label>
         <Form.Control name="book" value={form.book} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={3}>
        <Form.Group>
         <Form.Label>Chapter Start</Form.Label>
         <Form.Control type="number" name="chapterStart" value={form.chapterStart} onChange={handleChange} min={1}/>
        </Form.Group>
       </Col>

       <Col md={3}>
        <Form.Group>
         <Form.Label>Chapter End</Form.Label>
         <Form.Control type="number" name="chapterEnd" value={form.chapterEnd} onChange={handleChange} min={1}/>
        </Form.Group>
       </Col>

       <Col md={3}>
        <Form.Group>
         <Form.Label>Verse Start</Form.Label>
         <Form.Control type="number" name="verseStart" value={form.verseStart} onChange={handleChange} min={1}/>
        </Form.Group>
       </Col>

       <Col md={3}>
        <Form.Group>
         <Form.Label>Verse End</Form.Label>
         <Form.Control type="number" name="verseEnd" value={form.verseEnd} onChange={handleChange} min={1}/>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Section</Form.Label>
         <Form.Control name="section" value={form.section} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Category</Form.Label>
         <Form.Select name="category" value={form.category} onChange={handleChange}>
          <option value="">Select category</option>
          {categories.map(category=>(
           <option key={category._id} value={category._id}>{category.title}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Difficulty</Form.Label>
         <Form.Select name="difficulty" value={form.difficulty} onChange={handleChange}>
          <option value="">Select difficulty</option>
          {difficulties.map(difficulty=>(
           <option key={difficulty._id} value={difficulty._id}>{difficulty.title}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={3}>
        <Form.Group>
         <Form.Label>Progress</Form.Label>
         <Form.Control name="progress" value={form.progress} onChange={handleChange}/>
        </Form.Group>
       </Col>

      <Col md={3}>
       <Form.Group>
         <Form.Label>Progress Percent</Form.Label>
         <Form.Control type="number" name="progressPercent" value={calculatedProgressPercent} readOnly min={0} max={100}/>
        </Form.Group>
       </Col>

       <Col md={3}>
        <Form.Group>
         <Form.Label>Health</Form.Label>
         <Form.Control type="number" name="health" value={form.health} onChange={handleChange} min={0} max={100}/>
        </Form.Group>
       </Col>

       <Col md={3}>
        <Form.Group>
         <Form.Label>Issues</Form.Label>
         <Form.Control type="number" name="issues" value={form.issues} onChange={handleChange} min={0}/>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Status</Form.Label>
         <Form.Select name="status" value={form.status} onChange={handleChange}>
          <option value="">Select status</option>
          {statuses.map(status=>(
           <option key={status._id} value={status._id}>{status.title}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Started Date</Form.Label>
         <DatePicker
          value={toDateObject(form.startedDate)}
          onChange={date=>setForm(prev=>({...prev,startedDate:toDateValue(date)}))}
          format="MM/DD/YYYY"
          slotProps={muiDatePickerSlotProps}
         />
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Started Time</Form.Label>
         <Form.Select name="startedTime" value={form.startedTime} onChange={handleChange}>
          <option value="">Select time</option>
          {timeOptions.map(option=>(
           <option key={`started-${option.value}`} value={option.value}>{option.label}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Completed Date</Form.Label>
         <DatePicker
          value={toDateObject(form.completedDate)}
          onChange={date=>setForm(prev=>({...prev,completedDate:toDateValue(date)}))}
          format="MM/DD/YYYY"
          slotProps={muiDatePickerSlotProps}
         />
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Completed Time</Form.Label>
         <Form.Select name="completedTime" value={form.completedTime} onChange={handleChange}>
          <option value="">Select time</option>
          {timeOptions.map(option=>(
           <option key={`completed-${option.value}`} value={option.value}>{option.label}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Tags</Form.Label>
         <Form.Control name="tags" value={form.tags} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Notes</Form.Label>
         <Form.Control as="textarea" rows={8} name="notes" value={form.notes} onChange={handleChange}/>
        </Form.Group>
       </Col>
       </>
       ):null}

       {activeFormTab==="scripture"?(
       <>
       <Col md={12}>
        <Alert variant="info">
         Capture the Scripture Explorer output here first. Method templates stay separate and can be applied later.
        </Alert>
       </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Raw Output</Form.Label>
         <Form.Control
          as="textarea"
          rows={8}
          name="rawOutput"
          value={rawScriptureExplorerOutput}
          onChange={event=>setRawScriptureExplorerOutput(event.target.value)}
         />
        </Form.Group>
       </Col>

       <Col md={12} className="d-flex justify-content-end">
        <Button type="button" variant="outline-primary" onClick={applyScriptureExplorerParse}>
         Parse Scripture Explorer Output
        </Button>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Explorer Reference</Form.Label>
         <Form.Control name="reference" value={form.scriptureExplorer.reference} onChange={event=>handleScriptureExplorerChange({target:{name:"reference",value:event.target.value}})}/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Passage Text</Form.Label>
         <Form.Control name="passageText" value={form.scriptureExplorer.passageText} onChange={event=>handleScriptureExplorerChange({target:{name:"passageText",value:event.target.value}})}/>
        </Form.Group>
       </Col>

       {form.scriptureExplorer.sections.map((section,index)=>(
        <Col md={12} key={`${section.title}-${index}`}>
         {section.title===originalWordStudyTitle?(
          <Form.Group className="scripture-explorer-section scripture-original-word-study">
           <Form.Label>{section.title}</Form.Label>
           <div className="scripture-original-word-study-fields">
            {originalWordStudyFields.map(field=>{
             const originalFields=parseOriginalWordStudyContent(section.content);

             return(
              <div className="scripture-original-word-study-field" key={`${section.title}-${field}`}>
               <Form.Label>{originalWordStudyLabels[field]}</Form.Label>
               <Form.Control
                as="textarea"
                rows={field==="overview"?3:5}
                value={originalFields[field]||""}
                onChange={event=>handleOriginalWordStudyFieldChange(index,field,event.target.value)}
               />
              </div>
             );
            })}
           </div>
          </Form.Group>
         ):(
          <Form.Group className="scripture-explorer-section">
           <Form.Label>{section.title}</Form.Label>
           <Form.Control
            as="textarea"
            rows={5}
            value={section.content}
            onChange={event=>handleScriptureExplorerSectionChange(index,event.target.value)}
           />
          </Form.Group>
         )}
        </Col>
       ))}
       </>
       ):null}

       {activeFormTab==="methods"?(
       <>
       <Col md={12}>
       <Alert variant="info">
         Edit the applied method workspace below. Use the selector only when adding another method to this study.
        </Alert>
       </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Add Another Method</Form.Label>
         <div className="d-flex gap-2 align-items-start">
         <Form.Select name="methodToApply" value={methodToApply} onChange={handleMethodChange}>
         <option value="">Choose only if adding a different method</option>
          <optgroup label="Built-in Templates">
           {builtInWorkflowTemplates.map(template=>(
            <option key={getTemplateId(template)} value={getTemplateId(template)}>{template.title}</option>
           ))}
          </optgroup>
          <optgroup label="Bible Study Methods">
          {methods.map(method=>(
           <option key={method._id} value={method._id}>{method.title}</option>
          ))}
          </optgroup>
         </Form.Select>
         {methodToApply?(
          <Button type="button" variant="outline-secondary" onClick={clearMethodToApply}>
           Clear
          </Button>
         ):null}
         </div>
         <Form.Text muted>The saved method you are editing is already selected below. This selector only adds another method workspace.</Form.Text>
        </Form.Group>
       </Col>

       {form.methodWorkspaces.length?(
        <Col md={12}>
         <section className="study-workspace-panel">
          <div className="study-workspace-panel-header">
           <div>
            <h3>Applied Method Templates</h3>
            <p>Work through the selected method layout here. These responses save with this study.</p>
           </div>
          </div>

          <div className="study-method-tabs" role="tablist" aria-label="Applied method templates">
           {form.methodWorkspaces.map((workspace,workspaceIndex)=>{
            const workspaceId=getWorkspaceId(workspace,workspaceIndex);
            const isActive=String(activeMethodWorkspaceId)===String(workspaceId);

            return(
             <button
              key={`${workspaceId}-${workspaceIndex}`}
              type="button"
              className={isActive?"active":""}
              onClick={()=>setActiveMethodWorkspace(workspaceId)}
              role="tab"
              aria-selected={isActive}
             >
              {workspace.title||`Method ${workspaceIndex+1}`}
             </button>
            );
           })}
          </div>

          {activeWorkspace?(
            <article className="study-workspace-card">
             <div className="study-workspace-card-header">
              <div>
               <h4>{activeWorkspace.title||"Method Template"}</h4>
               {activeWorkspace.description?<p>{activeWorkspace.description}</p>:null}
              </div>
              <Button type="button" variant="outline-danger" size="sm" onClick={()=>removeMethodWorkspace(activeWorkspaceIndex)}>
               Remove
              </Button>
             </div>

             <div className="study-workspace-sections">
              {activeWorkspace.sections.map((section,sectionIndex)=>(
               <Form.Group className="study-workspace-section" key={`${activeWorkspace.method}-${section.label}-${sectionIndex}`}>
                <Form.Label>{section.label}</Form.Label>
                {section.prompt?<p className="study-workspace-prompt">{section.prompt}</p>:null}
                <Form.Control
                 as="textarea"
                 rows={3}
                 value={section.response||""}
                 onChange={event=>handleWorkspaceResponseChange(activeWorkspaceIndex,sectionIndex,event.target.value)}
                />
               </Form.Group>
              ))}
             </div>
            </article>
          ):null}
         </section>
        </Col>
       ):null}
       </>
       ):null}

       {activeFormTab==="study"?(
       <>
       <Col md={6}>
        <Form.Check
         type="checkbox"
         label="Active"
         name="active"
         checked={form.active}
         onChange={handleChange}
        />
       </Col>

       <Col md={6}>
        <Form.Check
         type="checkbox"
         label="Featured"
         name="featured"
         checked={form.featured}
         onChange={handleChange}
        />
       </Col>
       </>
       ):null}

       <Col md={12} className="d-flex gap-2">
       <Button type="submit" value="save" disabled={loading}>
         {loading?(isEdit?"Updating...":"Saving..."):(isEdit?"Update Study":"Create Study")}
        </Button>
       <Button type="button" variant="secondary" onClick={()=>navigate(isEdit?studyViewUrl:"/studies")}>
         {isEdit?"Cancel Edit":"Cancel"}
        </Button>
        {isEdit?(
         <Button type="button" variant="outline-primary" onClick={handleOpenPrintPreview}>
          Print Preview
         </Button>
        ):null}
       </Col>

      </Row>
     </Form>
    </Card.Body>
   </Card>
  </div>
   </>
  </LocalizationProvider>
 );
}

export default StudyForm;
