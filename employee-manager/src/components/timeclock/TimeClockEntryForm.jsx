import {Button,Card,Form} from "react-bootstrap";
import {employeeName} from "../../utils/employeeManager.js";

function TimeClockEntryForm({employees,draft,setDraft,onSave,onCancel,saving}){
 return(
  <Card className="employee-card"><Card.Body>
   <h3>{draft.id?"Edit Time Entry":"Add Manual Time Entry"}</h3>
   <div className="employee-form">
    <label>Employee<select value={draft.employeeId} onChange={event=>setDraft({...draft,employeeId:event.target.value})}><option value="">Select employee</option>{employees.map(employee=><option key={employee.id} value={employee.id}>{employeeName(employee)} ({employee.employeeNumber})</option>)}</select></label>
    <label>Date<input type="date" value={draft.date} onChange={event=>setDraft({...draft,date:event.target.value})}/></label>
    {["clockIn","breakOut","breakIn","clockOut"].map(field=><label key={field}>{field}<input type="time" step="1" value={draft[field]||""} onChange={event=>setDraft({...draft,[field]:event.target.value})}/></label>)}
    <label>Notes<Form.Control as="textarea" rows={2} value={draft.notes||""} onChange={event=>setDraft({...draft,notes:event.target.value})}/></label>
   </div>
   <div className="d-flex gap-2"><Button variant="primary" disabled={saving} onClick={onSave}>{saving?"Saving…":draft.id?"Save Changes":"Add Entry"}</Button>{draft.id?<Button variant="secondary" onClick={onCancel}>Cancel Edit</Button>:null}</div>
  </Card.Body></Card>
 );
}

export default TimeClockEntryForm;
