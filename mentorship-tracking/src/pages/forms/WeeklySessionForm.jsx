// src/pages/forms/WeeklySessionForm.jsx
import {useEffect,useMemo,useState} from "react";
import {Alert,Button,Col,Form,Row,Spinner} from "react-bootstrap";

const initialForm={
 weekNumber:"",
 sessionDate:"",
 sessionTime:"",
 sessionType:"",
 competencyDiscussed:"",
 actionPlanStep:"",
 howWhenCompleted:"",
 notes:"",
 status:"scheduled"
};

const normalizeCollection=(payload,preferredKey)=>{
 if(Array.isArray(payload))return payload;
 if(!payload||typeof payload!=="object")return [];
 if(preferredKey&&Array.isArray(payload[preferredKey]))return payload[preferredKey];
 if(Array.isArray(payload.data))return payload.data;
 if(Array.isArray(payload.items))return payload.items;
 if(Array.isArray(payload.results))return payload.results;
 if(Array.isArray(payload.rows))return payload.rows;
 for(const value of Object.values(payload)){
  if(Array.isArray(value))return value;
 }
 return [];
};

const getId=value=>String(typeof value==="object"?(value?._id||value?.id||""):(value||""));

const getStoredUser=()=>{
 const keys=["userInfo","user","authUser","currentUser"];
 for(const key of keys){
  try{
   const raw=localStorage.getItem(key)||sessionStorage.getItem(key);
   if(!raw)continue;
   const parsed=JSON.parse(raw);
   if(parsed?._id||parsed?.id||parsed?.email)return parsed;
   if(parsed?.user?._id||parsed?.user?.id||parsed?.user?.email)return parsed.user;
   if(parsed?.data?._id||parsed?.data?.id||parsed?.data?.email)return parsed.data;
  }catch(err){
   console.error(`Failed to parse stored user from ${key}`,err);
  }
 }
 return null;
};

function WeeklySessionForm({mode="create",menteeId,mentee,session,onSuccess,onCancel,user}){
 const isEdit=mode==="edit"&&Boolean(session?._id);

 const [form,setForm]=useState(initialForm);
 const [meetingMethods,setMeetingMethods]=useState([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [storedUser,setStoredUser]=useState(()=>getStoredUser());

 useEffect(()=>{
  setStoredUser(getStoredUser());
 },[]);

 const currentUser=user?._id||user?.id?user:storedUser;
 const currentUserId=currentUser?._id||currentUser?.id||"";

 const formatDateTimeParts=value=>{
  if(!value)return{sessionDate:"",sessionTime:""};
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return{sessionDate:"",sessionTime:""};
  const year=date.getFullYear();
  const month=String(date.getMonth()+1).padStart(2,"0");
  const day=String(date.getDate()).padStart(2,"0");
  const hours=String(date.getHours()).padStart(2,"0");
  const minutes=String(date.getMinutes()).padStart(2,"0");
  return{sessionDate:`${year}-${month}-${day}`,sessionTime:`${hours}:${minutes}`};
 };

 useEffect(()=>{
  let mounted=true;

  const loadForm=async()=>{
   try{
    setLoading(true);
    setError("");

    const methodRequest=fetch("/api/meeting-methods",{credentials:"include"});
    const menteeRequest=!isEdit&&menteeId&&!mentee
     ?fetch(`/api/mentees/${menteeId}`,{credentials:"include"})
     :Promise.resolve(null);
    const[res,menteeRes]=await Promise.all([methodRequest,menteeRequest]);
    if(!res.ok)throw new Error("Failed to load meeting methods");
    if(menteeRes&&!menteeRes.ok)throw new Error("Failed to load mentee meeting preference");
    const[data,menteeData]=await Promise.all([
     res.json(),
     menteeRes?menteeRes.json():Promise.resolve(null)
    ]);
    const methods=normalizeCollection(data,"meetingMethods");
    const sessionMentee=mentee||menteeData?.mentee||null;
    const defaultMeetingMethod=getId(sessionMentee?.meetingMethod);

    if(mounted)setMeetingMethods(Array.isArray(methods)?methods:[]);

    if(mounted){
      if(isEdit&&session){
       const sessionDateTime=formatDateTimeParts(session.sessionDate);
       setForm({
        weekNumber:session.weekNumber??"",
        sessionDate:sessionDateTime.sessionDate,
        sessionTime:sessionDateTime.sessionTime,
        sessionType:typeof session.sessionType==="string"?session.sessionType:session.sessionType?._id||"",
        competencyDiscussed:session.competencyDiscussed||"",
        actionPlanStep:session.actionPlanStep||"",
        howWhenCompleted:session.howWhenCompleted||"",
        notes:session.notes||"",
        status:session.status||"scheduled"
       });
      }else{
       setForm({...initialForm,sessionType:defaultMeetingMethod});
      }
    }
   }catch(err){
    if(mounted)setError(err.message||"Failed to load form data");
   }finally{
    if(mounted)setLoading(false);
   }
  };

  loadForm();

  return()=>{
   mounted=false;
  };
 },[isEdit,session,menteeId,mentee]);

 const payload=useMemo(()=>({
 mentee:menteeId,
 weekNumber:Number(form.weekNumber||0),
  sessionDate:form.sessionDate&&form.sessionTime?new Date(`${form.sessionDate}T${form.sessionTime}`).toISOString():null,
  sessionType:form.sessionType||null,
  competencyDiscussed:form.competencyDiscussed.trim(),
  actionPlanStep:form.actionPlanStep.trim(),
  howWhenCompleted:form.howWhenCompleted.trim(),
  notes:form.notes.trim(),
  status:form.status,
  createdBy:currentUserId
 }),[form,menteeId,currentUserId]);

 const handleChange=e=>{
  const {name,value}=e.target;
  setForm(prev=>({...prev,[name]:value}));
 };

 const handleSubmit=async e=>{
  e.preventDefault();

  try{
   setSaving(true);
   setError("");

   if(!menteeId)throw new Error("Missing mentee id");
   if(!currentUserId)throw new Error("No logged in user found");

   const request={
    url:isEdit?`/api/weekly-sessions/${session._id}`:"/api/weekly-sessions/create",
    method:isEdit?"PUT":"POST"
   };

   const res=await fetch(request.url,{
    method:request.method,
    credentials:"include",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   let successData=null;
   try{
    successData=await res.json();
   }catch{
    successData=null;
   }

   if(!res.ok)throw new Error(successData?.message||successData?.error||`Failed to ${isEdit?"update":"create"} session`);

   if(onSuccess)onSuccess(successData);
  }catch(err){
   setError(err.message||"Failed to save session");
  }finally{
   setSaving(false);
  }
 };

 if(loading){
  return(
   <div className="py-4 text-center">
    <Spinner animation="border" />
   </div>
  );
 }

 return(
  <Form onSubmit={handleSubmit}>
   {error?<Alert variant="danger" className="mb-3">{error}</Alert>:null}

   <Row className="g-3">
    <Col md={6}>
     <Form.Group>
      <Form.Label>Week Number</Form.Label>
      <Form.Control type="number" min="1" name="weekNumber" value={form.weekNumber} onChange={handleChange} required />
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group>
      <Form.Label>Status</Form.Label>
      <Form.Select name="status" value={form.status} onChange={handleChange} required>
       <option value="scheduled">Scheduled</option>
       <option value="completed">Completed</option>
       <option value="missed">Missed</option>
       <option value="cancelled">Cancelled</option>
       <option value="rescheduled">Rescheduled</option>
      </Form.Select>
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group>
      <Form.Label>Session Date</Form.Label>
      <Form.Control type="date" name="sessionDate" value={form.sessionDate} onChange={handleChange} required />
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group>
      <Form.Label>Session Time</Form.Label>
      <Form.Control type="time" name="sessionTime" value={form.sessionTime} onChange={handleChange} required />
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group>
      <Form.Label>Session Type</Form.Label>
      <Form.Select name="sessionType" value={form.sessionType} onChange={handleChange}>
       <option value="">Select meeting method</option>
       {meetingMethods.map(item=>(
        <option key={item._id} value={item._id}>{item.name||item.label||item.methodName}</option>
       ))}
      </Form.Select>
     </Form.Group>
    </Col>

    <Col md={12}>
     <Form.Group>
      <Form.Label>Competency Discussed</Form.Label>
      <Form.Control type="text" name="competencyDiscussed" value={form.competencyDiscussed} onChange={handleChange} />
     </Form.Group>
    </Col>

    <Col md={12}>
     <Form.Group>
      <Form.Label>Action Plan Step</Form.Label>
      <Form.Control as="textarea" rows={2} name="actionPlanStep" value={form.actionPlanStep} onChange={handleChange} />
     </Form.Group>
    </Col>

    <Col md={12}>
     <Form.Group>
      <Form.Label>How / When Completed</Form.Label>
      <Form.Control as="textarea" rows={2} name="howWhenCompleted" value={form.howWhenCompleted} onChange={handleChange} />
     </Form.Group>
    </Col>

    <Col md={12}>
     <Form.Group>
      <Form.Label>Notes</Form.Label>
      <Form.Control as="textarea" rows={4} name="notes" value={form.notes} onChange={handleChange} />
     </Form.Group>
    </Col>
   </Row>

   <div className="d-flex justify-content-end gap-2 mt-4">
    <Button type="button" variant="outline-secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
    <Button type="submit" variant="dark" disabled={saving}>
     {saving?(isEdit?"Saving...":"Creating..."):(isEdit?"Update Session":"Create Session")}
    </Button>
   </div>
  </Form>
 );
}

export default WeeklySessionForm;
