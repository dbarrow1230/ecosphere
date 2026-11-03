import Alert from "../../components/AppAlert.jsx";
import {useMemo,useState,useEffect} from "react";
import {Form,Row,Col,Button,Card,Table,Modal} from "react-bootstrap";
import {Clock3,CalendarRange,FileText,CheckCircle2,Calculator,Save,Trash2,XCircle,User,Plus} from "lucide-react";

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

export default function TimeSheetForm({initialData={},onSubmit,onDelete,submitLabel,deleteLabel="Delete",mode="add",lockedMentee,currentUser,users=[]}){
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

 const initialWeeks=useMemo(()=>{
  if(Array.isArray(initialData.weeks)&&initialData.weeks.length){
   return initialData.weeks.map((week,index)=>buildWeek({
    id:week._id||`week-${index+1}`,
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
    id:initialData._id||"week-1",
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

  return [buildWeek({
   id:"week-1",
   weekNumber:1,
   weekStarting:"",
   weekEnding:"",
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
  })];
 },[initialData,defaultCreatedBy]);

 const [weeks,setWeeks]=useState(initialWeeks);
 const [errors,setErrors]=useState({});
 const [loading,setLoading]=useState(false);
 const [showSubmitConfirm,setShowSubmitConfirm]=useState(false);
 const [showDeleteConfirm,setShowDeleteConfirm]=useState(false);
 const [deleteTarget,setDeleteTarget]=useState(null);

 useEffect(()=>{
  setWeeks(initialWeeks);
 },[initialWeeks]);

 useEffect(()=>{
  if(!defaultCreatedBy) return;
  setWeeks(prev=>prev.map(week=>({
   ...week,
   createdBy:String(week.createdBy||defaultCreatedBy)
  })));
 },[defaultCreatedBy]);

 const isEditMode=mode==="edit"||!!initialData._id;
 const menteeName=useMemo(()=>{
  if(lockedMentee?.fullName) return lockedMentee.fullName;
  return `${lockedMentee?.firstName||""} ${lockedMentee?.lastName||""}`.trim();
 },[lockedMentee]);

 const requiredMinutes=toMinutes(lockedMentee?.hoursNeeded||initialData.hoursNeeded||0);

 const totals=useMemo(()=>{
  let running=0;
  return weeks.map(week=>{
   const weeklyTotalMinutes=getWeekTotalMinutes(week);
   running+=weeklyTotalMinutes;
   return{
    id:week.id,
    weeklyTotalMinutes,
    runningTotalMinutes:running,
    remainingMinutes:Math.max(requiredMinutes-running,0)
   };
  });
 },[weeks,requiredMinutes]);

 const overallTotalMinutes=useMemo(()=>{
  return totals.length?totals[totals.length-1].runningTotalMinutes:0;
 },[totals]);

 const hoursLeftMinutes=useMemo(()=>{
  return Math.max(requiredMinutes-overallTotalMinutes,0);
 },[requiredMinutes,overallTotalMinutes]);

 function getUserDisplayName(user){
  return user?.fullName||user?.name||user?.username||user?.email||user?._id||"";
 }

 function handleWeekChange(index,field,value){
  setWeeks(prev=>prev.map((week,i)=>{
   if(i!==index) return week;
   const nextWeek={...week,[field]:field==="createdBy"?String(value):value};
   if(field==="weekStarting"){
    nextWeek.weekEnding=value?getWeekEndingFromWednesday(value):"";
   }
   return nextWeek;
  }));
  setErrors(prev=>({...prev,[`${index}-${field}`]:""}));
 }

 function handleDayChange(index,day,value){
  const normalized=normalizeTimeInput(value);
  setWeeks(prev=>prev.map((week,i)=>{
   if(i!==index) return week;
   return {...week,dailyHours:{...week.dailyHours,[day]:normalized}};
  }));
  setErrors(prev=>({...prev,[`${index}-${day}`]:"",[`${index}-hours`]:""}));
 }

 function canAddNextWeek(){
  if(!weeks.length) return true;
  const lastWeek=weeks[weeks.length-1];
  return isWeekReadyForNext(lastWeek);
 }

 function handleAddWeek(){
  const nextErrors={...errors};
  const lastIndex=weeks.length-1;
  const lastWeek=weeks[lastIndex];

  if(!isWeekReadyForNext(lastWeek)){
   if(!lastWeek.weekStarting) nextErrors[`${lastIndex}-weekStarting`]="Start date is required before adding a new week.";
   if(!lastWeek.weekEnding) nextErrors[`${lastIndex}-weekEnding`]="End date is required before adding a new week.";
   if(getWeekTotalMinutes(lastWeek)>2400) nextErrors[`${lastIndex}-hours`]="User can't work over 40:00 hours per week.";
   setErrors(nextErrors);
   return;
  }

  const nextStart=addDays(new Date(`${lastWeek.weekStarting}T00:00:00`),7);
  const nextWeekNumber=weeks.length+1;

  setWeeks(prev=>[
   ...prev,
   buildWeek({
    id:`week-${Date.now()}`,
    weekNumber:nextWeekNumber,
    weekStarting:formatDateInput(nextStart),
    weekEnding:formatDateInput(addDays(nextStart,6)),
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
   })
  ]);
 }

 function openDeleteWeek(index){
  setDeleteTarget(index);
  setShowDeleteConfirm(true);
 }

 async function handleConfirmedDelete(){
  if(deleteTarget==null) return;
  const targetWeek=weeks[deleteTarget];

  if(targetWeek?._id&&typeof onDelete==="function"&&weeks.length===1&&isEditMode){
   try{
    setLoading(true);
    await onDelete(targetWeek._id,targetWeek);
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
   }finally{
    setLoading(false);
   }
   return;
  }

  setWeeks(prev=>prev.filter((_,i)=>i!==deleteTarget).map((week,i)=>({...week,weekNumber:i+1})));
  setShowDeleteConfirm(false);
  setDeleteTarget(null);
 }

 function validate(){
  const nextErrors={};

  if(!lockedMentee?._id) nextErrors.mentee="Mentee is required.";

  weeks.forEach((week,index)=>{
   if(!week.weekStarting) nextErrors[`${index}-weekStarting`]="Week start date is required.";
   if(week.weekStarting&&!isWednesday(week.weekStarting)) nextErrors[`${index}-weekStarting`]="Week start must be a Wednesday.";
   if(week.weekStarting&&!week.weekEnding) nextErrors[`${index}-weekEnding`]="Week ending is required.";
   if(week.weekStarting&&week.weekEnding&&week.weekEnding!==getWeekEndingFromWednesday(week.weekStarting)) nextErrors[`${index}-weekEnding`]="Week ending must be Tuesday.";
   if(getWeekTotalMinutes(week)>2400) nextErrors[`${index}-hours`]="User can't work over 40:00 hours per week.";
   if(week.status==="signed"&&!week.signedAt) nextErrors[`${index}-signedAt`]="Signed date is required when status is signed.";
   if(!week.createdBy) nextErrors[`${index}-createdBy`]="Created by is required.";

   dayKeys.forEach(day=>{
    const value=week.dailyHours[day];
    if(value!==""&&!isValidTimeString(value)) nextErrors[`${index}-${day}`]="Use HH:MM format.";
    if(toMinutes(value)>1440) nextErrors[`${index}-${day}`]="Hours must be 24:00 or less.";
   });

   if(index<weeks.length-1&&!isWeekReadyForNext(week)){
    nextErrors[`${index}-weekStarting`]=nextErrors[`${index}-weekStarting`]||"Complete this week before adding another week.";
   }
  });

  setErrors(nextErrors);
  return Object.keys(nextErrors).length===0;
 }

 function handleOpenSubmitConfirm(e){
  e.preventDefault();
  if(!validate()) return;
  setShowSubmitConfirm(true);
 }

 async function handleConfirmedSubmit(){
  const currentWeek=weeks[weeks.length-1];

  const payload={
   _id:currentWeek._id||undefined,
   mentee:lockedMentee?._id,
   weekNumber:Number(currentWeek.weekNumber),
   weekStarting:currentWeek.weekStarting?new Date(`${currentWeek.weekStarting}T00:00:00`).toISOString():null,
   weekEnding:currentWeek.weekEnding?new Date(`${currentWeek.weekEnding}T23:59:59`).toISOString():null,
   hours:Number((getWeekTotalMinutes(currentWeek)/60).toFixed(4)),
   dailyHours:Object.fromEntries(dayKeys.map(day=>[day,Number((toMinutes(currentWeek.dailyHours[day])/60).toFixed(4))])),
   source:currentWeek.source,
   status:currentWeek.status,
   signedAt:currentWeek.signedAt?new Date(currentWeek.signedAt).toISOString():null,
   notes:currentWeek.notes.trim(),
   createdBy:currentWeek.createdBy
  };

  try{
   setLoading(true);
   await onSubmit?.(payload);
   setShowSubmitConfirm(false);
  }finally{
   setLoading(false);
  }
 }

 return (
  <>
   <Card className="shadow-sm border-0">
    <Card.Body>
     <div className="d-flex align-items-center gap-2 mb-3">
      <Clock3 size={18} />
      <h5 className="mb-0">{isEditMode?"Edit Timesheets":"Add Timesheets"}</h5>
     </div>

     <Row className="g-3 mb-4">
      <Col md={3}>
       <Card className="border-0 bg-light h-100">
        <Card.Body className="py-3">
         <div className="d-flex align-items-center gap-2 mb-2">
          <Calculator size={16} />
          <small className="text-muted">Required Hours</small>
         </div>
         <div className="fw-semibold fs-5">{minutesToTimeString(requiredMinutes)}</div>
        </Card.Body>
       </Card>
      </Col>

      <Col md={3}>
       <Card className="border-0 bg-light h-100">
        <Card.Body className="py-3">
         <small className="text-muted d-block mb-2">Weeks Added</small>
         <div className="fw-semibold fs-5">{weeks.length}</div>
        </Card.Body>
       </Card>
      </Col>

      <Col md={3}>
       <Card className="border-0 bg-light h-100">
        <Card.Body className="py-3">
         <small className="text-muted d-block mb-2">Running Total</small>
         <div className="fw-semibold fs-5">{minutesToTimeString(overallTotalMinutes)}</div>
        </Card.Body>
       </Card>
      </Col>

      <Col md={3}>
       <Card className="border-0 bg-light h-100">
        <Card.Body className="py-3">
         <small className="text-muted d-block mb-2">Hours Left</small>
         <div className="fw-semibold fs-5">{minutesToTimeString(hoursLeftMinutes)}</div>
        </Card.Body>
       </Card>
      </Col>
     </Row>

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

      {weeks.map((week,index)=>{
       const totalInfo=totals.find(item=>item.id===week.id)||{weeklyTotalMinutes:0,runningTotalMinutes:0,remainingMinutes:requiredMinutes};
       return(
        <Card key={week.id} className="border-0 bg-light mb-4">
         <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
           <div className="d-flex align-items-center gap-2">
            <CalendarRange size={18} />
            <h5 className="mb-0">{`Week ${week.weekNumber}`}</h5>
           </div>

           <div className="d-flex align-items-center gap-2">
            <span className="badge bg-secondary">{`Running Total ${minutesToTimeString(totalInfo.runningTotalMinutes)}`}</span>
            <span className={`badge ${totalInfo.remainingMinutes===0?"bg-success":"bg-warning text-dark"}`}>{`Hours Left ${minutesToTimeString(totalInfo.remainingMinutes)}`}</span>
            {weeks.length>1&&(
             <Button type="button" variant="outline-danger" size="sm" onClick={()=>openDeleteWeek(index)} className="d-inline-flex align-items-center gap-2">
              <Trash2 size={14} />
              <span>{deleteLabel}</span>
             </Button>
            )}
           </div>
          </div>

          <Row className="g-3">
           <Col md={4}>
            <Form.Group controlId={`weekStarting-${week.id}`}>
             <Form.Label>Week Starting</Form.Label>
             <Form.Control type="date" name="weekStarting" value={week.weekStarting} onChange={e=>handleWeekChange(index,"weekStarting",e.target.value)} isInvalid={!!errors[`${index}-weekStarting`]} />
             <Form.Text className="text-muted">Must be Wednesday.</Form.Text>
             <Form.Control.Feedback type="invalid">{errors[`${index}-weekStarting`]}</Form.Control.Feedback>
            </Form.Group>
           </Col>

           <Col md={4}>
            <Form.Group controlId={`weekEnding-${week.id}`}>
             <Form.Label>Week Ending</Form.Label>
             <Form.Control type="date" value={week.weekEnding} readOnly isInvalid={!!errors[`${index}-weekEnding`]} />
             <Form.Text className="text-muted">Auto-calculated to Tuesday.</Form.Text>
             <Form.Control.Feedback type="invalid">{errors[`${index}-weekEnding`]}</Form.Control.Feedback>
            </Form.Group>
           </Col>

           <Col md={4} className="d-flex align-items-end">
            <div className="w-100">
             <Form.Label>Week Summary</Form.Label>
             <div className="d-flex align-items-center gap-2">
              <span className="badge bg-dark">{`Week ${week.weekNumber}`}</span>
              <span className={`badge ${totalInfo.weeklyTotalMinutes>2400?"bg-danger":"bg-primary"}`}>{`${minutesToTimeString(totalInfo.weeklyTotalMinutes)} hrs`}</span>
             </div>
             {errors[`${index}-hours`]&&<div className="text-danger small mt-2">{errors[`${index}-hours`]}</div>}
            </div>
           </Col>

           <Col md={6}>
            <Form.Group controlId={`createdBy-${week.id}`}>
             <Form.Label className="d-flex align-items-center gap-2">
              <User size={16} />
              <span>Created By</span>
             </Form.Label>
             <Form.Select name="createdBy" value={String(week.createdBy||"")} onChange={e=>handleWeekChange(index,"createdBy",e.target.value)} isInvalid={!!errors[`${index}-createdBy`]}>
              <option value="">Select user</option>
              {normalizedUsers.map(user=>(
               <option key={String(user._id||user.id)} value={String(user._id||user.id)}>{getUserDisplayName(user)}</option>
              ))}
             </Form.Select>
             <Form.Text className="text-muted">Defaults to the current logged in user.</Form.Text>
             <Form.Control.Feedback type="invalid">{errors[`${index}-createdBy`]}</Form.Control.Feedback>
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
                   <Form.Control type="text" name={day} placeholder="0:00" value={week.dailyHours[day]} onChange={e=>handleDayChange(index,day,e.target.value)} isInvalid={!!errors[`${index}-${day}`]} />
                   <Form.Control.Feedback type="invalid">{errors[`${index}-${day}`]}</Form.Control.Feedback>
                  </td>
                 ))}
                 <td className={errors[`${index}-hours`]?"text-danger fw-semibold":"fw-semibold"}>{minutesToTimeString(totalInfo.weeklyTotalMinutes)}</td>
                </tr>
               </tbody>
              </Table>
             </Card.Body>
            </Card>
           </Col>

           <Col md={4}>
            <Form.Group controlId={`source-${week.id}`}>
             <Form.Label>Source</Form.Label>
             <Form.Select name="source" value={week.source} onChange={e=>handleWeekChange(index,"source",e.target.value)}>
              <option value="portal">Portal</option>
              <option value="manual">Manual</option>
             </Form.Select>
            </Form.Group>
           </Col>

           <Col md={4}>
            <Form.Group controlId={`status-${week.id}`}>
             <Form.Label>Status</Form.Label>
             <Form.Select name="status" value={week.status} onChange={e=>handleWeekChange(index,"status",e.target.value)}>
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
             <Form.Control type="datetime-local" name="signedAt" value={week.signedAt} onChange={e=>handleWeekChange(index,"signedAt",e.target.value)} isInvalid={!!errors[`${index}-signedAt`]} />
             <Form.Control.Feedback type="invalid">{errors[`${index}-signedAt`]}</Form.Control.Feedback>
            </Form.Group>
           </Col>

           <Col md={12}>
            <Form.Group controlId={`notes-${week.id}`}>
             <Form.Label>Notes</Form.Label>
             <Form.Control as="textarea" rows={3} name="notes" value={week.notes} onChange={e=>handleWeekChange(index,"notes",e.target.value)} />
            </Form.Group>
           </Col>
          </Row>
         </Card.Body>
        </Card>
       );
      })}

      {!canAddNextWeek()&&(
       <Alert variant="warning" className="mb-4">
        Complete the current week first before adding a new week.
       </Alert>
      )}

      <div className="d-flex justify-content-between">
       <Button type="button" variant="outline-dark" onClick={handleAddWeek} disabled={!canAddNextWeek()||loading} className="d-inline-flex align-items-center gap-2">
        <Plus size={16} />
        <span>Add Week</span>
       </Button>

       <Button type="submit" variant="primary" disabled={loading} className="d-inline-flex align-items-center gap-2">
        <Save size={16} />
        <span>{loading?(submitLabel||"Saving..."):(submitLabel||"Save Timesheets")}</span>
       </Button>
      </div>
     </Form>
    </Card.Body>
   </Card>

   <Modal show={showSubmitConfirm} onHide={()=>setShowSubmitConfirm(false)} centered>
    <Modal.Header closeButton>
     <Modal.Title>{isEditMode?"Confirm Update":"Confirm Save"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     {isEditMode?"Are you sure you want to save these timesheet changes?":"Are you sure you want to save these timesheets?"}
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
     Are you sure you want to delete this week?
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
  _id:String(id).startsWith("week-")?null:id,
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

function getWeekTotalMinutes(week){
 return dayKeys.reduce((sum,day)=>sum+toMinutes(week.dailyHours?.[day]),0);
}

function isWeekReadyForNext(week){
 if(!week?.weekStarting) return false;
 if(!isWednesday(week.weekStarting)) return false;
 if(!week?.weekEnding) return false;
 if(week.weekEnding!==getWeekEndingFromWednesday(week.weekStarting)) return false;
 if(getWeekTotalMinutes(week)>2400) return false;
 if(dayKeys.some(day=>week.dailyHours?.[day]!==""&&!isValidTimeString(week.dailyHours?.[day]))) return false;
 if(!week?.createdBy) return false;
 return true;
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