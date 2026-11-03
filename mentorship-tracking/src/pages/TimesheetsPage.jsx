// src/pages/TimesheetsPage.jsx
import {useEffect,useMemo,useState} from "react";
import axios from "axios";
import {Alert,Badge,Button,Card,Col,Container,Form,InputGroup,Modal,Row,Spinner,Table} from "react-bootstrap";
import {Clock3,FileText,Eye,Pencil,Trash2,Plus} from "lucide-react";
import TimeSheetForm from "./forms/TimeSheetForm.jsx";

function TimesheetsPage({user}){
 const [mentees,setMentees]=useState([]);
 const [selectedTimesheets,setSelectedTimesheets]=useState([]);
 const [selectedMentee,setSelectedMentee]=useState("");
 const [search,setSearch]=useState("");
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [showForm,setShowForm]=useState(false);
 const [formMode,setFormMode]=useState("add");
 const [currentTimesheet,setCurrentTimesheet]=useState({});
 const [lockedMentee,setLockedMentee]=useState(null);
 const [showView,setShowView]=useState(false);
 const [viewTimesheet,setViewTimesheet]=useState(null);
 const [showDeleteConfirm,setShowDeleteConfirm]=useState(false);
 const [deleteTarget,setDeleteTarget]=useState(null);

 useEffect(()=>{
  fetchData();
 },[]);

 useEffect(()=>{
  let cancelled=false;

  const fetchSelectedMenteeTimesheets=async()=>{
   if(!selectedMentee){
    setSelectedTimesheets([]);
    return;
   }

   try{
    setLoading(true);
    setError("");
    const response=await axios.get(`/api/timesheets/mentee/${selectedMentee}`);
    if(!cancelled) setSelectedTimesheets(normalizeTimesheetList(response.data));
   }catch(err){
    if(!cancelled){
     setSelectedTimesheets([]);
     setError(err.response?.data?.message||err.response?.data?.error||"Failed to load this mentee's timesheet history.");
    }
   }finally{
    if(!cancelled) setLoading(false);
   }
  };

  fetchSelectedMenteeTimesheets();
  return()=>{cancelled=true;};
 },[selectedMentee]);

 useEffect(()=>{
  if(!success) return;
  const timer=setTimeout(()=>setSuccess(""),5000);
  return()=>clearTimeout(timer);
 },[success]);

 const getMenteeStatus=item=>String(
  item?.status?.code||
  item?.status?.name||
  item?.status?.label||
  item?.status?.value||
  item?.status||
  ""
 ).trim().toLowerCase();

 const resolveCurrentUser=value=>{
  return value?._id||value?.id||value?.user?._id||value?.user?.id||value?.userId||"";
 };

 const normalizeTimesheetList=data=>{
  if(Array.isArray(data)) return data;
  if(Array.isArray(data?.timesheets)) return data.timesheets;
  if(Array.isArray(data?.data)) return data.data;
  return [];
 };

 const getFullName=mentee=>`${mentee?.firstName||""} ${mentee?.lastName||""}`.trim();

 const getMenteeById=menteeId=>{
  return mentees.find(item=>String(item?._id||"")===String(menteeId||""))||null;
 };

 const getMenteeNameById=menteeId=>{
  const matched=getMenteeById(menteeId);
  return matched?getFullName(matched):"Unknown Mentee";
 };

 const getDisplayDate=value=>{
  if(!value) return "—";
  const date=new Date(value);
  if(Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
 };

 const getDisplayHours=value=>{
  const parsed=Number(value);
  if(Number.isNaN(parsed)) return "0.00";
  return parsed.toFixed(2);
 };

 const activeMentees=useMemo(
  ()=>mentees.filter(item=>getMenteeStatus(item)==="active"),
  [mentees]
 );

 const fetchData=async()=>{
  try{
   setLoading(true);
   setError("");

   const menteesRes=await axios.get("/api/mentees/list");

   const menteeListRaw=Array.isArray(menteesRes.data)?menteesRes.data:menteesRes.data?.mentees||[];

   setMentees(menteeListRaw);
  }catch(err){
   setError(err.response?.data?.message||err.response?.data?.error||"Failed to load timesheets.");
  }finally{
   setLoading(false);
  }
 };

 const filteredTimesheets=useMemo(()=>{
  if(!selectedMentee) return [];

  const selected=getMenteeById(selectedMentee);
  if(!selected||getMenteeStatus(selected)!=="active") return [];

  let list=[...selectedTimesheets];

  const term=search.trim().toLowerCase();
  if(term){
   list=list.filter(item=>{
    const menteeName=getMenteeNameById(item?.mentee?._id||item?.mentee||"").toLowerCase();
    const weekNumber=String(item?.weekNumber||"").toLowerCase();
    const status=String(item?.status||"").toLowerCase();
    const source=String(item?.source||"").toLowerCase();
    const notes=String(item?.notes||"").toLowerCase();
    return menteeName.includes(term)||weekNumber.includes(term)||status.includes(term)||source.includes(term)||notes.includes(term);
   });
  }

  return list.sort((a,b)=>new Date(b?.weekStarting||b?.createdAt||0)-new Date(a?.weekStarting||a?.createdAt||0));
 },[selectedTimesheets,selectedMentee,search,mentees]);

 const handleAdd=()=>{
  const mentee=getMenteeById(selectedMentee);

  if(!mentee||getMenteeStatus(mentee)!=="active"){
   setError("Select an active mentee before adding a timesheet.");
   return;
  }

  setError("");
  setFormMode("add");
  setLockedMentee(mentee);
  setCurrentTimesheet({
   mentee:mentee?._id,
   hoursNeeded:mentee?.hoursNeeded||0,
   createdBy:resolveCurrentUser(user),
   weeks:selectedTimesheets
  });
  setShowForm(true);
 };

 const handleEdit=item=>{
  const mentee=getMenteeById(item?.mentee?._id||item?.mentee||"");

  if(!mentee){
   setError("This timesheet is not linked to a mentee record.");
   return;
  }

  setError("");
  setFormMode("edit");
  setLockedMentee(mentee);
  setCurrentTimesheet(item||{});
  setShowForm(true);
 };

 const handleView=item=>{
  setViewTimesheet(item);
  setShowView(true);
 };

 const handleDeleteClick=item=>{
  setDeleteTarget(item);
  setShowDeleteConfirm(true);
 };

 const handleFormSubmit=async payload=>{
  try{
   setSaving(true);
   setError("");
   setSuccess("");

   if(!payload?.mentee){
    setError("Mentee is required.");
    return;
   }

   if(!payload?.createdBy){
    setError("Created by is required.");
    return;
   }

   if(formMode==="edit"&&currentTimesheet?._id){
    await axios.put(`/api/timesheets/${currentTimesheet._id}`,payload);
    setSuccess("Timesheet updated successfully.");
   }else{
    await axios.post("/api/timesheets/create",payload);
    setSuccess("Timesheet created successfully.");
   }

   setShowForm(false);
   setCurrentTimesheet({});
   setLockedMentee(null);
   await fetchData();
   const historyRes=await axios.get(`/api/timesheets/mentee/${payload.mentee}`);
   setSelectedTimesheets(normalizeTimesheetList(historyRes.data));
  }catch(err){
   setError(err.response?.data?.message||err.response?.data?.error||`Failed to ${formMode==="edit"?"update":"create"} timesheet.`);
  }finally{
   setSaving(false);
  }
 };

 const handleDeleteConfirmed=async()=>{
  if(!deleteTarget?._id) return;

  try{
   setSaving(true);
   setError("");
   setSuccess("");
   await axios.delete(`/api/timesheets/${deleteTarget._id}`);
   setSuccess("Timesheet deleted successfully.");
   setShowDeleteConfirm(false);
   setDeleteTarget(null);
   await fetchData();
   const historyRes=await axios.get(`/api/timesheets/mentee/${selectedMentee}`);
   setSelectedTimesheets(normalizeTimesheetList(historyRes.data));
  }catch(err){
   setError(err.response?.data?.message||err.response?.data?.error||"Failed to delete timesheet.");
  }finally{
   setSaving(false);
  }
 };

 return(
  <Container fluid className="py-4">
   <Row className="g-4">
    <Col xs={12}>
     <Card className="shadow-sm border-0">
      <Card.Body>
       <Row className="g-3 align-items-end mb-3">
        <Col md={3}>
         <div className="d-flex align-items-center gap-2">
          <Clock3 size={18}/>
          <h4 className="mb-0">Timesheets</h4>
         </div>
        </Col>

        <Col md={3}>
         <Form.Group>
          <Form.Label>Filter by Active Mentee</Form.Label>
          <Form.Select value={selectedMentee} onChange={e=>setSelectedMentee(e.target.value)}>
           <option value="">Select active mentee</option>
           {activeMentees.map(item=>(
            <option key={item._id} value={item._id}>
             {getFullName(item)}
            </option>
           ))}
          </Form.Select>
         </Form.Group>
        </Col>

        <Col md={4}>
         <Form.Group>
          <Form.Label>Search</Form.Label>
          <InputGroup>
           <InputGroup.Text>
            <FileText size={16}/>
           </InputGroup.Text>
           <Form.Control
            type="text"
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="Search by mentee, week, status, source..."
           />
          </InputGroup>
         </Form.Group>
        </Col>

        <Col md={2} className="d-flex justify-content-md-end">
         <Button onClick={handleAdd} disabled={!selectedMentee} className="d-inline-flex align-items-center gap-2">
          <Plus size={16}/>
          <span>Add Timesheet</span>
         </Button>
        </Col>
       </Row>

       {error&&<Alert variant="danger" className="mb-3">{error}</Alert>}
       {success&&<Alert variant="success" className="mb-3">{success}</Alert>}

       {loading?(
        <div className="py-5 text-center">
         <Spinner animation="border"/>
        </div>
       ):(
        <div className="table-responsive">
         <Table hover className="align-middle mb-0">
          <thead>
           <tr>
            <th>Mentee</th>
            <th>Week #</th>
            <th>Week Starting</th>
            <th>Week Ending</th>
            <th>Hours</th>
            <th>Source</th>
            <th>Status</th>
            <th>Signed</th>
            <th className="text-end">Actions</th>
           </tr>
          </thead>
          <tbody>
           {filteredTimesheets.length?filteredTimesheets.map(item=>(
            <tr key={item._id}>
             <td>{getMenteeNameById(item?.mentee?._id||item?.mentee||"")}</td>
             <td>{item?.weekNumber??"—"}</td>
             <td>{getDisplayDate(item?.weekStarting)}</td>
             <td>{getDisplayDate(item?.weekEnding)}</td>
             <td>{getDisplayHours(item?.hours)}</td>
             <td>
              <Badge bg="light" text="dark">{item?.source||"portal"}</Badge>
             </td>
             <td>
              <Badge bg={item?.status==="signed"?"success":item?.status==="rejected"?"danger":"warning"}>
               {item?.status||"pending"}
              </Badge>
             </td>
             <td>{getDisplayDate(item?.signedAt)}</td>
             <td className="text-end">
              <div className="d-flex justify-content-end gap-2 flex-wrap">
               <Button size="sm" variant="outline-primary" onClick={()=>handleView(item)} className="d-inline-flex align-items-center gap-1">
                <Eye size={14}/>
                <span>View</span>
               </Button>
               <Button size="sm" variant="outline-warning" onClick={()=>handleEdit(item)} className="d-inline-flex align-items-center gap-1">
                <Pencil size={14}/>
                <span>Edit</span>
               </Button>
               <Button size="sm" variant="outline-danger" onClick={()=>handleDeleteClick(item)} className="d-inline-flex align-items-center gap-1">
                <Trash2 size={14}/>
                <span>Delete</span>
               </Button>
              </div>
             </td>
            </tr>
           )):(
            <tr>
             <td colSpan="9" className="text-center py-5 text-muted">No timesheets found.</td>
            </tr>
           )}
          </tbody>
         </Table>
        </div>
       )}
      </Card.Body>
     </Card>
    </Col>
   </Row>

   <Modal show={showForm} onHide={()=>{setShowForm(false);setCurrentTimesheet({});setLockedMentee(null);}} size="xl" centered backdrop="static">
   <Modal.Header closeButton>
     <Modal.Title>{formMode==="edit"?"Edit Timesheet":"Timesheets"}{lockedMentee?` - ${getFullName(lockedMentee)}`:""}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <TimeSheetForm
      mode={formMode}
      initialData={currentTimesheet||{}}
      lockedMentee={lockedMentee}
      currentUser={user}
      onSubmit={handleFormSubmit}
      submitLabel={formMode==="edit"?"Save Timesheet":"Create Timesheet"}
     />
    </Modal.Body>
   </Modal>

   <Modal show={showView} onHide={()=>{setShowView(false);setViewTimesheet(null);}} size="lg" centered>
    <Modal.Header closeButton>
     <Modal.Title>View Timesheet</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     {viewTimesheet&&(
      <>
       <Row className="g-3">
        <Col md={6}><strong>Mentee:</strong><div>{getMenteeNameById(viewTimesheet?.mentee?._id||viewTimesheet?.mentee||"")}</div></Col>
        <Col md={6}><strong>Week Number:</strong><div>{viewTimesheet?.weekNumber??"—"}</div></Col>
        <Col md={6}><strong>Week Starting:</strong><div>{getDisplayDate(viewTimesheet?.weekStarting)}</div></Col>
        <Col md={6}><strong>Week Ending:</strong><div>{getDisplayDate(viewTimesheet?.weekEnding)}</div></Col>
        <Col md={6}><strong>Total Hours:</strong><div>{getDisplayHours(viewTimesheet?.hours)}</div></Col>
        <Col md={6}><strong>Source:</strong><div>{viewTimesheet?.source||"portal"}</div></Col>
        <Col md={6}><strong>Status:</strong><div>{viewTimesheet?.status||"pending"}</div></Col>
        <Col md={6}><strong>Signed At:</strong><div>{getDisplayDate(viewTimesheet?.signedAt)}</div></Col>
       </Row>

       <hr/>

       <Row className="g-3">
        <Col md={3}><strong>Wednesday:</strong><div>{getDisplayHours(viewTimesheet?.dailyHours?.wednesday)}</div></Col>
        <Col md={3}><strong>Thursday:</strong><div>{getDisplayHours(viewTimesheet?.dailyHours?.thursday)}</div></Col>
        <Col md={3}><strong>Friday:</strong><div>{getDisplayHours(viewTimesheet?.dailyHours?.friday)}</div></Col>
        <Col md={3}><strong>Saturday:</strong><div>{getDisplayHours(viewTimesheet?.dailyHours?.saturday)}</div></Col>
        <Col md={3}><strong>Sunday:</strong><div>{getDisplayHours(viewTimesheet?.dailyHours?.sunday)}</div></Col>
        <Col md={3}><strong>Monday:</strong><div>{getDisplayHours(viewTimesheet?.dailyHours?.monday)}</div></Col>
        <Col md={3}><strong>Tuesday:</strong><div>{getDisplayHours(viewTimesheet?.dailyHours?.tuesday)}</div></Col>
       </Row>

       <hr/>

       <Row>
        <Col md={12}>
         <strong>Notes:</strong>
         <div>{viewTimesheet?.notes||"—"}</div>
        </Col>
       </Row>
      </>
     )}
    </Modal.Body>
   </Modal>

   <Modal show={showDeleteConfirm} onHide={()=>{setShowDeleteConfirm(false);setDeleteTarget(null);}} centered>
    <Modal.Header closeButton>
     <Modal.Title>Delete Timesheet</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     Are you sure you want to delete this timesheet for {deleteTarget?getMenteeNameById(deleteTarget?.mentee?._id||deleteTarget?.mentee||""):"this mentee"}?
    </Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={()=>{setShowDeleteConfirm(false);setDeleteTarget(null);}}>
      Cancel
     </Button>
     <Button variant="danger" onClick={handleDeleteConfirmed} disabled={saving}>
      Delete
     </Button>
    </Modal.Footer>
   </Modal>
  </Container>
 );
}

export default TimesheetsPage;
