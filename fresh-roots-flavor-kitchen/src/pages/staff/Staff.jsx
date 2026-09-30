import {useEffect,useState} from "react";
import {Alert,Button,Card,Col,Container,Form,Row,Tab,Tabs} from "react-bootstrap";
import {Link,useLocation,useNavigate} from "react-router-dom";
import "../../styles/staff.css";

const emptyForm={name:"",role:"",shift:"",status:"Off Duty",area:"boh",isActive:true};

function Staff({staff}){
 const location=useLocation();
 const navigate=useNavigate();
 const [loadedStaff,setLoadedStaff]=useState([]);
 const [formData,setFormData]=useState(emptyForm);
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState("");
 const isNew=location.pathname.endsWith("/new");

 useEffect(()=>{
  let active=true;
  fetch("/api/staff").then(async response=>{const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data?.message||"Staff data is unavailable");if(active)setLoadedStaff(Array.isArray(data?.staff)?data.staff:[]);}).catch(error=>{if(active)setMessage(error.message);});
  return()=>{active=false;};
 },[]);

 const staffMembers=Array.isArray(staff)?staff:loadedStaff;
 const bohStaff=staffMembers.filter(member=>member.area==="boh");
 const fohStaff=staffMembers.filter(member=>member.area==="foh");

 const getStatusClass=status=>{
  const value=String(status||"").toLowerCase();
  if(value.includes("break"))return "staff-status-break";
  if(value.includes("off"))return "staff-status-off";
  if(value.includes("duty"))return "staff-status-on";
  return "staff-status-default";
 };

 const renderRows=list=>list.length?<div className="staff-list">{list.map(member=><div key={member._id} className="staff-row"><div className="staff-row-main"><span className="staff-name">{member.name}</span><span className="staff-meta">{member.role}</span></div><div className="staff-row-shift">{member.shift||"Not assigned"}</div><div className={`staff-status ${getStatusClass(member.status)}`}>{member.status}</div></div>)}</div>:<p className="staff-empty">No staff members in this section.</p>;
 const handleChange=event=>setFormData(current=>({...current,[event.target.name]:event.target.value}));
 const handleSubmit=async event=>{
  event.preventDefault();setSaving(true);setMessage("");
  try{const response=await fetch("/api/staff",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(formData)});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data?.message||"Staff member could not be saved");setLoadedStaff(current=>[...current,data.staff]);setFormData(emptyForm);navigate("/staff",{replace:true});}catch(error){setMessage(error.message);}finally{setSaving(false);}
 };

 return(
  <Container className="staff-page">
   <Row className="align-items-end mb-4"><Col md={8}><p className="staff-eyebrow">Team Management</p><h1 className="staff-title">Staff</h1><p className="staff-text">View team coverage, track shifts, and manage front and back of house staffing.</p></Col><Col md={4} className="text-md-end"><div className="staff-actions"><Link to="/staff/new" className="staff-action">Add Staff</Link><Link to="/staff/schedule" className="staff-action-light">Schedule</Link></div></Col></Row>
   {message&&<Alert variant="warning" dismissible onClose={()=>setMessage("")}>{message}</Alert>}
   {isNew&&<Card className="mb-4"><Card.Body><div className="d-flex justify-content-between align-items-center mb-3"><h2 className="h4 mb-0">Add Staff Member</h2><Button variant="outline-secondary" size="sm" onClick={()=>navigate("/staff")}>Cancel</Button></div><Form onSubmit={handleSubmit}><Row className="g-3"><Col md={6}><Form.Group controlId="staffName"><Form.Label>Name</Form.Label><Form.Control name="name" value={formData.name} onChange={handleChange} required/></Form.Group></Col><Col md={6}><Form.Group controlId="staffRole"><Form.Label>Role</Form.Label><Form.Control name="role" value={formData.role} onChange={handleChange} required/></Form.Group></Col><Col md={4}><Form.Group controlId="staffShift"><Form.Label>Default Shift</Form.Label><Form.Control name="shift" value={formData.shift} onChange={handleChange}/></Form.Group></Col><Col md={4}><Form.Group controlId="staffArea"><Form.Label>Area</Form.Label><Form.Select name="area" value={formData.area} onChange={handleChange}><option value="boh">Back of House</option><option value="foh">Front of House</option></Form.Select></Form.Group></Col><Col md={4}><Form.Group controlId="staffStatus"><Form.Label>Status</Form.Label><Form.Select name="status" value={formData.status} onChange={handleChange}><option>On Duty</option><option>On Break</option><option>Off Duty</option></Form.Select></Form.Group></Col><Col xs={12}><Button type="submit" disabled={saving}>{saving?"Saving...":"Save Staff Member"}</Button></Col></Row></Form></Card.Body></Card>}
   <Row className="g-3 mb-4"><Col md={4}><div className="staff-stat"><span>Total Staff</span><strong>{staffMembers.length}</strong></div></Col><Col md={4}><div className="staff-stat"><span>BOH</span><strong>{bohStaff.length}</strong></div></Col><Col md={4}><div className="staff-stat"><span>FOH</span><strong>{fohStaff.length}</strong></div></Col></Row>
   <Row><Col><div className="staff-panel"><Tabs defaultActiveKey="boh" id="staff-tabs" className="staff-tabs" fill><Tab eventKey="boh" title={`BOH (${bohStaff.length})`}><div className="staff-tab-body">{renderRows(bohStaff)}</div></Tab><Tab eventKey="foh" title={`FOH (${fohStaff.length})`}><div className="staff-tab-body">{renderRows(fohStaff)}</div></Tab></Tabs></div></Col></Row>
  </Container>
 );
}

export default Staff;
