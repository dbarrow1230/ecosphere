import {useEffect,useState} from "react";
import {Accordion,Alert,Button,Col,Form,Modal,Row,Spinner} from "react-bootstrap";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import SortedSelect from "../../../components/SortedSelect.jsx";
import {muiDatePickerSlotProps,requiredMuiDatePickerSlotProps,toDateObject,toDateValue} from "../../../utils/datePicker.js";

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

const getTodayValue=()=>{
 const date=new Date();
 const offset=date.getTimezoneOffset();
 return new Date(date.getTime()-offset*60000).toISOString().slice(0,10);
};

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

const combineDate=(date)=>{
 if(!date)return null;
 return `${date}T00:00`;
};

const parseScriptureReference=value=>{
 const text=String(value||"").trim();
 const match=text.match(/^(.+?)\s+(\d+)(?::(\d+)(?:[-–—](?:(\d+):)?(\d+))?)?(?:\s+(.+))?$/);

 if(!match){
  return{
   reference:text,
   book:"",
   chapterStart:"",
   chapterEnd:"",
   verseStart:"",
   verseEnd:"",
   passageText:""
  };
 }

 const chapterStart=match[2]||"";
 const verseStart=match[3]||"";
 const endChapter=match[4]||"";
 const endVerse=match[5]||"";
 const chapterEnd=endChapter&&endChapter!==chapterStart?endChapter:"";
 const verseEnd=endVerse||"";
 const reference=`${match[1].trim()} ${chapterStart}${verseStart?`:${verseStart}`:""}${verseEnd?`-${chapterEnd?`${chapterEnd}:`:""}${verseEnd}`:""}`;

 return{
  reference,
  book:match[1].trim(),
  chapterStart,
  chapterEnd,
  verseStart,
  verseEnd,
  passageText:String(match[6]||"").trim()
 };
};

const tagStopWords=new Set([
 "the","and","for","that","with","from","this","into","your","their","there","then","than","have","will",
 "shall","lord","god","was","were","are","but","not","you","his","her","him","she","they","them","our",
 "out","who","what","when","where","why","how","daily","note","text","passage","scripture"
]);

const generateEntryTags=entry=>{
 const noteText=Array.isArray(entry.notes)?entry.notes.map(note=>note.text).join(" "):"";
 const source=[entry.book,entry.passageText,noteText].filter(Boolean).join(" ");
 const generated=String(source)
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g," ")
  .split(/\s+/)
  .map(tag=>tag.trim())
  .filter(tag=>tag.length>2&&!tagStopWords.has(tag));

 return [...new Set(generated)].slice(0,12);
};

const emptyNoteDraft=()=>({
 text:"",
 notedDate:""
});

const emptyEntry=()=>({
 reference:"",
 translation:"",
 book:"",
 chapterStart:"",
 chapterEnd:"",
 verseStart:"",
 verseEnd:"",
 passageText:"",
 notes:[],
 noteDraft:emptyNoteDraft(),
 memorize:false,
 memorizationStatus:"memorize"
});

const emptyForm=()=>({
 user:getObjectId(getStoredUser()),
 journalDate:getTodayValue(),
 title:"",
 summary:"",
 entries:[emptyEntry()]
});

const normalizeList=payload=>{
 if(Array.isArray(payload))return payload;
 if(Array.isArray(payload?.data))return payload.data;
 if(Array.isArray(payload?.items))return payload.items;
 return [];
};

const getEntryTitle=(entry,index)=>{
 const reference=entry.reference||entry.book||"New scripture";
 return `Scripture ${index+1}: ${reference}`;
};

const getTranslationValue=item=>item?.abbreviation||item?.slug||item?.title||"";

const getTranslationLabel=item=>{
 const value=getTranslationValue(item);
 if(!item?.title)return value;
 return value?`${value} - ${item.title}`:item.title;
};

const getTranslationOptions=(translations,selectedValue)=>{
 const value=String(selectedValue||"").trim();
 if(!value||translations.some(item=>getTranslationValue(item)===value))return translations;
 return [...translations,{abbreviation:value}];
};

const normalizeEntryNotesForForm=entry=>{
 const notes=Array.isArray(entry.notes)?entry.notes:[];
 const normalized=notes.map(note=>{
  const notedAt=splitDateTime(note.notedAt);
  return{
   text:note.text||"",
   notedDate:notedAt.date
  };
 }).filter(note=>note.text);

 if(entry.note&&!normalized.some(note=>note.text===entry.note)){
  normalized.push({
   text:entry.note,
   notedDate:""
  });
 }

 return normalized;
};

function DailyNoteForm({show,onHide,noteId,onSaved}){
 const isEdit=Boolean(noteId);

 const [form,setForm]=useState(()=>emptyForm());
 const [users,setUsers]=useState([]);
 const [translations,setTranslations]=useState([]);
 const [loading,setLoading]=useState(false);
 const [loadingData,setLoadingData]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [activeEntryKey,setActiveEntryKey]=useState("0");

 useEffect(()=>{
  if(!show)return;

  let isMounted=true;

  const loadData=async()=>{
   try{
    setLoadingData(true);
    setError("");
    setSuccess("");
    setActiveEntryKey("0");
    setForm(emptyForm());

    const storedUser=getStoredUser();
    const storedUserId=getObjectId(storedUser);

    const [usersData,translationsData,itemData]=await Promise.all([
     fetch("/api/users").then(res=>res.ok?res.json():{data:[]}).catch(()=>({data:[]})),
     fetch("/api/lookups/translations").then(res=>res.ok?res.json():{data:[]}).catch(()=>({data:[]})),
     isEdit?fetch(`/api/studies/daily-notes/${noteId}`).then(res=>res.ok?res.json():null):Promise.resolve(null)
    ]);

    if(!isMounted)return;

    const fetchedUsers=Array.isArray(usersData.data)?usersData.data:[];
    setUsers(fetchedUsers.length?fetchedUsers:(storedUserId?[storedUser]:[]));
    setTranslations(normalizeList(translationsData).filter(item=>item.active!==false));

    if(isEdit&&itemData?.data){
     const item=itemData.data;

     const journalDate=splitDateTime(item.journalDate).date;

     setForm({
      user:getObjectId(item.user)||storedUserId,
      journalDate,
      title:item.title||"",
      summary:item.summary||"",
      entries:Array.isArray(item.entries)&&item.entries.length?item.entries.map(entry=>{
       return{
        reference:entry.reference||"",
        translation:entry.translation||"",
        book:entry.book||"",
        chapterStart:entry.chapterStart??"",
        chapterEnd:entry.chapterEnd??"",
        verseStart:entry.verseStart??"",
        verseEnd:entry.verseEnd??"",
        passageText:entry.passageText||"",
        notes:normalizeEntryNotesForForm(entry),
        noteDraft:emptyNoteDraft(),
        memorize:Boolean(entry.memorize),
        memorizationStatus:entry.memorizationStatus||"memorize"
       };
      }):[emptyEntry()]
     });
    }
   }catch(err){
    if(!isMounted)return;
    setError(err.message||"Failed to load daily note data");
   }finally{
    if(isMounted)setLoadingData(false);
   }
  };

  loadData();

  return()=>{isMounted=false;};
 },[show,noteId,isEdit]);

 const handleClose=()=>{
  setForm(emptyForm());
  setError("");
  setSuccess("");
  setActiveEntryKey("0");
  onHide();
 };

 const handleChange=e=>{
  const {name,value}=e.target;
  setForm(prev=>({
   ...prev,
   [name]:value
  }));
 };

 const handleEntryChange=(index,name,value)=>{
  setForm(prev=>({
   ...prev,
   entries:prev.entries.map((entry,currentIndex)=>currentIndex===index?{
    ...entry,
    [name]:value
   }:entry)
  }));
 };

 const handleEntryNoteDraftChange=(entryIndex,name,value)=>{
  setForm(prev=>({
   ...prev,
   entries:prev.entries.map((entry,currentIndex)=>currentIndex===entryIndex?{
    ...entry,
    noteDraft:{
     ...(entry.noteDraft||emptyNoteDraft()),
     [name]:value
    }
   }:entry)
  }));
 };

 const handleEntryNoteChange=(entryIndex,noteIndex,name,value)=>{
  setForm(prev=>({
   ...prev,
   entries:prev.entries.map((entry,currentIndex)=>currentIndex===entryIndex?{
    ...entry,
    notes:(Array.isArray(entry.notes)?entry.notes:[]).map((note,currentNoteIndex)=>currentNoteIndex===noteIndex?{
     ...note,
     [name]:value
    }:note)
   }:entry)
  }));
 };

 const addEntryNote=entryIndex=>{
  setForm(prev=>({
   ...prev,
   entries:prev.entries.map((entry,currentIndex)=>{
    if(currentIndex!==entryIndex)return entry;

    const draft=entry.noteDraft||emptyNoteDraft();
    const text=String(draft.text||"").trim();
    if(!text)return entry;

    return{
     ...entry,
     notes:[
      ...(Array.isArray(entry.notes)?entry.notes:[]),
      {
       text,
       notedDate:draft.notedDate||""
      }
     ],
     noteDraft:emptyNoteDraft()
    };
   })
  }));
 };

 const removeEntryNote=(entryIndex,noteIndex)=>{
  setForm(prev=>({
   ...prev,
   entries:prev.entries.map((entry,currentIndex)=>currentIndex===entryIndex?{
    ...entry,
    notes:(Array.isArray(entry.notes)?entry.notes:[]).filter((_,currentNoteIndex)=>currentNoteIndex!==noteIndex)
   }:entry)
  }));
 };

 const parseEntryReference=index=>{
  setForm(prev=>({
   ...prev,
   entries:prev.entries.map((entry,currentIndex)=>currentIndex===index?{
    ...entry,
    ...Object.fromEntries(
     Object.entries(parseScriptureReference(entry.reference)).filter(([key,value])=>key!=="passageText"||value||!entry.passageText)
    )
   }:entry)
  }));
 };

 const addEntry=()=>{
  setForm(prev=>{
   const nextIndex=prev.entries.length;
   setActiveEntryKey(String(nextIndex));
   return{
    ...prev,
    entries:[...prev.entries,emptyEntry()]
   };
  });
 };

 const removeEntry=index=>{
  setForm(prev=>{
   if(prev.entries.length<=1)return prev;
   const entries=prev.entries.filter((_,currentIndex)=>currentIndex!==index);
   setActiveEntryKey(String(Math.max(0,Math.min(index,entries.length-1))));
   return{
    ...prev,
    entries
   };
  });
 };

 const handleSubmit=async e=>{
  e.preventDefault();

  try{
   setLoading(true);
   setError("");
   setSuccess("");

   const payload={
    ...form,
    user:form.user||getObjectId(getStoredUser()),
    journalDate:combineDate(form.journalDate),
    entries:form.entries.map(entry=>({
     ...entry,
     note:"",
     noteDraft:undefined,
     notes:(Array.isArray(entry.notes)?entry.notes:[]).map(note=>({
      text:String(note.text||"").trim(),
      notedAt:combineDate(note.notedDate)
     })).filter(note=>note.text),
     chapterStart:entry.chapterStart===""?null:Number(entry.chapterStart),
     chapterEnd:entry.chapterEnd===""?null:Number(entry.chapterEnd),
     verseStart:entry.verseStart===""?null:Number(entry.verseStart),
     verseEnd:entry.verseEnd===""?null:Number(entry.verseEnd),
     tags:generateEntryTags(entry),
     memorize:Boolean(entry.memorize),
     memorizationStatus:entry.memorizationStatus||"memorize"
    }))
   };

   if(!payload.user)throw new Error("A logged-in user is required to create a daily note.");

   const res=await fetch(isEdit?`/api/studies/daily-notes/${noteId}`:"/api/studies/daily-notes",{
    method:isEdit?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   const data=await res.json();
   if(!res.ok)throw new Error(data.message||data.error||`Failed to ${isEdit?"update":"create"} daily note`);

   const savedNote=data.data||data.dailyNote||data;
   setSuccess(`Daily note ${isEdit?"updated":"created"} successfully`);
   if(onSaved)onSaved(savedNote);
  }catch(err){
   setError(err.message);
  }finally{
   setLoading(false);
  }
 };

 return(
  <LocalizationProvider dateAdapter={AdapterDayjs}>
   <Modal show={show} onHide={handleClose} size="xl" centered scrollable>
    <Modal.Header closeButton>
     <Modal.Title>{isEdit?"Edit Daily Note":"Create Daily Note"}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     {loadingData?(
      <div className="py-4 text-center">
       <Spinner animation="border"/>
      </div>
     ):(
      <Form onSubmit={handleSubmit}>
       {error?<Alert variant="danger">{error}</Alert>:null}
       {success?<Alert variant="success">{success}</Alert>:null}

       <Row className="g-3">
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

        <Col md={6}>
         <Form.Group>
          <Form.Label>Journal Date</Form.Label>
          <DatePicker
           value={toDateObject(form.journalDate)}
           onChange={date=>setForm(prev=>({...prev,journalDate:toDateValue(date)}))}
           format="MM/DD/YYYY"
           slotProps={requiredMuiDatePickerSlotProps}
          />
         </Form.Group>
        </Col>

        <Col md={12}>
         <Form.Group>
          <Form.Label>Title</Form.Label>
          <Form.Control name="title" value={form.title} onChange={handleChange}/>
         </Form.Group>
        </Col>

        <Col md={12}>
         <Form.Group>
          <Form.Label>Summary</Form.Label>
          <Form.Control as="textarea" rows={3} name="summary" value={form.summary} onChange={handleChange}/>
         </Form.Group>
        </Col>

        <Col md={12}>
         <div className="card-header daily-note-section-header">
          <div>
           <h3 className="card-title">Scripture Entries</h3>
           <p className="mb-0">Add each scripture that stood out during the day.</p>
          </div>
          <Button type="button" onClick={addEntry}>Add Scripture</Button>
         </div>
        </Col>

        <Col md={12}>
         <Accordion activeKey={activeEntryKey} onSelect={key=>setActiveEntryKey(key||"")}>
          {form.entries.map((entry,index)=>(
           <Accordion.Item eventKey={String(index)} key={`daily-note-entry-${index}`} className="daily-note-entry-card">
            <Accordion.Header>{getEntryTitle(entry,index)}</Accordion.Header>
            <Accordion.Body>
             <div className="daily-note-entry-actions">
              <Button type="button" variant="outline-danger" size="sm" onClick={()=>removeEntry(index)}>
               Remove
              </Button>
             </div>

             <Row className="g-3">
              <Col md={8}>
               <Form.Group>
                <Form.Label>Scripture Reference</Form.Label>
                <Form.Control value={entry.reference} onChange={event=>handleEntryChange(index,"reference",event.target.value)} placeholder="John 3:16-18"/>
               </Form.Group>
              </Col>

              <Col md={4} className="daily-note-reference-action">
               <Button type="button" variant="outline-primary" onClick={()=>parseEntryReference(index)}>
                Parse Reference
               </Button>
              </Col>

              <Col md={8}>
               <Form.Group>
                <Form.Label>Translation</Form.Label>
                <SortedSelect
                 name={`translation-${index}`}
                 value={entry.translation}
                 onChange={event=>handleEntryChange(index,"translation",event.target.value)}
                 options={getTranslationOptions(translations,entry.translation)}
                 getValue={getTranslationValue}
                 getLabel={getTranslationLabel}
                 placeholder="Select translation"
                />
               </Form.Group>
              </Col>

              <Col md={12}>
               <Form.Group>
                <Form.Label>Book</Form.Label>
                <Form.Control value={entry.book} onChange={event=>handleEntryChange(index,"book",event.target.value)}/>
               </Form.Group>
              </Col>

              <Col md={12}>
               <Row className="g-3 daily-note-compact-row">
                <Col md={5} lg={4}>
                 <Form.Group className="daily-note-compact-field">
                  <Form.Label>Chapter Start</Form.Label>
                  <Form.Control type="number" min={1} value={entry.chapterStart} onChange={event=>handleEntryChange(index,"chapterStart",event.target.value)}/>
                 </Form.Group>
                </Col>

                <Col md={5} lg={4}>
                 <Form.Group className="daily-note-compact-field">
                  <Form.Label>Chapter End</Form.Label>
                  <Form.Control type="number" min={1} value={entry.chapterEnd} onChange={event=>handleEntryChange(index,"chapterEnd",event.target.value)}/>
                 </Form.Group>
                </Col>
               </Row>
              </Col>

              <Col md={12}>
               <Row className="g-3 daily-note-compact-row">
                <Col md={5} lg={4}>
                 <Form.Group className="daily-note-compact-field">
                  <Form.Label>Verse Start</Form.Label>
                  <Form.Control type="number" min={1} value={entry.verseStart} onChange={event=>handleEntryChange(index,"verseStart",event.target.value)}/>
                 </Form.Group>
                </Col>

                <Col md={5} lg={4}>
                 <Form.Group className="daily-note-compact-field">
                  <Form.Label>Verse End</Form.Label>
                  <Form.Control type="number" min={1} value={entry.verseEnd} onChange={event=>handleEntryChange(index,"verseEnd",event.target.value)}/>
                 </Form.Group>
                </Col>
               </Row>
              </Col>

              <Col md={12}>
               <Form.Group>
                <Form.Label>Passage Text</Form.Label>
                <Form.Control as="textarea" rows={4} value={entry.passageText} onChange={event=>handleEntryChange(index,"passageText",event.target.value)}/>
               </Form.Group>
              </Col>

              <Col md={12}>
               <div className="daily-note-items-panel">
                <div className="daily-note-items-header">
                 <h4>Daily Notes</h4>
                 <p>Add one note at a time with its own date.</p>
                </div>

                <Row className="g-3 daily-note-item-composer">
                 <Col md={12}>
                  <Form.Group>
                   <Form.Label>Note Text</Form.Label>
                   <Form.Control
                    as="textarea"
                    rows={3}
                    value={entry.noteDraft?.text||""}
                    onChange={event=>handleEntryNoteDraftChange(index,"text",event.target.value)}
                   />
                  </Form.Group>
                 </Col>

                 <Col md={12}>
                  <Row className="g-3 daily-note-compact-row">
                   <Col md={5} lg={4}>
                    <Form.Group className="daily-note-compact-field">
                     <Form.Label>Note Date</Form.Label>
                     <DatePicker
                      value={toDateObject(entry.noteDraft?.notedDate)}
                      onChange={date=>handleEntryNoteDraftChange(index,"notedDate",toDateValue(date))}
                      format="MM/DD/YYYY"
                      slotProps={muiDatePickerSlotProps}
                     />
                    </Form.Group>
                   </Col>

                   <Col md={3} className="daily-note-item-add-action">
                    <Button type="button" variant="outline-primary" onClick={()=>addEntryNote(index)}>
                     Add Note
                    </Button>
                   </Col>
                  </Row>
                 </Col>
                </Row>

                <div className="daily-note-items-list">
                 {Array.isArray(entry.notes)&&entry.notes.length?entry.notes.map((note,noteIndex)=>(
                  <div className="daily-note-item-row" key={`entry-${index}-note-${noteIndex}`}>
                   <div className="daily-note-item-edit-fields">
                    <Form.Group className="daily-note-compact-field daily-note-saved-note-date">
                     <Form.Label>Note Date</Form.Label>
                     <DatePicker
                      value={toDateObject(note.notedDate)}
                      onChange={date=>handleEntryNoteChange(index,noteIndex,"notedDate",toDateValue(date))}
                      format="MM/DD/YYYY"
                      slotProps={muiDatePickerSlotProps}
                     />
                    </Form.Group>
                    <Form.Group>
                     <Form.Label>Note Text</Form.Label>
                     <Form.Control
                      as="textarea"
                      rows={2}
                      value={note.text||""}
                      onChange={event=>handleEntryNoteChange(index,noteIndex,"text",event.target.value)}
                     />
                    </Form.Group>
                   </div>
                   <Button type="button" variant="outline-danger" size="sm" onClick={()=>removeEntryNote(index,noteIndex)}>
                    Remove
                   </Button>
                  </div>
                 )):(
                  <p className="daily-note-empty-message">No notes added for this scripture yet.</p>
                 )}
                </div>
               </div>
              </Col>

              <Col md={12}>
               <Form.Group>
                <Form.Label>Generated Tags</Form.Label>
                <Form.Control readOnly value={generateEntryTags(entry).join(", ")} placeholder="Generated from book, passage text, and daily note"/>
               </Form.Group>
              </Col>

              <Col md={12}>
               <div className="daily-note-memory-row">
                <Form.Check
                 type="checkbox"
                 label="Memorize"
                 checked={entry.memorize}
                 onChange={event=>handleEntryChange(index,"memorize",event.target.checked)}
                />
                {entry.memorize?(
                 <Form.Group className="daily-note-memory-status">
                  <Form.Label>Memorization Status</Form.Label>
                  <Form.Select value={entry.memorizationStatus} onChange={event=>handleEntryChange(index,"memorizationStatus",event.target.value)}>
                   <option value="memorize">Memorize</option>
                   <option value="in process">In Process</option>
                   <option value="reviewed">Reviewed</option>
                  </Form.Select>
                 </Form.Group>
                ):null}
               </div>
              </Col>
             </Row>
            </Accordion.Body>
           </Accordion.Item>
          ))}
         </Accordion>
        </Col>

        <Col md={12} className="daily-note-add-row">
         <Button type="button" variant="outline-primary" onClick={addEntry}>Add Scripture</Button>
        </Col>
       </Row>
      </Form>
     )}
    </Modal.Body>

    <Modal.Footer>
     <Button type="button" variant="secondary" onClick={handleClose}>
      Cancel
     </Button>
     <Button type="button" disabled={loading||loadingData} onClick={handleSubmit}>
      {loading?(isEdit?"Updating...":"Saving..."):(isEdit?"Update Daily Note":"Create Daily Note")}
     </Button>
    </Modal.Footer>
   </Modal>
  </LocalizationProvider>
 );
}

export default DailyNoteForm;