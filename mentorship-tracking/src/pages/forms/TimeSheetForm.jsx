import {useMemo,useState,useEffect} from "react";
import {Form,Row,Col,Button,Card,Table,Modal,Alert} from "react-bootstrap";
import {Clock3,CalendarRange,FileText,CheckCircle2,Calculator,Save,Trash2,XCircle,User,Plus,Edit3,Eye} from "lucide-react";
import "../../styles/TimeSheetForm.css";

const dayKeys=["wednesday","thursday","friday","saturday","sunday","monday","tuesday"];
const dayLabels={
 wednesday:"Wednesday",
 thursday:"Thursday",
 friday:"Friday",
 saturday:"Saturday",
 sunday:"Sunday",
 monday:"Monday",
 tuesday:"Tuesday"
};

export default function TimeSheetForm({initialData={},onSubmit,onDelete,submitLabel,deleteLabel="Delete",mode="add",lockedMentee,currentUser,users=[],allowCreate=true,allowEdit=true,allowDelete=true}){
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

 const defaultCreatedBy=String(
  resolvedCurrentUser?._id||
  resolvedCurrentUser?.id||
  initialData.createdBy?._id||
  initialData.createdBy||
  ""
 );

 const initialSavedTimesheets=useMemo(()=>{
  if(Array.isArray(initialData.weeks)&&initialData.weeks.length){
   return initialData.weeks.map((week,index)=>buildWeek({
    id:week._id||week.id||`saved-${index+1}`,
    weekNumber:week.weekNumber||index+1,
    weekStarting:week.weekStarting?formatDateInput(week.weekStarting):"",
    weekEnding:week.weekEnding?formatDateInput(week.weekEnding):"",
    source:week.source||"portal",
    status:week.status||"pending",
    signedAt:week.signedAt?formatDateTimeLocal(week.signedAt):"",
    notes:week.notes||"",
    createdBy:String(week.createdBy?._id||week.createdBy||defaultCreatedBy),
    dailyHours:{
     wednesday:normalizeTimeValue(week.dailyHours?.wednesday),
     thursday:normalizeTimeValue(week.dailyHours?.thursday),
     friday:normalizeTimeValue(week.dailyHours?.friday),
     saturday:normalizeTimeValue(week.dailyHours?.saturday),
     sunday:normalizeTimeValue(week.dailyHours?.sunday),
     monday:normalizeTimeValue(week.dailyHours?.monday),
     tuesday:normalizeTimeValue(week.dailyHours?.tuesday)
    }
   }));
  }

  if(initialData._id||initialData.weekNumber||initialData.weekStarting){
   return [buildWeek({
    id:initialData._id||initialData.id||"saved-1",
    weekNumber:Number(initialData.weekNumber)||1,
    weekStarting:initialData.weekStarting?formatDateInput(initialData.weekStarting):"",
    weekEnding:initialData.weekEnding?formatDateInput(initialData.weekEnding):"",
    source:initialData.source||"portal",
    status:initialData.status||"pending",
    signedAt:initialData.signedAt?formatDateTimeLocal(initialData.signedAt):"",
    notes:initialData.notes||"",
    createdBy:String(initialData.createdBy?._id||initialData.createdBy||defaultCreatedBy),
    dailyHours:{
     wednesday:normalizeTimeValue(initialData.dailyHours?.wednesday),
     thursday:normalizeTimeValue(initialData.dailyHours?.thursday),
     friday:normalizeTimeValue(initialData.dailyHours?.friday),
     saturday:normalizeTimeValue(initialData.dailyHours?.saturday),
     sunday:normalizeTimeValue(initialData.dailyHours?.sunday),
     monday:normalizeTimeValue(initialData.dailyHours?.monday),
     tuesday:normalizeTimeValue(initialData.dailyHours?.tuesday)
    }
   })];
  }

  return [];
 },[initialData,defaultCreatedBy]);

 const [savedTimesheets,setSavedTimesheets]=useState(initialSavedTimesheets);
 const [week,setWeek]=useState(mode==="edit"?initialSavedTimesheets[0]||null:null);
 const [errors,setErrors]=useState({});
 const [loading,setLoading]=useState(false);
 const [alert,setAlert]=useState(null);
 const [showSubmitConfirm,setShowSubmitConfirm]=useState(false);
 const [showDeleteConfirm,setShowDeleteConfirm]=useState(false);
 const [deleteTarget,setDeleteTarget]=useState(null);
 const [viewTimesheet,setViewTimesheet]=useState(null);

 useEffect(()=>{
  setSavedTimesheets(initialSavedTimesheets);
  setWeek(mode==="edit"?initialSavedTimesheets[0]||null:null);
  setErrors({});
  setAlert(null);
 },[initialSavedTimesheets,mode]);

 const isEditMode=!!week?._id;
 const menteeName=useMemo(()=>{
  if(lockedMentee?.fullName) return lockedMentee.fullName;
  return `${lockedMentee?.firstName||""} ${lockedMentee?.lastName||""}`.trim();
 },[lockedMentee]);

 const requiredMinutes=toMinutes(lockedMentee?.hoursNeeded||initialData.hoursNeeded||0);

 const savedTotalMinutes=useMemo(()=>{
  return savedTimesheets.reduce((sum,item)=>sum+getWeekTotalMinutes(item),0);
 },[savedTimesheets]);

 const weeklyTotalMinutes=useMemo(()=>{
  return week?getWeekTotalMinutes(week):0;
 },[week]);

 const hoursLeftMinutes=useMemo(()=>{
  return Math.max(requiredMinutes-savedTotalMinutes,0);
 },[requiredMinutes,savedTotalMinutes]);

 function getUserDisplayName(user){
  return user?.fullName||user?.name||user?.username||user?.email||user?._id||"";
 }

 function handleWeekChange(field,value){
  setWeek(prev=>{
   if(!prev) return prev;
   const nextWeek={...prev,[field]:field==="createdBy"?String(value):value};
   if(field==="weekStarting"){
    nextWeek.weekEnding=value?getWeekEndingFromWednesday(value):"";
   }
   return nextWeek;
  });
  setErrors(prev=>({...prev,[field]:""}));
 }

 function handleDayChange(day,value){
  const normalized=normalizeTimeInput(value);
  setWeek(prev=>prev?{...prev,dailyHours:{...prev.dailyHours,[day]:normalized}}:prev);
  setErrors(prev=>({...prev,[day]:"",hours:""}));
 }

 function handleAddNewTimesheet(){
  setWeek(buildNextWeek(savedTimesheets,defaultCreatedBy));
  setErrors({});
  setAlert(null);
 }

 function handleEditTimesheet(timesheet){
  setWeek(buildWeek({
   id:timesheet._id||timesheet.id,
   weekNumber:timesheet.weekNumber,
   weekStarting:timesheet.weekStarting,
   weekEnding:timesheet.weekEnding,
   source:timesheet.source,
   status:timesheet.status,
   signedAt:timesheet.signedAt,
   notes:timesheet.notes,
   createdBy:timesheet.createdBy,
   dailyHours:timesheet.dailyHours
  }));

  setErrors({});
  setAlert(null);
 }

 function handleCancelTimesheet(){
  setWeek(null);
  setErrors({});
  setAlert(null);
 }

 function openDeleteTimesheet(timesheet){
  setDeleteTarget(timesheet);
  setShowDeleteConfirm(true);
 }

 async function handleConfirmedDelete(){
  if(!deleteTarget) return;

  try{
   setLoading(true);

   if(deleteTarget?._id&&typeof onDelete==="function"){
    await onDelete(deleteTarget._id,deleteTarget);
   }

   const nextSavedTimesheets=savedTimesheets.filter(item=>String(item._id||item.id)!==String(deleteTarget._id||deleteTarget.id));
   setSavedTimesheets(nextSavedTimesheets);

   if(week&&String(week._id||week.id)===String(deleteTarget._id||deleteTarget.id)){
    setWeek(null);
   }

   setAlert({variant:"success",message:"Timesheet deleted successfully."});
   setShowDeleteConfirm(false);
   setDeleteTarget(null);
  }catch(err){
   setAlert({variant:"danger",message:err?.message||"Timesheet could not be deleted."});
  }finally{
   setLoading(false);
  }
 }

 function validate(){
  const nextErrors={};

  if(!week) nextErrors.form="Click Add New Timesheet before saving.";
  if(!lockedMentee?._id) nextErrors.mentee="Mentee is required.";

  if(week){
   if(!week.weekStarting) nextErrors.weekStarting="Week start date is required.";
   if(week.weekStarting&&!isWednesday(week.weekStarting)) nextErrors.weekStarting="Week start must be a Wednesday.";
   if(week.weekStarting&&!week.weekEnding) nextErrors.weekEnding="Week ending is required.";
   if(week.weekStarting&&week.weekEnding&&week.weekEnding!==getWeekEndingFromWednesday(week.weekStarting)) nextErrors.weekEnding="Week ending must be Tuesday.";
   if(getWeekTotalMinutes(week)>2400) nextErrors.hours="User can't work over 40:00 hours per week.";
   if(week.status==="signed"&&!week.signedAt) nextErrors.signedAt="Signed date is required when status is signed.";
   if(!week.createdBy) nextErrors.createdBy="Created by is required.";

   const duplicateWeek=savedTimesheets.some(item=>{
    if(String(item._id||item.id)===String(week._id||week.id)) return false;
    return item.weekStarting===week.weekStarting;
   });

   if(duplicateWeek) nextErrors.weekStarting="A timesheet already exists for this week.";

   dayKeys.forEach(day=>{
    const value=week.dailyHours[day];
    if(value!==""&&!isValidTimeString(value)) nextErrors[day]="Use HH:MM format.";
    if(toMinutes(value)>1440) nextErrors[day]="Hours must be 24:00 or less.";
   });
  }

  setErrors(nextErrors);
  return Object.keys(nextErrors).length===0;
 }

 function handleOpenSubmitConfirm(e){
  e.preventDefault();
  if(!validate()) return;
  setShowSubmitConfirm(true);
 }

 async function handleConfirmedSubmit(){
  if(!week) return;

  const payload={
   _id:week._id||undefined,
   mentee:lockedMentee?._id,
   weekNumber:Number(week.weekNumber),
   weekStarting:week.weekStarting?new Date(`${week.weekStarting}T00:00:00`).toISOString():null,
   weekEnding:week.weekEnding?new Date(`${week.weekEnding}T23:59:59`).toISOString():null,
   hours:Number((getWeekTotalMinutes(week)/60).toFixed(4)),
   dailyHours:Object.fromEntries(dayKeys.map(day=>[day,Number((toMinutes(week.dailyHours[day])/60).toFixed(4))])),
   source:week.source,
   status:week.status,
   signedAt:week.signedAt?new Date(week.signedAt).toISOString():null,
   notes:week.notes.trim(),
   createdBy:week.createdBy
  };

  try{
   setLoading(true);
   const saved=await onSubmit?.(payload);

   const savedWeek=buildWeek({
    id:saved?._id||saved?.id||payload._id||`saved-${Date.now()}`,
    weekNumber:saved?.weekNumber||payload.weekNumber,
    weekStarting:saved?.weekStarting?formatDateInput(saved.weekStarting):week.weekStarting,
    weekEnding:saved?.weekEnding?formatDateInput(saved.weekEnding):week.weekEnding,
    source:saved?.source||payload.source,
    status:saved?.status||payload.status,
    signedAt:saved?.signedAt?formatDateTimeLocal(saved.signedAt):week.signedAt,
    notes:saved?.notes||payload.notes,
    createdBy:String(saved?.createdBy?._id||saved?.createdBy||payload.createdBy),
    dailyHours:{
     wednesday:normalizeTimeValue(saved?.dailyHours?.wednesday??payload.dailyHours.wednesday),
     thursday:normalizeTimeValue(saved?.dailyHours?.thursday??payload.dailyHours.thursday),
     friday:normalizeTimeValue(saved?.dailyHours?.friday??payload.dailyHours.friday),
     saturday:normalizeTimeValue(saved?.dailyHours?.saturday??payload.dailyHours.saturday),
     sunday:normalizeTimeValue(saved?.dailyHours?.sunday??payload.dailyHours.sunday),
     monday:normalizeTimeValue(saved?.dailyHours?.monday??payload.dailyHours.monday),
     tuesday:normalizeTimeValue(saved?.dailyHours?.tuesday??payload.dailyHours.tuesday)
    }
   });

   const nextSavedTimesheets=upsertTimesheet(savedTimesheets,savedWeek);
   setSavedTimesheets(nextSavedTimesheets);
   setWeek(null);
   setErrors({});
   setAlert({variant:"success",message:isEditMode?"Timesheet updated successfully.":"Timesheet saved successfully."});
   setShowSubmitConfirm(false);
  }catch(err){
   setAlert({variant:"danger",message:err?.message||"Timesheet could not be saved."});
  }finally{
   setLoading(false);
  }
 }

 return (
  <>
   <Card className="shadow-sm border-0 timesheet-form">
    <Card.Body>
     <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
      <div className="d-flex align-items-center gap-2">
       <Clock3 size={18} />
       <h5 className="mb-0">{week?(isEditMode?"Edit Timesheet":"Add Timesheet"):"Timesheets"}</h5>
      </div>

      {!week&&allowCreate&&(
       <Button type="button" variant="outline-dark" onClick={handleAddNewTimesheet} disabled={loading} className="d-inline-flex align-items-center gap-2">
        <Plus size={16} />
        <span>Add New Timesheet</span>
       </Button>
      )}
     </div>

     {alert&&(
      <Alert variant={alert.variant} dismissible onClose={()=>setAlert(null)} className="mb-4">
       {alert.message}
      </Alert>
     )}

     {errors.form&&(
      <Alert variant="warning" className="mb-4">
       {errors.form}
      </Alert>
     )}

     <Row className="g-3 mb-4 timesheet-summary">
      <Col md={3}>
       <Card className="border-0 bg-light h-100 timesheet-summary-item timesheet-summary-required">
        <Card.Body>
         <div className="d-flex align-items-center gap-2">
          <Calculator size={16} />
          <span className="timesheet-summary-label">Required Hours</span>
         </div>
         <div className="timesheet-summary-value">{minutesToTimeString(requiredMinutes)}</div>
        </Card.Body>
       </Card>
      </Col>

      <Col md={3}>
       <Card className="border-0 bg-light h-100 timesheet-summary-item timesheet-summary-count">
        <Card.Body>
         <div className="d-flex align-items-center gap-2">
          <FileText size={16}/>
          <span className="timesheet-summary-label">Saved Timesheets</span>
         </div>
         <div className="timesheet-summary-value">{savedTimesheets.length}</div>
        </Card.Body>
       </Card>
      </Col>

      <Col md={3}>
       <Card className="border-0 bg-light h-100 timesheet-summary-item timesheet-summary-saved">
        <Card.Body>
         <div className="d-flex align-items-center gap-2">
          <CheckCircle2 size={16}/>
          <span className="timesheet-summary-label">Saved Total</span>
         </div>
         <div className="timesheet-summary-value">{minutesToTimeString(savedTotalMinutes)}</div>
        </Card.Body>
       </Card>
      </Col>

      <Col md={3}>
       <Card className="border-0 bg-light h-100 timesheet-summary-item timesheet-summary-left">
        <Card.Body>
         <div className="d-flex align-items-center gap-2">
          <CalendarRange size={16}/>
          <span className="timesheet-summary-label">Hours Left</span>
         </div>
         <div className="timesheet-summary-value">{minutesToTimeString(hoursLeftMinutes)}</div>
        </Card.Body>
       </Card>
      </Col>
     </Row>

     {!week&&allowCreate&&(
      <Alert variant="info" className="mb-4">
       Click Add New Timesheet to enter the next week.
      </Alert>
     )}

     {week&&(
      <Form onSubmit={handleOpenSubmitConfirm}>
       <Row className="g-3 mb-4">
        <Col md={6}>
         <Form.Group controlId="mentee">
          <Form.Label className="d-flex align-items-center gap-2">
           <FileText size={16} />
           <span>Mentee</span>
          </Form.Label>
          <Form.Control type="text" value={menteeName} readOnly isInvalid={!!errors.mentee} />
          <Form.Control.Feedback type="invalid">{errors.mentee}</Form.Control.Feedback>
         </Form.Group>
        </Col>
       </Row>

       <Card className="border-0 bg-light mb-4">
        <Card.Body>
         <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
           <CalendarRange size={18} />
           <h5 className="mb-0">{`Week ${week.weekNumber}`}</h5>
          </div>

          <div className="d-flex align-items-center gap-2">
           <span className={`badge ${weeklyTotalMinutes>2400?"bg-danger":"bg-primary"}`}>{`${minutesToTimeString(weeklyTotalMinutes)} hrs`}</span>
           <span className={`badge ${hoursLeftMinutes===0?"bg-success":"bg-warning text-dark"}`}>{`Hours Left ${minutesToTimeString(hoursLeftMinutes)}`}</span>
          </div>
         </div>

         <Row className="g-3">
          <Col md={4}>
           <Form.Group controlId={`weekStarting-${week.id}`}>
            <Form.Label>Week Starting</Form.Label>
            <Form.Control type="date" name="weekStarting" value={week.weekStarting} onChange={e=>handleWeekChange("weekStarting",e.target.value)} isInvalid={!!errors.weekStarting} />
            <Form.Text className="text-muted">Must be Wednesday.</Form.Text>
            <Form.Control.Feedback type="invalid">{errors.weekStarting}</Form.Control.Feedback>
           </Form.Group>
          </Col>

          <Col md={4}>
           <Form.Group controlId={`weekEnding-${week.id}`}>
            <Form.Label>Week Ending</Form.Label>
            <Form.Control type="date" value={week.weekEnding} readOnly isInvalid={!!errors.weekEnding} />
            <Form.Text className="text-muted">Auto-calculated to Tuesday.</Form.Text>
            <Form.Control.Feedback type="invalid">{errors.weekEnding}</Form.Control.Feedback>
           </Form.Group>
          </Col>

          <Col md={4} className="d-flex align-items-end">
           <div className="w-100">
            <Form.Label>Week Summary</Form.Label>
            <div className="d-flex align-items-center gap-2">
             <span className="badge bg-dark">{`Week ${week.weekNumber}`}</span>
             <span className={`badge ${weeklyTotalMinutes>2400?"bg-danger":"bg-primary"}`}>{`${minutesToTimeString(weeklyTotalMinutes)} hrs`}</span>
            </div>
            {errors.hours&&<div className="text-danger small mt-2">{errors.hours}</div>}
           </div>
          </Col>

          <Col md={6}>
           <Form.Group controlId={`createdBy-${week.id}`}>
            <Form.Label className="d-flex align-items-center gap-2">
             <User size={16} />
             <span>Created By</span>
            </Form.Label>
            <Form.Select name="createdBy" value={String(week.createdBy||"")} onChange={e=>handleWeekChange("createdBy",e.target.value)} isInvalid={!!errors.createdBy}>
             <option value="">Select user</option>
             {normalizedUsers.map(user=>(
              <option key={String(user._id||user.id)} value={String(user._id||user.id)}>{getUserDisplayName(user)}</option>
             ))}
            </Form.Select>
            <Form.Text className="text-muted">Defaults to the current logged in user.</Form.Text>
            <Form.Control.Feedback type="invalid">{errors.createdBy}</Form.Control.Feedback>
           </Form.Group>
          </Col>

          <Col md={12}>
           <Card className="border-0 shadow-sm">
            <Card.Body>
             <div className="d-flex align-items-center gap-2 mb-3">
              <Clock3 size={16} />
              <h6 className="mb-0">Daily Hours</h6>
             </div>

             <Table responsive bordered hover className="mb-0 align-middle">
              <thead>
               <tr>
                {dayKeys.map(day=>(
                 <th key={day}>{dayLabels[day]}</th>
                ))}
                <th>Weekly Total</th>
               </tr>
              </thead>

              <tbody>
               <tr>
                {dayKeys.map(day=>(
                 <td key={day}>
                  <Form.Control type="text" name={day} placeholder="0:00" value={week.dailyHours[day]} onChange={e=>handleDayChange(day,e.target.value)} isInvalid={!!errors[day]} />
                  <Form.Control.Feedback type="invalid">{errors[day]}</Form.Control.Feedback>
                 </td>
                ))}
                <td className={errors.hours?"text-danger fw-semibold":"fw-semibold"}>{minutesToTimeString(weeklyTotalMinutes)}</td>
               </tr>
              </tbody>
             </Table>
            </Card.Body>
           </Card>
          </Col>

          <Col md={4}>
           <Form.Group controlId={`source-${week.id}`}>
            <Form.Label>Source</Form.Label>
            <Form.Select name="source" value={week.source} onChange={e=>handleWeekChange("source",e.target.value)}>
             <option value="portal">Portal</option>
             <option value="manual">Manual</option>
            </Form.Select>
           </Form.Group>
          </Col>

          <Col md={4}>
           <Form.Group controlId={`status-${week.id}`}>
            <Form.Label>Status</Form.Label>
            <Form.Select name="status" value={week.status} onChange={e=>handleWeekChange("status",e.target.value)}>
             <option value="pending">Pending</option>
             <option value="signed">Signed</option>
             <option value="rejected">Rejected</option>
            </Form.Select>
           </Form.Group>
          </Col>

          <Col md={4}>
           <Form.Group controlId={`signedAt-${week.id}`}>
            <Form.Label className="d-flex align-items-center gap-2">
             <CheckCircle2 size={16} />
             <span>Signed At</span>
            </Form.Label>
            <Form.Control type="datetime-local" name="signedAt" value={week.signedAt} onChange={e=>handleWeekChange("signedAt",e.target.value)} isInvalid={!!errors.signedAt} />
            <Form.Control.Feedback type="invalid">{errors.signedAt}</Form.Control.Feedback>
           </Form.Group>
          </Col>

          <Col md={12}>
           <Form.Group controlId={`notes-${week.id}`}>
            <Form.Label>Notes</Form.Label>
            <Form.Control as="textarea" rows={3} name="notes" value={week.notes} onChange={e=>handleWeekChange("notes",e.target.value)} />
           </Form.Group>
          </Col>
         </Row>
        </Card.Body>
       </Card>

       {weeklyTotalMinutes>2400&&(
        <Alert variant="warning" className="mb-4">
         User can't work over 40:00 hours per week.
        </Alert>
       )}

       <div className="d-flex justify-content-between">
        <Button type="button" variant="outline-secondary" onClick={handleCancelTimesheet} disabled={loading} className="d-inline-flex align-items-center gap-2">
         <XCircle size={16} />
         <span>Cancel</span>
        </Button>

        <Button type="submit" variant="primary" disabled={loading} className="d-inline-flex align-items-center gap-2">
         <Save size={16} />
         <span>{loading
          ?(submitLabel||(isEditMode?"Updating...":"Saving..."))
          :(submitLabel||(isEditMode?"Update Timesheet":"Save Timesheet"))}
         </span>
        </Button>
       </div>
      </Form>
     )}
    </Card.Body>
   </Card>

   <Card className="shadow-sm border-0 mt-4">
    <Card.Body>
     <div className="d-flex align-items-center gap-2 mb-3">
      <FileText size={18} />
      <h5 className="mb-0">Saved Timesheets</h5>
     </div>

     {savedTimesheets.length===0?(
      <Alert variant="info" className="mb-0">
       No timesheets saved yet.
      </Alert>
     ):(
      <Table responsive bordered hover className="mb-0 align-middle">
       <thead>
        <tr>
         <th>Week</th>
         <th>Week Starting</th>
         <th>Week Ending</th>
         {dayKeys.map(day=>(
          <th key={day}>{dayLabels[day]}</th>
         ))}
         <th>Total</th>
         <th>Status</th>
         <th>Actions</th>
        </tr>
       </thead>

       <tbody>
        {savedTimesheets.map(timesheet=>(
         <tr key={String(timesheet._id||timesheet.id)}>
          <td>{timesheet.weekNumber}</td>
          <td>{formatDisplayDate(timesheet.weekStarting)}</td>
          <td>{formatDisplayDate(timesheet.weekEnding)}</td>
          {dayKeys.map(day=>(
           <td key={day}>{timesheet.dailyHours?.[day]||"0:00"}</td>
          ))}
          <td className="fw-semibold">{minutesToTimeString(getWeekTotalMinutes(timesheet))}</td>
          <td>
           <span className={`app-status-badge status-${String(timesheet.status||"pending").toLowerCase()}`}>
            {timesheet.status}
           </span>
          </td>
          <td>
           <div className="d-flex gap-2">
            <Button type="button" variant="outline-secondary" size="sm" onClick={()=>setViewTimesheet(timesheet)} className="d-inline-flex align-items-center gap-2">
             <Eye size={14} />
             <span>View</span>
            </Button>
            {allowEdit&&<Button type="button" variant="outline-primary" size="sm" onClick={()=>handleEditTimesheet(timesheet)} className="d-inline-flex align-items-center gap-2">
             <Edit3 size={14} />
             <span>Edit</span>
            </Button>}
            {allowDelete&&<Button type="button" variant="outline-danger" size="sm" onClick={()=>openDeleteTimesheet(timesheet)} className="d-inline-flex align-items-center gap-2">
             <Trash2 size={14} />
             <span>{deleteLabel}</span>
            </Button>}
           </div>
          </td>
         </tr>
        ))}
       </tbody>
      </Table>
     )}
    </Card.Body>
   </Card>

   <Modal show={!!viewTimesheet} onHide={()=>setViewTimesheet(null)} size="lg" centered>
    <Modal.Header closeButton>
     <Modal.Title>Timesheet Details</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     {viewTimesheet&&(
      <>
       <Row className="g-3 mb-4">
        <Col sm={6}><strong>Week:</strong><div>{viewTimesheet.weekNumber}</div></Col>
        <Col sm={6}><strong>Status:</strong><div className="text-capitalize">{viewTimesheet.status||"pending"}</div></Col>
        <Col sm={6}><strong>Week Starting:</strong><div>{formatDisplayDate(viewTimesheet.weekStarting)}</div></Col>
        <Col sm={6}><strong>Week Ending:</strong><div>{formatDisplayDate(viewTimesheet.weekEnding)}</div></Col>
        <Col sm={6}><strong>Total Hours:</strong><div>{minutesToTimeString(getWeekTotalMinutes(viewTimesheet))}</div></Col>
        <Col sm={6}><strong>Source:</strong><div className="text-capitalize">{viewTimesheet.source||"portal"}</div></Col>
       </Row>
       <Table responsive bordered className="mb-4 align-middle">
        <thead><tr>{dayKeys.map(day=><th key={day}>{dayLabels[day]}</th>)}</tr></thead>
        <tbody><tr>{dayKeys.map(day=><td key={day}>{normalizeTimeValue(viewTimesheet.dailyHours?.[day])||"0:00"}</td>)}</tr></tbody>
       </Table>
       <strong>Notes:</strong>
       <div className="mt-1">{viewTimesheet.notes||"No notes."}</div>
      </>
     )}
    </Modal.Body>
    <Modal.Footer>
     <Button type="button" variant="secondary" onClick={()=>setViewTimesheet(null)}>Close</Button>
    </Modal.Footer>
   </Modal>

   <Modal show={showSubmitConfirm} onHide={()=>setShowSubmitConfirm(false)} centered>
    <Modal.Header closeButton>
     <Modal.Title>{isEditMode?"Confirm Update":"Confirm Save"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     {isEditMode?"Are you sure you want to update this timesheet?":"Are you sure you want to save this timesheet?"}
    </Modal.Body>
    <Modal.Footer>
     <Button type="button" variant="secondary" onClick={()=>setShowSubmitConfirm(false)} disabled={loading} className="d-inline-flex align-items-center gap-2">
      <XCircle size={16} />
      <span>Cancel</span>
     </Button>
     <Button type="button" variant="primary" onClick={handleConfirmedSubmit} disabled={loading} className="d-inline-flex align-items-center gap-2">
      <Save size={16} />
      <span>{isEditMode?"Yes, Update":"Yes, Save"}</span>
     </Button>
    </Modal.Footer>
   </Modal>

   <Modal show={showDeleteConfirm} onHide={()=>setShowDeleteConfirm(false)} centered>
    <Modal.Header closeButton>
     <Modal.Title>Confirm Delete</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     Are you sure you want to delete this timesheet?
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

function buildWeek({id,weekNumber,weekStarting,weekEnding,source,status,signedAt,notes,createdBy,dailyHours}){
 return{
  _id:String(id).startsWith("week-")||String(id).startsWith("saved-")?null:id,
  id:String(id),
  weekNumber:Number(weekNumber)||1,
  weekStarting:weekStarting||"",
  weekEnding:weekEnding||"",
  source:source||"portal",
  status:status||"pending",
  signedAt:signedAt||"",
  notes:notes||"",
  createdBy:String(createdBy||""),
  dailyHours:{
   wednesday:normalizeTimeValue(dailyHours?.wednesday),
   thursday:normalizeTimeValue(dailyHours?.thursday),
   friday:normalizeTimeValue(dailyHours?.friday),
   saturday:normalizeTimeValue(dailyHours?.saturday),
   sunday:normalizeTimeValue(dailyHours?.sunday),
   monday:normalizeTimeValue(dailyHours?.monday),
   tuesday:normalizeTimeValue(dailyHours?.tuesday)
  }
 };
}
function buildNextWeek(savedTimesheets,defaultCreatedBy){
 const savedList=Array.isArray(savedTimesheets)?savedTimesheets.filter(Boolean):[];
 const usedWeekNumbers=new Set(savedList.map(item=>Number(item?.weekNumber)).filter(number=>number>0));
 let nextWeekNumber=1;
 while(usedWeekNumbers.has(nextWeekNumber)) nextWeekNumber+=1;

 const datedReference=savedList.find(item=>{
  const referenceWeek=Number(item?.weekNumber);
  if(!referenceWeek||!item?.weekStarting) return false;
  return !Number.isNaN(new Date(`${item.weekStarting}T00:00:00`).getTime());
 });
 const nextStart=datedReference
  ?addDays(new Date(`${datedReference.weekStarting}T00:00:00`),(nextWeekNumber-Number(datedReference.weekNumber))*7)
  :null;

 return buildWeek({
  id:`week-${Date.now()}`,
  weekNumber:nextWeekNumber,
  weekStarting:nextStart?formatDateInput(nextStart):"",
  weekEnding:nextStart?formatDateInput(addDays(nextStart,6)):"",
  source:"portal",
  status:"pending",
  signedAt:"",
  notes:"",
  createdBy:defaultCreatedBy,
  dailyHours:{
   wednesday:"",
   thursday:"",
   friday:"",
   saturday:"",
   sunday:"",
   monday:"",
   tuesday:""
  }
 });
}

function upsertTimesheet(savedTimesheets,savedWeek){
 const exists=savedTimesheets.some(item=>String(item._id||item.id)===String(savedWeek._id||savedWeek.id));
 const nextList=exists?savedTimesheets.map(item=>String(item._id||item.id)===String(savedWeek._id||savedWeek.id)?savedWeek:item):[...savedTimesheets,savedWeek];

 return nextList.sort((a,b)=>{
  const aWeek=Number(a.weekNumber)||0;
  const bWeek=Number(b.weekNumber)||0;
  return aWeek-bWeek;
 });
}

function getWeekTotalMinutes(week){
 return dayKeys.reduce((sum,day)=>sum+toMinutes(week.dailyHours?.[day]),0);
}

function normalizeTimeValue(value){
 if(value==null||value==="") return "";
 if(typeof value==="string"){
  const trimmed=value.trim();
  if(trimmed==="") return "";
  if(trimmed.includes(":")) return normalizeTimeInput(trimmed);
  if(!Number.isNaN(Number(trimmed))) return minutesToTimeString(toMinutes(Number(trimmed)));
  return "";
 }
 if(typeof value==="number") return minutesToTimeString(toMinutes(value));
 return "";
}

function normalizeTimeInput(value){
 if(value==null) return "";
 let clean=String(value).replace(/[^\d:]/g,"");
 if(clean==="") return "";
 if(clean.includes(":")){
  const [hPart="",mPart=""]=clean.split(":");
  const hours=hPart===""?"0":String(Number(hPart));
  const minutes=mPart===""?"":mPart.slice(0,2);
  return minutes===""?`${hours}:`:`${hours}:${minutes.padStart(2,"0")}`;
 }
 if(clean.length<=2) return clean;
 const hours=clean.slice(0,-2);
 const minutes=clean.slice(-2);
 return `${String(Number(hours)||0)}:${minutes}`;
}

function isValidTimeString(value){
 if(value==null||value==="") return true;
 return /^\d{1,2}:\d{2}$/.test(String(value).trim());
}

function toMinutes(value){
 if(value==null||value==="") return 0;
 if(typeof value==="number"){
  const hours=Math.trunc(value);
  const fractional=value-hours;
  if(fractional===0) return hours*60;
  return Math.round(value*60);
 }
 const raw=String(value).trim();
 if(raw==="") return 0;
 if(raw.includes(":")){
  const [hoursStr="0",minutesStr="0"]=raw.split(":");
  const hours=Number(hoursStr)||0;
  const minutes=Number(minutesStr)||0;
  return hours*60+minutes;
 }
 const numeric=Number(raw);
 if(Number.isNaN(numeric)) return 0;
 return Math.round(numeric*60);
}

function minutesToTimeString(totalMinutes){
 const safe=Math.max(Number(totalMinutes)||0,0);
 const hours=Math.floor(safe/60);
 const minutes=safe%60;
 return `${hours}:${String(minutes).padStart(2,"0")}`;
}

function formatDateInput(value){
 const date=new Date(value);
 if(Number.isNaN(date.getTime())) return "";
 const offset=date.getTimezoneOffset();
 const local=new Date(date.getTime()-offset*60000);
 return local.toISOString().slice(0,10);
}

function formatDateTimeLocal(value){
 const date=new Date(value);
 if(Number.isNaN(date.getTime())) return "";
 const offset=date.getTimezoneOffset();
 const local=new Date(date.getTime()-offset*60000);
 return local.toISOString().slice(0,16);
}

function formatDisplayDate(value){
 if(!value) return "";
 const date=new Date(`${formatDateInput(value)}T00:00:00`);
 if(Number.isNaN(date.getTime())) return "";
 return date.toLocaleDateString();
}

function isWednesday(value){
 const date=new Date(`${value}T00:00:00`);
 return date.getDay()===3;
}

function getWeekEndingFromWednesday(value){
 const date=new Date(`${value}T00:00:00`);
 if(Number.isNaN(date.getTime())) return "";
 const end=new Date(date);
 end.setDate(end.getDate()+6);
 return formatDateInput(end);
}

function addDays(value,days){
 const date=new Date(value);
 if(Number.isNaN(date.getTime())) return null;
 const next=new Date(date);
 next.setDate(next.getDate()+days);
 return next;
}
