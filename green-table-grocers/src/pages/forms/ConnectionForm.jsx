import {Button,Col,Form,Row} from "react-bootstrap";
import RichTextEditor from "../../components/RichTextEditor.jsx";
import {richTextToPlainText} from "../../utils/richText.js";

const recordTypes=[
 {value:"ZTL",label:"Zettel"},
 {value:"SRC",label:"Source"},
 {value:"ENT",label:"Entity"},
 {value:"STR",label:"Structure Note"},
 {value:"OUT",label:"Output"},
 {value:"FLT",label:"Fleeting Note"},
 {value:"PRJ",label:"Project"}
];

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

const getRecordIdentifier=(record,type)=>{
 const fields={
  ZTL:"zettelId",
  SRC:"sourceId",
  ENT:"entityId",
  STR:"structureNoteId",
  OUT:"outputId",
  FLT:"fleetingNoteId",
  PRJ:"projectId"
 };

 return record?.[fields[type]]||getObjectId(record);
};

const getRecordTitle=(record,type)=>{
 if(type==="ENT")return record?.name||"Untitled entity";
 if(type==="FLT")return record?.topic||richTextToPlainText(record?.rawCapture)||"Untitled capture";

 return record?.title||record?.name||record?.purpose||"Untitled record";
};

const getRelationValue=relationType=>{
 return String(
  relationType?.value||
  relationType?.code||
  relationType?.slug||
  relationType?.name||
  relationType?.label||
  ""
 ).trim().toLowerCase();
};

const escapeHtml=value=>String(value||"").replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[character]);

const asIds=value=>(Array.isArray(value)?value:[value]).map(getObjectId).filter(Boolean);
const sharedCount=(left,right)=>{
 const rightValues=new Set(right);
 return [...new Set(left)].filter(value=>rightValues.has(value)).length;
};
const textTerms=value=>new Set(String(value||"").toLowerCase().split(/[^a-z0-9]+/).filter(term=>term.length>3));

function ConnectionForm({
 form,
 setForm,
 recordsByType={},
 projects=[],
 relationTypes=[],
 onAddRelationType,
 editing=null,
 saving=false,
 onSubmit
}){
 const getSelectedTitle=(type,recordId)=>{
  const record=(recordsByType[type]||[]).find(item=>getObjectId(item)===recordId);
  return record?getRecordTitle(record,type):"";
 };

 const buildReasonContext=state=>{
  const toTitles=(state.toSelections||[]).map(selection=>getSelectedTitle(selection.recordType,selection.recordId)).filter(Boolean);
  return toTitles.length?`<p>${toTitles.map(escapeHtml).join(", ")}</p>`:"";
 };

 const withUpdatedReasonContext=(current,changes)=>{
  const next={...current,...changes};
  if(editing?._id)return next;
  const previousContext=current.reasonContext||"";
  const typedReason=previousContext&&String(current.reason||"").startsWith(previousContext)?String(current.reason||"").slice(previousContext.length):String(current.reason||"");
  const reasonContext=buildReasonContext(next);
  return {...next,reasonContext,reason:`${reasonContext}${typedReason}`};
 };

 const updateField=(field,value)=>{
  setForm(current=>({...current,[field]:value}));
 };

 const changeFromType=value=>{
  setForm(current=>withUpdatedReasonContext(current,{
   fromRecordType:value,
   fromRecord:""
  }));
 };

 const changeToType=value=>{
  setForm(current=>withUpdatedReasonContext(current,{
   toRecordType:value,
   toRecord:"",
   toRecords:(current.toSelections||[]).filter(selection=>selection.recordType===value).map(selection=>selection.recordId)
  }));
 };

 const toggleToRecord=recordId=>{
  setForm(current=>{
   const selections=Array.isArray(current.toSelections)?current.toSelections:[];
   const exists=selections.some(selection=>selection.recordType===current.toRecordType&&selection.recordId===recordId);
   const toSelections=exists?selections.filter(selection=>selection.recordType!==current.toRecordType||selection.recordId!==recordId):[...selections,{recordType:current.toRecordType,recordId}];
   const toRecords=toSelections.filter(selection=>selection.recordType===current.toRecordType).map(selection=>selection.recordId);
   return withUpdatedReasonContext(current,{toSelections,toRecords,toRecord:toRecords[0]||""});
  });
 };

 const fromRecords=recordsByType[form.fromRecordType]||[];
 const toRecords=recordsByType[form.toRecordType]||[];

 const fromRecord=fromRecords.find(record=>getObjectId(record)===form.fromRecord);
 const directFieldByType={ZTL:["zettelIds","linkedZettelIds","linkedZettels"],SRC:["sourceIds","relatedSourceIds","linkedSources"],ENT:["entityIds"],STR:["structureNoteIds"],OUT:["outputIds","linkedOutputIds","linkedOutputs"],FLT:["fleetingNoteIds"],PRJ:["projectIds","projectId"]};
 const associationTier=record=>{
  if(!fromRecord)return 0;
  const recordId=getObjectId(record);
  if((directFieldByType[form.toRecordType]||[]).some(field=>asIds(fromRecord[field]).includes(recordId)))return 3;
  const sharesStoredAssociation=
   sharedCount([...asIds(fromRecord.projectIds),...asIds(fromRecord.projectId)],[...asIds(record.projectIds),...asIds(record.projectId)])||
   sharedCount(asIds(fromRecord.sourceIds),asIds(record.sourceIds))||
   sharedCount(asIds(fromRecord.entityIds),asIds(record.entityIds))||
   sharedCount(asIds(fromRecord.zettelIds),asIds(record.zettelIds));
  if(sharesStoredAssociation)return 2;
  const fromTags=(Array.isArray(fromRecord.tags)?fromRecord.tags:[]).map(tag=>String(tag?.name||tag?.label||tag).toLowerCase());
  const recordTags=(Array.isArray(record.tags)?record.tags:[]).map(tag=>String(tag?.name||tag?.label||tag).toLowerCase());
  if(sharedCount(fromTags,recordTags)||sharedCount(textTerms(getRecordTitle(fromRecord,form.fromRecordType)),textTerms(getRecordTitle(record,form.toRecordType))))return 1;
  return 0;
 };
 const rankedToRecords=[...toRecords].sort((left,right)=>{
  const tierDifference=associationTier(right)-associationTier(left);
  if(tierDifference)return tierDifference;
  return getRecordTitle(left,form.toRecordType).localeCompare(getRecordTitle(right,form.toRecordType));
 });

 const relationOptions=[
  ...new Set(relationTypes.filter(type=>type.status!=="archived").map(getRelationValue).filter(Boolean))
 ];

 return(
  <Form onSubmit={onSubmit}>
   {editing?._id&&(
    <Form.Group className="mb-3">
     <Form.Label>Connection ID</Form.Label>
     <Form.Control value={editing.connectionId||""} readOnly/>
    </Form.Group>
   )}

    <Row>
     <Col xs={12} md={editing?._id?12:8}>
      <Form.Group className="mb-3">
       <Form.Label>Projects (optional)</Form.Label>
       <Form.Select multiple value={form.projectIds||[]} onChange={event=>{const projectIds=[...event.target.selectedOptions].map(option=>option.value);setForm(current=>({...current,projectIds,projectId:projectIds[0]||""}));}}>
        {projects.filter(project=>project.status!=="archived").map(project=><option key={project._id} value={project._id}>{project.code} - {project.title}</option>)}
       </Form.Select>
       <Form.Text>Select none, one, or several projects.</Form.Text>
      </Form.Group>
     </Col>
     {!editing?._id&&<Col xs={12} md={4}>
      <Form.Group className="mb-3">
       <Form.Label>Subject Code</Form.Label>
       <Form.Control
        value={form.subjectCode}
        onChange={event=>updateField("subjectCode",event.target.value.toUpperCase())}
        placeholder="Optional ID segment"
       />
      </Form.Group>
     </Col>}
    </Row>

   <Row>
    <Col xs={12} lg={6}>
     <fieldset className="border rounded p-3 mb-3 h-100">
      <legend className="float-none w-auto px-2 fs-6">
       From Record
      </legend>

      <Form.Group className="mb-3">
       <Form.Label>Record Type</Form.Label>
       <Form.Select
        value={form.fromRecordType}
        onChange={event=>changeFromType(event.target.value)}
       >
        {recordTypes.map(type=>(
         <option key={type.value} value={type.value}>
          {type.label}
         </option>
        ))}
       </Form.Select>
      </Form.Group>

      <Form.Group>
       <Form.Label>Record</Form.Label>
       <Form.Select
        required
        value={form.fromRecord}
        onChange={event=>setForm(current=>withUpdatedReasonContext(current,{fromRecord:event.target.value}))}
       >
        <option value="">Select source record</option>

        {fromRecords.map(record=>{
         const recordId=getObjectId(record);
         const identifier=getRecordIdentifier(record,form.fromRecordType);
         const title=getRecordTitle(record,form.fromRecordType);

         return(
          <option key={recordId} value={recordId}>
           {identifier} - {title}
          </option>
         );
        })}
       </Form.Select>
      </Form.Group>
     </fieldset>
    </Col>

    <Col xs={12} lg={6}>
     <fieldset className="border rounded p-3 mb-3 h-100">
      <legend className="float-none w-auto px-2 fs-6">
       To Record
      </legend>

      <Form.Group className="mb-3">
       <Form.Label>Record Type</Form.Label>
       <Form.Select
        value={form.toRecordType}
        onChange={event=>changeToType(event.target.value)}
       >
        {recordTypes.map(type=>(
         <option key={type.value} value={type.value}>
          {type.label}
         </option>
        ))}
       </Form.Select>
      </Form.Group>

      <Form.Group>
       <Form.Label>{editing?._id?"Record":"Records"}</Form.Label>
       {editing?._id?(
       <Form.Select
        required
        value={form.toRecord}
        onChange={event=>updateField("toRecord",event.target.value)}
       >
        <option value="">Select destination record</option>

        {toRecords.map(record=>{
         const recordId=getObjectId(record);
         const identifier=getRecordIdentifier(record,form.toRecordType);
         const title=getRecordTitle(record,form.toRecordType);
         const sameRecord=
          form.fromRecordType===form.toRecordType&&
          form.fromRecord===recordId;

         return(
          <option
           key={recordId}
           value={recordId}
           disabled={sameRecord}
          >
           {identifier} - {title}
          </option>
         );
        })}
       </Form.Select>
       ):(
        <div className="connection-record-checklist" role="group" aria-label="Destination records">
         {rankedToRecords.map(record=>{
          const recordId=getObjectId(record);
          const title=getRecordTitle(record,form.toRecordType);
          const sameRecord=form.fromRecordType===form.toRecordType&&form.fromRecord===recordId;
          return <Form.Check key={recordId} type="checkbox" id={`connection-to-${form.toRecordType}-${recordId}`} label={title} checked={(form.toSelections||[]).some(selection=>selection.recordType===form.toRecordType&&selection.recordId===recordId)} disabled={sameRecord} onChange={()=>toggleToRecord(recordId)}/>;
         })}
        </div>
       )}
      </Form.Group>
      {!editing?._id&&(form.toSelections||[]).length?<div className="connection-selected-records">{form.toSelections.map(selection=><button type="button" key={`${selection.recordType}:${selection.recordId}`} onClick={()=>{setForm(current=>{const toSelections=(current.toSelections||[]).filter(item=>item.recordType!==selection.recordType||item.recordId!==selection.recordId);const toRecords=toSelections.filter(item=>item.recordType===current.toRecordType).map(item=>item.recordId);return withUpdatedReasonContext(current,{toSelections,toRecords,toRecord:toRecords[0]||""});});}}>{getSelectedTitle(selection.recordType,selection.recordId)} ×</button>)}</div>:null}
     </fieldset>
    </Col>
   </Row>

   <Row>
    <Col xs={12} md={6}>
     <Form.Group className="mb-3 connection-relation-field">
      <Form.Label>Relation</Form.Label>
      <div className="connection-relation-control">
      <Form.Select
       required
       value={form.relation}
       onChange={event=>setForm(current=>withUpdatedReasonContext(current,{relation:event.target.value}))}
      >
       <option value="">Select relationship</option>
       {relationOptions.map(relation=>(
        <option key={relation} value={relation}>{relation}</option>
       ))}
      </Form.Select>
      <Button type="button" variant="outline-primary" onClick={onAddRelationType}>Add New</Button>
      </div>
     </Form.Group>
    </Col>

    <Col xs={12} md={3}>
     <Form.Group className="mb-3">
      <Form.Label>Strength</Form.Label>
      <Form.Select
       value={form.strength}
       onChange={event=>updateField("strength",event.target.value)}
      >
       <option value="weak">Weak</option>
       <option value="medium">Medium</option>
       <option value="strong">Strong</option>
      </Form.Select>
     </Form.Group>
    </Col>

    <Col xs={12} md={3}>
     <Form.Group className="mb-3">
      <Form.Label>Status</Form.Label>
      <Form.Select
       value={form.status}
       onChange={event=>updateField("status",event.target.value)}
      >
       <option value="active">Active</option>
       <option value="archived">Archived</option>
      </Form.Select>
     </Form.Group>
    </Col>
   </Row>

   <Form.Group className="mb-3">
    <Form.Label>Reason / Context</Form.Label>
    <RichTextEditor value={form.reason} onChange={value=>updateField("reason",value)} placeholder="Explain why these records are connected and why the relationship matters." minHeight="10rem"/>
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Tags</Form.Label>
    <Form.Control value={form.tags||""} onChange={event=>updateField("tags",event.target.value)} placeholder="Comma-separated tags"/>
   </Form.Group>

   <div className="text-end">
    <Button type="submit" disabled={saving}>
     {saving
      ?"Saving..."
      :editing?._id
       ?"Save Changes"
       :"Save Connection"}
    </Button>
   </div>
  </Form>
 );
}

export default ConnectionForm;
