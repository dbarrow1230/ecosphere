import {useEffect,useMemo,useState} from "react";
import {useLocation,useNavigate,useSearchParams} from "react-router-dom";
import {Container,Row,Col,Card,Form,InputGroup,Button,Badge,Alert,Modal} from "react-bootstrap";
import {CalendarDays,NotebookPen,Clock3,Flag} from "lucide-react";
import {sortItems} from "../../utils/sortItems.js";
import {isJournalFollowUpComplete} from "../../utils/dashboard/journalFollowUpTasks.js";
import {followUpReadingFields,normalizeFollowUpReadings,updatePairedReading,toUSReading,formatFollowUpReading} from "../../utils/dashboard/followUpReadings.js";
import "../../styles/journalPage.css";

const entryTypes=[
	{value:"note",label:"Note"},
	{value:"maintenance",label:"Maintenance"},
	{value:"watering",label:"Watering"},
	{value:"feeding",label:"Feeding"},
	{value:"pruning",label:"Pruning / Trim"},
	{value:"hydro-refill",label:"Hydro Refill"},
	{value:"hydro-cleaning",label:"Hydro Cleaning"},
	{value:"observation",label:"Observation"},
	{value:"harvest",label:"Harvest"},
	{value:"transplant",label:"Transplant"},
	{value:"pest",label:"Pest"},
	{value:"disease",label:"Disease"},
	{value:"equipment",label:"Equipment"},
	{value:"other",label:"Other"}
];

const outcomes=[
	{value:"",label:"No outcome"},
	{value:"planned",label:"Planned"},
	{value:"completed",label:"Completed"},
	{value:"partial",label:"Partial"},
	{value:"needs-follow-up",label:"Needs Follow-up"},
	{value:"failed",label:"Failed"},
	{value:"resolved",label:"Resolved"}
];

const defaultEntryForm={
	entryDate:"",
	entryType:"maintenance",
	title:"",
	entry:"",
	maintenanceType:"",
	outcome:"completed",
	durationMinutes:"",
	followUpDate:"",
	planting:"",
	seed:"",
	plant:"",
	garden:"",
	gardenSection:"",
	hydroSystem:"",
	hydroDevice:"",
	hydroPodPosition:"",
	equipment:"",
	tags:""
};

const getObjectId=value=>{
	if(!value)return "";
	if(typeof value==="string")return value;

	if(typeof value==="object"){
		if(typeof value.$oid==="string")return value.$oid;
		if(typeof value._id==="string")return value._id;
		if(typeof value.id==="string")return value.id;
		if(typeof value._id?.$oid==="string")return value._id.$oid;
		if(typeof value.id?.$oid==="string")return value.id.$oid;
	}

	return "";
};

const formatDateForInput=value=>{
	if(typeof value==="string"&&/^\d{4}-\d{2}-\d{2}/.test(value))return value.slice(0,10);
	const date=value ? new Date(value) : new Date();
	if(Number.isNaN(date.getTime()))return "";
	return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
};

const formatDate=value=>{
	if(!value)return "No date";
	const date=new Date(formatDateForInput(value)+"T12:00:00");
	if(Number.isNaN(date.getTime()))return "No date";
	return date.toLocaleDateString();
};

const getSeedLabel=seed=>seed?.plantName||seed?.name||seed?.title||"Unnamed Seed";
const getPlantLabel=plant=>plant?.name||plant?.plantName||plant?.title||"Unnamed Plant";
const getGardenLabel=garden=>garden?.name||garden?.title||"Unnamed Garden";
const getSectionLabel=section=>section?.name||section?.title||"Unnamed Section";
const getEquipmentLabel=equipment=>[equipment?.name,equipment?.brand,equipment?.model].filter(Boolean).join(" • ")||"Unnamed Equipment";
const getHydroLabel=system=>system?.name||system?.model||"Unnamed Hydro Run";
const getPlantingLabel=planting=>planting?.instanceName||getSeedLabel(planting?.seed)||getPlantLabel(planting?.plant)||"Growing Instance";

const unwrapRows=value=>{
	if(Array.isArray(value))return value;
	if(Array.isArray(value?.data))return value.data;
	if(Array.isArray(value?.items))return value.items;
	if(Array.isArray(value?.results))return value.results;
	return [];
};

const loadRows=async url=>{
	const res=await fetch(url);
	const data=await res.json().catch(()=>[]);
	if(!res.ok)throw new Error(data.message||`Failed to load ${url}`);
	return unwrapRows(data);
};

export default function JournalPage({user,editorOnly=false,initialEntry={},onClose,onSaved}){
 const [searchParams,setSearchParams]=useSearchParams();
 const requestedEntry=searchParams.get("entry");
 const location=useLocation();
 const navigate=useNavigate();
 const [followUpOrigin]=useState(()=>requestedEntry?(location.state?.followUpOrigin||"/dashboard"):null);
	const [entryForm,setEntryForm]=useState(()=>({...defaultEntryForm,entryDate:formatDateForInput(new Date()),...initialEntry}));
	const [journalEntries,setJournalEntries]=useState([]);
	const [plantings,setPlantings]=useState([]);
	const [seedRecords,setSeedRecords]=useState([]);
	const [plantRecords,setPlantRecords]=useState([]);
	const [gardens,setGardens]=useState([]);
	const [gardenSections,setGardenSections]=useState([]);
	const [hydroSystems,setHydroSystems]=useState([]);
	const [equipmentRecords,setEquipmentRecords]=useState([]);
	const [saving,setSaving]=useState(false);
	const [loading,setLoading]=useState(true);
	const [error,setError]=useState("");
	const [success,setSuccess]=useState("");
 const [editingId,setEditingId]=useState("");
 const [showEditor,setShowEditor]=useState(editorOnly);
 const [showHistory,setShowHistory]=useState(false);
 const [viewEntry,setViewEntry]=useState(null);
 const [followUpNote,setFollowUpNote]=useState("");
 const [followUpReadings,setFollowUpReadings]=useState({});
 const [noteError,setNoteError]=useState("");
 const [savingNote,setSavingNote]=useState(false);
 const [historyMonth,setHistoryMonth]=useState(()=>formatDateForInput(new Date()).slice(0,7));

const selectedHydroSystem=useMemo(()=>{
		return hydroSystems.find(system=>getObjectId(system)===entryForm.hydroSystem)||null;
	},[hydroSystems,entryForm.hydroSystem]);

	const hydroDevices=useMemo(()=>{
		return selectedHydroSystem?.devices||[];
	},[selectedHydroSystem]);

	const selectedHydroDevice=useMemo(()=>{
		return hydroDevices.find(device=>getObjectId(device)===entryForm.hydroDevice)||null;
	},[hydroDevices,entryForm.hydroDevice]);

 const currentMonth=formatDateForInput(new Date()).slice(0,7);
 const currentMonthEntries=journalEntries.filter(entry=>formatDateForInput(entry.entryDate||entry.createdAt).slice(0,7)===currentMonth);
 const currentMonthLabel=new Date(currentMonth+"-01T12:00:00").toLocaleDateString(undefined,{month:"long",year:"numeric"});
 const moveHistoryMonth=offset=>{const date=new Date(historyMonth+"-01T12:00:00");date.setMonth(date.getMonth()+offset);setHistoryMonth(formatDateForInput(date).slice(0,7));};
 const openEditor=entry=>{
  const form={...defaultEntryForm};
  if(entry){
   Object.keys(form).forEach(key=>{form[key]=entry[key]??"";});
   ["planting","seed","plant","garden","gardenSection","hydroSystem","hydroDevice","equipment"].forEach(key=>{form[key]=getObjectId(entry[key]);});
   form.tags=(entry.tags||[]).join(", ");
   form.followUpDate=entry.followUpDate?formatDateForInput(entry.followUpDate):"";
  }
  form.entryDate=formatDateForInput(entry?.entryDate||new Date());
  if(form.hydroSystem){
   const run=hydroSystems.find(item=>getObjectId(item)===form.hydroSystem);
   const device=run?.devices?.find(item=>getObjectId(item)===form.hydroDevice)||(run?.devices?.length===1?run.devices[0]:null);
   if(device){form.hydroDevice=getObjectId(device);form.equipment=getObjectId(device.equipment);}
  }
  setEntryForm(form);setEditingId(getObjectId(entry));setError("");setShowEditor(true);
 };

	useEffect(()=>{
		let ignore=false;

		const loadJournalData=async()=>{
			try{
				setLoading(true);

				const [entriesData,plantingsData,seedsData,plantsData,gardensData,sectionsData,hydroData,equipmentData]=await Promise.all([
					loadRows("/api/journal-entries"),
					loadRows("/api/plantings"),
					loadRows("/api/seeds"),
					loadRows("/api/plants"),
					loadRows("/api/gardens"),
					loadRows("/api/garden-sections"),
					loadRows("/api/hydro-systems"),
					loadRows("/api/equipment")
				]);

				if(ignore)return;

				setJournalEntries(entriesData);
				setPlantings(plantingsData);
				setSeedRecords(seedsData);
				setPlantRecords(plantsData);
				setGardens(gardensData);
				setGardenSections(sectionsData);
				setHydroSystems(hydroData);
				setEquipmentRecords(equipmentData);
    if(requestedEntry){
     const entry=entriesData.find(item=>getObjectId(item)===requestedEntry);
     if(entry)setViewEntry(entry);
     else setError("This journal entry is no longer available.");
     setSearchParams(params=>{params.delete("entry");return params;},{replace:true});
    }
			}catch(err){
				if(!ignore)setError(err.message||"Failed to load journal data");
			}finally{
				if(!ignore)setLoading(false);
			}
		};

		loadJournalData();

		return()=>{
			ignore=true;
		};
	},[requestedEntry,setSearchParams]);

	
	const handleEntryChange=e=>{
		const {name,value}=e.target;

		setEntryForm(prev=>{
			const next={...prev,[name]:value};

			if(name==="hydroSystem"){
				const run=hydroSystems.find(item=>getObjectId(item)===value);
    const device=run?.devices?.length===1?run.devices[0]:null;
    next.hydroDevice=getObjectId(device);
    next.equipment=getObjectId(device?.equipment);
    next.hydroPodPosition="";
			}

			if(name==="planting"){
    const planting=plantings.find(item=>getObjectId(item)===value);
    if(planting)["seed","plant","garden","gardenSection"].forEach(key=>{next[key]=getObjectId(planting[key]);});
   }
   if(name==="hydroDevice"){
    next.equipment=getObjectId(hydroDevices.find(item=>getObjectId(item)===value)?.equipment);
				next.hydroPodPosition="";
			}

			return next;
		});
	};

	const handleEntrySubmit=async e=>{
		e.preventDefault();

		try{
			setSaving(true);
			setError("");
			setSuccess("");

			const payload={
				...entryForm,
				durationMinutes:entryForm.durationMinutes==="" ? 0 : Number(entryForm.durationMinutes),
				hydroPodPosition:entryForm.hydroPodPosition==="" ? null : Number(entryForm.hydroPodPosition),
				followUpDate:entryForm.followUpDate||null,
				tags:entryForm.tags.split(",").map(item=>item.trim()).filter(Boolean),
				...(!editingId?{createdBy:getObjectId(user)}:{})
			};

			const res=await fetch(editingId?`/api/journal-entries/${editingId}`:"/api/journal-entries",{
				method:editingId?"PUT":"POST",
				headers:{"Content-Type":"application/json"},
				body:JSON.stringify(payload)
			});

			const data=await res.json().catch(()=>({}));
			if(!res.ok)throw new Error(data.message||"Failed to save journal entry");

			setJournalEntries(prev=>editingId?prev.map(item=>getObjectId(item)===editingId?data:item):[data,...prev]);
   setShowEditor(false);
   setViewEntry(current=>current&&getObjectId(current)===getObjectId(data)?data:current);
   onSaved?.(data);
			setEntryForm({...defaultEntryForm,entryDate:formatDateForInput(new Date())});
			setSuccess(editingId?"Journal entry updated.":"Journal entry saved.");
		}catch(err){
			setError(err.message||"Failed to save journal entry");
		}finally{
			setSaving(false);
		}
	};

 const renderLinkedTargets=entry=>{
  const targets=[
   entry.planting&&["Instance",getPlantingLabel(entry.planting)],
   !entry.planting&&entry.seed&&["Seed",getSeedLabel(entry.seed)],
   !entry.planting&&entry.plant&&["Plant",getPlantLabel(entry.plant)],
   entry.hydroSystem&&["Hydro run",getHydroLabel(entry.hydroSystem)],
   entry.hydroPodPosition&&["Pod",entry.hydroPodPosition],
   !entry.hydroSystem&&entry.equipment&&["Equipment",getEquipmentLabel(entry.equipment)],
   entry.garden&&["Garden",getGardenLabel(entry.garden)],
   entry.gardenSection&&["Section",getSectionLabel(entry.gardenSection)]
  ].filter(Boolean);
  return targets.length?<dl className="journal-linked-records">{targets.map(([label,value])=><div key={label}><dt>{label}:</dt><dd>{value}</dd></div>)}</dl>:"General journal entry";
 };

 const closeEditor=()=>{setShowEditor(false);if(editorOnly)onClose?.();};
 const closeRecord=()=>{
  if(savingNote)return;
  setViewEntry(null);
  if(followUpOrigin)navigate(followUpOrigin,{replace:true});
 };
 const openRecord=entry=>{setViewEntry(entry);setFollowUpNote("");setFollowUpReadings({});setNoteError("");};
 const saveFollowUp=async event=>{
  event.preventDefault();
  if(savingNote)return;
  setSavingNote(true);setNoteError("");
  try{
   const readings=normalizeFollowUpReadings(followUpReadings);
   if(!followUpNote.trim()&&!Object.keys(readings).length)throw new Error("Enter notes or at least one monitoring reading.");
   const response=await fetch(`/api/journal-entries/${getObjectId(viewEntry)}/notes`,{
    method:"PATCH",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({note:followUpNote.trim(),readings,date:new Date().toISOString(),createdBy:getObjectId(user)||null})
   });
   const updated=await response.json();
   if(!response.ok)throw new Error(updated.message||"Failed to save follow-up notes");
   setJournalEntries(entries=>entries.map(entry=>getObjectId(entry)===getObjectId(updated)?updated:entry));
   setViewEntry(updated);setFollowUpNote("");setFollowUpReadings({});onSaved?.(updated);
  }catch(error){setNoteError(error.message||"Failed to save follow-up notes");}
  finally{setSavingNote(false);}
 };

 const records=(rows,label)=>[{value:"",label:"None selected"},...sortItems(rows,label).map(item=>({value:getObjectId(item),label:label(item)}))];
 const fieldWidths={entryDate:3,entryType:3,outcome:3,durationMinutes:3,title:8,entry:12,followUpDate:3,tags:9,maintenanceType:4,planting:6,hydroSystem:6,hydroDevice:6,hydroPodPosition:3,equipment:6,seed:6,plant:6,garden:6,gardenSection:6};
 const field=(name,label,type="text",options=null,disabled=false)=><Col xs={12} md={name==="title"&&entryForm.entryType!=="maintenance"&&!entryForm.maintenanceType?12:fieldWidths[name]||6} key={name}>
  <InputGroup className={"journal-form-field"+(name==="entry"?" journal-notes-field":"")}>
   <Form.Label htmlFor={"journal-"+name} className="input-group-text">{label}:</Form.Label>
   {options?<Form.Select id={"journal-"+name} name={name} value={entryForm[name]} onChange={handleEntryChange} disabled={disabled}>{options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</Form.Select>:
    <Form.Control id={"journal-"+name} name={name} type={type} as={name==="entry"?"textarea":undefined} rows={name==="entry"?3:undefined} min={type==="number"?0:undefined} required={name==="entryDate"||name==="title"} value={entryForm[name]} onChange={handleEntryChange}/>}
  </InputGroup>
 </Col>;

 return <Container fluid className={editorOnly?"journal-page":"journal-page py-4"}>
  {!editorOnly&&<>
  <Card className="journal-hero"><Card.Body><div><p className="journal-kicker">Garden Journal</p><h1>Daily Work & Growing Notes</h1><p>This month’s work and growing notes.</p></div><div className="journal-hero-count"><strong>{loading?"…":currentMonthEntries.length}</strong><span>entries in {currentMonthLabel}</span></div><Button disabled={loading} onClick={()=>openEditor(null)}><NotebookPen size={18}/> New entry</Button></Card.Body></Card>
  {error&&!showEditor&&<Alert variant="danger">{error}</Alert>}{success&&<Alert variant="success" dismissible onClose={()=>setSuccess("")}>{success}</Alert>}
  <Card className="journal-card"><Card.Header><CalendarDays size={20}/><h2>{currentMonthLabel}</h2><Button variant="primary" className="ms-auto" onClick={()=>setShowHistory(true)}>Entry history</Button></Card.Header><Card.Body>
   <JournalEntriesView key={currentMonth} journalEntries={journalEntries} month={currentMonth} loading={loading} onEdit={openEditor} onView={openRecord} renderLinkedTargets={renderLinkedTargets} idPrefix="current"/>
  </Card.Body></Card>
  <Modal show={showHistory&&!showEditor&&!viewEntry} onHide={()=>setShowHistory(false)} size="xl" centered scrollable className="journal-editor">
   <Modal.Header closeButton><Modal.Title>Entry history</Modal.Title></Modal.Header>
   <Modal.Body className="journal-page">
    <div className="journal-month-navigation"><Button variant="primary" onClick={()=>moveHistoryMonth(-1)}>← Previous month</Button><Form.Group controlId="history-month"><Form.Label>Browse month</Form.Label><Form.Control type="month" value={historyMonth} onChange={e=>{if(e.target.value)setHistoryMonth(e.target.value);}}/></Form.Group><Button variant="primary" onClick={()=>moveHistoryMonth(1)}>Next month →</Button></div>
    <JournalEntriesView key={historyMonth} journalEntries={journalEntries} month={historyMonth} loading={loading} onEdit={openEditor} onView={openRecord} renderLinkedTargets={renderLinkedTargets} idPrefix="history"/>
   </Modal.Body><Modal.Footer><Button onClick={()=>setShowHistory(false)}>Close history</Button></Modal.Footer>
  </Modal>
  </>}
  <Modal show={!!viewEntry&&!showEditor} onHide={closeRecord} size="xl" centered scrollable className="journal-editor" backdrop={savingNote?"static":true} keyboard={!savingNote}>
   <Modal.Header closeButton={!savingNote}><Modal.Title>Journal entry & follow-up</Modal.Title></Modal.Header>
   <Modal.Body>{viewEntry&&<>
    <h3>{viewEntry.title||"Untitled entry"}</h3>
    <p>{formatDate(viewEntry.entryDate)} · {entryTypes.find(type=>type.value===viewEntry.entryType)?.label||viewEntry.entryType}</p>
    <p style={{whiteSpace:"pre-wrap"}}>{viewEntry.entry||"No original notes added."}</p>
    <h4>Seed, plant and location links</h4>
    {renderLinkedTargets(viewEntry)}
    {viewEntry.followUpDate&&<p>{isJournalFollowUpComplete(viewEntry)?"Follow-up completed":"Scheduled follow-up"}: {formatDate(viewEntry.followUpDate)}</p>}
    <FollowUpNotes notes={viewEntry.notes}/>
    <Form onSubmit={saveFollowUp} className="mt-3">
     <h4>Follow-up monitoring · {formatDate(new Date())}</h4>
     {[...new Set(followUpReadingFields.map(field=>field.group))].map(group=><fieldset key={group} disabled={savingNote} className="mb-3"><legend className="h5">{group}</legend><Row className="g-3">{followUpReadingFields.filter(field=>field.group===group).map(field=><Col xs={12} sm={6} lg={4} key={field.key}>
      <div className="fw-semibold mb-1">{field.label}</div>
      {(field.usUnit?[true,false]:[false]).map(isUS=>{
       const key=isUS?`${field.key}US`:field.key;
       const unit=isUS?field.usUnit:field.unit;
       return <Form.Group key={key} controlId={`follow-up-${key}`} className="mb-2"><Form.Label>{unit||field.label}</Form.Label><Form.Control type="number" step={field.step||"any"} min={isUS&&field.min!==undefined?toUSReading(field,field.min):field.min} max={isUS&&field.max!==undefined?toUSReading(field,field.max):field.max} aria-label={`${field.label}${unit?` (${unit})`:""}`} value={followUpReadings[key]??""} onChange={event=>setFollowUpReadings(values=>updatePairedReading(values,field,event.target.value,isUS))}/></Form.Group>;
      })}
     </Col>)}</Row></fieldset>)}
     <Form.Group controlId="record-follow-up-notes"><Form.Label>Notes</Form.Label>
      <Form.Control as="textarea" rows={4} value={followUpNote} onChange={event=>setFollowUpNote(event.target.value)} disabled={savingNote}/>
     </Form.Group>
     {noteError&&<Alert variant="danger" className="mt-2">{noteError}</Alert>}
     <Button type="submit" className="mt-3" disabled={savingNote||(!followUpNote.trim()&&!Object.values(followUpReadings).some(value=>value!==""))}>{savingNote?"Saving…":"Save follow-up & readings"}</Button>
    </Form>
   </>}</Modal.Body>
   <Modal.Footer><Button disabled={savingNote} onClick={closeRecord}>Close</Button><Button disabled={savingNote} onClick={()=>openEditor(viewEntry)}>Edit original entry</Button></Modal.Footer>
  </Modal>
  <Modal show={showEditor} onHide={()=>{if(!saving)closeEditor();}} size="xl" centered scrollable className="journal-editor" backdrop={saving?"static":true} keyboard={!saving}>
   <Modal.Header closeButton={!saving}><Modal.Title>{editingId?"Edit journal entry":"New journal entry"}</Modal.Title></Modal.Header>
   <Modal.Body>{error&&<Alert variant="danger">{error}</Alert>}
    <Form id="journal-entry-form" onSubmit={handleEntrySubmit}><fieldset disabled={saving}><Row className="g-2">
     {field("entryDate","Date","date")}{field("entryType","Type","text",entryTypes)}
     {field("outcome","Outcome","text",outcomes)}{field("durationMinutes","Minutes","number")}
     {field("title","Title")}
     {(entryForm.entryType==="maintenance"||entryForm.maintenanceType)&&field("maintenanceType","Maintenance")}
     {field("entry","Notes")}
     {field("followUpDate","Follow-up","date")}{field("tags","Tags")}
     <Col xs={12}><h3>Linked records</h3></Col>
     {field("planting","Growing instance","text",records(plantings,getPlantingLabel))}
     {field("hydroSystem","Hydro run","text",records(hydroSystems,getHydroLabel))}
     {selectedHydroSystem&&field("hydroDevice","Run device","text",records(hydroDevices,item=>item.name||item.model||"Device"))}
     {selectedHydroSystem&&field("hydroPodPosition","Pod","text",[{value:"",label:"Any pod"},...(selectedHydroDevice?.pods||selectedHydroSystem.pods||[]).map(pod=>({value:pod.position,label:"Pod "+pod.position}))])}
     {field("equipment",selectedHydroSystem?"Run equipment":"Equipment","text",records(equipmentRecords,getEquipmentLabel),!!selectedHydroSystem)}
     <Col xs={12}><details><summary>Seed, plant and location links</summary><Row className="g-3">
      {field("seed","Seed","text",records(seedRecords,getSeedLabel))}{field("plant","Plant","text",records(plantRecords,getPlantLabel))}
      {field("garden","Garden","text",records(gardens,getGardenLabel))}{field("gardenSection","Garden section","text",records(gardenSections,getSectionLabel))}
     </Row></details></Col>
    </Row></fieldset></Form>
    {selectedHydroSystem&&hydroDevices.length>1&&!entryForm.hydroDevice&&<p className="mt-3">Choose a device to link its equipment.</p>}
   </Modal.Body><Modal.Footer><Button variant="primary" disabled={saving} onClick={closeEditor}>Cancel</Button><Button type="submit" form="journal-entry-form" disabled={saving}>{saving?"Saving…":editingId?"Save changes":"Save entry"}</Button></Modal.Footer>
  </Modal>
 </Container>;
}

function FollowUpNotes({notes=[]}){
 if(!notes.length)return null;
 return <section className="journal-follow-up-notes mt-3" aria-label="Follow-up notes and readings"><h4>Follow-ups & monitoring readings</h4>{notes.map((note,index)=><div key={index} className="border rounded p-3 mb-2"><strong>{formatDate(note.date)}</strong><dl className="journal-linked-records">{followUpReadingFields.filter(field=>note.readings?.[field.key]!==undefined&&note.readings?.[field.key]!==null).map(field=><div key={field.key}><dt>{field.label}:</dt><dd>{formatFollowUpReading(field,note.readings[field.key])}</dd></div>)}</dl>{note.note&&<p className="mb-0" style={{whiteSpace:"pre-wrap"}}>{note.note}</p>}</div>)}</section>;
}

function JournalEntriesView({journalEntries,month,loading,onEdit,onView,renderLinkedTargets,idPrefix}){
 const [filters,setFilters]=useState({type:"",outcome:"",followUp:"",tag:""});
 const [page,setPage]=useState(0);
 const monthEntries=useMemo(()=>journalEntries.filter(entry=>formatDateForInput(entry.entryDate||entry.createdAt).slice(0,7)===month),[journalEntries,month]);
 const today=formatDateForInput(new Date());
 const sortedEntries=useMemo(()=>monthEntries.filter(entry=>
  (!filters.type||entry.entryType===filters.type)&&
  (!filters.outcome||(filters.outcome==="none"?!entry.outcome:entry.outcome===filters.outcome))&&
  (!filters.tag||(entry.tags||[]).includes(filters.tag))&&
  (!filters.followUp||(filters.followUp==="none"?!entry.followUpDate:filters.followUp==="scheduled"?!!entry.followUpDate:!!entry.followUpDate&&!isJournalFollowUpComplete(entry)&&formatDateForInput(entry.followUpDate)<=today))
 ).sort((a,b)=>new Date(b.entryDate||b.createdAt)-new Date(a.entryDate||a.createdAt)),[monthEntries,filters,today]);
 const days=[...new Set(sortedEntries.map(entry=>formatDateForInput(entry.entryDate||entry.createdAt)))];
 const pageCount=Math.max(1,days.length);
 const currentPage=Math.min(page,pageCount-1);
 const selectedDay=days[currentPage];
 const pageEntries=sortedEntries.filter(entry=>formatDateForInput(entry.entryDate||entry.createdAt)===selectedDay);
 const updateFilters=next=>{setFilters(next);setPage(0);};
 const groups=selectedDay?{[selectedDay]:pageEntries}:{};
 const tags=[...new Set(journalEntries.flatMap(entry=>entry.tags||[]))].sort();

 const renderFilter=(name,label,options)=><Form.Group controlId={idPrefix+"-filter-"+name}><Form.Label>{label}</Form.Label><Form.Select value={filters[name]} onChange={e=>updateFilters(prev=>({...prev,[name]:e.target.value}))}><option value="">All {label.toLowerCase()}</option>{options.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</Form.Select></Form.Group>;
 return <>   <div className="journal-filters">
    {renderFilter("type","Types",entryTypes)}{renderFilter("outcome","Outcomes",outcomes.map(item=>({...item,value:item.value||"none"})))}
    {renderFilter("followUp","Follow-ups",[{value:"due",label:"Due or overdue"},{value:"scheduled",label:"Has follow-up date"},{value:"none",label:"No follow-up date"}])}
    {renderFilter("tag","Tags",tags.map(tag=>({value:tag,label:tag})))}<Button variant="primary" onClick={()=>updateFilters({type:"",outcome:"",followUp:"",tag:""})}>Clear filters</Button>
   </div>
   <nav className="journal-entry-navigation" aria-label="Journal days">
    <Button variant="primary" disabled={loading||currentPage===0} onClick={()=>setPage(currentPage-1)}>← Previous day</Button>
    <span role="status">{loading?"Loading entries…":sortedEntries.length?`${formatDate(selectedDay)} · ${pageEntries.length} ${pageEntries.length===1?"entry":"entries"} · Day ${currentPage+1} of ${days.length}`:"0 entries"}</span>
    <Button variant="primary" disabled={loading||currentPage>=pageCount-1} onClick={()=>setPage(currentPage+1)}>Next day →</Button>
   </nav>
   {!loading&&!sortedEntries.length&&<div className="journal-empty">No entries match this month and filters.</div>}
   {!loading&&Object.entries(groups).map(([day,entries])=><section className="journal-day" key={day}><h3>{formatDate(day+"T12:00:00")}</h3><div className="journal-entry-grid">{entries.map(entry=><article className="journal-entry-item" key={getObjectId(entry)}>
    <div className="journal-entry-head"><h4>{entry.title||"Untitled entry"}</h4><div className="d-flex gap-2"><Button variant="primary" onClick={()=>onView(entry)}>View / Follow up</Button><Button variant="primary" onClick={()=>onEdit(entry)} aria-label={"Edit "+(entry.title||"entry")}>Edit</Button></div></div>
    <div className="journal-entry-meta"><span><Flag size={14}/>{entryTypes.find(type=>type.value===entry.entryType)?.label||entry.entryType}</span>{!!entry.durationMinutes&&<span><Clock3 size={14}/>{entry.durationMinutes} min</span>}{entry.outcome&&<Badge bg={entry.outcome==="needs-follow-up"?"warning":"success"}>{outcomes.find(item=>item.value===entry.outcome)?.label||entry.outcome}</Badge>}</div>
    <p>{entry.entry||"No notes added."}</p><div className="journal-entry-targets">{renderLinkedTargets(entry)}</div>
    <FollowUpNotes notes={entry.notes}/>
    {entry.followUpDate&&<div className="journal-follow-up">{isJournalFollowUpComplete(entry)?"Follow-up completed":"Follow up"}: {formatDate(entry.followUpDate)}</div>}
    {!!entry.tags?.length&&<div className="journal-tags">{entry.tags.map(tag=><span key={tag}>#{tag}</span>)}</div>}
   </article>)}</div></section>)}</>;
}
