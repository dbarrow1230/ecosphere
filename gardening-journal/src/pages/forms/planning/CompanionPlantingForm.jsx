import {useState} from "react";
import {Alert,Button,Card,Col,Form,Row} from "react-bootstrap";

const emptyCompanion=()=>({key:crypto.randomUUID(),name:"",relationship:"compatible",source:"",notes:""});
const initialCompanions=record=>{
 const rows=record?.companions?.length?record.companions.filter(row=>!row.inherited&&row.relationship!=="incompatible"):record?.companion?[{name:record.companion,relationship:record.relationship,source:record.source,notes:record.notes}]:record?.libraryId?[]:[emptyCompanion()];
 return rows.map(row=>({...emptyCompanion(),...row}));
};

export default function CompanionPlantingForm({record,library=[],onSave,onCancel,saving,error}){
 const [name]=useState(record?.name||"");
 const [libraryKey]=useState(record?.libraryKey||(record?.libraryId?`${record.libraryType}:${record.libraryId}`:""));
 const catalogEntry=library.find(item=>item.libraryKey===libraryKey);
 const inherited=(catalogEntry?.companions||[]).filter(row=>row.relationship!=="incompatible");
 const excluded=(record?.companions||[]).filter(row=>!row.inherited&&row.relationship==="incompatible");

 const [notes,setNotes]=useState(record?.notes||"");
 const [companions,setCompanions]=useState(()=>initialCompanions(record));
 const changeCompanion=(key,field,value)=>setCompanions(previous=>previous.map(row=>row.key===key?{...row,[field]:value}:row));
 const submit=event=>{
  event.preventDefault();
  onSave({name,notes,...(catalogEntry?{libraryType:catalogEntry.libraryType,libraryId:catalogEntry.libraryId}:{}),companions:[...excluded,...companions.map(({name,relationship,source,notes})=>({name,relationship,source,notes}))]});
 };
 return <Form onSubmit={submit}>
  {error&&<Alert variant="danger">{error}</Alert>}
  <Row className="g-3 mb-3">
   <Col xs={12}><Form.Group controlId="companion-main-plant"><Form.Label>{record?.libraryType==="seed"?"Seed":"Plant"}</Form.Label><Form.Control value={name} readOnly disabled={saving}/></Form.Group></Col>
   <Col xs={12}><Form.Group controlId="companion-plan-notes"><Form.Label>Planting notes</Form.Label><Form.Control as="textarea" rows={2} value={notes} onChange={event=>setNotes(event.target.value)} disabled={saving}/></Form.Group></Col>
  </Row>
  {!!inherited.length&&<Card className="mb-3"><Card.Body><h3 className="h5">Recorded companions</h3><ul>{inherited.map(row=><li key={`${row.name}-${row.relationship}`}><strong>{row.name}</strong></li>)}</ul></Card.Body></Card>}
  <h3 className="h5">Additional companions</h3>
  <p>Add a companion plant and any observations.</p>
  <div className="companion-form-rows">
   {companions.map((row,index)=><Card key={row.key}><Card.Body>
    <div className="companion-row-heading"><h4 className="h6">Companion {index+1}</h4><Button type="button" size="sm" variant="outline-danger" disabled={saving||(companions.length===1&&!inherited.length&&!excluded.length)} onClick={()=>setCompanions(previous=>previous.filter(item=>item.key!==row.key))} aria-label={`Remove companion ${index+1}`}>Remove</Button></div>
    <Row className="g-3">
     <Col xs={12}><Form.Group controlId={`companion-${row.key}-name`}><Form.Label>Companion plant</Form.Label><Form.Control list="companion-library-names" value={row.name} onChange={event=>changeCompanion(row.key,"name",event.target.value)} required disabled={saving}/></Form.Group></Col>

     <Col xs={12}><Form.Group controlId={`companion-${row.key}-source`}><Form.Label>Source</Form.Label><Form.Control value={row.source} onChange={event=>changeCompanion(row.key,"source",event.target.value)} disabled={saving}/></Form.Group></Col>
     <Col xs={12}><Form.Group controlId={`companion-${row.key}-notes`}><Form.Label>Observations</Form.Label><Form.Control as="textarea" rows={2} value={row.notes} onChange={event=>changeCompanion(row.key,"notes",event.target.value)} disabled={saving}/></Form.Group></Col>
    </Row>
   </Card.Body></Card>)}
  </div>
  <datalist id="companion-library-names">{[...new Set(library.map(item=>item.name))].map(name=><option key={name} value={name}/>)}</datalist>
  <Button type="button" variant="outline-primary" className="mt-3" disabled={saving} onClick={()=>setCompanions(previous=>[...previous,emptyCompanion()])}>Add another companion</Button>
  <div className="d-flex gap-2 mt-3"><Button type="submit" disabled={saving}>{saving?"Saving...":"Save companions"}</Button><Button type="button" variant="outline-secondary" onClick={onCancel} disabled={saving}>Cancel</Button></div>
 </Form>;
}
