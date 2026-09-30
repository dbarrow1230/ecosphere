import useDomainIdPreview from "../../hooks/useDomainIdPreview.js";
import {useEffect,useState} from "react";
import {Button,Col,Form,Row,Tab,Tabs} from "react-bootstrap";
import RelationshipSelector from "../../components/RelationshipSelector.jsx";
import DomainSelect from "../../components/DomainSelect.jsx";
import RichTextEditor from "../../components/RichTextEditor.jsx";
import RecordPreviewPopover from "../../components/RecordPreviewPopover.jsx";
import useRecordSubtypes from "../../hooks/useRecordSubtypes.js";

function StructureNoteForm({
 form,
 setForm,
 projects=[],
 zettels=[],
 sources=[],
 entities=[],
 editing=null,
 saving=false,
 userId="",
 defaultTab="details",
 onSubmit
}){
 const domainIdPreview=useDomainIdPreview({form,editing,recordType:"STR",idField:"structureNoteId",subtype:form.subtype,subject:form.title});
 const [createdTypes,setCreatedTypes]=useState([]);
 const structureTypes=useRecordSubtypes("STR",createdTypes);
 const [activeTab,setActiveTab]=useState(defaultTab);
 const [addingSubtype,setAddingSubtype]=useState(false);
 const [subtypeName,setSubtypeName]=useState("");
 const [subtypeError,setSubtypeError]=useState("");
 const [savingSubtype,setSavingSubtype]=useState(false);

 const addSubtype=async()=>{
  const name=subtypeName.trim();
  const code=name.toUpperCase().replace(/[^A-Z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,24);
  if(!name||!code)return;
  setSavingSubtype(true);
  setSubtypeError("");
  try{
   const response=await fetch("/api/record-subtypes",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({userId,recordType:"STR",name,code,status:"active"})});
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Unable to add subtype");
   setCreatedTypes(current=>[...current,data.data]);
   updateField("subtype",data.data.code);
   setSubtypeName("");
   setAddingSubtype(false);
  }catch(error){setSubtypeError(error.message);}
  finally{setSavingSubtype(false);}
 };

 useEffect(()=>{
  setActiveTab(defaultTab);
 },[defaultTab,editing]);

 // Helper: update one form field
 const updateField=(field,value)=>{
  setForm(current=>({...current,[field]:value}));
 };

 const updateOrderedSelection=(recordType,field,value)=>{
  setForm(current=>{
   const selected=new Set(value);
   const orderEntries=(current.orderEntries||[]).filter(entry=>entry.recordType!==recordType||selected.has(entry.recordId));
   const orderedIds=new Set(orderEntries.filter(entry=>entry.recordType===recordType).map(entry=>entry.recordId));

   value.forEach(recordId=>{
    if(!orderedIds.has(recordId))orderEntries.push({recordType,recordId});
   });

   if(recordType==="zettel"){
    const pathEntries=(current.pathEntries||[]).filter(entry=>selected.has(entry.zettelId));
    const pathIds=new Set(pathEntries.map(entry=>entry.zettelId));

    value.forEach(zettelId=>{
     if(!pathIds.has(zettelId))pathEntries.push({zettelId,annotation:""});
    });

    return {...current,[field]:value,orderEntries,pathEntries};
   }

   return {...current,[field]:value,orderEntries};
  });
 };

 const moveOrderEntry=(fromIndex,toIndex)=>{
  if(fromIndex===toIndex||toIndex<0)return;
  setForm(current=>{
   const orderEntries=[...(current.orderEntries||[])];
   if(fromIndex>=orderEntries.length||toIndex>=orderEntries.length)return current;
   const [entry]=orderEntries.splice(fromIndex,1);
   orderEntries.splice(toIndex,0,entry);
   return {...current,orderEntries};
  });
 };

 const getOrderedRecord=entry=>{
  const records=entry.recordType==="zettel"?zettels:entry.recordType==="source"?sources:entities;
  const record=records.find(item=>item._id===entry.recordId);
  return {
   label:record?.title||record?.name||"Untitled record",
   code:record?.zettelId||record?.sourceId||record?.entityId||entry.recordId,
   record
  };
 };

 return(
  <Form className="structure-note-form" onSubmit={onSubmit}>
   <Tabs activeKey={activeTab} onSelect={tab=>setActiveTab(tab||"details")} className="structure-form-tabs">
    <Tab eventKey="details" title="Structure Details">

   <DomainSelect value={form.domainId} onChange={(domainId,domain)=>setForm(current=>({...current,domainId,domainCode:domain?.code||""}))}/>
   {editing?._id&&(
    <div className="structure-form-id">
     <span className="structure-form-id-label">Structure Note ID:</span>
     <code className="structure-form-id-value">{domainIdPreview}</code>
    </div>
   )}

   <Row>
    {!editing?._id&&<Col xs={12} md={8}>
      <Form.Group className="mb-3">
       <Form.Label>Subject Code</Form.Label>
       <Form.Control
        value={form.subjectCode}
        onChange={event=>updateField(
         "subjectCode",
         event.target.value.toUpperCase()
        )}
        placeholder="Optional ID segment"
       />
      </Form.Group>
     </Col>}

     <Col xs={12} md={editing?._id?12:4}>
      <Form.Group className="mb-3">
       <Form.Label>Subtype</Form.Label>
       <div className="d-flex flex-wrap gap-2">
       <Form.Select className="flex-grow-1" style={{minWidth:"11rem"}}
        required
        value={form.subtype}
        onChange={event=>updateField(
         "subtype",
         event.target.value.toUpperCase()
        )}
       >
        <option value="">Select Structure Type</option>
        {structureTypes.map(type=><option key={type._id} value={type.code}>{type.name||type.code}</option>)}
        {form.subtype&&!structureTypes.some(type=>type.code===form.subtype)&&<option value={form.subtype}>{form.subtype}</option>}
       </Form.Select>
       <Button type="button" variant="outline-primary" onClick={()=>setAddingSubtype(value=>!value)}>Add New Subtype</Button>
       </div>
       {addingSubtype&&<div className="d-flex flex-wrap gap-2 mt-2"><Form.Control className="flex-grow-1" style={{minWidth:"11rem"}} value={subtypeName} onChange={event=>setSubtypeName(event.target.value)} placeholder="New subtype name"/><Button type="button" onClick={addSubtype} disabled={savingSubtype||!subtypeName.trim()}>{savingSubtype?"Saving...":"Save Subtype"}</Button></div>}
       {subtypeError&&<p className="text-danger mt-2 mb-0" role="alert">{subtypeError}</p>}
      </Form.Group>
     </Col>
    </Row>

   <RelationshipSelector label="Projects (optional)" value={form.projectIds||[]} records={projects} idField="projectId" titleField="title" onChange={projectIds=>setForm(current=>({...current,projectIds,projectId:projectIds[0]||""}))}/>

   <Form.Group className="mb-3">
    <Form.Label>Title</Form.Label>
    <Form.Control
     required
     value={form.title}
     onChange={event=>updateField("title",event.target.value)}
    />
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Purpose</Form.Label>
    <RichTextEditor value={form.purpose} onChange={value=>updateField("purpose",value)} placeholder="Explain what this structure note organizes and how it will be used." minHeight="7rem"/>
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Summary</Form.Label>
    <RichTextEditor value={form.summary} onChange={value=>updateField("summary",value)} placeholder="Summarize this structure." minHeight="7rem"/>
   </Form.Group>

    </Tab>
    <Tab eventKey="relationships" title="Sources & Links">
     <RelationshipSelector label="Linked zettels" value={form.zettelIds} records={zettels} idField="zettelId" titleField="title" onChange={value=>updateOrderedSelection("zettel","zettelIds",value)}/>
     <RelationshipSelector label="Linked sources" value={form.sourceIds} records={sources} idField="sourceId" titleField="title" onChange={value=>updateOrderedSelection("source","sourceIds",value)}/>
     <RelationshipSelector label="Linked entities" value={form.entityIds} records={entities} idField="entityId" titleField="name" onChange={value=>updateOrderedSelection("entity","entityIds",value)}/>
    </Tab>
    <Tab eventKey="order" title="Notes">
     <p className="structure-order-help">Records enter the order as you select them. Drag a row to rearrange it. Linked Zettels can also include an annotation explaining their place in the structure.</p>
     {(form.orderEntries||[]).length?(
      <ol className="structure-order-list">
       {(form.orderEntries||[]).map((entry,index)=>{
        const record=getOrderedRecord(entry);
        const pathEntry=entry.recordType==="zettel"?(form.pathEntries||[]).find(item=>item.zettelId===entry.recordId):null;
        return(
         <li className="structure-order-item" key={`${entry.recordType}-${entry.recordId}`} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();moveOrderEntry(Number(event.dataTransfer.getData("text/plain")),index);}}>
          <span className="structure-order-handle" draggable aria-label={`Drag order item ${index+1}`} onDragStart={event=>event.dataTransfer.setData("text/plain",String(index))}>⋮⋮</span>
          <span className="structure-order-number">{index+1}</span>
          <span className="structure-order-record">
           <strong>{record.label}</strong>
           <RecordPreviewPopover record={record.record} code={record.code} title={record.label}/>
           {entry.recordType==="zettel"&&(
            <Form.Group className="mt-2">
             <Form.Label>Path Annotation</Form.Label>
             <Form.Control
              as="textarea"
              rows={3}
              value={pathEntry?.annotation||""}
              onChange={event=>{
               const annotation=event.target.value;
               setForm(current=>{
                const pathEntries=[...(current.pathEntries||[])];
                const pathIndex=pathEntries.findIndex(item=>item.zettelId===entry.recordId);

                if(pathIndex>=0){
                 pathEntries[pathIndex]={...pathEntries[pathIndex],annotation};
                }else{
                 pathEntries.push({zettelId:entry.recordId,annotation});
                }

                return {...current,pathEntries};
               });
              }}
              placeholder="Explain why this Zettel appears here, what it contributes, or what should be done with it."
             />
            </Form.Group>
           )}
          </span>
         </li>
        );
       })}
      </ol>
     ):<p className="structure-order-empty">Select linked zettels, sources, or entities first.</p>}
    </Tab>
    <Tab eventKey="organization" title="Organization">
   <Form.Group className="mb-3">
    <Form.Label>Outline</Form.Label>
    <Form.Control
     as="textarea"
     rows={18}
     value={form.outline||""}
     onChange={event=>updateField("outline",event.target.value)}
     placeholder={`Central Question

1. First section

Primary question:
...

Research:
- ...
- ...

Return to the central question:
...`}
    />
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Tags</Form.Label>
    <Form.Control
     value={form.tags}
     onChange={event=>updateField("tags",event.target.value)}
     placeholder="Separate tags with commas"
    />
   </Form.Group>

   <Row>
    <Col xs={12} md={8}>
     <Form.Group className="mb-3">
      <Form.Label>Status</Form.Label>
      <Form.Select
       value={form.status}
       onChange={event=>updateField("status",event.target.value)}
      >
       <option value="draft">Draft</option>
       <option value="active">Active</option>
       <option value="reviewed">Reviewed</option>
       <option value="archived">Archived</option>
      </Form.Select>
     </Form.Group>
    </Col>

    <Col xs={12} md={4}>
     <Form.Group className="mb-3">
      <Form.Label>Favorite</Form.Label>
      <Form.Check
       type="switch"
       checked={form.isFavorite}
       onChange={event=>updateField(
        "isFavorite",
        event.target.checked
       )}
       label={form.isFavorite?"Yes":"No"}
      />
     </Form.Group>
    </Col>
   </Row>
    </Tab>
   </Tabs>

   <div className="structure-form-actions">
    <Button type="submit" disabled={saving}>
     {saving
      ?"Saving..."
      :editing?._id
       ?"Save Changes"
       :"Save Structure Note"}
    </Button>
   </div>
  </Form>
 );
}

export default StructureNoteForm;
