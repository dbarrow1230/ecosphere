import {useCallback,useEffect,useState} from "react";
import {Alert,Badge,Button,ButtonGroup,Card,Col,Container,Modal,Row,Spinner,Table} from "react-bootstrap";
import BackupForm from "../components/BackupForm";
import BackupScheduleForm from "../components/BackupScheduleForm";
import "../styles/BackupPage.css";

const BACKUP_ENDPOINT="/api/backup-logs";
const SCHEDULE_ENDPOINT="/api/backup-schedules";

const BackupPage=({user})=>{
 const [backupLogs,setBackupLogs]=useState([]);
 const [schedules,setSchedules]=useState([]);
 const [defaultBackupLocation,setDefaultBackupLocation]=useState("");
 const [loading,setLoading]=useState(true);
 const [schedulesLoading,setSchedulesLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [downloadingId,setDownloadingId]=useState("");
 const [workingAction,setWorkingAction]=useState({type:"",id:""});
 const [confirmation,setConfirmation]=useState({type:"",backup:null});
 const [scheduleModal,setScheduleModal]=useState({show:false,schedule:null});
 const [scheduleDeleteTarget,setScheduleDeleteTarget]=useState(null);
 const [scheduleSaving,setScheduleSaving]=useState(false);
 const [scheduleAction,setScheduleAction]=useState({type:"",id:""});
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");

 const userId=String(
  user?._id?.$oid||
  user?._id||
  user?.id?.$oid||
  user?.id||
  ""
 ).trim();

 const normalizeBackupLogs=data=>{
  if(Array.isArray(data))return data;
  if(Array.isArray(data?.data))return data.data;
  if(Array.isArray(data?.backups))return data.backups;
  if(Array.isArray(data?.backupLogs))return data.backupLogs;

  return [];
 };

 const normalizeSchedules=data=>Array.isArray(data?.data)?data.data:Array.isArray(data)?data:[];

 const loadBackupLogs=useCallback(async()=>{
  if(!userId){
   setBackupLogs([]);
   setLoading(false);
   setError("A valid user ID is required.");
   return;
  }

  setLoading(true);
  setError("");

  try{
   const response=await fetch(
    `${BACKUP_ENDPOINT}?userId=${encodeURIComponent(userId)}`,
    {
     credentials:"include"
    }
   );

   const data=await response.json();

   if(!response.ok){
    throw new Error(data?.message||"Unable to load backup history.");
   }

   setBackupLogs(normalizeBackupLogs(data));
  }catch(requestError){
   setError(requestError.message);
  }finally{
   setLoading(false);
  }
 },[userId]);

 const loadSchedules=useCallback(async()=>{
  if(!userId){
   setSchedules([]);
   setSchedulesLoading(false);
   return;
  }

  setSchedulesLoading(true);
  try{
   const response=await fetch(`${SCHEDULE_ENDPOINT}?userId=${encodeURIComponent(userId)}`,{credentials:"include"});
   const data=await response.json();
   if(!response.ok)throw new Error(data?.message||"Unable to load automatic backups.");
   setSchedules(normalizeSchedules(data));
  }catch(requestError){
   setError(requestError.message);
  }finally{
   setSchedulesLoading(false);
  }
 },[userId]);

 const loadBackupConfiguration=useCallback(async()=>{
  if(!userId)return;
  try{
   const response=await fetch(`${BACKUP_ENDPOINT}/configuration?userId=${encodeURIComponent(userId)}`,{credentials:"include"});
   const data=await response.json();
   if(!response.ok)throw new Error(data?.message||"Unable to load the backup location.");
   setDefaultBackupLocation(String(data?.data?.defaultBackupLocation||""));
  }catch(requestError){
   setError(requestError.message);
  }
 },[userId]);

 useEffect(()=>{
  queueMicrotask(loadBackupLogs);
  queueMicrotask(loadSchedules);
  queueMicrotask(loadBackupConfiguration);
 },[loadBackupConfiguration,loadBackupLogs,loadSchedules]);

 useEffect(()=>{
  if(!error)return undefined;
  const timer=setTimeout(()=>setError(""),5000);
  return()=>clearTimeout(timer);
 },[error]);

 useEffect(()=>{
  if(!message)return undefined;
  const timer=setTimeout(()=>setMessage(""),5000);
  return()=>clearTimeout(timer);
 },[message]);

 const refreshPage=()=>{
  loadBackupLogs();
  loadSchedules();
  loadBackupConfiguration();
 };

 const handleCreateBackup=async formData=>{
  if(!userId){
   setError("A valid user ID is required.");
   return;
  }

  setSaving(true);
  setError("");
  setMessage("");

  try{
   const response=await fetch(BACKUP_ENDPOINT,{
    method:"POST",
    headers:{
     "Content-Type":"application/json"
    },
    credentials:"include",
    body:JSON.stringify({
     ...formData,
     userId
    })
   });

   const data=await response.json();

   if(!response.ok){
    throw new Error(data?.message||"Unable to create the backup.");
   }

   const createdBackup=data?.backup||data?.data||data;

   if(createdBackup?.backupId){
    setBackupLogs(currentLogs=>{
     const existingLogIndex=currentLogs.findIndex(
      log=>log.backupId===createdBackup.backupId
     );

     if(existingLogIndex===-1){
      return [createdBackup,...currentLogs];
     }

     return currentLogs.map(log=>
      log.backupId===createdBackup.backupId
       ?createdBackup
       :log
     );
    });
   }else{
    await loadBackupLogs();
   }

   setMessage(data?.message||"The backup was created successfully.");
  }catch(requestError){
   setError(requestError.message);
  }finally{
   setSaving(false);
  }
 };

 const getDownloadFileName=(response,backupLog)=>{
  const contentDisposition=response.headers.get("content-disposition");
  const encodedFileName=contentDisposition?.match(/filename\*=UTF-8''([^;]+)/i);
  const standardFileName=contentDisposition?.match(/filename="?([^"]+)"?/i);

  if(encodedFileName?.[1]){
   return decodeURIComponent(encodedFileName[1]);
  }

  if(standardFileName?.[1]){
   return standardFileName[1];
  }

  return backupLog.fileName||`${backupLog.backupId}.json`;
 };

 const handleDownloadBackup=async backupLog=>{
  if(!userId){
   setError("A valid user ID is required.");
   return;
  }

  setDownloadingId(backupLog.backupId);
  setError("");
  setMessage("");

  try{
   const response=await fetch(
    `${BACKUP_ENDPOINT}/${encodeURIComponent(backupLog.backupId)}/download?userId=${encodeURIComponent(userId)}`,
    {
     credentials:"include"
    }
   );

   if(!response.ok){
    let errorMessage="Unable to download the backup.";

    try{
     const data=await response.json();
     errorMessage=data?.message||errorMessage;
    }catch{
     errorMessage="Unable to download the backup.";
    }

    throw new Error(errorMessage);
   }

   const backupBlob=await response.blob();
   const downloadUrl=URL.createObjectURL(backupBlob);
   const downloadLink=document.createElement("a");

   downloadLink.href=downloadUrl;
   downloadLink.download=getDownloadFileName(response,backupLog);

   document.body.appendChild(downloadLink);
   downloadLink.click();
   downloadLink.remove();

   URL.revokeObjectURL(downloadUrl);

   setMessage("The backup download has started.");
  }catch(requestError){
   setError(requestError.message);
  }finally{
   setDownloadingId("");
  }
 };

 const closeConfirmation=()=>{
  if(workingAction.type)return;
  setConfirmation({type:"",backup:null});
 };

 const handleRestoreBackup=async backupLog=>{
  setWorkingAction({type:"restore",id:backupLog.backupId});
  setError("");
  setMessage("");

  try{
   const response=await fetch(
    `${BACKUP_ENDPOINT}/${encodeURIComponent(backupLog.backupId)}/restore?userId=${encodeURIComponent(userId)}`,
    {method:"POST",credentials:"include"}
   );
   const data=await response.json();
   if(!response.ok)throw new Error(data?.message||"Unable to restore the backup.");
   setMessage(data?.message||"The backup was restored successfully.");
   setConfirmation({type:"",backup:null});
  }catch(requestError){
   setError(requestError.message);
  }finally{
   setWorkingAction({type:"",id:""});
  }
 };

 const handleDeleteBackup=async backupLog=>{
  setWorkingAction({type:"delete",id:backupLog._id});
  setError("");
  setMessage("");

  try{
   const response=await fetch(
    `${BACKUP_ENDPOINT}/${encodeURIComponent(backupLog._id)}?userId=${encodeURIComponent(userId)}`,
    {method:"DELETE",credentials:"include"}
   );
   const data=await response.json();
   if(!response.ok)throw new Error(data?.message||"Unable to delete the backup.");
   setBackupLogs(current=>current.filter(item=>item._id!==backupLog._id));
   setMessage(data?.message||"The backup was deleted successfully.");
   setConfirmation({type:"",backup:null});
  }catch(requestError){
   setError(requestError.message);
  }finally{
   setWorkingAction({type:"",id:""});
  }
 };

 const handleSaveSchedule=async formData=>{
  const editingSchedule=scheduleModal.schedule;
  setScheduleSaving(true);
  setError("");
  setMessage("");
  try{
   const response=await fetch(editingSchedule?`${SCHEDULE_ENDPOINT}/${editingSchedule._id}`:SCHEDULE_ENDPOINT,{
    method:editingSchedule?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    credentials:"include",
    body:JSON.stringify({...formData,userId})
   });
   const data=await response.json();
   if(!response.ok)throw new Error(data?.message||"Unable to save the backup schedule.");
   await loadSchedules();
   setScheduleModal({show:false,schedule:null});
   setMessage(data?.message||"Backup schedule saved.");
  }catch(requestError){
   setError(requestError.message);
  }finally{
   setScheduleSaving(false);
  }
 };

 const handleScheduleStatus=async(schedule,action)=>{
  setScheduleAction({type:action,id:schedule._id});
  setError("");
  setMessage("");
  try{
   const response=await fetch(`${SCHEDULE_ENDPOINT}/${schedule._id}/${action}?userId=${encodeURIComponent(userId)}`,{method:"PATCH",credentials:"include"});
   const data=await response.json();
   if(!response.ok)throw new Error(data?.message||`Unable to ${action} the backup schedule.`);
   await loadSchedules();
   setMessage(data?.message||`Backup schedule ${action==="pause"?"paused":"resumed"}.`);
  }catch(requestError){
   setError(requestError.message);
  }finally{
   setScheduleAction({type:"",id:""});
  }
 };

 const handleDeleteSchedule=async()=>{
  if(!scheduleDeleteTarget)return;
  setScheduleAction({type:"delete",id:scheduleDeleteTarget._id});
  setError("");
  setMessage("");
  try{
   const response=await fetch(`${SCHEDULE_ENDPOINT}/${scheduleDeleteTarget._id}?userId=${encodeURIComponent(userId)}`,{method:"DELETE",credentials:"include"});
   const data=await response.json();
   if(!response.ok)throw new Error(data?.message||"Unable to delete the backup schedule.");
   setSchedules(current=>current.filter(schedule=>schedule._id!==scheduleDeleteTarget._id));
   setScheduleDeleteTarget(null);
   setMessage(data?.message||"Backup schedule deleted.");
  }catch(requestError){
   setError(requestError.message);
  }finally{
   setScheduleAction({type:"",id:""});
  }
 };

 const formatBackupType=(backupType="")=>{
  return backupType
   .replaceAll("_"," ")
   .replaceAll("-"," ")
   .replace(/\b\w/g,character=>character.toUpperCase());
 };

 const formatDate=dateValue=>{
  if(!dateValue)return "—";

  const date=new Date(dateValue);

  if(Number.isNaN(date.getTime()))return "—";

  return new Intl.DateTimeFormat("en-US",{
   dateStyle:"medium",
   timeStyle:"short"
  }).format(date);
 };

 const weekdayNames=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

 const formatSchedule=schedule=>{
  if(schedule.frequency==="daily")return `Daily at ${schedule.time}`;
  if(schedule.frequency==="weekly")return `${weekdayNames[schedule.dayOfWeek]||"Weekly"} at ${schedule.time}`;
  return `Day ${schedule.dayOfMonth} each month at ${schedule.time}`;
 };

 const renderSchedules=()=>{
  if(schedulesLoading)return <div className="py-4 text-center"><Spinner animation="border"/></div>;
  if(!schedules.length)return <Alert variant="secondary" className="mb-0">No automatic backups are scheduled.</Alert>;

  return(
   <Table striped bordered hover className="backup-schedule-table mb-0 align-middle">
    <thead><tr><th>Type</th><th>Schedule</th><th>Next Backup</th><th>Keep For</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>
     {schedules.map(schedule=>(
      <tr key={schedule._id}>
       <td data-label="Type">{formatBackupType(schedule.backupType)}</td>
       <td data-label="Schedule"><div>{formatSchedule(schedule)}</div><small className="backup-location-text">{schedule.backupLocation||defaultBackupLocation}</small></td>
       <td data-label="Next Backup">{schedule.status==="paused"?"Paused":formatDate(schedule.nextRunAt)}</td>
       <td data-label="Keep For">{schedule.retentionDays} days</td>
       <td data-label="Status"><Badge bg="" className={`backup-status backup-schedule-status-${schedule.status}`}>{formatBackupType(schedule.status)}</Badge></td>
       <td data-label="Actions" className="backup-actions-cell">
        <ButtonGroup size="sm" className="backup-actions">
         <Button variant="outline-primary" onClick={()=>setScheduleModal({show:true,schedule})} disabled={Boolean(scheduleAction.type)}>Edit</Button>
         {schedule.status==="active"?(
          <Button variant="outline-secondary" onClick={()=>handleScheduleStatus(schedule,"pause")} disabled={Boolean(scheduleAction.type)}>Pause</Button>
         ):(
          <Button variant="outline-success" onClick={()=>handleScheduleStatus(schedule,"resume")} disabled={Boolean(scheduleAction.type)}>Resume</Button>
         )}
         <Button variant="outline-danger" onClick={()=>setScheduleDeleteTarget(schedule)} disabled={Boolean(scheduleAction.type)}>Delete</Button>
        </ButtonGroup>
       </td>
      </tr>
     ))}
    </tbody>
   </Table>
  );
 };

 const renderBackupHistory=()=>{
  if(loading){
   return(
    <div className="py-5 text-center">
     <Spinner animation="border" role="status">
      <span className="visually-hidden">
       Loading backup history
      </span>
     </Spinner>
    </div>
   );
  }

  if(!backupLogs.length){
   return(
    <Alert variant="secondary" className="mb-0">
     No backups have been created yet.
    </Alert>
   );
  }

  return(
   <Table striped bordered hover className="backup-history-table mb-0 align-middle">
    <thead>
     <tr>
      <th>Backup Type</th>
      <th>File Name</th>
      <th>Records</th>
      <th>Status</th>
      <th>Created</th>
      <th>Completed</th>
      <th className="text-end">Action</th>
     </tr>
    </thead>

    <tbody>
     {backupLogs.map(backupLog=>(
      <tr key={backupLog._id||backupLog.backupId}>
       <td data-label="Backup Type">{formatBackupType(backupLog.backupType)}</td>

       <td data-label="File Name" className="backup-file-name">
        <div>{backupLog.fileName||"—"}</div>
        <small className="backup-location-text">{backupLog.backupDirectory||defaultBackupLocation}</small>
       </td>

       <td data-label="Records">{backupLog.recordCount??0}</td>

       <td data-label="Status">
        <Badge bg="" className={`backup-status backup-status-${backupLog.status||"started"}`}>
         {formatBackupType(backupLog.status)}
        </Badge>
       </td>

       <td data-label="Created">{formatDate(backupLog.createdAt)}</td>

       <td data-label="Completed">{formatDate(backupLog.completedAt)}</td>

       <td data-label="Actions" className="backup-actions-cell">
        <ButtonGroup size="sm" className="backup-actions">
         {backupLog.status==="completed"&&(
          <>
           <Button
            type="button"
            variant="outline-primary"
            onClick={()=>handleDownloadBackup(backupLog)}
            disabled={downloadingId===backupLog.backupId||Boolean(workingAction.type)}
           >
            {downloadingId===backupLog.backupId?"Downloading":"Download"}
           </Button>
           <Button
            type="button"
            variant="outline-success"
            onClick={()=>setConfirmation({type:"restore",backup:backupLog})}
            disabled={Boolean(workingAction.type)}
           >
            Restore
           </Button>
          </>
         )}
         <Button
          type="button"
          variant="outline-danger"
          onClick={()=>setConfirmation({type:"delete",backup:backupLog})}
          disabled={Boolean(workingAction.type)}
         >
          Delete
         </Button>
        </ButtonGroup>
       </td>
      </tr>
     ))}
    </tbody>
   </Table>
  );
 };

 return(
  <Container fluid className="backup-page">
   <Row className="g-4">
    <Col xs={12}>
     <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
      <div>
       <p className="text-uppercase text-muted small fw-semibold mb-1">
        Data Management
       </p>

       <h1 className="mb-1">Backups</h1>

       <p className="text-muted mb-0">
        Create and download backups of your Zettelkasten data.
       </p>
      </div>

      <Button
       type="button"
       variant="outline-secondary"
       onClick={refreshPage}
       disabled={loading||schedulesLoading||!userId}
      >
       {loading||schedulesLoading?"Refreshing":"Refresh"}
      </Button>
     </div>
    </Col>

    {error&&(
     <Col xs={12}>
      <Alert
       variant="danger"
       dismissible
       onClose={()=>setError("")}
       className="mb-0"
      >
       {error}
      </Alert>
     </Col>
    )}

    {message&&(
     <Col xs={12}>
      <Alert
       variant="success"
       dismissible
       onClose={()=>setMessage("")}
       className="mb-0"
      >
       {message}
      </Alert>
     </Col>
    )}

    <Col xs={12} xl={3}>
     <Card className="h-100">
      <Card.Body>
       <Card.Title>Create Backup</Card.Title>

       <Card.Text className="text-muted">
        Choose the information you want to export.
       </Card.Text>

       <BackupForm
        onSubmit={handleCreateBackup}
        saving={saving}
        defaultBackupLocation={defaultBackupLocation}
       />
      </Card.Body>
     </Card>
    </Col>

    <Col xs={12} xl={9}>
     <Card className="backup-schedules-card h-100">
      <Card.Body>
       <div className="backup-card-heading">
        <div>
         <Card.Title className="mb-1">Automatic Backups</Card.Title>
         <Card.Text className="text-muted mb-0">Set when backups run and how long they are kept.</Card.Text>
        </div>
        <Button type="button" variant="primary" onClick={()=>setScheduleModal({show:true,schedule:null})}>Add Schedule</Button>
       </div>
       {renderSchedules()}
      </Card.Body>
     </Card>
    </Col>

    <Col xs={12}>
     <Card className="backup-history-card">
      <Card.Body>
       <div className="mb-3">
        <Card.Title className="mb-1">
         Backup History
        </Card.Title>

        <Card.Text className="text-muted mb-0">
         Review the status of your previous backups.
        </Card.Text>
       </div>

       {renderBackupHistory()}
      </Card.Body>
     </Card>
    </Col>
   </Row>

   <Modal show={Boolean(confirmation.type)} onHide={closeConfirmation} centered>
    <Modal.Header closeButton={!workingAction.type}>
     <Modal.Title>
      {confirmation.type==="restore"?"Restore Backup":"Delete Backup"}
     </Modal.Title>
    </Modal.Header>
    <Modal.Body>
     {confirmation.type==="restore"?(
      <>
       Restore <strong>{confirmation.backup?.fileName}</strong>? Existing records with the same IDs will be replaced by the backed-up versions. Other current records will remain.
      </>
     ):(
      <>
       Delete <strong>{confirmation.backup?.fileName}</strong>? This permanently removes both the backup history entry and its backup file.
      </>
     )}
    </Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={closeConfirmation} disabled={Boolean(workingAction.type)}>
      Cancel
     </Button>
     <Button
      variant={confirmation.type==="restore"?"success":"danger"}
      disabled={Boolean(workingAction.type)}
      onClick={()=>confirmation.type==="restore"
       ?handleRestoreBackup(confirmation.backup)
       :handleDeleteBackup(confirmation.backup)
      }
     >
      {workingAction.type
       ?`${workingAction.type==="restore"?"Restoring":"Deleting"}…`
       :confirmation.type==="restore"?"Restore Backup":"Delete Backup"
      }
     </Button>
    </Modal.Footer>
   </Modal>

   <Modal show={scheduleModal.show} onHide={()=>!scheduleSaving&&setScheduleModal({show:false,schedule:null})} size="lg" centered>
    <Modal.Header closeButton={!scheduleSaving}>
     <Modal.Title>{scheduleModal.schedule?"Edit Automatic Backup":"Add Automatic Backup"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <BackupScheduleForm
      initialData={scheduleModal.schedule}
      defaultBackupLocation={defaultBackupLocation}
      onSubmit={handleSaveSchedule}
      onCancel={()=>setScheduleModal({show:false,schedule:null})}
      saving={scheduleSaving}
     />
    </Modal.Body>
   </Modal>

   <Modal show={Boolean(scheduleDeleteTarget)} onHide={()=>!scheduleAction.type&&setScheduleDeleteTarget(null)} centered>
    <Modal.Header closeButton={!scheduleAction.type}><Modal.Title>Delete Automatic Backup</Modal.Title></Modal.Header>
    <Modal.Body>Delete this automatic backup schedule? Existing backup files and history will remain.</Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={()=>setScheduleDeleteTarget(null)} disabled={Boolean(scheduleAction.type)}>Cancel</Button>
     <Button variant="danger" onClick={handleDeleteSchedule} disabled={Boolean(scheduleAction.type)}>{scheduleAction.type==="delete"?"Deleting…":"Delete Schedule"}</Button>
    </Modal.Footer>
   </Modal>
  </Container>
 );
};

export default BackupPage;
