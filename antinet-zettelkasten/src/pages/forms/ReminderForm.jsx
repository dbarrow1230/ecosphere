import {useEffect,useMemo,useState} from "react";
import {Alert,Button,Col,Form,Row} from "react-bootstrap";
import {Mail,MonitorSmartphone,Save,XCircle} from "lucide-react";

function getObjectId(value){
 if(!value)return "";
 if(typeof value==="string")return value;
 return String(value._id?.$oid||value.id?.$oid||value._id||value.id||value.$oid||"");
}

function getStoredUser(){
 for(const key of ["userInfo","user","authUser","currentUser"]){
  try{
   const parsed=JSON.parse(localStorage.getItem(key)||sessionStorage.getItem(key)||"null");
   const user=parsed?.user||parsed?.data||parsed;
   if(getObjectId(user))return user;
  }catch{
   continue;
  }
 }
 return null;
}

function splitDateTime(value){
 if(!value)return {date:"",time:""};
 const parsed=new Date(value);
 if(Number.isNaN(parsed.getTime()))return {date:"",time:""};
 const pad=number=>String(number).padStart(2,"0");
 return {
  date:`${parsed.getFullYear()}-${pad(parsed.getMonth()+1)}-${pad(parsed.getDate())}`,
  time:`${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`
 };
}

function combineDateTime(date,time){
 return date&&time?`${date}T${time}`:"";
}

export default function ReminderForm({mode="add",currentUser,onSubmit,onCancel,initialData={}}){
 const resolvedUser=useMemo(()=>currentUser||getStoredUser(),[currentUser]);
 const userId=getObjectId(resolvedUser);

 const defaultForm=useMemo(()=>{
  const sendAt=splitDateTime(initialData.sendAt);
  return {
   _id:getObjectId(initialData),
   title:String(initialData.title||""),
   message:String(initialData.message||""),
   reminderType:String(initialData.reminderType||"custom"),
   channels:{
    inApp:initialData.channels?.inApp??true,
    email:initialData.channels?.email??false
   },
   sendDate:sendAt.date,
   sendTime:sendAt.time,
   isRecurring:Boolean(initialData.isRecurring),
   recurrenceRule:String(initialData.recurrenceRule||"weekly"),
   recurrenceEndDate:splitDateTime(initialData.recurrenceEndAt).date
  };
 },[initialData]);

 const [formData,setFormData]=useState(defaultForm);
 const [errors,setErrors]=useState({});
 const [loading,setLoading]=useState(false);
 const [submitError,setSubmitError]=useState("");
 const isEditMode=mode==="edit"||Boolean(formData._id);

 useEffect(()=>{
  queueMicrotask(()=>setFormData(defaultForm));
 },[defaultForm]);

 const handleChange=event=>{
  const {name,value,type,checked}=event.target;
  setFormData(current=>({...current,[name]:type==="checkbox"?checked:value}));
  setErrors(current=>({...current,[name]:"",sendAt:"",recurrenceEndDate:""}));
  setSubmitError("");
 };

 const handleChannelChange=event=>{
  const {name,checked}=event.target;
  setFormData(current=>({
   ...current,
   channels:{...current.channels,[name]:checked}
  }));
  setErrors(current=>({...current,channels:""}));
  setSubmitError("");
 };

 const validate=()=>{
  const nextErrors={};
  const sendAt=combineDateTime(formData.sendDate,formData.sendTime);
  const sendAtTime=sendAt?new Date(sendAt).getTime():Number.NaN;
  const originalSendAtTime=initialData.sendAt?new Date(initialData.sendAt).getTime():Number.NaN;
  const scheduleChanged=!isEditMode||sendAtTime!==originalSendAtTime;
  if(!userId)nextErrors.user="The logged-in user could not be identified.";
  if(!formData.title.trim())nextErrors.title="Title is required.";
  if(!sendAt||Number.isNaN(sendAtTime)){
   nextErrors.sendAt="Reminder date and time are required.";
  }else if(scheduleChanged&&sendAtTime<=Date.now()){
   nextErrors.sendAt="Reminder date and time must be in the future. Check AM or PM.";
  }
  if(!formData.channels.inApp&&!formData.channels.email)nextErrors.channels="Select at least one notification method.";
  if(formData.isRecurring&&!formData.recurrenceRule)nextErrors.recurrenceRule="Frequency is required.";
  if(formData.isRecurring&&formData.recurrenceEndDate&&sendAt){
   const endAt=combineDateTime(formData.recurrenceEndDate,formData.sendTime);
   if(new Date(endAt)<new Date(sendAt))nextErrors.recurrenceEndDate="The end date cannot be before the first reminder.";
  }
  setErrors(nextErrors);
  return Object.keys(nextErrors).length===0;
 };

 const handleSubmit=async event=>{
  event.preventDefault();
  if(!validate())return;

  const sendAt=combineDateTime(formData.sendDate,formData.sendTime);
  try{
   setLoading(true);
   setSubmitError("");
   await onSubmit?.({
    _id:formData._id,
    user:userId,
    title:formData.title.trim(),
    message:formData.message.trim(),
    reminderType:formData.reminderType,
    parentModel:"User",
    parentRecordId:userId,
    parentDisplayId:"Personal reminder",
    audienceType:"selected",
    selectedUsers:[userId],
    channels:{
     inApp:formData.channels.inApp,
     email:formData.channels.email
    },
    sendAt:new Date(sendAt).toISOString(),
    isRecurring:formData.isRecurring,
    recurrenceRule:formData.isRecurring?formData.recurrenceRule:"",
    recurrenceEndAt:formData.isRecurring&&formData.recurrenceEndDate
     ?new Date(combineDateTime(formData.recurrenceEndDate,formData.sendTime)).toISOString()
     :null,
    reminderOffsetMinutes:0,
    modalDismissedBy:Array.isArray(initialData.modalDismissedBy)?initialData.modalDismissedBy:[]
   });
  }catch(error){
   setSubmitError(error?.response?.data?.message||error?.message||`Failed to ${isEditMode?"update":"create"} reminder.`);
  }finally{
   setLoading(false);
  }
 };

 return (
  <Form className="reminder-form" onSubmit={handleSubmit}>
   {errors.user&&<Alert variant="danger">{errors.user}</Alert>}
   {submitError&&<Alert variant="danger">{submitError}</Alert>}

   <Row className="g-3">
    <Col xs={12}>
     <Form.Group>
      <Form.Label>Title</Form.Label>
      <Form.Control name="title" value={formData.title} onChange={handleChange} isInvalid={Boolean(errors.title)}/>
      <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
     </Form.Group>
    </Col>

    <Col xs={12}>
     <Form.Group>
      <Form.Label>Note</Form.Label>
      <Form.Control as="textarea" rows={4} name="message" value={formData.message} onChange={handleChange}/>
     </Form.Group>
    </Col>

    <Col xs={12}>
     <Form.Group>
      <Form.Label>Notify By</Form.Label>
      <div className="form-field-content d-inline-flex flex-wrap gap-4">
       <Form.Check type="checkbox" id="reminder-inapp" name="inApp" checked={formData.channels.inApp} onChange={handleChannelChange} label={<span className="d-inline-flex align-items-center gap-2"><MonitorSmartphone size={16}/>On Screen</span>}/>
       <Form.Check type="checkbox" id="reminder-email" name="email" checked={formData.channels.email} onChange={handleChannelChange} label={<span className="d-inline-flex align-items-center gap-2"><Mail size={16}/>Email</span>}/>
      </div>
      {errors.channels&&<div className="text-danger small mt-2">{errors.channels}</div>}
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group>
      <Form.Label>Purpose</Form.Label>
      <Form.Select name="reminderType" value={formData.reminderType} onChange={handleChange}>
       <option value="review">Review</option>
       <option value="follow-up">Follow up</option>
       <option value="process">Process</option>
       <option value="research">Research</option>
       <option value="custom">Other</option>
      </Form.Select>
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group>
      <Form.Label>Reminder Date</Form.Label>
      <Form.Control type="date" name="sendDate" value={formData.sendDate} onChange={handleChange} isInvalid={Boolean(errors.sendAt)}/>
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group>
      <Form.Label>Reminder Time</Form.Label>
      <Form.Control type="time" step="60" name="sendTime" value={formData.sendTime} onChange={handleChange} isInvalid={Boolean(errors.sendAt)}/>
      <Form.Control.Feedback type="invalid">{errors.sendAt}</Form.Control.Feedback>
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group>
      <Form.Label>Repeat</Form.Label>
      <Form.Check type="switch" id="reminder-recurring" name="isRecurring" checked={formData.isRecurring} onChange={handleChange} label={formData.isRecurring?"Recurring":"One time"}/>
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group>
      <Form.Label>Status</Form.Label>
      <Form.Control value={String(initialData.status||"pending")} readOnly/>
     </Form.Group>
    </Col>

    {formData.isRecurring&&(
     <>
      <Col md={6}>
       <Form.Group>
        <Form.Label>Frequency</Form.Label>
        <Form.Select name="recurrenceRule" value={formData.recurrenceRule} onChange={handleChange} isInvalid={Boolean(errors.recurrenceRule)}>
         <option value="daily">Daily</option>
         <option value="weekly">Weekly</option>
         <option value="bi-weekly">Every two weeks</option>
         <option value="monthly">Monthly</option>
        </Form.Select>
        <Form.Control.Feedback type="invalid">{errors.recurrenceRule}</Form.Control.Feedback>
       </Form.Group>
      </Col>

      <Col md={6}>
       <Form.Group>
        <Form.Label>Repeat Until</Form.Label>
        <Form.Control type="date" name="recurrenceEndDate" value={formData.recurrenceEndDate} onChange={handleChange} isInvalid={Boolean(errors.recurrenceEndDate)}/>
        <Form.Control.Feedback type="invalid">{errors.recurrenceEndDate}</Form.Control.Feedback>
       </Form.Group>
      </Col>
     </>
    )}

    <Col xs={12} className="d-flex justify-content-end gap-2 pt-2">
     <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
      <XCircle size={16}/> Cancel
     </Button>
     <Button type="submit" variant="primary" disabled={loading}>
      <Save size={16}/> {isEditMode?"Update Reminder":"Create Reminder"}
     </Button>
    </Col>
   </Row>
  </Form>
 );
}
