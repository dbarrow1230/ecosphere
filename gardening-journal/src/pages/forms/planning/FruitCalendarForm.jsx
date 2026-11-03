import {useState} from "react";
import {Alert,Button,Col,Form,Row} from "react-bootstrap";

const defaults={"name": "", "variety": "", "location": "", "sowMonths": [], "plantMonths": [], "harvestMonths": [], "notes": ""};
const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export default function FruitCalendarForm({record,onSave,onCancel,saving,error}){
 const [monthError,setMonthError]=useState("");
 const [form,setForm]=useState(()=>({
 name:record?.name??defaults.name,
 variety:record?.variety??defaults.variety,
 location:record?.location??defaults.location,
 sowMonths:(record?.sowMonths||[]).map(Number),
 plantMonths:(record?.plantMonths||[]).map(Number),
 harvestMonths:(record?.harvestMonths||[]).map(Number),
 notes:record?.notes??defaults.notes,
 }));
 const change=(key,value)=>setForm(previous=>({...previous,[key]:value}));
 const toggleMonth=(key,month)=>setForm(previous=>({...previous,[key]:previous[key].includes(month)?previous[key].filter(value=>value!==month):[...previous[key],month].sort((a,b)=>a-b)}));
 const submit=event=>{
  event.preventDefault();
  if(!form.sowMonths.length&&!form.plantMonths.length&&!form.harvestMonths.length){setMonthError("Select at least one sowing, planting, or harvest month so this crop appears on the calendar.");return;}
  setMonthError("");onSave(form);
 };
 return <Form onSubmit={submit}>
  {(error||monthError)&&<Alert variant="danger">{error||monthError}</Alert>}
  <Row className="g-3">
    <Col md={6}><Form.Group controlId="fruit-calendar-name"><Form.Label>Crop</Form.Label><Form.Control type="text" value={form.name} onChange={event=>change("name",event.target.value)} required/></Form.Group></Col>
    <Col md={6}><Form.Group controlId="fruit-calendar-variety"><Form.Label>Variety</Form.Label><Form.Control type="text" value={form.variety} onChange={event=>change("variety",event.target.value)}/></Form.Group></Col>
    <Col md={6}><Form.Group controlId="fruit-calendar-location"><Form.Label>Location / climate</Form.Label><Form.Control type="text" value={form.location} onChange={event=>change("location",event.target.value)}/></Form.Group></Col>
    <Col xs={12}><fieldset className="calendar-month-choices"><legend>Sow</legend><div>{months.map((month,index)=><Form.Check inline key={month} id={`fruit-calendar-sowMonths-${index}`} label={month} checked={form.sowMonths.includes(index+1)} onChange={()=>toggleMonth("sowMonths",index+1)}/>)}</div></fieldset></Col>
    <Col xs={12}><fieldset className="calendar-month-choices"><legend>Plant / transplant</legend><div>{months.map((month,index)=><Form.Check inline key={month} id={`fruit-calendar-plantMonths-${index}`} label={month} checked={form.plantMonths.includes(index+1)} onChange={()=>toggleMonth("plantMonths",index+1)}/>)}</div></fieldset></Col>
    <Col xs={12}><fieldset className="calendar-month-choices"><legend>Harvest</legend><div>{months.map((month,index)=><Form.Check inline key={month} id={`fruit-calendar-harvestMonths-${index}`} label={month} checked={form.harvestMonths.includes(index+1)} onChange={()=>toggleMonth("harvestMonths",index+1)}/>)}</div></fieldset></Col>
    <Col md={12}><Form.Group controlId="fruit-calendar-notes"><Form.Label>Notes / source</Form.Label><Form.Control as="textarea" rows={3} value={form.notes} onChange={event=>change("notes",event.target.value)}/></Form.Group></Col>
  </Row>
  
  <div className="d-flex gap-2 mt-3"><Button type="submit" disabled={saving}>{saving?"Saving...":"Save Fruit Schedule"}</Button><Button type="button" variant="outline-secondary" onClick={onCancel} disabled={saving}>Cancel</Button></div>
 </Form>;
}
