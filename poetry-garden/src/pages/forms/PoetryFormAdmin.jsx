// src/pages/forms/PoetryFormAdmin.jsx
import React,{useEffect,useState} from "react";
import {Button,Card,Col,Form,InputGroup,Modal,Nav,Row,Spinner} from "react-bootstrap";
import {FileInput,Plus,Save,Trash2,X} from "lucide-react";
import "./PoetryFormAdmin.css";

const NA="N/A";

const emptyStructure={
 lines:"",
 stanzas:"",
 meter:"",
 rhymeScheme:"",
 syllablePattern:"",
 refrain:"",
 additionalRules:[]
};

const emptyExample={
 title:"",
 author:"",
 text:"",
 notes:"",
 sourceUrl:""
};

const emptyReference={
 title:"",
 url:""
};

const emptyForm={
 name:"",
 slug:"",
 alternateNames:"",
 type:"form",
 category:"",
 origin:"",
 description:"",
 structure:{
  ...emptyStructure,
  additionalRules:[]
 },
 examples:[],
 references:[],
 notes:"",
 isActive:true
};

const emptyLookupEditor={
 type:"",
 name:"",
 description:"",
 saving:false,
 error:""
};

const sectionKeys={
 "name":"name",
 "slug":"slug",
 "alternate names":"alternateNames",
 "type":"type",
 "category":"category",
 "origin":"origin",
 "description":"description",
 "lines":"lines",
 "stanzas":"stanzas",
 "meter":"meter",
 "rhyme scheme":"rhymeScheme",
 "syllable pattern":"syllablePattern",
 "refrain":"refrain",
 "additional rules":"additionalRules",
 "examples":"examples",
 "references":"references",
 "notes":"notes",
 "tags":"tags",
 "active":"active",
 "is active":"active",
 "isactive":"active"
};

const sectionPattern=/^(Name|Slug|Alternate Names|Type|Category|Origin|Description|Lines|Stanzas|Meter|Rhyme Scheme|Syllable Pattern|Refrain|Additional Rules|Examples|References|Notes|Tags|Active|Is Active|isActive)\s*:\s*(.*)$/i;

const slugify=value=>{
 return String(value||"")
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g,"-")
  .replace(/^-+|-+$/g,"");
};

const textOrNA=value=>{
 const output=String(value??"").trim();

 if(!output)return NA;

 if(/^(none|not available|not applicable|unknown)$/i.test(output)){
  return NA;
 }

 return output;
};

const normalizeCompare=value=>{
 return String(value||"")
  .trim()
  .toLowerCase()
  .replace(/[–—]/g,"-")
  .replace(/\s+/g," ");
};

const normalizeLooseCompare=value=>{
 return normalizeCompare(value)
  .replace(/[^a-z0-9]+/g,"");
};

const cleanUrl=value=>{
 const original=String(value||"")
  .trim()
  .replace(/\\_/g,"_");

 if(!original)return "";

 const markdown=original.match(
  /^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/
 );

 if(markdown){
  return markdown[2]
   .trim()
   .replace(/\\_/g,"_");
 }

 const urlMatch=original.match(
  /https?:\/\/[^\s)]+/i
 );

 if(urlMatch){
  return urlMatch[0]
   .replace(/[.,;]+$/,"")
   .replace(/\\_/g,"_");
 }

 return original;
};

const matchLookupItem=(value,items)=>{
 const original=String(value||"").trim();

 if(!original)return null;

 const normalized=normalizeCompare(original);
 const loose=normalizeLooseCompare(original);

 const exact=items.find(item=>
  normalizeCompare(item?.name)===normalized
 );

 if(exact)return exact;

 const looseMatch=items.find(item=>
  normalizeLooseCompare(item?.name)===loose
 );

 return looseMatch||null;
};

const matchLookupValue=(value,items)=>{
 const original=String(value||"").trim();

 if(!original)return "";

 const item=matchLookupItem(
  original,
  items
 );

 return item?.name||original;
};

const lookupExists=(value,items)=>{
 return Boolean(
  matchLookupItem(
   value,
   items
  )
 );
};

const trimSectionLines=lines=>{
 const output=[...(lines||[])];

 while(
  output.length&&
  !String(output[0]||"").trim()
 ){
  output.shift();
 }

 while(
  output.length&&
  !String(
   output[output.length-1]||""
  ).trim()
 ){
  output.pop();
 }

 return output;
};

const sectionText=(sections,key,multiline=false)=>{
 const lines=trimSectionLines(
  sections[key]||[]
 );

 if(multiline){
  return lines
   .map(line=>
    String(line||"")
     .replace(/\s+$/,"")
   )
   .join("\n")
   .trim();
 }

 return lines
  .map(line=>
   String(line||"").trim()
  )
  .filter(Boolean)
  .join(" ")
  .trim();
};

const normalizeList=value=>{
 if(Array.isArray(value)){
  return value
   .map(item=>
    String(item||"").trim()
   )
   .filter(item=>
    item&&
    !/^(none|n\/a|na|not applicable)$/i.test(item)
   );
 }

 if(!value)return [];

 return String(value)
  .split(/\n|,/)
  .map(item=>
   item
    .replace(/^\s*[-*•]\s*/,"")
    .trim()
  )
  .filter(item=>
   item&&
   !/^(none|n\/a|na|not applicable)$/i.test(item)
  );
};

const normalizeLookupValue=value=>{
 if(!value)return "";

 if(typeof value==="string"){
  return value.trim();
 }

 if(typeof value==="object"){
  return String(
   value.name||
   value.label||
   value.value||
   ""
  ).trim();
 }

 return String(value).trim();
};

const parseSections=text=>{
 const sections={};
 let currentKey="";

 String(text||"")
  .replace(/\r\n?/g,"\n")
  .split("\n")
  .forEach(rawLine=>{
   const trimmed=rawLine.trim();
   const match=trimmed.match(
    sectionPattern
   );

   if(currentKey==="examples"){
    if(
     match&&
     match[1].toLowerCase()==="references"
    ){
     currentKey="references";
     sections.references=[];

     if(match[2]){
      sections.references.push(
       match[2]
      );
     }

     return;
    }

    sections.examples.push(rawLine);
    return;
   }

   if(currentKey==="references"){
    if(match){
     const label=match[1]
      .toLowerCase();

     if(
      [
       "notes",
       "tags",
       "active",
       "is active",
       "isactive"
      ].includes(label)
     ){
      currentKey=sectionKeys[label];
      sections[currentKey]=[];

      if(match[2]){
       sections[currentKey].push(
        match[2]
       );
      }

      return;
     }
    }

    sections.references.push(rawLine);
    return;
   }

   if(match){
    const label=match[1]
     .toLowerCase();

    currentKey=sectionKeys[label];
    sections[currentKey]=[];

    if(match[2]){
     sections[currentKey].push(
      match[2]
     );
    }

    return;
   }

   if(currentKey){
    sections[currentKey].push(
     rawLine
    );
   }
  });

 return sections;
};

const parseRules=value=>{
 const lines=Array.isArray(value)
  ?value
  :String(value||"")
   .replace(/\r\n?/g,"\n")
   .split("\n");

 return trimSectionLines(lines)
  .map(rule=>
   String(rule||"")
    .replace(/^\s*[-*•]\s*/,"")
    .trim()
  )
  .filter(rule=>
   rule&&
   !/^(none|n\/a|na|not applicable)$/i.test(rule)
  );
};

const stripFormattingIndent=line=>{
 const value=String(line||"");

 if(value.startsWith("  ")){
  return value.slice(2);
 }

 if(value.startsWith("\t")){
  return value.slice(1);
 }

 return value;
};

const hasExampleData=example=>{
 return Boolean(
  example.title||
  example.author||
  example.text||
  example.notes||
  example.sourceUrl
 );
};

const finishExample=example=>{
 if(!example)return null;

 return{
  title:textOrNA(example.title),
  author:textOrNA(example.author),
  text:textOrNA(example.text),
  notes:textOrNA(example.notes),
  sourceUrl:cleanUrl(
   example.sourceUrl
  )||NA
 };
};

const parseExamples=lines=>{
 const output=[];
 let current=null;
 let currentField="";

 const pushCurrent=()=>{
  if(!current)return;

  const finished=finishExample(
   current
  );

  if(
   finished&&
   hasExampleData(finished)
  ){
   output.push(finished);
  }

  current=null;
  currentField="";
 };

 trimSectionLines(lines||[])
  .forEach(rawLine=>{
   const line=String(rawLine||"");

   if(
    /^\s*(none|n\/a|na)\s*$/i.test(
     line
    )
   ){
    if(
     current&&
     currentField
    ){
     current[currentField]=NA;
    }

    return;
   }

   const titleStart=line.match(
    /^\s*-\s*Title\s*:\s*(.*)$/i
   );

   if(titleStart){
    pushCurrent();

    current={...emptyExample};
    current.title=titleStart[1]
     .trim();
    currentField="title";

    return;
   }

   const fieldMatch=line.match(
    /^\s*(Title|Author|Text|Notes|Source URL)\s*:\s*(.*)$/i
   );

   if(fieldMatch){
    const label=fieldMatch[1]
     .toLowerCase();

    const value=fieldMatch[2]||"";

    if(
     label==="title"&&
     current&&
     hasExampleData(current)
    ){
     pushCurrent();
    }

    if(!current){
     current={...emptyExample};
    }

    if(label==="title"){
     currentField="title";
    }

    if(label==="author"){
     currentField="author";
    }

    if(label==="text"){
     currentField="text";
    }

    if(label==="notes"){
     currentField="notes";
    }

    if(label==="source url"){
     currentField="sourceUrl";
    }

    current[currentField]=value.trim();

    return;
   }

   if(
    !current||
    !currentField
   ){
    return;
   }

   const content=
    stripFormattingIndent(line);

   if(
    !content.trim()&&
    !current[currentField]
   ){
    return;
   }

   if(current[currentField]){
    current[currentField]+=`\n${content}`;
   }else{
    current[currentField]=content;
   }
  });

 pushCurrent();

 return output;
};

const normalizeExamples=value=>{
 if(!Array.isArray(value)){
  return [];
 }

 return value
  .map(example=>
   finishExample({
    title:example?.title||"",
    author:example?.author||"",
    text:example?.text||"",
    notes:example?.notes||"",
    sourceUrl:
     example?.sourceUrl||
     example?.sourceURL||
     example?.url||
     ""
   })
  )
  .filter(Boolean);
};

const hasReferenceData=reference=>{
 return Boolean(
  reference.title||
  reference.url
 );
};

const parseReferences=lines=>{
 const output=[];
 let current=null;
 let currentField="";

 const pushCurrent=()=>{
  if(!current)return;

  current.title=String(
   current.title||""
  ).trim();

  current.url=cleanUrl(
   current.url
  );

  if(hasReferenceData(current)){
   output.push(current);
  }

  current=null;
  currentField="";
 };

 trimSectionLines(lines||[])
  .forEach(rawLine=>{
   const line=String(rawLine||"");

   const titleStart=line.match(
    /^\s*-\s*Title\s*:\s*(.*)$/i
   );

   if(titleStart){
    pushCurrent();

    current={...emptyReference};
    current.title=titleStart[1]
     .trim();
    currentField="title";

    return;
   }

   const fieldMatch=line.match(
    /^\s*(Title|URL)\s*:\s*(.*)$/i
   );

   if(fieldMatch){
    const label=fieldMatch[1]
     .toLowerCase();

    const value=fieldMatch[2]||"";

    if(
     label==="title"&&
     current&&
     hasReferenceData(current)
    ){
     pushCurrent();
    }

    if(!current){
     current={...emptyReference};
    }

    currentField=
     label==="title"
      ?"title"
      :"url";

    current[currentField]=value.trim();

    return;
   }

   if(
    !current||
    !currentField
   ){
    return;
   }

   const content=
    stripFormattingIndent(line)
     .trim();

   if(!content)return;

   if(current[currentField]){
    current[currentField]+=` ${content}`;
   }else{
    current[currentField]=content;
   }
  });

 pushCurrent();

 return output;
};

const normalizeReferences=value=>{
 if(!Array.isArray(value)){
  return [];
 }

 return value
  .map(reference=>({
   title:String(
    reference?.title||""
   ).trim(),
   url:cleanUrl(
    reference?.url||""
   )
  }))
  .filter(hasReferenceData);
};

const parseActive=value=>{
 if(typeof value==="boolean"){
  return value;
 }

 const normalized=String(
  value??""
 )
  .trim()
  .toLowerCase();

 if(
  [
   "false",
   "no",
   "inactive",
   "0"
  ].includes(normalized)
 ){
  return false;
 }

 return true;
};

const parseLineCount=value=>{
 if(
  value===null||
  value===undefined
 ){
  return "";
 }

 if(typeof value==="number"){
  return value;
 }

 const normalized=String(
  value||""
 ).trim();

 if(
  !normalized||
  /^(none|n\/a|na|variable|varies|not applicable)$/i.test(
   normalized
  )
 ){
  return "";
 }

 const match=normalized.match(/\d+/);

 return match?match[0]:"";
};

const normalizeImportedObject=value=>{
 const source=Array.isArray(value)
  ?value[0]
  :value;

 if(
  !source||
  typeof source!=="object"
 ){
  throw new Error(
   "The imported JSON does not contain a poetry form"
  );
 }

 const name=String(
  source.name||""
 ).trim();

 if(!name){
  throw new Error(
   "Name was not found in the imported data"
  );
 }

 const structure=
  source.structure&&
  typeof source.structure==="object"
   ?source.structure
   :{};

 const allowedTypes=[
  "form",
  "meter",
  "stanza",
  "movement",
  "technique",
  "genre"
 ];

 const parsedType=String(
  source.type||"form"
 )
  .trim()
  .toLowerCase();

 return{
  name,
  slug:slugify(name),
  alternateNames:normalizeList(
   source.alternateNames
  ).join(", "),
  type:allowedTypes.includes(parsedType)
   ?parsedType
   :"form",
  category:textOrNA(
   normalizeLookupValue(
    source.category
   )
  ),
  origin:textOrNA(
   source.origin
  ),
  description:textOrNA(
   source.description
  ),
  structure:{
   lines:parseLineCount(
    structure.lines
   ),
   stanzas:textOrNA(
    structure.stanzas
   ),
   meter:textOrNA(
    normalizeLookupValue(
     structure.meter
    )
   ),
   rhymeScheme:textOrNA(
    normalizeLookupValue(
     structure.rhymeScheme||
     structure.rhyme_scheme
    )
   ),
   syllablePattern:textOrNA(
    structure.syllablePattern||
    structure.syllable_pattern
   ),
   refrain:textOrNA(
    structure.refrain
   ),
   additionalRules:parseRules(
    structure.additionalRules||
    structure.additional_rules||
    []
   )
  },
  examples:normalizeExamples(
   source.examples
  ),
  references:normalizeReferences(
   source.references
  ),
  notes:textOrNA(
   source.notes
  ),
  isActive:parseActive(
   source.isActive!==undefined
    ?source.isActive
    :source.active
  )
 };
};

const parsePlainTextForm=text=>{
 const sections=parseSections(text);

 const name=sectionText(
  sections,
  "name"
 );

 if(!name){
  throw new Error(
   "Name was not found in the imported text"
  );
 }

 const alternateNames=normalizeList(
  sectionText(
   sections,
   "alternateNames",
   true
  )
 );

 const parsedType=sectionText(
  sections,
  "type"
 )
  .toLowerCase()
  .trim();

 const allowedTypes=[
  "form",
  "meter",
  "stanza",
  "movement",
  "technique",
  "genre"
 ];

 return{
  name,
  slug:slugify(name),
  alternateNames:alternateNames.join(", "),
  type:allowedTypes.includes(parsedType)
   ?parsedType
   :"form",
  category:textOrNA(
   sectionText(
    sections,
    "category"
   )
  ),
  origin:textOrNA(
   sectionText(
    sections,
    "origin",
    true
   )
  ),
  description:textOrNA(
   sectionText(
    sections,
    "description",
    true
   )
  ),
  structure:{
   lines:parseLineCount(
    sectionText(
     sections,
     "lines"
    )
   ),
   stanzas:textOrNA(
    sectionText(
     sections,
     "stanzas",
     true
    )
   ),
   meter:textOrNA(
    sectionText(
     sections,
     "meter"
    )
   ),
   rhymeScheme:textOrNA(
    sectionText(
     sections,
     "rhymeScheme"
    )
   ),
   syllablePattern:textOrNA(
    sectionText(
     sections,
     "syllablePattern"
    )
   ),
   refrain:textOrNA(
    sectionText(
     sections,
     "refrain",
     true
    )
   ),
   additionalRules:parseRules(
    sections.additionalRules||[]
   )
  },
  examples:parseExamples(
   sections.examples||[]
  ),
  references:parseReferences(
   sections.references||[]
  ),
  notes:textOrNA(
   sectionText(
    sections,
    "notes",
    true
   )
  ),
  isActive:parseActive(
   sectionText(
    sections,
    "active"
   )
  )
 };
};

const sortLookups=items=>{
 return [...items].sort(
  (a,b)=>
   String(a?.name||"")
    .localeCompare(
     String(b?.name||""),
     undefined,
     {sensitivity:"base"}
    )
 );
};

const PoetryFormAdmin=({
 show,
 poetryForm,
 onClose,
 onSaved,
 onError
})=>{
 const [form,setForm]=useState({
  ...emptyForm
 });

 const [categories,setCategories]=useState([]);
 const [meters,setMeters]=useState([]);
 const [rhymeSchemes,setRhymeSchemes]=useState([]);

 const [activeTab,setActiveTab]=useState("details");
 const [chatText,setChatText]=useState("");
 const [saving,setSaving]=useState(false);
 const [parsing,setParsing]=useState(false);
 const [loadingLookups,setLoadingLookups]=useState(false);

 const [lookupEditor,setLookupEditor]=useState({
  ...emptyLookupEditor
 });

 const isEdit=Boolean(
  poetryForm?._id
 );

 const getLookupEndpoint=type=>{
  if(type==="category"){
   return "/api/poetry-categories";
  }

  if(type==="meter"){
   return "/api/poetry-meters";
  }

  if(type==="rhymeScheme"){
   return "/api/poetry-rhyme-schemes";
  }

  return "";
 };

 const getLookupItems=type=>{
  if(type==="category"){
   return categories;
  }

  if(type==="meter"){
   return meters;
  }

  if(type==="rhymeScheme"){
   return rhymeSchemes;
  }

  return [];
 };

 const setLookupItems=(type,items)=>{
  const sorted=sortLookups(items);

  if(type==="category"){
   setCategories(sorted);
   return;
  }

  if(type==="meter"){
   setMeters(sorted);
   return;
  }

  if(type==="rhymeScheme"){
   setRhymeSchemes(sorted);
  }
 };

 const loadLookupType=async type=>{
  const endpoint=getLookupEndpoint(type);

  if(!endpoint){
   throw new Error(
    "Invalid lookup type"
   );
  }

  const res=await fetch(endpoint);

  if(!res.ok){
   throw new Error(
    `Unable to load ${type}`
   );
  }

  const data=await res.json();
  const items=Array.isArray(data)?data:[];

  setLookupItems(type,items);

  return items;
 };

 const loadLookups=async()=>{
  try{
   setLoadingLookups(true);

   const [
    categoryData,
    meterData,
    rhymeData
   ]=await Promise.all([
    loadLookupType("category"),
    loadLookupType("meter"),
    loadLookupType("rhymeScheme")
   ]);

   setCategories(
    sortLookups(categoryData)
   );

   setMeters(
    sortLookups(meterData)
   );

   setRhymeSchemes(
    sortLookups(rhymeData)
   );
  }catch(error){
   onError(
    error.message||
    "Unable to load poetry form dropdowns",
    true
   );
  }finally{
   setLoadingLookups(false);
  }
 };

 const createLookup=async(type,name)=>{
  const value=textOrNA(name);
  const currentItems=getLookupItems(type);

  const existing=matchLookupItem(
   value,
   currentItems
  );

  if(existing){
   return existing;
  }

  const endpoint=getLookupEndpoint(type);

  if(!endpoint){
   throw new Error(
    "Invalid lookup type"
   );
  }

  const res=await fetch(
   endpoint,
   {
    method:"POST",
    headers:{
     "Content-Type":"application/json"
    },
    body:JSON.stringify({
     name:value,
     description:"",
     isActive:true
    })
   }
  );

  const data=await res
   .json()
   .catch(()=>({}));

  if(res.status===409){
   const refreshed=await loadLookupType(
    type
   );

   const duplicate=matchLookupItem(
    value,
    refreshed
   );

   if(duplicate){
    return duplicate;
   }
  }

  if(!res.ok){
   throw new Error(
    data.message||
    `Unable to add ${value}`
   );
  }

  const updated=[
   ...currentItems.filter(item=>
    normalizeCompare(item.name)!==
    normalizeCompare(data.name)
   ),
   data
  ];

  setLookupItems(
   type,
   updated
  );

  return data;
 };

 const ensureImportedLookups=async imported=>{
  const categoryRecord=await createLookup(
   "category",
   imported.category
  );

  const meterRecord=await createLookup(
   "meter",
   imported.structure.meter
  );

  const rhymeRecord=await createLookup(
   "rhymeScheme",
   imported.structure.rhymeScheme
  );

  return{
   ...imported,
   category:
    categoryRecord?.name||
    imported.category,
   structure:{
    ...imported.structure,
    meter:
     meterRecord?.name||
     imported.structure.meter,
    rhymeScheme:
     rhymeRecord?.name||
     imported.structure.rhymeScheme
   }
  };
 };

 useEffect(()=>{
  if(!show)return;

  setActiveTab(
   poetryForm?._id
    ?"details"
    :"chat"
  );

  setChatText("");

  setLookupEditor({
   ...emptyLookupEditor
  });

  loadLookups();
 },[show]);

 useEffect(()=>{
  if(!show)return;

  if(poetryForm){
   setForm({
    name:poetryForm.name||"",
    slug:poetryForm.slug||"",
    alternateNames:(
     poetryForm.alternateNames||[]
    ).join(", "),
    type:poetryForm.type||"form",
    category:
     normalizeLookupValue(
      poetryForm.category
     )||NA,
    origin:
     poetryForm.origin||NA,
    description:
     poetryForm.description||NA,
    structure:{
     lines:
      poetryForm.structure?.lines??
      "",
     stanzas:
      poetryForm.structure?.stanzas||
      NA,
     meter:
      normalizeLookupValue(
       poetryForm.structure?.meter
      )||NA,
     rhymeScheme:
      normalizeLookupValue(
       poetryForm.structure?.rhymeScheme
      )||NA,
     syllablePattern:
      poetryForm.structure?.syllablePattern||
      NA,
     refrain:
      poetryForm.structure?.refrain||
      NA,
     additionalRules:Array.isArray(
      poetryForm.structure?.additionalRules
     )
      ?poetryForm.structure.additionalRules
      :parseRules(
       poetryForm.structure?.additionalRules||
       ""
      )
    },
    examples:normalizeExamples(
     poetryForm.examples
    ),
    references:normalizeReferences(
     poetryForm.references
    ),
    notes:
     poetryForm.notes||NA,
    isActive:
     poetryForm.isActive!==false
   });
  }else{
   setForm({
    ...emptyForm,
    structure:{
     ...emptyStructure,
     additionalRules:[]
    },
    examples:[],
    references:[]
   });
  }
 },[show,poetryForm]);

 useEffect(()=>{
  if(!show)return;

  setForm(current=>{
   const category=matchLookupValue(
    current.category,
    categories
   );

   const meter=matchLookupValue(
    current.structure?.meter,
    meters
   );

   const rhymeScheme=matchLookupValue(
    current.structure?.rhymeScheme,
    rhymeSchemes
   );

   if(
    category===current.category&&
    meter===current.structure?.meter&&
    rhymeScheme===current.structure?.rhymeScheme
   ){
    return current;
   }

   return{
    ...current,
    category,
    structure:{
     ...current.structure,
     meter,
     rhymeScheme
    }
   };
  });
 },[
  show,
  categories,
  meters,
  rhymeSchemes
 ]);

 const parseChatText=async()=>{
  try{
   if(!chatText.trim()){
    throw new Error(
     "Paste the ChatGPT response first"
    );
   }

   setParsing(true);

   const trimmed=chatText.trim();
   let parsedForm=null;

   if(
    trimmed.startsWith("{")||
    trimmed.startsWith("[")
   ){
    try{
     parsedForm=normalizeImportedObject(
      JSON.parse(trimmed)
     );
    }catch(error){
     if(!(error instanceof SyntaxError)){
      throw error;
     }

     parsedForm=null;
    }
   }

   if(!parsedForm){
    parsedForm=parsePlainTextForm(
     chatText
    );
   }

   parsedForm=await ensureImportedLookups(
    parsedForm
   );

   setForm(parsedForm);

   setLookupEditor({
    ...emptyLookupEditor
   });

   setActiveTab("details");
  }catch(error){
   onError(
    error.message||
    "Unable to parse ChatGPT response",
    false
   );
  }finally{
   setParsing(false);
  }
 };

 const clearChatText=()=>{
  setChatText("");
 };

 const handleChange=e=>{
  const {
   name,
   value,
   type,
   checked
  }=e.target;

  setForm(current=>{
   const updated={
    ...current,
    [name]:
     type==="checkbox"
      ?checked
      :value
   };

   if(
    name==="name"&&
    !isEdit
   ){
    updated.slug=slugify(value);
   }

   return updated;
  });
 };

 const handleStructureChange=e=>{
  const {name,value}=e.target;

  setForm(current=>({
   ...current,
   structure:{
    ...current.structure,
    [name]:value
   }
  }));
 };

 const openLookupEditor=(type,currentValue="",items=[])=>{
  const missing=
   currentValue&&
   !lookupExists(
    currentValue,
    items
   );

  setLookupEditor({
   type,
   name:missing
    ?String(currentValue).trim()
    :"",
   description:"",
   saving:false,
   error:""
  });
 };

 const closeLookupEditor=()=>{
  if(lookupEditor.saving)return;

  setLookupEditor({
   ...emptyLookupEditor
  });
 };

 const handleLookupEditorChange=e=>{
  const {name,value}=e.target;

  setLookupEditor(current=>({
   ...current,
   [name]:value,
   error:""
  }));
 };

 const selectLookupValue=(type,name)=>{
  if(type==="category"){
   setForm(current=>({
    ...current,
    category:name
   }));

   return;
  }

  setForm(current=>({
   ...current,
   structure:{
    ...current.structure,
    [type]:name
   }
  }));
 };

 const saveLookup=async()=>{
  const name=textOrNA(
   lookupEditor.name
  );

  if(!lookupEditor.type)return;

  try{
   setLookupEditor(current=>({
    ...current,
    saving:true,
    error:""
   }));

   const record=await createLookup(
    lookupEditor.type,
    name
   );

   selectLookupValue(
    lookupEditor.type,
    record.name
   );

   setLookupEditor({
    ...emptyLookupEditor
   });
  }catch(error){
   setLookupEditor(current=>({
    ...current,
    saving:false,
    error:
     error.message||
     "Unable to add lookup value"
   }));
  }
 };

 const renderLookupEditor=(type,label)=>{
  if(lookupEditor.type!==type){
   return null;
  }

  return(
   <Card className="mt-2">
    <Card.Body>
     <div className="d-flex justify-content-between align-items-center mb-3">
      <strong>
       Add {label}
      </strong>

      <Button
       type="button"
       size="sm"
       variant="outline-secondary"
       onClick={closeLookupEditor}
       disabled={lookupEditor.saving}
      >
       <X size={15}/>
      </Button>
     </div>

     <Row className="g-2">
      <Col md={5}>
       <Form.Group>
        <Form.Label>
         Name
        </Form.Label>

        <Form.Control
         name="name"
         value={lookupEditor.name}
         onChange={handleLookupEditorChange}
         disabled={lookupEditor.saving}
        />
       </Form.Group>
      </Col>

      <Col md={7}>
       <Form.Group>
        <Form.Label>
         Description
        </Form.Label>

        <Form.Control
         name="description"
         value={lookupEditor.description}
         onChange={handleLookupEditorChange}
         disabled={lookupEditor.saving}
        />
       </Form.Group>
      </Col>
     </Row>

     {lookupEditor.error&&(
      <div className="text-danger mt-2">
       {lookupEditor.error}
      </div>
     )}

     <div className="d-flex justify-content-end gap-2 mt-3">
      <Button
       type="button"
       size="sm"
       variant="secondary"
       onClick={closeLookupEditor}
       disabled={lookupEditor.saving}
      >
       Cancel
      </Button>

      <Button
       type="button"
       size="sm"
       variant="primary"
       className="text-nowrap"
       onClick={saveLookup}
       disabled={
        lookupEditor.saving||
        !lookupEditor.name.trim()
       }
      >
       {lookupEditor.saving?(
        <Spinner
         animation="border"
         size="sm"
        />
       ):(
        <Plus size={15}/>
       )}
       Add & Select
      </Button>
     </div>
    </Card.Body>
   </Card>
  );
 };

 const addRule=()=>{
  setForm(current=>({
   ...current,
   structure:{
    ...current.structure,
    additionalRules:[
     ...current.structure.additionalRules,
     ""
    ]
   }
  }));
 };

 const updateRule=(index,value)=>{
  setForm(current=>({
   ...current,
   structure:{
    ...current.structure,
    additionalRules:
     current.structure.additionalRules.map(
      (rule,i)=>
       i===index
        ?value
        :rule
     )
   }
  }));
 };

 const removeRule=index=>{
  setForm(current=>({
   ...current,
   structure:{
    ...current.structure,
    additionalRules:
     current.structure.additionalRules.filter(
      (_,i)=>i!==index
     )
   }
  }));
 };

 const handleExampleChange=(index,e)=>{
  const {name,value}=e.target;

  setForm(current=>({
   ...current,
   examples:current.examples.map(
    (example,i)=>
     i===index
      ?{
       ...example,
       [name]:value
      }
      :example
   )
  }));
 };

 const handleReferenceChange=(index,e)=>{
  const {name,value}=e.target;

  setForm(current=>({
   ...current,
   references:current.references.map(
    (reference,i)=>
     i===index
      ?{
       ...reference,
       [name]:value
      }
      :reference
   )
  }));
 };

 const addExample=()=>{
  setForm(current=>({
   ...current,
   examples:[
    ...current.examples,
    {
     ...emptyExample,
     title:NA,
     author:NA,
     text:NA,
     notes:NA,
     sourceUrl:NA
    }
   ]
  }));
 };

 const removeExample=index=>{
  setForm(current=>({
   ...current,
   examples:current.examples.filter(
    (_,i)=>i!==index
   )
  }));
 };

 const addReference=()=>{
  setForm(current=>({
   ...current,
   references:[
    ...current.references,
    {...emptyReference}
   ]
  }));
 };

 const removeReference=index=>{
  setForm(current=>({
   ...current,
   references:current.references.filter(
    (_,i)=>i!==index
   )
  }));
 };

 const buildPayload=()=>({
  name:form.name.trim(),
  slug:slugify(form.name),
  alternateNames:form.alternateNames
   .split(",")
   .map(item=>item.trim())
   .filter(item=>
    item&&
    !/^(n\/a|na)$/i.test(item)
   ),
  type:form.type,
  category:textOrNA(
   form.category
  ),
  origin:textOrNA(
   form.origin
  ),
  description:textOrNA(
   form.description
  ),
  structure:{
   lines:
    form.structure.lines===""
     ?null
     :Number(
      form.structure.lines
     ),
   stanzas:textOrNA(
    form.structure.stanzas
   ),
   meter:textOrNA(
    form.structure.meter
   ),
   rhymeScheme:textOrNA(
    form.structure.rhymeScheme
   ),
   syllablePattern:textOrNA(
    form.structure.syllablePattern
   ),
   refrain:textOrNA(
    form.structure.refrain
   ),
   additionalRules:
    form.structure.additionalRules
     .map(rule=>rule.trim())
     .filter(Boolean)
  },
  examples:form.examples
   .map(example=>({
    title:textOrNA(
     example.title
    ),
    author:textOrNA(
     example.author
    ),
    text:textOrNA(
     example.text
    ),
    notes:textOrNA(
     example.notes
    ),
    sourceUrl:
     cleanUrl(
      example.sourceUrl
     )||NA
   }))
   .filter(example=>
    example.title||
    example.author||
    example.text||
    example.notes||
    example.sourceUrl
   ),
  references:form.references
   .map(reference=>({
    title:reference.title.trim(),
    url:cleanUrl(
     reference.url
    )
   }))
   .filter(reference=>
    reference.title||
    reference.url
   ),
  notes:textOrNA(
   form.notes
  ),
  isActive:form.isActive
 });

 const validateForm=()=>{
  if(!form.name.trim()){
   setActiveTab("details");

   onError(
    "Name is required",
    false
   );

   return false;
  }

  if(!form.description.trim()){
   setActiveTab("details");

   onError(
    "Description is required",
    false
   );

   return false;
  }

  const invalidReference=
   form.references.find(
    reference=>
     reference.url.trim()&&
     !reference.title.trim()
   );

  if(invalidReference){
   setActiveTab("references");

   onError(
    "Every reference with a URL must have a title",
    false
   );

   return false;
  }

  return true;
 };

 const handleSubmit=async e=>{
  e.preventDefault();

  if(!validateForm())return;

  try{
   setSaving(true);

   const res=await fetch(
    isEdit
     ?`/api/poetry-forms/${poetryForm._id}`
     :"/api/poetry-forms",
    {
     method:isEdit
      ?"PUT"
      :"POST",
     headers:{
      "Content-Type":"application/json"
     },
     body:JSON.stringify(
      buildPayload()
     )
    }
   );

   const data=await res
    .json()
    .catch(()=>({}));

   if(!res.ok){
    onError(
     data.message||
     "Unable to save poetry form",
     res.status>=500
    );

    return;
   }

   onSaved(
    data,
    isEdit
   );
  }catch(error){
   onError(
    error.message||
    "Unable to connect to the server",
    true
   );
  }finally{
   setSaving(false);
  }
 };

 return(
  <Modal
   show={show}
   onHide={
    saving
     ?()=>{}
     :onClose
   }
   backdrop="static"
   keyboard={false}
   size="xl"
   centered
   scrollable
  >
   <Modal.Header
    closeButton={!saving}
   >
    <Modal.Title>
     {isEdit
      ?"Edit Poetry Form"
      :"Add Poetry Form"}
    </Modal.Title>
   </Modal.Header>

   <Nav
    variant="tabs"
    fill
    activeKey={activeTab}
    onSelect={key=>
     setActiveTab(key)
    }
    className="poetry-form-tabs"
   >
    <Nav.Item>
     <Nav.Link eventKey="chat">
      Chat Import
     </Nav.Link>
    </Nav.Item>

    <Nav.Item>
     <Nav.Link eventKey="details">
      Form Details
     </Nav.Link>
    </Nav.Item>

    <Nav.Item>
     <Nav.Link eventKey="examples">
      Examples ({form.examples.length})
     </Nav.Link>
    </Nav.Item>

    <Nav.Item>
     <Nav.Link eventKey="references">
      References ({form.references.length})
     </Nav.Link>
    </Nav.Item>
   </Nav>

   <Modal.Body>
    <Form
     id="poetry-form-admin-form"
     onSubmit={handleSubmit}
    >
     {activeTab==="chat"&&(
      <>
       <Form.Group>
        <Form.Label>
         ChatGPT Response
        </Form.Label>

        <Form.Control
         as="textarea"
         rows={22}
         value={chatText}
         onChange={e=>
          setChatText(
           e.target.value
          )
         }
         placeholder={`Name:
ABC

Slug: AUTO

Alternate Names:
N/A

Type:
form

Category:
Alphabetic Poetry

Origin:
N/A

Description:
Description of the poetry form.

Lines:
5

Stanzas:
Single five-line unit

Meter:
Variable

Rhyme Scheme:
Variable

Syllable Pattern:
N/A

Refrain:
N/A

Additional Rules:
- Rule one.
- Rule two.

Examples:
- Title:
  Example Title
  Author:
  Example Author
  Text:
  First line
  Second line
  Notes:
  Explanation of the example.
  Source URL:
  https://example.com/example

References:
- Title:
  Reference One
  URL:
  https://example.com/reference-one
- Title:
  Reference Two
  URL:
  https://example.com/reference-two
- Title:
  Reference Three
  URL:
  https://example.com/reference-three

Notes:
N/A

Tags: AUTO

Active: true`}
        />
       </Form.Group>

       <div className="d-flex justify-content-end gap-2 mt-3">
        <Button
         type="button"
         variant="outline-secondary"
         onClick={clearChatText}
         disabled={
          !chatText||
          parsing
         }
        >
         <X size={16}/>
         Clear
        </Button>

        <Button
         type="button"
         variant="primary"
         onClick={parseChatText}
         disabled={
          !chatText.trim()||
          loadingLookups||
          parsing
         }
        >
         {parsing?(
          <Spinner
           animation="border"
           size="sm"
          />
         ):(
          <FileInput size={16}/>
         )}
         Parse & Fill Form
        </Button>
       </div>
      </>
     )}

     {activeTab==="details"&&(
      <>
       <Row className="g-3">
        <Col md={6}>
         <Form.Group>
          <Form.Label>
           Name
          </Form.Label>

          <Form.Control
           name="name"
           value={form.name}
           onChange={handleChange}
          />
         </Form.Group>
        </Col>

        <Col md={6}>
         <Form.Group>
          <Form.Label>
           Slug
          </Form.Label>

          <Form.Control
           name="slug"
           value={form.slug}
           readOnly
          />
         </Form.Group>
        </Col>

        <Col md={6}>
         <Form.Group>
          <Form.Label>
           Alternate Names
          </Form.Label>

          <Form.Control
           name="alternateNames"
           value={form.alternateNames}
           onChange={handleChange}
           placeholder="Separate with commas"
          />
         </Form.Group>
        </Col>

        <Col md={3}>
         <Form.Group>
          <Form.Label>
           Type
          </Form.Label>

          <Form.Select
           name="type"
           value={form.type}
           onChange={handleChange}
          >
           <option value="form">
            Form
           </option>

           <option value="meter">
            Meter
           </option>

           <option value="stanza">
            Stanza
           </option>

           <option value="movement">
            Movement
           </option>

           <option value="technique">
            Technique
           </option>

           <option value="genre">
            Genre
           </option>
          </Form.Select>
         </Form.Group>
        </Col>

        <Col md={3}>
         <Form.Group>
          <Form.Label>
           Active
          </Form.Label>

          <div className="poetry-form-switch">
           <Form.Check
            type="switch"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            label={
             form.isActive
              ?"Active"
              :"Inactive"
            }
           />
          </div>
         </Form.Group>
        </Col>

        <Col md={6}>
         <Form.Group>
          <Form.Label>
           Category
          </Form.Label>

          <InputGroup>
           <Form.Select
            name="category"
            value={form.category}
            onChange={handleChange}
            disabled={loadingLookups}
           >
            <option value="">
             Select Category
            </option>

            {form.category&&
             !lookupExists(
              form.category,
              categories
             )&&(
              <option value={form.category}>
               {form.category}
              </option>
             )}

            {categories.map(category=>(
             <option
              key={category._id}
              value={category.name}
             >
              {category.name}
             </option>
            ))}
           </Form.Select>

           <Button
            type="button"
            variant="outline-primary"
            className="text-nowrap"
            onClick={()=>
             openLookupEditor(
              "category",
              form.category,
              categories
             )
            }
            disabled={loadingLookups}
           >
            <Plus size={16}/>
            Add
           </Button>
          </InputGroup>

          {renderLookupEditor(
           "category",
           "Category"
          )}
         </Form.Group>
        </Col>

        <Col md={6}>
         <Form.Group>
          <Form.Label>
           Origin
          </Form.Label>

          <Form.Control
           as="textarea"
           rows={4}
           name="origin"
           value={form.origin}
           onChange={handleChange}
          />
         </Form.Group>
        </Col>

        <Col xs={12}>
         <Form.Group>
          <Form.Label>
           Description
          </Form.Label>

          <Form.Control
           as="textarea"
           rows={5}
           name="description"
           value={form.description}
           onChange={handleChange}
          />
         </Form.Group>
        </Col>
       </Row>

       <h3 className="poetry-form-section-title">
        Structure
       </h3>

       <Row className="g-3">
        <Col md={3}>
         <Form.Group>
          <Form.Label>
           Lines
          </Form.Label>

          <Form.Control
           type="number"
           min="0"
           name="lines"
           value={
            form.structure.lines
           }
           onChange={
            handleStructureChange
           }
          />
         </Form.Group>
        </Col>

        <Col md={9}>
         <Form.Group>
          <Form.Label>
           Stanzas
          </Form.Label>

          <Form.Control
           name="stanzas"
           value={
            form.structure.stanzas
           }
           onChange={
            handleStructureChange
           }
          />
         </Form.Group>
        </Col>

        <Col md={6}>
         <Form.Group>
          <Form.Label>
           Meter
          </Form.Label>

          <InputGroup>
           <Form.Select
            name="meter"
            value={
             form.structure.meter
            }
            onChange={
             handleStructureChange
            }
            disabled={loadingLookups}
           >
            <option value="">
             Select Meter
            </option>

            {form.structure.meter&&
             !lookupExists(
              form.structure.meter,
              meters
             )&&(
              <option
               value={
                form.structure.meter
               }
              >
               {form.structure.meter}
              </option>
             )}

            {meters.map(meter=>(
             <option
              key={meter._id}
              value={meter.name}
             >
              {meter.name}
             </option>
            ))}
           </Form.Select>

           <Button
            type="button"
            variant="outline-primary"
            className="text-nowrap"
            onClick={()=>
             openLookupEditor(
              "meter",
              form.structure.meter,
              meters
             )
            }
            disabled={loadingLookups}
           >
            <Plus size={16}/>
            Add
           </Button>
          </InputGroup>

          {renderLookupEditor(
           "meter",
           "Meter"
          )}
         </Form.Group>
        </Col>

        <Col md={6}>
         <Form.Group>
          <Form.Label>
           Rhyme Scheme
          </Form.Label>

          <InputGroup>
           <Form.Select
            name="rhymeScheme"
            value={
             form.structure.rhymeScheme
            }
            onChange={
             handleStructureChange
            }
            disabled={loadingLookups}
           >
            <option value="">
             Select Rhyme Scheme
            </option>

            {form.structure.rhymeScheme&&
             !lookupExists(
              form.structure.rhymeScheme,
              rhymeSchemes
             )&&(
              <option
               value={
                form.structure.rhymeScheme
               }
              >
               {
                form.structure.rhymeScheme
               }
              </option>
             )}

            {rhymeSchemes.map(rhyme=>(
             <option
              key={rhyme._id}
              value={rhyme.name}
             >
              {rhyme.name}
             </option>
            ))}
           </Form.Select>

           <Button
            type="button"
            variant="outline-primary"
            className="text-nowrap"
            onClick={()=>
             openLookupEditor(
              "rhymeScheme",
              form.structure.rhymeScheme,
              rhymeSchemes
             )
            }
            disabled={loadingLookups}
           >
            <Plus size={16}/>
            Add
           </Button>
          </InputGroup>

          {renderLookupEditor(
           "rhymeScheme",
           "Rhyme Scheme"
          )}
         </Form.Group>
        </Col>

        <Col md={6}>
         <Form.Group>
          <Form.Label>
           Syllable Pattern
          </Form.Label>

          <Form.Control
           name="syllablePattern"
           value={
            form.structure.syllablePattern
           }
           onChange={
            handleStructureChange
           }
          />
         </Form.Group>
        </Col>

        <Col md={6}>
         <Form.Group>
          <Form.Label>
           Refrain
          </Form.Label>

          <Form.Control
           name="refrain"
           value={
            form.structure.refrain
           }
           onChange={
            handleStructureChange
           }
          />
         </Form.Group>
        </Col>

        <Col xs={12}>
         <div className="poetry-form-section-heading">
          <h3>
           Additional Rules
          </h3>

          <Button
           type="button"
           size="sm"
           variant="outline-primary"
           className="text-nowrap"
           onClick={addRule}
          >
           <Plus size={16}/>
           Add Rule
          </Button>
         </div>

         {form.structure.additionalRules.length===0&&(
          <div className="poetry-form-empty">
           No additional rules added.
          </div>
         )}

         {form.structure.additionalRules.map(
          (rule,index)=>(
           <InputGroup
            className="mb-2"
            key={index}
           >
            <Form.Control
             value={rule}
             onChange={e=>
              updateRule(
               index,
               e.target.value
              )
             }
             placeholder={`Rule ${index+1}`}
            />

            <Button
             type="button"
             variant="outline-danger"
             onClick={()=>
              removeRule(index)
             }
            >
             <Trash2 size={16}/>
            </Button>
           </InputGroup>
          )
         )}
        </Col>

        <Col xs={12}>
         <Form.Group>
          <Form.Label>
           Notes
          </Form.Label>

          <Form.Control
           as="textarea"
           rows={4}
           name="notes"
           value={form.notes}
           onChange={handleChange}
          />
         </Form.Group>
        </Col>
       </Row>
      </>
     )}

     {activeTab==="examples"&&(
      <>
       <div className="poetry-form-section-heading mt-0">
        <h3>
         Examples
        </h3>

        <Button
         type="button"
         size="sm"
         variant="outline-primary"
         className="text-nowrap"
         onClick={addExample}
        >
         <Plus size={16}/>
         Add Example
        </Button>
       </div>

       {form.examples.length===0&&(
        <div className="poetry-form-empty">
         No examples added.
        </div>
       )}

       {form.examples.map(
        (example,index)=>(
         <Card
          className="poetry-form-subcard"
          key={index}
         >
          <Card.Body>
           <div className="poetry-form-subcard-heading">
            <strong>
             Example {index+1}
            </strong>

            <Button
             type="button"
             size="sm"
             variant="outline-danger"
             onClick={()=>
              removeExample(index)
             }
            >
             <Trash2 size={16}/>
            </Button>
           </div>

           <Row className="g-3">
            <Col md={6}>
             <Form.Group>
              <Form.Label>
               Title
              </Form.Label>

              <Form.Control
               name="title"
               value={example.title}
               onChange={e=>
                handleExampleChange(
                 index,
                 e
                )
               }
              />
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group>
              <Form.Label>
               Author
              </Form.Label>

              <Form.Control
               name="author"
               value={example.author}
               onChange={e=>
                handleExampleChange(
                 index,
                 e
                )
               }
              />
             </Form.Group>
            </Col>

            <Col xs={12}>
             <Form.Group>
              <Form.Label>
               Text
              </Form.Label>

              <Form.Control
               as="textarea"
               rows={8}
               name="text"
               value={example.text}
               onChange={e=>
                handleExampleChange(
                 index,
                 e
                )
               }
              />
             </Form.Group>
            </Col>

            <Col xs={12}>
             <Form.Group>
              <Form.Label>
               Notes
              </Form.Label>

              <Form.Control
               as="textarea"
               rows={3}
               name="notes"
               value={example.notes}
               onChange={e=>
                handleExampleChange(
                 index,
                 e
                )
               }
              />
             </Form.Group>
            </Col>

            <Col xs={12}>
             <Form.Group>
              <Form.Label>
               Source URL
              </Form.Label>

              <Form.Control
               type="text"
               name="sourceUrl"
               value={
                example.sourceUrl
               }
               onChange={e=>
                handleExampleChange(
                 index,
                 e
                )
               }
              />
             </Form.Group>
            </Col>
           </Row>
          </Card.Body>
         </Card>
        )
       )}
      </>
     )}

     {activeTab==="references"&&(
      <>
       <div className="poetry-form-section-heading mt-0">
        <h3>
         References
        </h3>

        <Button
         type="button"
         size="sm"
         variant="outline-primary"
         className="text-nowrap"
         onClick={addReference}
        >
         <Plus size={16}/>
         Add Reference
        </Button>
       </div>

       {form.references.length===0&&(
        <div className="poetry-form-empty">
         No references added.
        </div>
       )}

       {form.references.map(
        (reference,index)=>(
         <Card
          className="poetry-form-subcard"
          key={index}
         >
          <Card.Body>
           <div className="poetry-form-subcard-heading">
            <strong>
             Reference {index+1}
            </strong>

            <Button
             type="button"
             size="sm"
             variant="outline-danger"
             onClick={()=>
              removeReference(index)
             }
            >
             <Trash2 size={16}/>
            </Button>
           </div>

           <Row className="g-3">
            <Col md={6}>
             <Form.Group>
              <Form.Label>
               Title
              </Form.Label>

              <Form.Control
               name="title"
               value={
                reference.title
               }
               onChange={e=>
                handleReferenceChange(
                 index,
                 e
                )
               }
              />
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group>
              <Form.Label>
               URL
              </Form.Label>

              <Form.Control
               type="url"
               name="url"
               value={
                reference.url
               }
               onChange={e=>
                handleReferenceChange(
                 index,
                 e
                )
               }
              />
             </Form.Group>
            </Col>
           </Row>
          </Card.Body>
         </Card>
        )
       )}
      </>
     )}
    </Form>
   </Modal.Body>

   <Modal.Footer>
    <Button
     type="button"
     variant="secondary"
     onClick={onClose}
     disabled={
      saving||
      parsing||
      lookupEditor.saving
     }
    >
     <X size={16}/>
     Cancel
    </Button>

    <Button
     type="submit"
     form="poetry-form-admin-form"
     variant="primary"
     disabled={
      saving||
      parsing||
      loadingLookups||
      lookupEditor.saving
     }
    >
     {saving?(
      <Spinner
       animation="border"
       size="sm"
      />
     ):(
      <Save size={16}/>
     )}

     {isEdit
      ?"Update"
      :"Save"}
    </Button>
   </Modal.Footer>
  </Modal>
 );
};

export default PoetryFormAdmin;