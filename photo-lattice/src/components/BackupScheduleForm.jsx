import {useEffect,useMemo,useState} from "react";
import {Alert,Button,Col,Form,Row,Spinner} from "react-bootstrap";

const getLocalDate=()=>{
 const date=new Date();
 const offset=date.getTimezoneOffset()*60000;
 return new Date(date.getTime()-offset).toISOString().slice(0,10);
};

const defaultValues={
 backupType:"full",
 frequency:"weekly",
 startDate:getLocalDate(),
 time:"02:00",
 dayOfWeek:String(new Date().getDay()),
 dayOfMonth:String(new Date().getDate()),
 retentionDays:"30",
 timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone||"America/New_York"
};

export default function BackupScheduleForm({initialData,onSubmit,onCancel,saving=false,defaultBackupLocation=""}){
 const initialValues=useMemo(()=>({
  ...defaultValues,
  ...initialData,
  backupLocation:initialData?.backupLocation||defaultBackupLocation,
  dayOfWeek:String(initialData?.dayOfWeek??defaultValues.dayOfWeek),
  dayOfMonth:String(initialData?.dayOfMonth??defaultValues.dayOfMonth),
  retentionDays:String(initialData?.retentionDays??defaultValues.retentionDays)
 }),[defaultBackupLocation,initialData]);
 const [formData,setFormData]=useState(initialValues);
 const [error,setError]=useState("");

 useEffect(()=>{queueMicrotask(()=>setFormData(initialValues));},[initialValues]);
 useEffect(()=>{
  if(!error)return undefined;
  const timer=setTimeout(()=>setError(""),5000);
  return()=>clearTimeout(timer);
 },[error]);

 const handleChange=event=>{
  const {name,value}=event.target;
  setFormData(current=>({...current,[name]:value}));
  setError("");
 };

 const handleSubmit=async event=>{
  event.preventDefault();
  const retentionDays=Number(formData.retentionDays);
  if(!formData.startDate||!formData.time){setError("Start date and time are required.");return;}
  if(!Number.isInteger(retentionDays)||retentionDays<1||retentionDays>3650){setError("Keep backups for 1 to 3650 days.");return;}
  await onSubmit({
   ...formData,
   dayOfWeek:Number(formData.dayOfWeek),
   dayOfMonth:Number(formData.dayOfMonth),
   retentionDays
  });
 };

 return(
  <Form className="backup-schedule-form" onSubmit={handleSubmit}>
   {error&&<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>}
   <Row className="g-3">
    <Col md={6}>
     <Form.Group>
      <Form.Label>Backup Type</Form.Label>
      <Form.Select name="backupType" value={formData.backupType} onChange={handleChange}>
       <option value="full">Full Backup</option>
       <option value="notes">Notes</option>
       <option value="favorites">Favorites</option>
       <option value="archived">Archived Notes</option>
       <option value="tags">Tags</option>
      </Form.Select>
     </Form.Group>
    </Col>
    <Col md={6}>
     <Form.Group>
      <Form.Label>Frequency</Form.Label>
      <Form.Select name="frequency" value={formData.frequency} onChange={handleChange}>
       <option value="daily">Daily</option>
       <option value="weekly">Weekly</option>
       <option value="monthly">Monthly</option>
      </Form.Select>
     </Form.Group>
    </Col>
    <Col md={6}>
     <Form.Group>
      <Form.Label>Start Date</Form.Label>
      <Form.Control type="date" name="startDate" value={formData.startDate} onChange={handleChange}/>
     </Form.Group>
    </Col>
    <Col md={6}>
     <Form.Group>
      <Form.Label>Backup Time</Form.Label>
      <Form.Control type="time" step="60" name="time" value={formData.time} onChange={handleChange}/>
     </Form.Group>
    </Col>
    {formData.frequency==="weekly"&&(
     <Col md={6}>
      <Form.Group>
       <Form.Label>Day</Form.Label>
       <Form.Select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange}>
        <option value="0">Sunday</option><option value="1">Monday</option><option value="2">Tuesday</option><option value="3">Wednesday</option><option value="4">Thursday</option><option value="5">Friday</option><option value="6">Saturday</option>
       </Form.Select>
      </Form.Group>
     </Col>
    )}
    {formData.frequency==="monthly"&&(
     <Col md={6}>
      <Form.Group>
       <Form.Label>Day of Month</Form.Label>
       <Form.Control type="number" min="1" max="31" name="dayOfMonth" value={formData.dayOfMonth} onChange={handleChange}/>
      </Form.Group>
     </Col>
    )}
    <Col md={6}>
     <Form.Group>
      <Form.Label>Keep Backups</Form.Label>
      <div className="backup-retention-field form-field-content">
       <Form.Control type="number" min="1" max="3650" name="retentionDays" value={formData.retentionDays} onChange={handleChange}/>
       <span>days</span>
      </div>
     </Form.Group>
    </Col>
    <Col xs={12}>
     <Form.Group>
      <Form.Label>Backup Location</Form.Label>
      <Form.Control type="text" name="backupLocation" value={formData.backupLocation} onChange={handleChange} required/>
     </Form.Group>
    </Col>
    <Col xs={12} className="d-flex justify-content-end gap-2">
     <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
     <Button type="submit" variant="primary" disabled={saving}>
      {saving?<><Spinner as="span" size="sm" animation="border"/> Saving</>:initialData?._id?"Update Schedule":"Create Schedule"}
     </Button>
    </Col>
   </Row>
  </Form>
 );
}
