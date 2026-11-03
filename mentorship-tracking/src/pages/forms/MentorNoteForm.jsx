//src/pages/forms/MentorNoteForm.jsx
import {useMemo,useState,useEffect,useRef} from "react";
import {Form,Row,Col,Button,Card,Table,Modal,Badge} from "react-bootstrap";
import {FileText,Save,Trash2,XCircle,Pencil,User,Plus} from "lucide-react";

export default function MentorNoteForm({mentees=[],users=[],notes=[],initialData={},onSubmit,onDelete,onEdit,mode="add",lockedMentee,currentUser,allowCreate=true,allowDelete=true}){
 const formCardRef=useRef(null);

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

 const resolvedCurrentUser=useMemo(()=>{
  const source=currentUser||getStoredUser();
  if(!source) return null;
  const id=source._id||source.id||source.user?._id||source.user?.id||source.data?._id||source.data?.id||"";
  if(!id) return null;
  return {...source,_id:String(id),id:String(id)};
 },[currentUser]);

 const normalizedUsers=useMemo(()=>{
  const list=(Array.isArray(users)?users:[]).map(user=>{
   const id=user?._id||user?.id||"";
   return id?{...user,_id:String(id),id:String(id)}:user;
  }).filter(Boolean);
  const currentId=resolvedCurrentUser?._id||resolvedCurrentUser?.id||"";
  if(!currentId) return list;
  const exists=list.some(user=>String(user?._id||user?.id||"")===String(currentId));
  if(exists) return list;
  return [...list,resolvedCurrentUser];
 },[users,resolvedCurrentUser]);

 const getId=value=>{
  if(!value) return "";
  if(typeof value==="string"||typeof value==="number") return String(value);
  if(typeof value==="object") return String(value._id||value.id||"");
  return "";
 };

 const getMenteeDisplayName=value=>{
  if(!value) return "";
  if(typeof value==="string"||typeof value==="number"){
   const matched=(Array.isArray(mentees)?mentees:[]).find(item=>String(item?._id||item?.id||"")===String(value));
   if(!matched) return "";
   return matched.fullName||`${matched.firstName||""} ${matched.lastName||""}`.trim();
  }
  return value.fullName||`${value.firstName||""} ${value.lastName||""}`.trim();
 };

 const getUserDisplayName=user=>{
  return user?.fullName||user?.name||user?.username||user?.email||user?._id||"";
 };

 const defaultCreatedBy=String(
  getId(resolvedCurrentUser)||
  getId(initialData.createdBy)||
  ""
 );

 const lockedMenteeId=useMemo(()=>{
  return String(getId(lockedMentee));
 },[lockedMentee]);

 const lockedMenteeName=useMemo(()=>{
  return getMenteeDisplayName(lockedMentee);
 },[lockedMentee,mentees]);

 const normalizedNotes=useMemo(()=>{
  return (Array.isArray(notes)?notes:[]).map(item=>({
   ...item,
   _id:String(getId(item)),
   mentee:String(getId(item?.mentee)),
   createdBy:String(getId(item?.createdBy)),
   weekNumber:item?.weekNumber??""
  }));
 },[notes]);

 const buildBlankForm=useMemo(()=>(()=>({
  _id:"",
  mentee:lockedMenteeId||"",
  weekNumber:"",
  note:"",
  category:"general",
  isFlagged:false,
  followUpRequired:false,
  riskLevel:"low",
  createdBy:String(defaultCreatedBy||"")
 })),[lockedMenteeId,defaultCreatedBy]);

 const buildEditForm=useMemo(()=>noteRecord=>({
  _id:String(getId(noteRecord)),
  mentee:String(getId(noteRecord?.mentee)||lockedMenteeId||""),
  weekNumber:noteRecord?.weekNumber??"",
  note:noteRecord?.note||"",
  category:noteRecord?.category||"general",
  isFlagged:!!noteRecord?.isFlagged,
  followUpRequired:!!noteRecord?.followUpRequired,
  riskLevel:noteRecord?.riskLevel||"low",
  createdBy:String(getId(noteRecord?.createdBy)||defaultCreatedBy||"")
 }),[lockedMenteeId,defaultCreatedBy]);

 const defaultForm=useMemo(()=>{
  if(initialData&&Object.keys(initialData).length){
   return buildEditForm(initialData);
  }
  return buildBlankForm();
 },[initialData,buildEditForm,buildBlankForm]);

 const [formData,setFormData]=useState(defaultForm);
 const [errors,setErrors]=useState({});
 const [loading,setLoading]=useState(false);
 const [showSubmitConfirm,setShowSubmitConfirm]=useState(false);
 const [showDeleteConfirm,setShowDeleteConfirm]=useState(false);
 const [deleteTarget,setDeleteTarget]=useState(null);

 useEffect(()=>{
  setFormData(defaultForm);
 },[defaultForm]);

 useEffect(()=>{
  if(!defaultCreatedBy) return;
  setFormData(prev=>({
   ...prev,
   createdBy:String(prev.createdBy||defaultCreatedBy)
  }));
 },[defaultCreatedBy]);

 useEffect(()=>{
  const dialog=formCardRef.current?.closest(".modal-dialog");
  if(!dialog) return;
  const previousWidth=dialog.style.width;
  const previousMaxWidth=dialog.style.maxWidth;
  dialog.style.width="90vw";
  dialog.style.maxWidth="1200px";
  return()=>{
   dialog.style.width=previousWidth;
   dialog.style.maxWidth=previousMaxWidth;
  };
 },[]);

 const isEditMode=mode==="edit"||!!formData._id;

 const selectedMenteeId=useMemo(()=>{
  return String(lockedMenteeId||getId(formData.mentee)||"");
 },[lockedMenteeId,formData.mentee]);

 const menteeNotes=useMemo(()=>{
  if(!selectedMenteeId) return [];
  return normalizedNotes
   .filter(item=>String(item.mentee)===String(selectedMenteeId))
   .sort((a,b)=>{
    const weekA=Number(a.weekNumber||0);
    const weekB=Number(b.weekNumber||0);
    if(weekA!==weekB)return weekA-weekB;
    return new Date(b.createdAt||0)-new Date(a.createdAt||0);
   });
 },[normalizedNotes,selectedMenteeId]);

 const groupedNotesByWeek=useMemo(()=>{
  return menteeNotes.reduce((acc,item)=>{
   const key=item.weekNumber||"Unassigned";
   if(!acc[key])acc[key]=[];
   acc[key].push(item);
   return acc;
  },{});
 },[menteeNotes]);

 function getCreatedByDisplay(createdBy){
  const id=String(getId(createdBy));
  if(!id) return "—";
  const matched=normalizedUsers.find(user=>String(user._id||user.id||"")===id);
  return matched?getUserDisplayName(matched):id;
 }

 function handleChange(e){
  const {name,value,type,checked}=e.target;
  setFormData(prev=>({
   ...prev,
   [name]:type==="checkbox"?checked:(name==="createdBy"||name==="mentee"?String(value):value)
  }));
  setErrors(prev=>({...prev,[name]:""}));
 }

 function validate(){
  const nextErrors={};
  if(!getId(formData.mentee)) nextErrors.mentee="Mentee is required.";
  if(formData.weekNumber!==""&&Number(formData.weekNumber)<1) nextErrors.weekNumber="Week must be 1 or greater.";
  if(!formData.note.trim()) nextErrors.note="Note is required.";
  if(!getId(formData.createdBy)) nextErrors.createdBy="Created by is required.";
  setErrors(nextErrors);
  return Object.keys(nextErrors).length===0;
 }

 function handleOpenSubmitConfirm(e){
  e.preventDefault();
  if(!validate()) return;
  setShowSubmitConfirm(true);
 }

 function handleAddNewNote(){
  setFormData(buildBlankForm());
  setErrors({});
 }

 async function handleConfirmedSubmit(){
  const payload={
   mentee:String(getId(formData.mentee)),
   weekNumber:formData.weekNumber?Number(formData.weekNumber):null,
   note:formData.note.trim(),
   category:formData.category,
   isFlagged:formData.isFlagged,
   followUpRequired:formData.followUpRequired,
   riskLevel:formData.riskLevel,
   createdBy:String(getId(formData.createdBy))
  };
  if(formData._id) payload._id=String(getId(formData._id));
  try{
   setLoading(true);
   await onSubmit?.(payload);
   setShowSubmitConfirm(false);
   setFormData(buildBlankForm());
   setErrors({});
  }finally{
   setLoading(false);
  }
 }

 function handleOpenDeleteConfirm(noteRecord=null){
  setDeleteTarget(noteRecord||formData);
  setShowDeleteConfirm(true);
 }

 async function handleConfirmedDelete(){
  const target=deleteTarget||formData;
  if(!getId(target?._id)||!onDelete) return;
  try{
   setLoading(true);
   await onDelete(String(getId(target._id)),target);
   setShowDeleteConfirm(false);
   setDeleteTarget(null);
   if(String(getId(formData._id))===String(getId(target._id))){
    setFormData(buildBlankForm());
    setErrors({});
   }
  }finally{
   setLoading(false);
  }
 }

 function handleEditRow(noteRecord){
  setFormData(buildEditForm(noteRecord));
  setErrors({});
  onEdit?.(noteRecord);
 }

 return(
  <>
   <Card ref={formCardRef} className="shadow-sm border-0">
    <Card.Body>
     <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
      <div className="d-flex align-items-center gap-2">
       <FileText size={18}/>
       <h5 className="mb-0">{isEditMode?"Edit Mentor Note":"Add Mentor Note"}</h5>
      </div>
      {!!lockedMentee&&allowCreate&&(
       <Button type="button" variant="outline-dark" onClick={handleAddNewNote} className="d-inline-flex align-items-center gap-2">
        <Plus size={16}/>
        <span>Add New Note</span>
       </Button>
      )}
     </div>
     {(allowCreate||isEditMode)&&<Form onSubmit={handleOpenSubmitConfirm}>
      <Row className="g-3">
       <Col md={6}>
        <Form.Group>
         <Form.Label>Mentee</Form.Label>
         {lockedMentee?(
          <>
           <Form.Control value={lockedMenteeName} readOnly isInvalid={!!errors.mentee}/>
           <Form.Control type="hidden" name="mentee" value={String(getId(formData.mentee))}/>
           <Form.Control.Feedback type="invalid">{errors.mentee}</Form.Control.Feedback>
          </>
         ):(
          <>
           <Form.Select
            name="mentee"
            value={String(getId(formData.mentee))}
            onChange={handleChange}
            isInvalid={!!errors.mentee}
           >
            <option value="">Select mentee</option>
            {mentees.map(item=>(
             <option key={String(item._id||item.id)} value={String(item._id||item.id)}>
              {item.fullName||`${item.firstName||""} ${item.lastName||""}`.trim()}
             </option>
            ))}
           </Form.Select>
           <Form.Control.Feedback type="invalid">{errors.mentee}</Form.Control.Feedback>
          </>
         )}
        </Form.Group>
       </Col>
       <Col md={3}>
        <Form.Group>
         <Form.Label>Week Number</Form.Label>
         <Form.Control
          type="number"
          name="weekNumber"
          value={formData.weekNumber}
          onChange={handleChange}
          isInvalid={!!errors.weekNumber}
         />
         <Form.Control.Feedback type="invalid">{errors.weekNumber}</Form.Control.Feedback>
        </Form.Group>
       </Col>
       <Col md={3}>
        <Form.Group>
         <Form.Label>Category</Form.Label>
         <Form.Select name="category" value={formData.category} onChange={handleChange}>
          <option value="general">General</option>
          <option value="session">Session</option>
          <option value="performance">Performance</option>
          <option value="attendance">Attendance</option>
          <option value="behavior">Behavior</option>
          <option value="goal">Goal</option>
          <option value="hours">Hours</option>
         </Form.Select>
        </Form.Group>
       </Col>
       <Col md={12}>
        <Form.Group>
         <Form.Label>Note</Form.Label>
         <Form.Control
          as="textarea"
          rows={4}
          name="note"
          value={formData.note}
          onChange={handleChange}
          isInvalid={!!errors.note}
         />
         <Form.Control.Feedback type="invalid">{errors.note}</Form.Control.Feedback>
        </Form.Group>
       </Col>
       <Col md={4}>
        <Form.Group>
         <Form.Label>Risk Level</Form.Label>
         <Form.Select name="riskLevel" value={formData.riskLevel} onChange={handleChange}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
         </Form.Select>
        </Form.Group>
       </Col>
       <Col md={4} className="d-flex align-items-center">
        <Form.Check
         type="checkbox"
         label="Flagged"
         name="isFlagged"
         checked={formData.isFlagged}
         onChange={handleChange}
        />
       </Col>
       <Col md={4} className="d-flex align-items-center">
        <Form.Check
         type="checkbox"
         label="Follow Up Required"
         name="followUpRequired"
         checked={formData.followUpRequired}
         onChange={handleChange}
        />
       </Col>
       <Col md={6}>
        <Form.Group>
         <Form.Label className="d-flex align-items-center gap-2">
          <User size={16}/>
          <span>Created By</span>
         </Form.Label>
         <Form.Select
          name="createdBy"
          value={String(getId(formData.createdBy))}
          onChange={handleChange}
          isInvalid={!!errors.createdBy}
         >
          <option value="">Select user</option>
          {normalizedUsers.map(item=>(
           <option key={String(item._id||item.id)} value={String(item._id||item.id)}>
            {getUserDisplayName(item)}
           </option>
          ))}
         </Form.Select>
         <Form.Text className="text-muted">Defaults to the current logged in user.</Form.Text>
         <Form.Control.Feedback type="invalid">{errors.createdBy}</Form.Control.Feedback>
        </Form.Group>
       </Col>
       <Col md={12} className="d-flex justify-content-between">
        <div>
         {isEditMode&&onDelete&&allowDelete&&(
          <Button variant="danger" onClick={()=>handleOpenDeleteConfirm()} disabled={loading}>
           <Trash2 size={16} className="me-1"/> Delete
          </Button>
         )}
        </div>
        <Button type="submit" variant="primary" disabled={loading}>
         <Save size={16} className="me-1"/>
         {isEditMode?"Update":"Save"}
        </Button>
       </Col>
      </Row>
     </Form>}
     {!!lockedMentee&&(
      <div className="mt-4">
       <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="mb-0">Mentor Notes by Week</h5>
        <span className="text-muted small">{menteeNotes.length} total</span>
       </div>
       {Object.keys(groupedNotesByWeek).length?Object.entries(groupedNotesByWeek).map(([week,items])=>(
        <div key={week} className="mb-4">
         <div className="d-flex align-items-center justify-content-between mb-2">
          <h6 className="mb-0">Week {week}</h6>
          <Badge bg="secondary">{items.length}</Badge>
         </div>
         <Table responsive bordered hover size="sm" className="align-middle">
          <thead>
           <tr>
            <th>Category</th>
            <th>Note</th>
            <th>Risk</th>
            <th>Flagged</th>
            <th>Follow Up</th>
            <th>Created By</th>
            <th style={{width:"140px"}}>Actions</th>
           </tr>
          </thead>
          <tbody>
           {items.map(item=>(
            <tr key={item._id}>
             <td className="text-capitalize">{item.category||"general"}</td>
             <td>{item.note||"—"}</td>
             <td className="text-capitalize">{item.riskLevel||"low"}</td>
             <td>{item.isFlagged?"Yes":"No"}</td>
             <td>{item.followUpRequired?"Yes":"No"}</td>
             <td>{getCreatedByDisplay(item.createdBy)}</td>
             <td>
              <div className="d-flex gap-2">
               <Button type="button" variant="outline-primary" size="sm" onClick={()=>handleEditRow(item)}>
                <Pencil size={14} className="me-1"/> Edit
               </Button>
               {allowDelete&&<Button type="button" variant="outline-danger" size="sm" onClick={()=>handleOpenDeleteConfirm(item)}>
                <Trash2 size={14} className="me-1"/> Delete
               </Button>}
              </div>
             </td>
            </tr>
           ))}
          </tbody>
         </Table>
        </div>
       )):(
        <div className="text-muted">No notes found for this mentee.</div>
       )}
      </div>
     )}
    </Card.Body>
   </Card>
   <Modal show={showSubmitConfirm} onHide={()=>setShowSubmitConfirm(false)} centered>
    <Modal.Header closeButton>
     <Modal.Title>Confirm</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     {isEditMode?"Update this note?":"Save this note?"}
    </Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={()=>setShowSubmitConfirm(false)}>
      <XCircle size={16}/> Cancel
     </Button>
     <Button variant="primary" onClick={handleConfirmedSubmit}>
      <Save size={16}/> Confirm
     </Button>
    </Modal.Footer>
   </Modal>
   <Modal show={showDeleteConfirm} onHide={()=>{setShowDeleteConfirm(false);setDeleteTarget(null);}} centered>
    <Modal.Header closeButton>
     <Modal.Title>Delete Note</Modal.Title>
    </Modal.Header>
    <Modal.Body>Are you sure you want to delete this note?</Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={()=>{setShowDeleteConfirm(false);setDeleteTarget(null);}}>
      <XCircle size={16}/> Cancel
     </Button>
     <Button variant="danger" onClick={handleConfirmedDelete}>
      <Trash2 size={16}/> Delete
     </Button>
    </Modal.Footer>
   </Modal>
  </>
 );
}