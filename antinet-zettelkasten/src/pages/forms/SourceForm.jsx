import useDomainIdPreview from "../../hooks/useDomainIdPreview.js";
import {useEffect,useMemo,useState} from "react";
import {Alert,Button,Form,Spinner,Tab,Tabs} from "react-bootstrap";
import RelationshipSelector from "../../components/RelationshipSelector.jsx";
import DomainSelect from "../../components/DomainSelect.jsx";
import useRecordSubtypes from "../../hooks/useRecordSubtypes.js";
import RichTextEditor from "../../components/RichTextEditor.jsx";

const getStoredUserId=()=>{
 for(const key of ["userInfo","user","authUser","currentUser"]){
  try{
   const parsed=JSON.parse(localStorage.getItem(key)||sessionStorage.getItem(key)||"null");
   const value=parsed?.user||parsed?.data||parsed;
   const id=value?._id||value?.id||value?.$oid||value?._id?.$oid||value?.id?.$oid;
   if(id)return String(id);
  }catch{
   continue;
  }
 }

 return "";
};

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 return value._id?.$oid||value.id?.$oid||value._id||value.id||value.$oid||"";
};

const toCode=value=>String(value||"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,24);

const toSubjectCode=value=>{
 const words=String(value||"").trim().toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);
 if(words.length>1)return words.map(word=>word.slice(0,3)).join("").slice(0,12);
 return (words[0]||"").slice(0,12);
};

const readableName=item=>{
 if(!item)return "";
 if(typeof item==="string")return item;
 const fullName=[item.firstName,item.middleName,item.lastName].map(value=>String(value||"").trim()).filter(Boolean).join(" ");
 return String(item.displayName||item.name||item.title||item.label||fullName||"").trim();
};

const joinNames=items=>Array.isArray(items)?items.map(readableName).filter(Boolean).join(", "):"";

const toProperCase=value=>String(value||"")
 .trim()
 .toLocaleLowerCase()
 .replace(/(^|[-\s&/('’])([a-z])/g,(_,prefix,letter)=>`${prefix}${letter.toLocaleUpperCase()}`);

const getShellOrigin=()=>{
 try{
  const referrerOrigin=new URL(document.referrer).origin;
  if(referrerOrigin&&referrerOrigin!==window.location.origin)return referrerOrigin;
 }catch{
  // The form may also run directly instead of inside the Eco Sphere shell.
 }

 return `${window.location.protocol}//${window.location.hostname}:5174`;
};

const BOOK_LIBRARY_CACHE_TTL=5*60*1000;
const bookLibraryCache={books:[],applicationUrl:"",loadedAt:0,promise:null};

const loadBookLibrary=async()=>{
 const cacheIsFresh=bookLibraryCache.loadedAt&&Date.now()-bookLibraryCache.loadedAt<BOOK_LIBRARY_CACHE_TTL;
 if(cacheIsFresh)return {books:bookLibraryCache.books,applicationUrl:bookLibraryCache.applicationUrl};
 if(bookLibraryCache.promise)return bookLibraryCache.promise;

 bookLibraryCache.promise=(async()=>{
  const activationResponse=await fetch(`${getShellOrigin()}/api/app-runtime/activate/book-management`,{method:"POST",credentials:"include"});
  const activation=await activationResponse.json().catch(()=>({}));
  if(!activationResponse.ok)throw new Error(activation.message||"Unable to connect to Book Management.");

  const applicationUrl=String(activation.url||"").replace(/\/$/,"");
  if(!applicationUrl)throw new Error("Book Management did not provide an application address.");

  const response=await fetch(`${applicationUrl}/api/books?sort=title&order=asc`,{credentials:"include",cache:"no-store"});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.message||"Unable to load your book library.");

  bookLibraryCache.books=Array.isArray(data.books)?data.books:[];
  bookLibraryCache.applicationUrl=applicationUrl;
  bookLibraryCache.loadedAt=Date.now();
  return {books:bookLibraryCache.books,applicationUrl};
 })();

 try{
  return await bookLibraryCache.promise;
 }finally{
  bookLibraryCache.promise=null;
 }
};

function SourceForm({form,setForm,projects=[],entities=[],zettels=[],sourceTypes=[],editing=null,saving=false,onSubmit}){
 const domainIdPreview=useDomainIdPreview({form,editing,recordType:"SRC",idField:"sourceId",subtype:form.subtype,subject:form.title});
 const completeSourceTypes=useRecordSubtypes("SRC",sourceTypes);
 const [loadingId,setLoadingId]=useState(false);
 const [idError,setIdError]=useState("");
 const [books,setBooks]=useState([]);
 const [booksLoading,setBooksLoading]=useState(false);
 const [booksError,setBooksError]=useState("");
 const [bookManagementUrl,setBookManagementUrl]=useState("");
 const [bookSearch,setBookSearch]=useState(()=>form.libraryBookId?form.title||"":"");

 const selectedSourceType=useMemo(
  ()=>completeSourceTypes.find(type=>getObjectId(type)===form.subtypeId),
  [completeSourceTypes,form.subtypeId]
 );
 const isBookSource=/\bbook\b/i.test(`${selectedSourceType?.name||""} ${selectedSourceType?.code||""}`);
 const matchingBooks=useMemo(()=>{
  const query=bookSearch.trim().toLowerCase();

  if(!query)return books;

  return books.filter(book=>[
   book.title,
   book.subtitle,
   joinNames(book.authors),
   joinNames(book.publishers),
   readableName(book.publisher),
   readableName(book.publication?.publisher),
   book.isbn10,
   book.isbn13,
   book.eisbn,
   book.asin
  ].some(value=>String(value||"").toLowerCase().includes(query))).slice(0,50);
 },[bookSearch,books]);

 useEffect(()=>{
  if(!isBookSource)return;

  let active=true;

  const loadBooks=async()=>{
   setBooksLoading(true);
   setBooksError("");

   try{
    const library=await loadBookLibrary();

    if(active){
     setBookManagementUrl(library.applicationUrl);
     setBooks(library.books);
     if(form.libraryBookId){
      const linkedBook=library.books.find(book=>getObjectId(book)===form.libraryBookId);
      if(linkedBook)setBookSearch(current=>current||linkedBook.title||"");
     }
    }
   }catch(error){
    if(active)setBooksError(error.message);
   }finally{
    if(active)setBooksLoading(false);
   }
  };

  loadBooks();
  return()=>{active=false;};
 },[isBookSource,form.libraryBookId]);

 const updateField=(field,value)=>{
  setForm(current=>({...current,[field]:value}));
 };

 useEffect(()=>{
  if(editing?._id){
   queueMicrotask(()=>{
    setForm(current=>current.sourceId===editing.sourceId?current:{...current,sourceId:editing.sourceId||""});
    setIdError("");
   });
   return;
  }

  const userId=getStoredUserId();

  if(!userId){
   queueMicrotask(()=>setIdError("A valid user is required to generate the source ID."));
   return;
  }

  const selectedProject=projects.find(project=>getObjectId(project)===form.projectId);
  const selectedSubtype=completeSourceTypes.find(type=>getObjectId(type)===form.subtypeId);
  const projectCode=toCode(form.domainCode)||toCode(selectedProject?.code)||"GENERAL";
  const subtypeCode=toCode(selectedSubtype?.code);
  const subjectCode=toSubjectCode(form.title);
  const generatedDate=new Date().toLocaleDateString("en-CA").replaceAll("-","");
  const sequenceSubjectCode=`${subjectCode}-${generatedDate}`;

  if(!subtypeCode){
   queueMicrotask(()=>{
    setForm(current=>current.sourceId?{...current,sourceId:""}:current);
    setIdError("Select a source type.");
   });
   return;
  }

  if(!subjectCode){
   queueMicrotask(()=>{
    setForm(current=>current.sourceId?{...current,sourceId:""}:current);
    setIdError("Enter the source title.");
   });
   return;
  }

  let active=true;

  const timer=setTimeout(async()=>{
   setLoadingId(true);
   setIdError("");

   try{
    const params=new URLSearchParams({
     userId,
     recordType:"SRC",
     projectCode,
     subtypeCode,
     subjectCode:sequenceSubjectCode
    });

    const response=await fetch(`/api/id-sequences?${params.toString()}`,{credentials:"include"});
    const data=await response.json().catch(()=>null);

    if(!response.ok)throw new Error(data?.message||"Unable to generate source ID preview");

    const sequences=Array.isArray(data?.data)?data.data:data?.data?[data.data]:[];

    const sequence=sequences.find(item=>
     toCode(item.recordType)==="SRC"&&
     toCode(item.projectCode)===projectCode&&
     toCode(item.subtypeCode)===subtypeCode&&
     toCode(item.subjectCode)===sequenceSubjectCode
    );

    const nextNumber=Number(sequence?.nextNumber)||1;
    const sourceId=`SRC-${projectCode}-${subtypeCode}-${subjectCode}-${generatedDate}-${String(nextNumber).padStart(3,"0")}`;

    if(active){
     setForm(current=>current.sourceId===sourceId?current:{...current,sourceId});
    }
   }catch(error){
    if(active){
     setForm(current=>({...current,sourceId:""}));
     setIdError(error.message);
    }
   }finally{
    if(active)setLoadingId(false);
   }
  },250);

  return()=>{
   active=false;
   clearTimeout(timer);
  };
 },[
  editing?._id,
  editing?.sourceId,
  form.projectId,
  form.subtypeId,
  form.domainCode,
  form.title,
  projects,
  completeSourceTypes,
  setForm
 ]);

 return(
  <Form onSubmit={onSubmit}>
   <DomainSelect value={form.domainId} onChange={(domainId,domain)=>setForm(current=>({...current,domainId,domainCode:domain?.code||"",sourceId:""}))}/>
   <div className="zettel-form-id"><span>Source ID</span><code>{loadingId&&!editing?._id?"Generating...":(editing?._id?domainIdPreview:form.sourceId)||"Generated when saved"}</code></div>
   {idError&&<div className="text-danger mb-3">{idError}</div>}

   <Tabs defaultActiveKey="details" className="mb-4">
    <Tab eventKey="details" title="Source Details">

   <RelationshipSelector label="Projects (optional)" value={form.projectIds||[]} records={projects} idField="projectId" titleField="title" onChange={projectIds=>setForm(current=>({...current,projectIds,projectId:projectIds[0]||""}))}/>

   <Form.Group className="mb-3">
    <Form.Label>Title</Form.Label>
    <Form.Control
     required
     value={form.title||""}
     onChange={event=>updateField("title",event.target.value)}
    />
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Source Type</Form.Label>
    <Form.Select
     required
     value={form.subtypeId||""}
     onChange={event=>updateField("subtypeId",event.target.value)}
    >
     <option value="">Select Source Type</option>
     {completeSourceTypes.map(type=>(
      <option key={type._id} value={type._id}>{type.name||type.code}</option>
     ))}
   </Form.Select>
  </Form.Group>

   {isBookSource&&(
    <>
    <Form.Group className="mb-3">
     <Form.Label>Find Book</Form.Label>
     <Form.Control
      type="search"
      value={bookSearch}
      disabled={booksLoading}
      placeholder="Search title, author, publisher, or ISBN"
      onChange={event=>setBookSearch(event.target.value)}
     />
     <Form.Text>{bookSearch.trim()?`${matchingBooks.length} matching ${matchingBooks.length===1?"book":"books"}${matchingBooks.length===50?" shown":""}.`:`Search to narrow the dropdown, or browse the full library below.`}</Form.Text>
    </Form.Group>
    <Form.Group className="mb-3">
     <Form.Label>Library Book</Form.Label>
     <Form.Select
       value={form.libraryBookId||""}
       disabled={booksLoading}
       onChange={event=>{
        const libraryBookId=event.target.value;
        const book=books.find(item=>getObjectId(item)===libraryBookId);

        if(!book){
         setForm(current=>({...current,libraryBookId:"",libraryBookUrl:""}));
         return;
        }

        const libraryBookUrl=`${bookManagementUrl}/books/${encodeURIComponent(libraryBookId)}/edit`;
        const publisher=joinNames(book.publishers)||readableName(book.publisher)||readableName(book.publication?.publisher)||readableName(book.publisherId);
        setForm(current=>({
         ...current,
         libraryBookId,
         libraryBookUrl,
         title:book.title||current.title,
         author:joinNames(book.authors)||current.author,
         publisher:publisher?toProperCase(publisher):current.publisher,
         summary:book.summary||current.summary,
         tags:Array.isArray(book.tags)&&book.tags.length?book.tags.map(tag=>String(tag||"").trim()).filter(Boolean).join(", "):current.tags
        }));
       }}
     >
      <option value="">{booksLoading?"Loading your library...":bookSearch.trim()?matchingBooks.length?"Select a matching book":"No matching books — enter it manually":"Browse your library or enter the book manually"}</option>
      {matchingBooks.map(book=><option key={getObjectId(book)} value={getObjectId(book)}>{book.title}{joinNames(book.authors)?` — ${joinNames(book.authors)}`:""}</option>)}
     </Form.Select>
     <Form.Text>
      Selecting a library book fills the fields below. You can still edit them manually.
      {form.libraryBookUrl&&<> <a href={form.libraryBookUrl} target="_blank" rel="noreferrer">Open selected book</a>.</>}
     </Form.Text>
     {booksLoading&&<div className="mt-2 text-muted"><Spinner size="sm" animation="border" className="me-2"/>Connecting to Book Management...</div>}
     {booksError&&<Alert variant="warning" className="mt-2 mb-0">{booksError} You can continue by entering the book manually.</Alert>}
    </Form.Group>
    </>
   )}

   <Form.Group className="mb-3">
    <Form.Label>Author / Creator</Form.Label>
    <Form.Control
     value={form.author||""}
     onChange={event=>updateField("author",event.target.value)}
    />
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Publisher</Form.Label>
    <Form.Control
     value={form.publisher||""}
     onChange={event=>updateField("publisher",event.target.value)}
    />
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Original URL</Form.Label>
    <Form.Control
     type="url"
     value={form.originalUrl||""}
     onChange={event=>updateField("originalUrl",event.target.value)}
    />
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Upload Source File</Form.Label>
    <Form.Control
     type="file"
     onChange={event=>{const uploadFile=event.target.files?.[0]||null;setForm(current=>({...current,uploadFile,title:current.title||String(uploadFile?.name||"").replace(/\.[^.]+$/,""),filePath:current.filePath}));}}
    />
    <Form.Text>The file is uploaded and linked to this source when you save.</Form.Text>
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Existing File Path</Form.Label>
    <Form.Control
     value={form.filePath||""}
     onChange={event=>updateField("filePath",event.target.value)}
    />
    <Form.Text>Kept for existing and legacy source records.</Form.Text>
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Access Date</Form.Label>
    <Form.Control
     type="date"
     value={form.accessDate||""}
     onChange={event=>updateField("accessDate",event.target.value)}
    />
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Archive Type</Form.Label>
    <Form.Control
     value={form.archiveType||""}
     onChange={event=>updateField("archiveType",event.target.value)}
    />
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Archive Location</Form.Label>
    <Form.Control
     value={form.archiveLocation||""}
     onChange={event=>updateField("archiveLocation",event.target.value)}
    />
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Copied Text / Saved Extract</Form.Label>
    <RichTextEditor value={form.copiedText||""} onChange={value=>updateField("copiedText",value)} placeholder="Paste or write the preserved source material." minHeight="16rem"/>
   </Form.Group>
    </Tab>
    <Tab eventKey="relationships" title="Entities & Links">
     <RelationshipSelector label="Linked entities" value={form.entityIds} records={entities} idField="entityId" titleField="name" onChange={value=>updateField("entityIds",value)}/>
     <RelationshipSelector label="Produced Zettels" value={form.producedZettelIds||[]} records={zettels} idField="zettelId" titleField="title" onChange={value=>updateField("producedZettelIds",value)}/>
    </Tab>
   </Tabs>

   <Form.Group className="mb-3">
    <Form.Label>Source Summary</Form.Label>
    <RichTextEditor value={form.summary||""} onChange={value=>updateField("summary",value)} placeholder="Summarize the source and why it matters." minHeight="7rem"/>
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Tags</Form.Label>
    <Form.Control
     value={form.tags||""}
     onChange={event=>updateField("tags",event.target.value)}
     placeholder="Separate tags with commas"
    />
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Status</Form.Label>
    <Form.Select
     value={form.status||"active"}
     onChange={event=>updateField("status",event.target.value)}
    >
     <option value="draft">Draft</option>
     <option value="active">Active</option>
     <option value="archived">Archived</option>
    </Form.Select>
   </Form.Group>

   <div className="text-end">
    <Button type="submit" disabled={saving||loadingId||(!editing?._id&&!form.sourceId)}>
     {saving?"Saving...":editing?._id?"Save Changes":"Save Source"}
    </Button>
   </div>
  </Form>
 );
}

export default SourceForm;
