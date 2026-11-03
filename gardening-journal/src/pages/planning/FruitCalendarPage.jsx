import {useEffect,useState} from "react";
import {Alert,Button,Card,Modal,Table} from "react-bootstrap";
import FruitCalendarForm from "../forms/planning/FruitCalendarForm.jsx";
import CropScheduleCalendar from "../../components/calendar/CropScheduleCalendar.jsx";
import {dateForSavedCrop} from "../../utils/growing/cropCalendarEvents.js";
import {Cherry} from "lucide-react";
import "./planning.css";

const endpoint="/api/fruit-calendar";
const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export default function FruitCalendarPage(){
 const [rows,setRows]=useState([]);
 const [calendarDate,setCalendarDate]=useState(()=>new Date());
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [formError,setFormError]=useState("");
 const [notice,setNotice]=useState("");
 const [showForm,setShowForm]=useState(false);
 const [editing,setEditing]=useState(null);
 async function load(){
  setLoading(true);setError("");
  try{const response=await fetch(endpoint);const data=await response.json();if(!response.ok)throw new Error(data.message||"Unable to load fruit calendar");setRows(data);}
  catch(error){setError(error.message);}finally{setLoading(false);}
 }
 useEffect(()=>{load();},[]);
 function open(record=null){setEditing(record);setFormError("");setNotice("");setShowForm(true);}
 async function save(values){
  setSaving(true);setFormError("");
  try{
   const response=await fetch(editing?`${endpoint}/${editing._id}`:endpoint,{method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(values)});
   const data=await response.json();if(!response.ok)throw new Error(data.message||"Unable to save fruit schedule");
   setRows(previous=>editing?previous.map(row=>row._id===data._id?data:row):[data,...previous]);setCalendarDate(previous=>dateForSavedCrop(data,previous));setShowForm(false);setNotice("Fruit Schedule saved.");
  }catch(error){setFormError(error.message);}finally{setSaving(false);}
 }
 async function remove(record){
  if(!window.confirm(`Delete ${record.name}?`))return;
  setError("");setNotice("");
  try{const response=await fetch(`${endpoint}/${record._id}`,{method:"DELETE"});const data=await response.json();if(!response.ok)throw new Error(data.message||"Unable to delete record");setRows(previous=>previous.filter(row=>row._id!==record._id));setNotice("Fruit Schedule deleted.");}
  catch(error){setError(error.message);}
 }
 return <section className="garden-planning-page crop-calendar-fruit">
  <header className="garden-planning-header"><div><span className="crop-calendar-category"><Cherry size={20} aria-hidden="true"/> Fruit</span><h1>Fruit Calendar</h1><p>Plan sowing, planting, and harvesting for each fruit variety in your climate.</p></div><div className="d-flex gap-2"><Button variant="outline-primary" onClick={load} disabled={loading}>Refresh</Button><Button onClick={()=>open()}>Add Fruit Schedule</Button></div></header>
  {error&&<Alert variant="danger">{error}</Alert>}{notice&&<Alert variant="success">{notice}</Alert>}
  <CropScheduleCalendar rows={rows} date={calendarDate} onNavigate={setCalendarDate} onEdit={open}/>
  <details className="crop-schedule-register"><summary>View fruit schedule records ({rows.length})</summary>
  <div className="crop-schedules">{rows.map(row=><Card key={row._id}><Card.Body><div className="d-flex justify-content-between flex-wrap gap-2"><div><h2 className="h4">{row.name}{row.variety?` · ${row.variety}`:""}</h2><p>{row.location||"Location not recorded"}</p></div><div className="d-flex gap-2 align-self-start"><Button size="sm" onClick={()=>open(row)}>Edit</Button><Button size="sm" variant="outline-danger" onClick={()=>remove(row)}>Delete</Button></div></div><Table responsive bordered className="crop-month-grid"><caption>Sowing, planting, and harvest months for {row.name}</caption><thead><tr><th scope="col">Activity</th>{months.map(month=><th scope="col" key={month}>{month}</th>)}</tr></thead><tbody>{[["sowMonths","Sow"],["plantMonths","Plant"],["harvestMonths","Harvest"]].map(([key,label])=><tr key={key}><th scope="row">{label}</th>{months.map((month,index)=><td key={month} className={row[key]?.includes(index+1)?`calendar-active calendar-${key}`:""}><span aria-label={`${month}: ${row[key]?.includes(index+1)?label:"not scheduled"}`}>{row[key]?.includes(index+1)?"●":"—"}</span></td>)}</tr>)}</tbody></Table>{row.notes&&<p>{row.notes}</p>}</Card.Body></Card>)}{!rows.length&&<Card body>{loading?"Loading schedules...":"No schedules yet. Add a crop to plan its months."}</Card>}</div>
  </details>
  <Modal show={showForm} onHide={()=>!saving&&setShowForm(false)} size="lg" centered backdrop="static"><Modal.Header closeButton={!saving}><Modal.Title>{editing?"Edit":"Add"} Fruit Schedule</Modal.Title></Modal.Header><Modal.Body>{showForm&&<FruitCalendarForm key={editing?._id||"new"} record={editing} onSave={save} onCancel={()=>setShowForm(false)} saving={saving} error={formError}/>}</Modal.Body></Modal>
 </section>;
}
