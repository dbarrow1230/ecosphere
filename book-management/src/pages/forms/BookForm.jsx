// /src/pages/forms/BookForm.jsx
import {memo,useCallback,useEffect,useMemo,useState} from "react";
import {Modal,Tab,Tabs} from "react-bootstrap";
import {useNavigate,useParams} from "react-router-dom";
import AuthorForm from "./AuthorForm";
import SeriesForm from "./SeriesForm";
import PublisherForm from "./PublisherForm";

const CONDITION_OPTIONS=["New","Like New","Very Good","Good","Fair","Poor","Damaged"];
const READING_STATUS_OPTIONS=["Unread","Reading","Paused","Finished","Abandoned"];

const emptyForm={
 title:"",
 subtitle:"",
 edition:"",
 volume:"",
 summary:"",
 authors:[],
 series:"",
 seriesNumber:"",
 publishers:[],
 publication:{publishedDate:"",language:""},
 isbn10:"",
 isbn13:"",
 eisbn:"",
 asin:"",
 customId:"",
 identifierNotes:"",
 cost:"",
 currency:"USD",
 acquisitionSource:"",
 acquisitionMethod:"",
 acquisitionNotes:"",
 formats:[],
 formatPrices:[],
 duration:{hours:"",minutes:""},
 fileTypes:[],
 purchaseDate:"",
 genres:[],
 tags:"",
 subjects:"",
 images:[],
 condition:"New",
 reading:{status:"Unread",currentPage:"0",totalPages:"",progressPercent:"0",startedAt:"",finishedAt:"",lastReadAt:""},
 rating:{average:"",personal:""},
 notes:[]
};

function toInputDate(value){
 if(!value)return "";
 const d=new Date(value);
 if(Number.isNaN(d.getTime()))return "";
 return d.toISOString().slice(0,10);
}

function toCsv(value){
 if(!Array.isArray(value))return "";
 return value.filter(Boolean).join(", ");
}

const TAG_STOP_WORDS=new Set([
 "a","an","and","are","as","at","be","by","for","from","how","in","into","is","it","of","on","or","that","the","this","to","with","your"
]);

function normalizeTag(value){
 return String(value||"")
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g,"")
  .replace(/\s+/g," ")
  .trim();
}

function tagsFromBookSubject(form,genreOptions){
 const selectedGenreLabels=form.genres
  .map(genreId=>{
   const found=genreOptions.find(item=>String(getId(item))===String(genreId));
   return getOptionLabel(found);
  })
  .filter(Boolean);

 const phraseTags=[
  ...selectedGenreLabels,
  form.title,
  form.subtitle
 ].map(normalizeTag).filter(Boolean);

 const keywordTags=[form.title,form.subtitle,form.summary]
  .join(" ")
  .split(/\s+/)
  .map(normalizeTag)
  .filter(item=>item.length>2&&!TAG_STOP_WORDS.has(item));

 return [...phraseTags,...keywordTags]
  .filter((item,index,items)=>items.indexOf(item)===index)
  .slice(0,20);
}

function getId(value){
 if(!value)return "";
 return String(typeof value==="object"?(value?._id||value?.$oid||""):value);
}

function getAuthorLabel(item){
 if(!item)return "";
 if(typeof item==="string")return item;
 return item?.displayName||item?.name||[item?.firstName,item?.middleName,item?.lastName].filter(Boolean).join(" ");
}

function getOptionLabel(item){
 if(!item)return "";
 if(typeof item==="string")return item;
 return item?.name||item?.title||item?.label||item?.value||"";
}

function getPublisherLabel(item){
 return item?.name||item?.displayName||"";
}

function getSeriesLabel(item){
 if(!item)return "";
 if(typeof item==="string")return item;
 return item?.name||item?.title||"";
}

function normalizeOptions(data,key){
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.[key]))return data[key];
 if(Array.isArray(data?.items))return data.items;
 if(Array.isArray(data?.results))return data.results;
 return [];
}

function InlineField({label,children,right}){
 return(
  <div className="row g-2 align-items-start mb-2">
   <div className="col-md-3 fw-semibold text-md-end pt-2">{label}:</div>
   <div className="col-md-9">
    <div className="d-flex gap-2 align-items-start flex-wrap">
     <div className="flex-grow-1">{children}</div>
     {right||null}
    </div>
   </div>
  </div>
 );
}

const CheckboxList=memo(function CheckboxList({items=[],selected=[],getLabel,groupName,onToggle,emptyText="No items found.",maxHeight="180px"}){
 const [filter,setFilter]=useState("");
 const selectedSet=useMemo(()=>new Set(selected.map(item=>String(item))),[selected]);
 const normalizedFilter=filter.trim().toLowerCase();
 const visibleLimit=150;

 const visibleItems=useMemo(()=>{
  const labelFor=item=>String(getLabel(item)||"").toLowerCase();
  const filtered=normalizedFilter?items.filter(item=>labelFor(item).includes(normalizedFilter)):items;

  if(normalizedFilter)return filtered;

  const picked=new Set();
  const selectedItems=[];
  const unselectedItems=[];

  for(const item of filtered){
   const itemId=getId(item);
   if(!itemId||picked.has(itemId))continue;
   picked.add(itemId);

   if(selectedSet.has(itemId))selectedItems.push(item);
   else unselectedItems.push(item);
  }

  return [...selectedItems,...unselectedItems.slice(0,Math.max(visibleLimit-selectedItems.length,0))];
 },[items,getLabel,normalizedFilter,selectedSet]);

 const showingLimited=!normalizedFilter&&items.length>visibleItems.length;

 return(
  <div className="border rounded p-2">
   <input
    type="search"
    className="form-control form-control-sm mb-2"
    value={filter}
    onChange={e=>setFilter(e.target.value)}
    placeholder={`Filter ${groupName}s...`}
    disabled={!items.length}
   />
   {showingLimited?<div className="small text-muted mb-2">Showing {visibleItems.length} of {items.length}. Type to narrow the list.</div>:null}
   <div style={{maxHeight,overflowY:"auto"}}>
    {!items.length?<div className="text-muted">{emptyText}</div>:null}
    {items.length&&!visibleItems.length?<div className="text-muted">No matching {groupName}s found.</div>:null}
    {visibleItems.map(item=>{
     const itemId=getId(item);
     const checked=selectedSet.has(itemId);
     return(
      <div key={itemId} className="form-check mb-1">
       <input id={`${groupName}-${itemId}`} type="checkbox" className="form-check-input" checked={checked} onChange={()=>onToggle(itemId)} />
       <label htmlFor={`${groupName}-${itemId}`} className="form-check-label">{getLabel(item)}</label>
      </div>
     );
    })}
   </div>
  </div>
 );
});

async function fetchJson(url){
 const res=await fetch(url,{cache:"no-store"});
 const data=await res.json();
 if(!res.ok)throw new Error(data?.message||`Failed to load ${url}`);
 return data;
}

export default function BookForm({mode,bookId,initialData,onSaved,onCancel}){
 const navigate=useNavigate();
 const params=useParams();
 const id=bookId||params.id||"";
 const isEdit=mode?mode==="edit":!!id;

 const [form,setForm]=useState(emptyForm);
 const [loading,setLoading]=useState(isEdit&&!initialData);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [activeTab,setActiveTab]=useState("book-info");

 const [authorOptions,setAuthorOptions]=useState([]);
 const [publisherOptions,setPublisherOptions]=useState([]);
 const [seriesOptions,setSeriesOptions]=useState([]);
 const [languageOptions,setLanguageOptions]=useState([]);
 const [genreOptions,setGenreOptions]=useState([]);
 const [formatOptions,setFormatOptions]=useState([]);
 const [fileTypeOptions,setFileTypeOptions]=useState([]);
 const [acquisitionSourceOptions,setAcquisitionSourceOptions]=useState([]);
 const [acquisitionMethodOptions,setAcquisitionMethodOptions]=useState([]);
 const [lookupLoading,setLookupLoading]=useState(true);

 const [showAuthorModal,setShowAuthorModal]=useState(false);
 const [showSeriesModal,setShowSeriesModal]=useState(false);
 const [showPublisherModal,setShowPublisherModal]=useState(false);

 const [newLanguage,setNewLanguage]=useState("");
 const [newGenre,setNewGenre]=useState("");
 const [noteInput,setNoteInput]=useState("");
 const [imagePreview,setImagePreview]=useState("");
 const [uploadingImage,setUploadingImage]=useState(false);

 const computed=useMemo(()=>{
  const slug=(form.title.trim()||"")
   .toLowerCase()
   .replace(/[^a-z0-9\s-]/g,"")
   .replace(/\s+/g,"-")
   .replace(/-+/g,"-")
   .replace(/^-+|-+$/g,"");

  const isbn10=(form.isbn10||"").toUpperCase().replace(/[^0-9X]/g,"");
  const isbn13=(form.isbn13||"").replace(/[^0-9]/g,"");
  const eisbn=(form.eisbn||"").replace(/[^0-9]/g,"");
  const asin=(form.asin||"").toUpperCase().replace(/[^A-Z0-9]/g,"");

  const currentPage=Math.max(0,Number(form.reading.currentPage)||0);
  const totalPages=Math.max(0,Number(form.reading.totalPages)||0);
  const progressPercent=totalPages>0?Math.min(100,Math.max(0,Math.round((currentPage/totalPages)*100))):0;

  const audiobookFormatIds=formatOptions.filter(item=>{
   const label=getOptionLabel(item).toLowerCase().replace(/[\s-]+/g,"");
   return label.includes("audio");
  }).map(item=>String(getId(item)));

  const digitalFormatIds=formatOptions.filter(item=>{
   const label=getOptionLabel(item).toLowerCase().replace(/[\s-]+/g,"");
   return label.includes("digital")||
    label.includes("ebook")||
    label.includes("electronic")||
    label.includes("kindle")||
    label.includes("epub")||
    label.includes("pdf");
  }).map(item=>String(getId(item)));

  const isAudiobook=form.formats.some(formatId=>audiobookFormatIds.includes(String(formatId)));
  const isDigital=form.formats.some(formatId=>digitalFormatIds.includes(String(formatId)));
  const showFileTypes=isAudiobook||isDigital;
  const generatedTags=tagsFromBookSubject(form,genreOptions);

  return {slug,isbn10,isbn13,eisbn,asin,progressPercent,isAudiobook,isDigital,showFileTypes,generatedTags};
 },[form,genreOptions,formatOptions]);

 async function loadLookups(){
  try{
   setLookupLoading(true);
   setError("");

   const [
    authorsData,
    publishersData,
    seriesData,
    languagesData,
    genresData,
    formatsData,
    fileTypesData,
    acquisitionSourcesData,
    acquisitionMethodsData
   ]=await Promise.all([
    fetchJson("/api/authors"),
    fetchJson("/api/publishers"),
    fetchJson("/api/series?limit=1000"),
    fetchJson("/api/languages"),
    fetchJson("/api/genres"),
    fetchJson("/api/formats"),
    fetchJson("/api/filetypes"),
    fetchJson("/api/acquisition-sources"),
    fetchJson("/api/acquisition-methods")
   ]);

   setAuthorOptions(
    normalizeOptions(authorsData,"authors").sort((a,b)=>
     getAuthorLabel(a).localeCompare(getAuthorLabel(b))
    )
   );

   setPublisherOptions(
    normalizeOptions(publishersData,"publishers").sort((a,b)=>
     getOptionLabel(a).localeCompare(getOptionLabel(b))
    )
   );

   setSeriesOptions(
    normalizeOptions(seriesData,"series").sort((a,b)=>
     getSeriesLabel(a).localeCompare(getSeriesLabel(b))
    )
   );

   setLanguageOptions(
    normalizeOptions(languagesData,"languages").sort((a,b)=>
     getOptionLabel(a).localeCompare(getOptionLabel(b))
    )
   );

   setGenreOptions(
    normalizeOptions(genresData,"genres").sort((a,b)=>
     getOptionLabel(a).localeCompare(getOptionLabel(b))
    )
   );

   setFormatOptions(
    normalizeOptions(formatsData,"formats").sort((a,b)=>
     getOptionLabel(a).localeCompare(getOptionLabel(b))
    )
   );

   setFileTypeOptions(
    normalizeOptions(fileTypesData,"fileTypes").sort((a,b)=>
     getOptionLabel(a).localeCompare(getOptionLabel(b))
    )
   );

   setAcquisitionSourceOptions(
    normalizeOptions(acquisitionSourcesData,"acquisitionSources").sort((a,b)=>
     getOptionLabel(a).localeCompare(getOptionLabel(b))
    )
   );

   setAcquisitionMethodOptions(
    normalizeOptions(acquisitionMethodsData,"acquisitionMethods").sort((a,b)=>
     getOptionLabel(a).localeCompare(getOptionLabel(b))
    )
   );
  }catch(err){
   setError(err.message||"Failed to load lookup data");
  }finally{
   setLookupLoading(false);
  }
 }

 function applyBookToForm(book){
  const currentPage=book?.reading?.currentPage??"0";
  const totalPages=book?.reading?.totalPages??book?.totalPages??book?.pages??"";

  setForm({
   title:book?.title||"",
   subtitle:book?.subtitle||"",
   edition:book?.edition||"",
   volume:book?.volume||"",
   summary:book?.summary||"",
   authors:Array.isArray(book?.authors)?book.authors.map(item=>getId(item)).filter(Boolean):[],
   series:getId(book?.series),
   seriesNumber:book?.seriesNumber??"",
   publishers:Array.isArray(book?.publishers)?book.publishers.map(item=>getId(item)).filter(Boolean):[],
   publication:{
    publishedDate:toInputDate(book?.publication?.publishedDate),
    language:getId(book?.publication?.language)
   },
   isbn10:book?.isbn10||"",
   isbn13:book?.isbn13||"",
   eisbn:book?.eisbn||"",
   asin:book?.asin||"",
   customId:book?.customId||"",
   identifierNotes:book?.identifierNotes||"",
   cost:book?.cost??"",
   currency:book?.currency||"USD",
   acquisitionSource:getId(book?.acquisitionSource),
   acquisitionMethod:getId(book?.acquisitionMethod),
   acquisitionNotes:book?.acquisitionNotes||"",
   formats:Array.isArray(book?.formats)?book.formats.map(item=>getId(item)).filter(Boolean):[],
   formatPrices:Array.isArray(book?.formatPrices)?book.formatPrices.map(item=>({
    format:getId(item?.format),
    price:item?.price??"",
    currency:item?.currency||book?.currency||"USD"
   })).filter(item=>item.format):[],
   duration:{
    hours:book?.duration?.hours??"",
    minutes:book?.duration?.minutes??""
   },
   fileTypes:Array.isArray(book?.fileTypes)?book.fileTypes.map(item=>getId(item)).filter(Boolean):[],
   purchaseDate:toInputDate(book?.purchaseDate),
   genres:Array.isArray(book?.genres)?book.genres.map(item=>getId(item)).filter(Boolean):[],
   tags:toCsv(book?.tags),
   subjects:toCsv(book?.subjects),
   images:Array.isArray(book?.images)?book.images.filter(Boolean):[],
   condition:book?.condition||"New",
   reading:{
    status:book?.reading?.status||"Unread",
    currentPage:String(currentPage),
    totalPages:String(totalPages||""),
    progressPercent:String(book?.reading?.progressPercent??"0"),
    startedAt:toInputDate(book?.reading?.startedAt),
    finishedAt:toInputDate(book?.reading?.finishedAt),
    lastReadAt:toInputDate(book?.reading?.lastReadAt)
   },
   rating:{
    average:book?.rating?.average??"",
    personal:book?.rating?.personal??""
   },
   notes:Array.isArray(book?.notes)?book.notes.filter(Boolean):[]
  });
  setImagePreview(Array.isArray(book?.images)&&book.images[0]?`/images/${book.images[0]}`:"");
 }

 useEffect(()=>{
  loadLookups();
 },[]);

 useEffect(()=>{
  setForm(prev=>{
   const nextProgress=String(computed.progressPercent);
   if(prev.reading.progressPercent===nextProgress)return prev;
   return {...prev,reading:{...prev.reading,progressPercent:nextProgress}};
  });
 },[computed.progressPercent]);

 useEffect(()=>{
  setForm(prev=>{
   const nextFormatPrices=(prev.formatPrices||[]).filter(item=>prev.formats.includes(String(item.format)));
   const missingFormats=prev.formats.filter(formatId=>!nextFormatPrices.some(item=>String(item.format)===String(formatId)));
   if(!missingFormats.length&&nextFormatPrices.length===(prev.formatPrices||[]).length)return prev;
   return {
    ...prev,
    formatPrices:[
     ...nextFormatPrices,
     ...missingFormats.map(formatId=>({format:String(formatId),price:"",currency:prev.currency||"USD"}))
    ]
   };
  });
 },[form.formats,form.currency]);

 useEffect(()=>{
  if(computed.isAudiobook)return;
  setForm(prev=>{
   if(prev.duration.hours===""&&prev.duration.minutes==="")return prev;
   return {...prev,duration:{hours:"",minutes:""}};
  });
 },[computed.isAudiobook]);

 useEffect(()=>{
  if(computed.showFileTypes)return;
  setForm(prev=>{
   if(!prev.fileTypes.length)return prev;
   return {...prev,fileTypes:[]};
  });
 },[computed.showFileTypes]);

 useEffect(()=>{
  if(initialData){
   applyBookToForm(initialData);
   return;
  }
  if(!isEdit)return;
  let active=true;
  (async()=>{
   try{
    setLoading(true);
    setError("");
    const data=await fetchJson(`/api/books/${id}`);
    if(!active)return;
    applyBookToForm(data?.book||data);
   }catch(err){
    if(active)setError(err.message||"Failed to load book");
   }finally{
    if(active)setLoading(false);
   }
  })();
  return()=>{active=false;};
 },[id,isEdit,initialData]);

 function setField(name,value){
  setForm(prev=>({...prev,[name]:value}));
 }

 function setNested(parent,name,value){
  setForm(prev=>({...prev,[parent]:{...prev[parent],[name]:value}}));
 }

 function toggleArrayValue(name,value){
  setForm(prev=>{
   const list=prev[name]||[];
   const nextValue=String(value);
   return {...prev,[name]:list.includes(nextValue)?list.filter(item=>item!==nextValue):[...list,nextValue]};
  });
 }

 const toggleAuthors=useCallback(value=>toggleArrayValue("authors",value),[]);
 const togglePublishers=useCallback(value=>toggleArrayValue("publishers",value),[]);
 const toggleFormats=useCallback(value=>toggleArrayValue("formats",value),[]);
 const toggleFileTypes=useCallback(value=>toggleArrayValue("fileTypes",value),[]);
 const toggleGenres=useCallback(value=>toggleArrayValue("genres",value),[]);

 function setFormatPrice(index,name,value){
  setForm(prev=>({
   ...prev,
   formatPrices:prev.formatPrices.map((item,i)=>i===index?{...item,[name]:value}:item)
  }));
 }

 function upsertOption(list,item,labelGetter){
  if(!item?._id)return list;
  const itemId=String(item._id);
  const exists=list.some(option=>String(getId(option))===itemId);
  const next=exists?list.map(option=>String(getId(option))===itemId?item:option):[...list,item];
  return next.sort((a,b)=>labelGetter(a).localeCompare(labelGetter(b)));
 }

 function addNote(){
  const value=noteInput.trim();
  if(!value)return;
  setForm(prev=>({...prev,notes:[...prev.notes,value]}));
  setNoteInput("");
 }

 function removeNote(index){
  setForm(prev=>({...prev,notes:prev.notes.filter((_,i)=>i!==index)}));
 }

 async function addLanguage(){
  const value=newLanguage.trim();
  if(!value)return;
  try{
   setError("");
   const res=await fetch("/api/languages",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({name:value})
   });
   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||"Failed to add language");
   const created=data?.language||data;
   setNewLanguage("");
   await loadLookups();
   if(created?._id)setNested("publication","language",String(created._id));
  }catch(err){
   setError(err.message||"Failed to add language");
  }
 }

 async function addGenre(){
  const value=newGenre.trim();
  if(!value)return;
  try{
   setError("");
   const res=await fetch("/api/genres",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({name:value})
   });
   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||"Failed to add genre");
   const created=data?.genre||data;
   setNewGenre("");
   await loadLookups();
   if(created?._id){
    setForm(prev=>({...prev,genres:prev.genres.includes(String(created._id))?prev.genres:[...prev.genres,String(created._id)]}));
   }
  }catch(err){
   setError(err.message||"Failed to add genre");
  }
 }

 async function handleImageChange(e){
  const file=e.target.files?.[0];
  if(!file)return;
  setError("");
  setUploadingImage(true);
  try{
   const body=new FormData();
   body.append("file",file);
   const res=await fetch("/api/upload/images",{
    method:"POST",
    body
   });
   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||"Failed to upload image");
   const filename=data?.filename||file.name;
   setForm(prev=>({...prev,images:[filename]}));
   const uploadedUrl=data?.url||`/images/${filename}`;
   const separator=uploadedUrl.includes("?")?"&":"?";
   setImagePreview(`${uploadedUrl}${separator}v=${Date.now()}`);
  }catch(err){
   setError(err.message||"Failed to upload image");
  }finally{
   setUploadingImage(false);
   e.target.value="";
  }
 }

 function clearImage(){
  setForm(prev=>({...prev,images:[]}));
  setImagePreview("");
 }

 async function handleSubmit(e){
  e.preventDefault();
  if(saving)return;
  setError("");
  setSuccess("");

  if(!form.title.trim()){
   setError("Title is required.");
   return;
  }

  if(!Array.isArray(form.authors)||form.authors.length===0){
   setError("At least one author is required.");
   return;
  }

  if(form.reading.startedAt&&form.reading.finishedAt&&new Date(form.reading.finishedAt)<new Date(form.reading.startedAt)){
   setError("Finished date cannot be before started date.");
   return;
  }

  const payload={
   title:form.title.trim(),
   subtitle:form.subtitle.trim(),
   edition:form.edition.trim(),
   volume:form.volume.trim(),
   summary:form.summary.trim(),
   authors:form.authors,
   series:form.series||null,
   seriesNumber:form.seriesNumber===""?null:Number(form.seriesNumber),
   publishers:form.publishers,
   publication:{
    publishedDate:form.publication.publishedDate||null,
    language:form.publication.language||null
   },
   isbn10:computed.isbn10,
   isbn13:computed.isbn13,
   eisbn:computed.eisbn,
   asin:computed.asin,
   customId:form.customId.trim(),
   identifierNotes:form.identifierNotes.trim(),
   cost:null,
   currency:(form.currency||"USD").trim().toUpperCase(),
   acquisitionSource:form.acquisitionSource||null,
   acquisitionMethod:form.acquisitionMethod||null,
   acquisitionNotes:form.acquisitionNotes.trim(),
   formats:form.formats,
   formatPrices:(form.formatPrices||[]).map(item=>({
    format:item.format,
    price:item.price===""?null:Number(item.price),
    currency:(item.currency||form.currency||"USD").trim().toUpperCase()
   })).filter(item=>item.format),
   ...(computed.isAudiobook?{
    duration:{
     hours:form.duration.hours===""?0:Number(form.duration.hours),
     minutes:form.duration.minutes===""?0:Number(form.duration.minutes)
    }
   }:{
    duration:{hours:0,minutes:0}
   }),
   fileTypes:computed.showFileTypes?form.fileTypes:[],
   purchaseDate:form.purchaseDate||null,
   genres:form.genres,
   tags:computed.generatedTags,
   subjects:form.subjects.split(",").map(item=>item.trim()).filter(Boolean),
   images:form.images,
   condition:form.condition.trim(),
   reading:{
    status:form.reading.status.trim()||"Unread",
    currentPage:form.reading.currentPage===""?0:Number(form.reading.currentPage),
    totalPages:form.reading.totalPages===""?0:Number(form.reading.totalPages),
    progressPercent:computed.progressPercent,
    startedAt:form.reading.startedAt||null,
    finishedAt:form.reading.finishedAt||null,
    lastReadAt:form.reading.lastReadAt||null
   },
   rating:{
    average:form.rating.average===""?null:Number(form.rating.average),
    personal:form.rating.personal===""?null:Number(form.rating.personal)
   },
   notes:form.notes
  };

  try{
   setSaving(true);
   const res=await fetch(isEdit?`/api/books/${id}`:"/api/books",{
    method:isEdit?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });
   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||`Failed to ${isEdit?"update":"create"} book`);
   const saved=data?.book||data;
   setSuccess(`Book ${isEdit?"updated":"created"} successfully.`);
   if(onSaved){
    onSaved(saved);
    return;
   }
   applyBookToForm(saved);
  }catch(err){
   setError(err.message||`Failed to ${isEdit?"update":"create"} book`);
  }finally{
   setSaving(false);
  }
 }

 if(loading||lookupLoading){
  return <div className="container py-4">Loading...</div>;
 }

 return(
  <div className="container py-3">
   {!onSaved&&(
    <div className="d-flex align-items-center justify-content-between mb-3">
     <h1 className="m-0">{isEdit?"Edit Book":"Add Book"}</h1>
     <button type="button" className="btn btn-outline-secondary" onClick={()=>onCancel?onCancel():navigate(-1)}>Back</button>
    </div>
   )}

   {error?<div className="alert alert-danger py-2">{error}</div>:null}
   {success?<div className="alert alert-success py-2">{success}</div>:null}

   <form onSubmit={handleSubmit}>
    <Tabs activeKey={activeTab} onSelect={key=>setActiveTab(key||"book-info")} className="mb-3">
     <Tab eventKey="book-info" title="Book Info">
      <div className="border rounded p-3 bg-white">
       <InlineField label="Title">
        <input type="text" className="form-control" value={form.title} onChange={e=>setField("title",e.target.value)} required />
       </InlineField>

       <InlineField label="Slug">
        <input type="text" className="form-control" value={computed.slug} readOnly />
       </InlineField>

       <InlineField label="Subtitle">
        <input type="text" className="form-control" value={form.subtitle} onChange={e=>setField("subtitle",e.target.value)} />
       </InlineField>

       <InlineField label="Edition">
        <input type="text" className="form-control" value={form.edition} onChange={e=>setField("edition",e.target.value)} />
       </InlineField>

       <InlineField label="Volume">
        <input type="text" className="form-control" value={form.volume} onChange={e=>setField("volume",e.target.value)} />
       </InlineField>

       <InlineField label="Authors" right={
        <div className="d-flex gap-2">
         <button type="button" className="btn btn-outline-primary btn-sm" onClick={()=>setShowAuthorModal(true)}>Add Author</button>
         <button type="button" className="btn btn-outline-secondary btn-sm" onClick={loadLookups}>Refresh</button>
        </div>
       }>
        <CheckboxList items={authorOptions} selected={form.authors} getLabel={getAuthorLabel} groupName="author" onToggle={toggleAuthors} emptyText="No authors found." />
       </InlineField>

       <InlineField label="Series" right={
        <div className="d-flex gap-2">
         <button type="button" className="btn btn-outline-primary btn-sm" onClick={()=>setShowSeriesModal(true)}>Add Series</button>
         <button type="button" className="btn btn-outline-secondary btn-sm" onClick={loadLookups}>Refresh</button>
        </div>
       }>
        <select className="form-select" value={form.series} onChange={e=>setField("series",e.target.value)}>
         <option value="">Select series</option>
         {seriesOptions.map(item=>{
          const itemId=getId(item);
          return <option key={itemId} value={itemId}>{getSeriesLabel(item)||"Untitled Series"}</option>;
         })}
        </select>
       </InlineField>

       <InlineField label="Series Number">
        <input type="number" min="1" step="1" className="form-control" value={form.seriesNumber} onChange={e=>setField("seriesNumber",e.target.value)} />
       </InlineField>

       <InlineField label="Publishers" right={
        <div className="d-flex gap-2">
         <button type="button" className="btn btn-outline-primary btn-sm" onClick={()=>setShowPublisherModal(true)}>Add Publisher</button>
         <button type="button" className="btn btn-outline-secondary btn-sm" onClick={loadLookups}>Refresh</button>
        </div>
       }>
        <CheckboxList items={publisherOptions} selected={form.publishers} getLabel={getPublisherLabel} groupName="publisher" onToggle={togglePublishers} emptyText="No publishers found." />
       </InlineField>

       <InlineField label="Published Date">
        <input type="date" className="form-control" value={form.publication.publishedDate} onChange={e=>setNested("publication","publishedDate",e.target.value)} />
       </InlineField>

       <InlineField label="Language" right={
        <div className="d-flex gap-2">
         <input type="text" className="form-control form-control-sm" style={{width:"170px"}} value={newLanguage} onChange={e=>setNewLanguage(e.target.value)} placeholder="New language" />
         <button type="button" className="btn btn-outline-primary btn-sm" onClick={addLanguage}>Add</button>
         <button type="button" className="btn btn-outline-secondary btn-sm" onClick={loadLookups}>Refresh</button>
        </div>
       }>
        <select className="form-select" value={form.publication.language} onChange={e=>setNested("publication","language",e.target.value)}>
         <option value="">Select language</option>
         {languageOptions.map(item=>{
          const value=getOptionLabel(item);
          const itemId=getId(item);
          return <option key={itemId||value} value={itemId}>{value}</option>;
         })}
        </select>
       </InlineField>

       <InlineField label="ISBN-10">
        <input type="text" className="form-control" value={form.isbn10} onChange={e=>setField("isbn10",e.target.value)} />
       </InlineField>

       <InlineField label="ISBN-13">
        <input type="text" className="form-control" value={form.isbn13} onChange={e=>setField("isbn13",e.target.value)} />
       </InlineField>

       <InlineField label="eISBN">
        <input type="text" className="form-control" value={form.eisbn} onChange={e=>setField("eisbn",e.target.value)} />
       </InlineField>

       <InlineField label="ASIN">
        <input type="text" className="form-control" value={form.asin} onChange={e=>setField("asin",e.target.value.toUpperCase())} />
       </InlineField>

       <InlineField label="Custom ID">
        <input type="text" className="form-control" value={form.customId} onChange={e=>setField("customId",e.target.value)} />
       </InlineField>

       <InlineField label="Identifier Notes">
        <textarea className="form-control" rows="3" value={form.identifierNotes} onChange={e=>setField("identifierNotes",e.target.value)} />
       </InlineField>

       <InlineField label="Total Pages">
        <input type="number" min="0" className="form-control" value={form.reading.totalPages} onChange={e=>setNested("reading","totalPages",e.target.value)} />
       </InlineField>

       <InlineField label="Purchase Date">
        <input type="date" className="form-control" value={form.purchaseDate} onChange={e=>setField("purchaseDate",e.target.value)} />
       </InlineField>

       <InlineField label="Acquisition Source" right={<button type="button" className="btn btn-outline-secondary btn-sm" onClick={loadLookups}>Refresh</button>}>
        <select className="form-select" value={form.acquisitionSource} onChange={e=>setField("acquisitionSource",e.target.value)}>
         <option value="">Select acquisition source</option>
         {acquisitionSourceOptions.map(item=>{
          const itemId=getId(item);
          return <option key={itemId} value={itemId}>{getOptionLabel(item)}</option>;
         })}
        </select>
       </InlineField>

       <InlineField label="Acquisition Method" right={<button type="button" className="btn btn-outline-secondary btn-sm" onClick={loadLookups}>Refresh</button>}>
        <select className="form-select" value={form.acquisitionMethod} onChange={e=>setField("acquisitionMethod",e.target.value)}>
         <option value="">Select acquisition method</option>
         {acquisitionMethodOptions.map(item=>{
          const itemId=getId(item);
          return <option key={itemId} value={itemId}>{getOptionLabel(item)}</option>;
         })}
        </select>
       </InlineField>

       <InlineField label="Acquisition Notes">
        <textarea className="form-control" rows="3" value={form.acquisitionNotes} onChange={e=>setField("acquisitionNotes",e.target.value)} />
       </InlineField>

       <InlineField label="Formats" right={<button type="button" className="btn btn-outline-secondary btn-sm" onClick={loadLookups}>Refresh</button>}>
        <CheckboxList items={formatOptions} selected={form.formats} getLabel={getOptionLabel} groupName="format" onToggle={toggleFormats} emptyText="No formats found." />
       </InlineField>

       <InlineField label="Format Prices">
        <div className="d-flex flex-column gap-2">
         {!form.formatPrices.length?<div className="text-muted">Select one or more formats to add prices.</div>:form.formatPrices.map((item,index)=>{
          const formatItem=formatOptions.find(option=>String(getId(option))===String(item.format));
          return(
           <div key={`${item.format}-${index}`} className="row g-2 align-items-center border rounded p-2 m-0">
            <div className="col-md-4">
             <input type="text" className="form-control" value={getOptionLabel(formatItem)} readOnly />
            </div>
            <div className="col-md-4">
             <input type="number" min="0" step="0.01" className="form-control" value={item.price} onChange={e=>setFormatPrice(index,"price",e.target.value)} placeholder="0.00" />
            </div>
            <div className="col-md-4">
             <input type="text" className="form-control" value={item.currency} onChange={e=>setFormatPrice(index,"currency",e.target.value.toUpperCase())} maxLength="3" placeholder="USD" />
            </div>
           </div>
          );
         })}
        </div>
       </InlineField>

       {computed.isAudiobook?(
        <InlineField label="Duration">
         <div className="row g-2">
          <div className="col-md-6">
           <input type="number" min="0" className="form-control" value={form.duration.hours} onChange={e=>setNested("duration","hours",e.target.value)} placeholder="Hours" />
          </div>
          <div className="col-md-6">
           <input type="number" min="0" max="59" className="form-control" value={form.duration.minutes} onChange={e=>setNested("duration","minutes",e.target.value)} placeholder="Minutes" />
          </div>
         </div>
        </InlineField>
       ):null}

       {computed.showFileTypes?(
        <InlineField label="File Types" right={<button type="button" className="btn btn-outline-secondary btn-sm" onClick={loadLookups}>Refresh</button>}>
         <CheckboxList items={fileTypeOptions} selected={form.fileTypes} getLabel={getOptionLabel} groupName="filetype" onToggle={toggleFileTypes} emptyText="No file types found." />
        </InlineField>
       ):null}

       <InlineField label="Condition">
        <select className="form-select" value={form.condition} onChange={e=>setField("condition",e.target.value)}>
         {CONDITION_OPTIONS.map(item=><option key={item} value={item}>{item}</option>)}
        </select>
       </InlineField>

       <InlineField label="Genres" right={
        <div className="d-flex gap-2">
         <input type="text" className="form-control form-control-sm" style={{width:"170px"}} value={newGenre} onChange={e=>setNewGenre(e.target.value)} placeholder="New genre" />
         <button type="button" className="btn btn-outline-primary btn-sm" onClick={addGenre}>Add</button>
         <button type="button" className="btn btn-outline-secondary btn-sm" onClick={loadLookups}>Refresh</button>
        </div>
       }>
        <CheckboxList items={genreOptions} selected={form.genres} getLabel={getOptionLabel} groupName="genre" onToggle={toggleGenres} emptyText="No genres found." />
       </InlineField>

       <InlineField label="Tags">
        <input type="text" className="form-control" value={computed.generatedTags.join(", ")} readOnly placeholder="Generated from book details" />
       </InlineField>

       <InlineField label="Subjects">
        <input type="text" className="form-control" value={form.subjects} onChange={e=>setField("subjects",e.target.value)} placeholder="Comma separated subjects" />
       </InlineField>

       <InlineField label="Image">
        <div className="d-flex flex-column gap-2">
         <div className="d-flex gap-2 align-items-center flex-wrap">
          <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} disabled={uploadingImage} />
          <button type="button" className="btn btn-outline-secondary" onClick={clearImage} disabled={!form.images.length}>Clear</button>
         </div>
         {uploadingImage?<div className="text-muted">Uploading...</div>:null}
         {form.images.length?<div className="small text-muted">Filename: {form.images[0]}</div>:null}
         {imagePreview?<div><img src={imagePreview} alt="Preview" style={{maxWidth:"140px",maxHeight:"180px",borderRadius:"8px",border:"1px solid #ddd"}} /></div>:null}
        </div>
       </InlineField>

       <InlineField label="Summary">
        <textarea className="form-control" rows="5" value={form.summary} onChange={e=>setField("summary",e.target.value)} />
       </InlineField>
      </div>
     </Tab>

     <Tab eventKey="personal-reading" title="Personal Reading">
      <div className="border rounded p-3 bg-white">
       <InlineField label="Reading Status">
        <select className="form-select" value={form.reading.status} onChange={e=>setNested("reading","status",e.target.value)}>
         {READING_STATUS_OPTIONS.map(item=><option key={item} value={item}>{item}</option>)}
        </select>
       </InlineField>

       <InlineField label="Current Page">
        <input type="number" min="0" className="form-control" value={form.reading.currentPage} onChange={e=>setNested("reading","currentPage",e.target.value)} />
       </InlineField>

       <InlineField label="% Read">
        <input type="number" className="form-control" value={computed.progressPercent} readOnly />
       </InlineField>

       <InlineField label="Started At">
        <input type="date" className="form-control" value={form.reading.startedAt} onChange={e=>setNested("reading","startedAt",e.target.value)} />
       </InlineField>

       <InlineField label="Finished At">
        <input type="date" className="form-control" value={form.reading.finishedAt} min={form.reading.startedAt||undefined} onChange={e=>setNested("reading","finishedAt",e.target.value)} />
       </InlineField>

       <InlineField label="Last Read At">
        <input type="date" className="form-control" value={form.reading.lastReadAt} onChange={e=>setNested("reading","lastReadAt",e.target.value)} />
       </InlineField>

       <InlineField label="Avg Rating">
        <input type="number" min="0" max="5" step="0.1" className="form-control" value={form.rating.average} onChange={e=>setNested("rating","average",e.target.value)} />
       </InlineField>

       <InlineField label="Personal Rating">
        <input type="number" min="0" max="5" step="0.1" className="form-control" value={form.rating.personal} onChange={e=>setNested("rating","personal",e.target.value)} />
       </InlineField>

       <InlineField label="Notes">
        <div className="d-flex flex-column gap-2">
         <div className="d-flex gap-2">
          <input type="text" className="form-control" value={noteInput} onChange={e=>setNoteInput(e.target.value)} placeholder="Add note" />
          <button type="button" className="btn btn-outline-primary" onClick={addNote}>Add</button>
         </div>
         {form.notes.length?<div className="d-flex flex-column gap-2">{form.notes.map((note,index)=>(
          <div key={`${note}-${index}`} className="d-flex gap-2 align-items-start">
           <div className="form-control">{note}</div>
           <button type="button" className="btn btn-outline-danger" onClick={()=>removeNote(index)}>Remove</button>
          </div>
         ))}</div>:<div className="text-muted">No notes added.</div>}
        </div>
       </InlineField>
      </div>
     </Tab>
    </Tabs>

    <div className="d-flex gap-2 pt-2">
     <button type="submit" className="btn btn-primary" disabled={saving||uploadingImage}>{saving?(isEdit?"Saving...":"Creating..."):(isEdit?"Save Changes":"Create Book")}</button>
     <button type="button" className="btn btn-outline-secondary" onClick={()=>onCancel?onCancel():navigate(-1)} disabled={saving}>Cancel</button>
     {!isEdit?<button type="button" className="btn btn-outline-secondary" onClick={()=>{setForm(emptyForm);setNoteInput("");setNewLanguage("");setNewGenre("");setImagePreview("");setActiveTab("book-info");}} disabled={saving}>Reset</button>:null}
    </div>
   </form>

   <Modal show={showAuthorModal} onHide={()=>setShowAuthorModal(false)} centered size="xl" backdrop="static">
    <Modal.Header closeButton>
     <Modal.Title>Add Author</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <AuthorForm
      mode="add"
      onSaved={async author=>{
       if(author?._id){
        const authorId=String(author._id);
        setAuthorOptions(prev=>upsertOption(prev,author,getAuthorLabel));
        setForm(prev=>({...prev,authors:prev.authors.includes(authorId)?prev.authors:[...prev.authors,authorId]}));
       }
       await loadLookups();
       if(author?._id){
        setForm(prev=>({...prev,authors:prev.authors.includes(String(author._id))?prev.authors:[...prev.authors,String(author._id)]}));
       }
       setShowAuthorModal(false);
      }}
      onCancel={()=>setShowAuthorModal(false)}
     />
    </Modal.Body>
   </Modal>

   <Modal show={showSeriesModal} onHide={()=>setShowSeriesModal(false)} centered size="lg" backdrop="static">
    <Modal.Header closeButton>
     <Modal.Title>Add Series</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <SeriesForm
      mode="add"
      onSaved={async series=>{
       if(series?._id){
        const seriesId=String(series._id);
        setSeriesOptions(prev=>{
         const exists=prev.some(item=>String(getId(item))===seriesId);
         const next=exists?prev:[...prev,series];
         return next.sort((a,b)=>getSeriesLabel(a).localeCompare(getSeriesLabel(b)));
        });
        setField("series",seriesId);
       }
       await loadLookups();
       if(series?._id)setField("series",String(series._id));
       setShowSeriesModal(false);
      }}
      onCancel={()=>setShowSeriesModal(false)}
     />
    </Modal.Body>
   </Modal>

   <Modal show={showPublisherModal} onHide={()=>setShowPublisherModal(false)} centered size="xl" backdrop="static">
    <Modal.Header closeButton>
     <Modal.Title>Add Publisher</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <PublisherForm
      mode="add"
      onSaved={async publisher=>{
       if(publisher?._id){
        const publisherId=String(publisher._id);
        setPublisherOptions(prev=>upsertOption(prev,publisher,getPublisherLabel));
        setForm(prev=>({...prev,publishers:prev.publishers.includes(publisherId)?prev.publishers:[...prev.publishers,publisherId]}));
       }
       await loadLookups();
       if(publisher?._id){
        setForm(prev=>({...prev,publishers:prev.publishers.includes(String(publisher._id))?prev.publishers:[...prev.publishers,String(publisher._id)]}));
       }
       setShowPublisherModal(false);
      }}
      onCancel={()=>setShowPublisherModal(false)}
     />
    </Modal.Body>
   </Modal>
  </div>
 );
}
