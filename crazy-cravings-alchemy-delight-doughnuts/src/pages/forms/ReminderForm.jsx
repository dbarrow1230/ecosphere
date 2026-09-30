// src/pages/forms/ReminderForm.jsx
import {useEffect,useMemo,useState} from "react";
import {Form,Row,Col,Button,Card,Modal,Alert} from "react-bootstrap";
import {Bell,Save,XCircle,Mail,MessageSquare,MonitorSmartphone,Repeat,CalendarClock,UserRound,SquarePen} from "lucide-react";

function toDateTimeLocalValue(value){
 if(!value) return "";
 const date=new Date(value);
 if(Number.isNaN(date.getTime())) return "";
 const pad=num=>String(num).padStart(2,"0");
 const year=date.getFullYear();
 const month=pad(date.getMonth()+1);
 const day=pad(date.getDate());
 const hours=pad(date.getHours());
 const minutes=pad(date.getMinutes());
 return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function ReminderForm({mode="add",lockedMentee,currentUser,onSubmit,onCancel,initialData={}}){
 const getStoredUser=()=>{
  const keys=["userInfo","user","authUser","currentUser"];
  for(const key of keys){
   try{
    const raw=localStorage.getItem(key)||sessionStorage.getItem(key);
    if(!raw) continue;
    const parsed=JSON.parse(raw);
    if(parsed?._id||parsed?.id||parsed?.username||parsed?.email) return parsed;
    if(parsed?.user?._id||parsed?.user?.id||parsed?.user?.username||parsed?.user?.email) return parsed.user;
    if(parsed?.data?._id||parsed?.data?.id||parsed?.data?.username||parsed?.data?.email) return parsed.data;
   }catch(err){
    console.error(`Failed to parse stored user from ${key}`,err);
   }
  }
  return null;
 };

 const resolvedUser=useMemo(()=>{
  const source=currentUser||getStoredUser();
  if(!source) return null;
  const id=source._id||source.id||"";
  if(!id) return null;
  return {...source,_id:String(id),id:String(id)};
 },[currentUser]);

 const menteeName=useMemo(()=>{
  if(!lockedMentee) return "";
  return lockedMentee.fullName||`${lockedMentee.firstName||""} ${lockedMentee.lastName||""}`.trim();
 },[lockedMentee]);

 const defaultRecurrenceRule=useMemo(()=>{
  const frequency=String(lockedMentee?.meetingFrequency||"Weekly").toLowerCase();
  return frequency==="bi-weekly"?"bi-weekly":"weekly";
 },[lockedMentee]);

 const defaultForm=useMemo(()=>({
  _id:String(initialData._id||""),
  user:String(initialData.user?._id||initialData.user||resolvedUser?._id||""),
  menteeId:String(initialData.mentee?._id||initialData.mentee||initialData.menteeId||lockedMentee?._id||""),
  title:initialData.title||`Upcoming meeting with ${menteeName}`.trim(),
  message:initialData.message||`Reminder: meeting with ${menteeName} starts soon.`.trim(),
  audienceType:initialData.audienceType||"selected",
  selectedUsers:Array.isArray(initialData.selectedUsers)&&initialData.selectedUsers.length
   ?initialData.selectedUsers.map(item=>String(item?._id||item))
   :(resolvedUser?._id?[String(resolvedUser._id)]:[]),
  channels:{
   inApp:initialData.channels?.inApp ?? true,
   email:initialData.channels?.email ?? true,
   sms:initialData.channels?.sms ?? true
  },
  sendAt:toDateTimeLocalValue(initialData.sendAt),
  nextRunAt:toDateTimeLocalValue(initialData.nextRunAt),
  lastSentAt:toDateTimeLocalValue(initialData.lastSentAt),
  sentAt:toDateTimeLocalValue(initialData.sentAt),
  status:initialData.status||"pending",
  isRecurring:initialData.isRecurring ?? true,
  recurrenceRule:initialData.recurrenceRule||defaultRecurrenceRule,
  recurrenceEndAt:toDateTimeLocalValue(initialData.recurrenceEndAt),
  reminderOffsetMinutes:Number(initialData.reminderOffsetMinutes||30),
  modalDismissedBy:Array.isArray(initialData.modalDismissedBy)?initialData.modalDismissedBy:[]
 }),[initialData,resolvedUser,lockedMentee,menteeName,defaultRecurrenceRule]);

 const [formData,setFormData]=useState(defaultForm);
 const [errors,setErrors]=useState({});
 const [loading,setLoading]=useState(false);
 const [showConfirm,setShowConfirm]=useState(false);
 const [submitError,setSubmitError]=useState("");

 useEffect(()=>{
  setFormData(defaultForm);
 },[defaultForm]);

 const isEditMode=mode==="edit"||!!formData._id;

 const handleChange=e=>{
  const {name,value,type,checked}=e.target;
  setFormData(prev=>({
   ...prev,
   [name]:type==="checkbox"
    ?checked
    :name==="reminderOffsetMinutes"
     ?Number(value)
     :value
  }));
  setErrors(prev=>({...prev,[name]:""}));
  setSubmitError("");
 };

 const handleChannelChange=e=>{
  const {name,checked}=e.target;
  setFormData(prev=>({
   ...prev,
   channels:{
    ...prev.channels,
    [name]:checked
   }
  }));
  setErrors(prev=>({...prev,channels:""}));
  setSubmitError("");
 };

 const validate=()=>{
  const nextErrors={};

  if(!lockedMentee?._id) nextErrors.menteeId="Mentee is required.";
  if(!resolvedUser?._id) nextErrors.user="Current user is required.";
  if(!formData.title.trim()) nextErrors.title="Title is required.";
  if(!formData.message.trim()) nextErrors.message="Message is required.";
  if(!formData.reminderOffsetMinutes||Number(formData.reminderOffsetMinutes)<1){
   nextErrors.reminderOffsetMinutes="Offset must be 1 minute or greater.";
  }
  if(!formData.channels.inApp&&!formData.channels.email&&!formData.channels.sms){
   nextErrors.channels="Select at least one delivery method.";
  }
  if(formData.isRecurring&&!formData.recurrenceRule){
   nextErrors.recurrenceRule="Recurrence rule is required.";
  }
  if(formData.recurrenceEndAt&&Number.isNaN(new Date(formData.recurrenceEndAt).getTime())){
   nextErrors.recurrenceEndAt="Recurrence end date is invalid.";
  }

  setErrors(nextErrors);
  return Object.keys(nextErrors).length===0;
 };

 const handleOpenConfirm=e=>{
  e.preventDefault();
  if(!validate()) return;
  setShowConfirm(true);
 };

 const handleConfirmedSubmit=async()=>{
  try{
   setLoading(true);
   setSubmitError("");

   await onSubmit?.({
    _id:formData._id||"",
    user:String(resolvedUser?._id||formData.user||""),
    menteeId:String(lockedMentee?._id||formData.menteeId||""),
    title:formData.title.trim(),
    message:formData.message.trim(),
    audienceType:formData.audienceType,
    selectedUsers:formData.selectedUsers.length?formData.selectedUsers:[String(resolvedUser?._id||"")],
    channels:{
     inApp:!!formData.channels.inApp,
     email:!!formData.channels.email,
     sms:!!formData.channels.sms
    },
    sendAt:formData.sendAt||"",
    nextRunAt:formData.nextRunAt||"",
    lastSentAt:formData.lastSentAt||"",
    sentAt:formData.sentAt||"",
    status:formData.status,
    isRecurring:!!formData.isRecurring,
    recurrenceRule:formData.isRecurring?formData.recurrenceRule:"",
    recurrenceEndAt:formData.recurrenceEndAt||null,
    reminderOffsetMinutes:Number(formData.reminderOffsetMinutes),
    modalDismissedBy:formData.modalDismissedBy
   });

   setShowConfirm(false);
  }catch(err){
   setSubmitError(err?.response?.data?.message||err?.message||`Failed to ${isEditMode?"update":"create"} reminder.`);
  }finally{
   setLoading(false);
  }
 };

 return(
  <>
   <Card className="shadow-sm border-0">
    <Card.Body>
     <div className="d-flex align-items-center gap-2 mb-3">
      {isEditMode?<SquarePen size={18}/>:<Bell size={18}/>}
      <h5 className="mb-0">{isEditMode?"Edit Reminder":"Create Reminder"}</h5>
     </div>

     {errors.user&&<Alert variant="danger" className="mb-3">{errors.user}</Alert>}
     {errors.menteeId&&<Alert variant="danger" className="mb-3">{errors.menteeId}</Alert>}
     {submitError&&<Alert variant="danger" className="mb-3">{submitError}</Alert>}

     <Form onSubmit={handleOpenConfirm}>
      <Row className="g-3">

       <Col md={6}>
        <Form.Group>
         <Form.Label className="d-flex align-items-center gap-2">
          <UserRound size={16}/>
          <span>Mentee</span>
         </Form.Label>
         <Form.Control type="text" value={menteeName} readOnly isInvalid={!!errors.menteeId}/>
         <Form.Control.Feedback type="invalid">{errors.menteeId}</Form.Control.Feedback>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label className="d-flex align-items-center gap-2">
          <CalendarClock size={16}/>
          <span>Reminder Offset</span>
         </Form.Label>
         <Form.Select
          name="reminderOffsetMinutes"
          value={formData.reminderOffsetMinutes}
          onChange={handleChange}
          isInvalid={!!errors.reminderOffsetMinutes}
         >
          <option value={15}>15 minutes before</option>
          <option value={30}>30 minutes before</option>
          <option value={45}>45 minutes before</option>
          <option value={60}>60 minutes before</option>
          <option value={120}>2 hours before</option>
          <option value={1440}>1 day before</option>
         </Form.Select>
         <Form.Control.Feedback type="invalid">{errors.reminderOffsetMinutes}</Form.Control.Feedback>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Title</Form.Label>
         <Form.Control
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          isInvalid={!!errors.title}
         />
         <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Message</Form.Label>
         <Form.Control
          as="textarea"
          rows={4}
          name="message"
          value={formData.message}
          onChange={handleChange}
          isInvalid={!!errors.message}
         />
         <Form.Control.Feedback type="invalid">{errors.message}</Form.Control.Feedback>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Group>
         <Form.Label>Send By</Form.Label>
         <div className="d-flex flex-wrap gap-3 mt-2">
          <Form.Check
           type="checkbox"
           id="reminder-inapp"
           name="inApp"
           checked={formData.channels.inApp}
           onChange={handleChannelChange}
           label={<span className="d-inline-flex align-items-center gap-2"><MonitorSmartphone size={16}/><span>On Screen</span></span>}
          />
          <Form.Check
           type="checkbox"
           id="reminder-email"
           name="email"
           checked={formData.channels.email}
           onChange={handleChannelChange}
           label={<span className="d-inline-flex align-items-center gap-2"><Mail size={16}/><span>Email</span></span>}
          />
          <Form.Check
           type="checkbox"
           id="reminder-sms"
           name="sms"
           checked={formData.channels.sms}
           onChange={handleChannelChange}
           label={<span className="d-inline-flex align-items-center gap-2"><MessageSquare size={16}/><span>SMS</span></span>}
          />
         </div>
         {errors.channels&&<div className="text-danger small mt-2">{errors.channels}</div>}
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label className="d-flex align-items-center gap-2">
          <Repeat size={16}/>
          <span>Recurring</span>
         </Form.Label>
         <Form.Check
          type="switch"
          id="reminder-recurring"
          name="isRecurring"
          checked={formData.isRecurring}
          onChange={handleChange}
          label={formData.isRecurring?"Yes":"No"}
         />
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Recurrence Rule</Form.Label>
         <Form.Select
          name="recurrenceRule"
          value={formData.recurrenceRule}
          onChange={handleChange}
          disabled={!formData.isRecurring}
          isInvalid={!!errors.recurrenceRule}
         >
          <option value="">Select rule</option>
          <option value="weekly">Weekly</option>
          <option value="bi-weekly">Bi-Weekly</option>
         </Form.Select>
         <Form.Control.Feedback type="invalid">{errors.recurrenceRule}</Form.Control.Feedback>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Recurrence End</Form.Label>
         <Form.Control
          type="datetime-local"
          name="recurrenceEndAt"
          value={formData.recurrenceEndAt}
          onChange={handleChange}
          disabled={!formData.isRecurring}
          isInvalid={!!errors.recurrenceEndAt}
         />
         <Form.Control.Feedback type="invalid">{errors.recurrenceEndAt}</Form.Control.Feedback>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Status</Form.Label>
         <Form.Select name="status" value={formData.status} onChange={handleChange}>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="paused">Paused</option>
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Send At</Form.Label>
         <Form.Control type="datetime-local" name="sendAt" value={formData.sendAt} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group>
         <Form.Label>Next Run At</Form.Label>
         <Form.Control type="datetime-local" name="nextRunAt" value={formData.nextRunAt} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Last Sent At</Form.Label>
         <Form.Control type="datetime-local" name="lastSentAt" value={formData.lastSentAt} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Sent At</Form.Label>
         <Form.Control type="datetime-local" name="sentAt" value={formData.sentAt} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col md={12} className="d-flex justify-content-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
         <XCircle size={16} className="me-1"/> Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
         <Save size={16} className="me-1"/> {isEditMode?"Update Reminder":"Create Reminder"}
        </Button>
       </Col>
      </Row>
     </Form>
    </Card.Body>
   </Card>

   <Modal show={showConfirm} onHide={()=>setShowConfirm(false)} centered>
    <Modal.Header closeButton>
     <Modal.Title>{isEditMode?"Update Reminder":"Confirm Reminder"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     {isEditMode
      ?`Update this ${formData.isRecurring?`${formData.recurrenceRule||"recurring"} `:""}reminder for ${menteeName}?`
      :`Create ${formData.isRecurring?`${formData.recurrenceRule||"recurring"} `:""}reminder for ${menteeName}?`
     }
    </Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={()=>setShowConfirm(false)} disabled={loading}>
      <XCircle size={16} className="me-1"/> Cancel
     </Button>
     <Button variant="primary" onClick={handleConfirmedSubmit} disabled={loading}>
      <Save size={16} className="me-1"/> {isEditMode?"Update":"Confirm"}
     </Button>
    </Modal.Footer>
   </Modal>
  </>
 );
}