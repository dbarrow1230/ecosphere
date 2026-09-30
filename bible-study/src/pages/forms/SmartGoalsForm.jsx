// src/pages/forms/SmartGoalsForm.jsx
import {useMemo,useState,useEffect} from "react";
import {Form,Row,Col,Button,Card,Modal} from "react-bootstrap";
import {Target,Save,Trash2,XCircle,User,CalendarRange} from "lucide-react";

export default function SmartGoalForm({initialData={},onSubmit,onDelete,submitLabel,deleteLabel="Delete",mode="add",lockedMentee,currentUser,users=[],statuses=[]}){
 const defaultForm=useMemo(()=>({
  _id:initialData._id||"",
  mentee:initialData.mentee?._id||initialData.mentee||lockedMentee?._id||"",
  weekNumber:initialData.weekNumber??1,
  specific:initialData.specific||"",
  measurable:initialData.measurable||"",
  achievable:initialData.achievable||"",
  relevant:initialData.relevant||"",
  timeBound:initialData.timeBound||"",
  progressPercent:initialData.progressPercent??0,
  status:initialData.status?._id||initialData.status||"",
  targetDate:initialData.targetDate?formatDateInput(initialData.targetDate):"",
  mentorComments:initialData.mentorComments||"",
  createdBy:initialData.createdBy?._id||initialData.createdBy||currentUser?._id||currentUser?.id||""
 }),[initialData,lockedMentee,currentUser]);

 const [formData,setFormData]=useState(defaultForm);
 const [errors,setErrors]=useState({});
 const [loading,setLoading]=useState(false);
 const [showSubmitConfirm,setShowSubmitConfirm]=useState(false);
 const [showDeleteConfirm,setShowDeleteConfirm]=useState(false);

 useEffect(()=>{
  setFormData(defaultForm);
 },[defaultForm]);

 const isEditMode=mode==="edit"||!!formData._id;
 const menteeName=useMemo(()=>{
  if(lockedMentee?.fullName) return lockedMentee.fullName;
  return `${lockedMentee?.firstName||""} ${lockedMentee?.lastName||""}`.trim();
 },[lockedMentee]);

 function getUserDisplayName(user){
  return user?.fullName||user?.name||user?.username||user?.email||user?._id||"";
 }

 function getStatusDisplayName(status){
  return status?.name||status?.label||status?.code||status?._id||"";
 }

 function handleChange(e){
  const {name,value}=e.target;
  setFormData(prev=>({...prev,[name]:value}));
  setErrors(prev=>({...prev,[name]:""}));
 }

 function validate(){
  const nextErrors={};

  if(!lockedMentee?._id&&!formData.mentee) nextErrors.mentee="Mentee is required.";
  if(formData.weekNumber===""||Number(formData.weekNumber)<1||Number(formData.weekNumber)>6) nextErrors.weekNumber="Week number must be between 1 and 6.";
  if(!formData.specific.trim()) nextErrors.specific="Specific goal is required.";
  if(formData.progressPercent===""||Number(formData.progressPercent)<0||Number(formData.progressPercent)>100) nextErrors.progressPercent="Progress must be between 0 and 100.";
  if(!formData.createdBy) nextErrors.createdBy="Created by is required.";

  setErrors(nextErrors);
  return Object.keys(nextErrors).length===0;
 }

 function handleOpenSubmitConfirm(e){
  e.preventDefault();
  if(!validate()) return;
  setShowSubmitConfirm(true);
 }

 async function handleConfirmedSubmit(){
  const payload={
   mentee:lockedMentee?._id||formData.mentee,
   weekNumber:Number(formData.weekNumber),
   specific:formData.specific.trim(),
   measurable:formData.measurable.trim(),
   achievable:formData.achievable.trim(),
   relevant:formData.relevant.trim(),
   timeBound:formData.timeBound.trim(),
   progressPercent:Number(formData.progressPercent),
   status:formData.status||null,
   targetDate:formData.targetDate?new Date(`${formData.targetDate}T00:00:00`).toISOString():null,
   mentorComments:formData.mentorComments.trim(),
   createdBy:formData.createdBy
  };

  if(formData._id) payload._id=formData._id;

  try{
   setLoading(true);
   await onSubmit?.(payload);
   setShowSubmitConfirm(false);
  }finally{
   setLoading(false);
  }
 }

 async function handleConfirmedDelete(){
  if(!formData._id||!onDelete) return;

  try{
   setLoading(true);
   await onDelete(formData._id,formData);
   setShowDeleteConfirm(false);
  }finally{
   setLoading(false);
  }
 }

 return (
  <>
   <Card className="shadow-sm border-0">
    <Card.Body>
     <div className="d-flex align-items-center gap-2 mb-3">
      <Target size={18} />
      <h5 className="mb-0">{isEditMode?"Edit Smart Goal":"Add Smart Goal"}</h5>
     </div>

     <Form onSubmit={handleOpenSubmitConfirm}>
      <Row className="g-3">
       <Col md={6}>
        <Form.Group controlId="mentee">
         <Form.Label>Mentee</Form.Label>
         <Form.Control type="text" value={menteeName} readOnly isInvalid={!!errors.mentee} />
         <Form.Control.Feedback type="invalid">{errors.mentee}</Form.Control.Feedback>
        </Form.Group>
       </Col>

       <Col md={3}>
        <Form.Group controlId="weekNumber">
         <Form.Label>Week Number</Form.Label>
         <Form.Select name="weekNumber" value={formData.weekNumber} onChange={handleChange} isInvalid={!!errors.weekNumber}>
          <option value={1}>Week 1</option>
          <option value={2}>Week 2</option>
          <option value={3}>Week 3</option>
          <option value={4}>Week 4</option>
          <option value={5}>Week 5</option>
          <option value={6}>Week 6</option>
         </Form.Select>
         <Form.Control.Feedback type="invalid">{errors.weekNumber}</Form.Control.Feedback>
        </Form.Group>
       </Col>

       <Col md={3}>
        <Form.Group controlId="progressPercent">
         <Form.Label>Progress Percent</Form.Label>
         <Form.Control type="number" name="progressPercent" min="0" max="100" value={formData.progressPercent} onChange={handleChange} isInvalid={!!errors.progressPercent} />
         <Form.Control.Feedback type="invalid">{errors.progressPercent}</Form.Control.Feedback>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Group controlId="specific">
         <Form.Label>Specific</Form.Label>
         <Form.Control as="textarea" rows={3} name="specific" value={formData.specific} onChange={handleChange} isInvalid={!!errors.specific} />
         <Form.Control.Feedback type="invalid">{errors.specific}</Form.Control.Feedback>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group controlId="measurable">
         <Form.Label>Measurable</Form.Label>
         <Form.Control as="textarea" rows={3} name="measurable" value={formData.measurable} onChange={handleChange} />
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group controlId="achievable">
         <Form.Label>Achievable</Form.Label>
         <Form.Control as="textarea" rows={3} name="achievable" value={formData.achievable} onChange={handleChange} />
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group controlId="relevant">
         <Form.Label>Relevant</Form.Label>
         <Form.Control as="textarea" rows={3} name="relevant" value={formData.relevant} onChange={handleChange} />
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group controlId="timeBound">
         <Form.Label>Time Bound</Form.Label>
         <Form.Control as="textarea" rows={3} name="timeBound" value={formData.timeBound} onChange={handleChange} />
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group controlId="status">
         <Form.Label>Status</Form.Label>
         <Form.Select name="status" value={formData.status} onChange={handleChange}>
          <option value="">Select status</option>
          {statuses.map(item=>(
           <option key={item._id} value={item._id}>{getStatusDisplayName(item)}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group controlId="targetDate">
         <Form.Label className="d-flex align-items-center gap-2">
          <CalendarRange size={16} />
          <span>Target Date</span>
         </Form.Label>
         <Form.Control type="date" name="targetDate" value={formData.targetDate} onChange={handleChange} />
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group controlId="createdBy">
         <Form.Label className="d-flex align-items-center gap-2">
          <User size={16} />
          <span>Created By</span>
         </Form.Label>
         <Form.Select name="createdBy" value={formData.createdBy} onChange={handleChange} isInvalid={!!errors.createdBy}>
          <option value="">Select user</option>
          {users.map(item=>(
           <option key={item._id||item.id} value={item._id||item.id}>{getUserDisplayName(item)}</option>
          ))}
         </Form.Select>
         <Form.Text className="text-muted">Defaults to the current logged in user.</Form.Text>
         <Form.Control.Feedback type="invalid">{errors.createdBy}</Form.Control.Feedback>
        </Form.Group>
       </Col>

       <Col md={12}>
        <Form.Group controlId="mentorComments">
         <Form.Label>Mentor Comments</Form.Label>
         <Form.Control as="textarea" rows={4} name="mentorComments" value={formData.mentorComments} onChange={handleChange} />
        </Form.Group>
       </Col>

       <Col md={12} className="d-flex justify-content-between">
        <div>
         {isEditMode&&typeof onDelete==="function"&&(
          <Button type="button" variant="danger" disabled={loading} onClick={()=>setShowDeleteConfirm(true)} className="d-inline-flex align-items-center gap-2">
           <Trash2 size={16} />
           <span>{deleteLabel}</span>
          </Button>
         )}
        </div>

        <div className="d-flex gap-2">
         <Button type="submit" variant="primary" disabled={loading} className="d-inline-flex align-items-center gap-2">
          <Save size={16} />
          <span>{loading?(submitLabel||"Saving..."):(submitLabel||`${isEditMode?"Update":"Save"} Smart Goal`)}</span>
         </Button>
        </div>
       </Col>
      </Row>
     </Form>
    </Card.Body>
   </Card>

   <Modal show={showSubmitConfirm} onHide={()=>setShowSubmitConfirm(false)} centered>
    <Modal.Header closeButton>
     <Modal.Title>{isEditMode?"Confirm Update":"Confirm Save"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     {isEditMode?"Are you sure you want to save this smart goal?":"Are you sure you want to save this smart goal?"}
    </Modal.Body>
    <Modal.Footer>
     <Button type="button" variant="secondary" onClick={()=>setShowSubmitConfirm(false)} disabled={loading} className="d-inline-flex align-items-center gap-2">
      <XCircle size={16} />
      <span>Cancel</span>
     </Button>
     <Button type="button" variant="primary" onClick={handleConfirmedSubmit} disabled={loading} className="d-inline-flex align-items-center gap-2">
      <Save size={16} />
      <span>{isEditMode?"Yes, Save":"Yes, Save"}</span>
     </Button>
    </Modal.Footer>
   </Modal>

   <Modal show={showDeleteConfirm} onHide={()=>setShowDeleteConfirm(false)} centered>
    <Modal.Header closeButton>
     <Modal.Title>Confirm Delete</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     Are you sure you want to delete this smart goal?
    </Modal.Body>
    <Modal.Footer>
     <Button type="button" variant="secondary" onClick={()=>setShowDeleteConfirm(false)} disabled={loading} className="d-inline-flex align-items-center gap-2">
      <XCircle size={16} />
      <span>Cancel</span>
     </Button>
     <Button type="button" variant="danger" onClick={handleConfirmedDelete} disabled={loading} className="d-inline-flex align-items-center gap-2">
      <Trash2 size={16} />
      <span>Yes, Delete</span>
     </Button>
    </Modal.Footer>
   </Modal>
  </>
 );
}

function formatDateInput(value){
 const date=new Date(value);
 if(Number.isNaN(date.getTime())) return "";
 const offset=date.getTimezoneOffset();
 const local=new Date(date.getTime()-offset*60000);
 return local.toISOString().slice(0,10);
}