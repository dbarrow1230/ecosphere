import {Button,Card,Form,Table} from "react-bootstrap";
import {employeeName} from "../../utils/employeeManager.js";

function TimeClockEntryTable({entries,employees,filters,setFilters,onEdit,onDelete,loading}){
 const employeeById=Object.fromEntries(employees.map(employee=>[employee.id,employee]));
 return(
  <Card className="employee-card"><Card.Body>
   <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3"><h3 className="mb-0">Time Clock List</h3><div className="d-flex gap-2 flex-wrap"><Form.Select aria-label="Filter by employee" value={filters.employee} onChange={event=>setFilters({...filters,employee:event.target.value})}><option value="">All employees</option>{employees.map(employee=><option key={employee.id} value={employee.id}>{employeeName(employee)}</option>)}</Form.Select><Form.Control type="date" aria-label="From date" value={filters.dateFrom} onChange={event=>setFilters({...filters,dateFrom:event.target.value})}/><Form.Control type="date" aria-label="To date" value={filters.dateTo} onChange={event=>setFilters({...filters,dateTo:event.target.value})}/></div></div>
   {loading?<p>Loading time entries…</p>:<Table responsive bordered hover><thead><tr><th>Date</th><th>Employee</th><th>Clock In</th><th>Break Out</th><th>Break In</th><th>Clock Out</th><th>Break</th><th>Regular</th><th>OT</th><th>Method</th><th>Notes</th><th>Actions</th></tr></thead><tbody>{entries.map(entry=><tr key={entry.id}><td>{entry.date}</td><td>{employeeName(employeeById[entry.employeeId]||entry.employeeRef)}</td><td>{entry.clockIn||"—"}</td><td>{entry.breakOut||"—"}</td><td>{entry.breakIn||"—"}</td><td>{entry.clockOut||"—"}</td><td>{Number(entry.totalBreakHours||0).toFixed(2)}</td><td>{Number(entry.regularHours||0).toFixed(2)}</td><td>{Number(entry.overtimeHours||0).toFixed(2)}</td><td>{entry.method}</td><td>{entry.notes}</td><td><div className="d-flex gap-1"><Button size="sm" variant="outline-primary" onClick={()=>onEdit(entry)}>Edit</Button><Button size="sm" variant="outline-danger" onClick={()=>onDelete(entry)}>Delete</Button></div></td></tr>)}</tbody></Table>}
  </Card.Body></Card>
 );
}

export default TimeClockEntryTable;
