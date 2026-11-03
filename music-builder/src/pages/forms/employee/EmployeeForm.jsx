// src/pages/forms/employee/EmployeeForm.jsx
import {useMemo} from "react";
import {Tabs,Tab,Form,Row,Col,Button,Card} from "react-bootstrap";
import {Building2,Briefcase,User,Mail,Phone,IdCard,CalendarDays,DollarSign,Clock3,MapPin,ShieldCheck,FileText,Users,Contact,HeartHandshake} from "lucide-react";

function EmployeeTabbedForm({
 formData,
 setFormData,
 onSubmit,
 loading=false,
 businesses=[],
 departments=[],
 roles=[],
 shiftLocations=[],
 users=[],
 states=[],
 counties=[],
 countries=[],
 employees=[]
}){

 const employeeOptions=useMemo(()=>employees||[],[employees]);

 const setValue=(section,name,value)=>{
  setFormData(prev=>({
   ...prev,
   [section]:{
    ...prev[section],
    [name]:value
   }
  }));
 };

 const toggleArrayValue=(section,name,value)=>{
  setFormData(prev=>{
   const current=Array.isArray(prev[section]?.[name])?prev[section][name]:[];
   const exists=current.includes(value);
   return{
    ...prev,
    [section]:{
     ...prev[section],
     [name]:exists?current.filter(item=>item!==value):[...current,value]
    }
   };
  });
 };

 const addEmployeeNote=()=>{
  setFormData(prev=>({
   ...prev,
   employee:{
    ...prev.employee,
    notes:[...(prev.employee?.notes||[]),{date:"",text:""}]
   }
  }));
 };

 const updateEmployeeNote=(index,key,value)=>{
  setFormData(prev=>({
   ...prev,
   employee:{
    ...prev.employee,
    notes:(prev.employee?.notes||[]).map((item,i)=>i===index?{...item,[key]:value}:item)
   }
  }));
 };

 const removeEmployeeNote=index=>{
  setFormData(prev=>({
   ...prev,
   employee:{
    ...prev.employee,
    notes:(prev.employee?.notes||[]).filter((_,i)=>i!==index)
   }
  }));
 };

 const addEmployeeDetailsNote=()=>{
  setFormData(prev=>({
   ...prev,
   employeeDetails:{
    ...prev.employeeDetails,
    notes:[...(prev.employeeDetails?.notes||[]),{date:"",text:""}]
   }
  }));
 };

 const updateEmployeeDetailsNote=(index,key,value)=>{
  setFormData(prev=>({
   ...prev,
   employeeDetails:{
    ...prev.employeeDetails,
    notes:(prev.employeeDetails?.notes||[]).map((item,i)=>i===index?{...item,[key]:value}:item)
   }
  }));
 };

 const removeEmployeeDetailsNote=index=>{
  setFormData(prev=>({
   ...prev,
   employeeDetails:{
    ...prev.employeeDetails,
    notes:(prev.employeeDetails?.notes||[]).filter((_,i)=>i!==index)
   }
  }));
 };

 const employee=formData.employee||{};
 const employeeDetails=formData.employeeDetails||{};
 const emergencyContact=formData.emergencyContact||{};
 const selectedBusiness=businesses.find(item=>item._id===employee.business);
 const selectedDepartment=departments.find(item=>item._id===employee.department);
 const selectedRole=roles.find(item=>item._id===employee.role);
 const employeeLabel=`${employee.firstName||""} ${employee.lastName||""}`.trim()||employee.employeeId||"New Employee";

 return(
  <Form onSubmit={onSubmit}>
   <Card className="shadow-sm border-0 mb-3">
    <Card.Body>
     <Row className="align-items-center">
      <Col md={8}>
       <div className="d-flex align-items-center gap-2 mb-2">
        <Users size={20}/>
        <h5 className="mb-0">{employeeLabel}</h5>
       </div>
       <div className="text-muted small">
        {selectedBusiness?.legalName||"No business selected"}{selectedDepartment?.name?` • ${selectedDepartment.name}`:""}{selectedRole?.name?` • ${selectedRole.name}`:""}
       </div>
      </Col>
      <Col md={4} className="text-md-end mt-3 mt-md-0">
       <Button type="submit" disabled={loading}>{loading?"Saving...":"Save Employee"}</Button>
      </Col>
     </Row>
    </Card.Body>
   </Card>

   <Tabs defaultActiveKey="employee" className="mb-3">
    <Tab eventKey="employee" title="Employee">
     <Card className="shadow-sm border-0">
      <Card.Body>
       <Row>
        <Col md={12}>
         <div className="d-flex align-items-center gap-2 mb-3">
          <User size={18}/>
          <h6 className="mb-0">Main Employee Information</h6>
         </div>
        </Col>

        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label className="d-flex align-items-center gap-2"><Building2 size={16}/>Business</Form.Label>
          <Form.Select value={employee.business||""} onChange={e=>setValue("employee","business",e.target.value)}>
           <option value="">Select Business</option>
           {businesses.map(item=><option key={item._id} value={item._id}>{item.legalName}</option>)}
          </Form.Select>
         </Form.Group>
        </Col>
        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label className="d-flex align-items-center gap-2"><Briefcase size={16}/>Department</Form.Label>
          <Form.Select value={employee.department||""} onChange={e=>setValue("employee","department",e.target.value||null)}>
           <option value="">Select Department</option>
           {departments.map(item=><option key={item._id} value={item._id}>{item.name}</option>)}
          </Form.Select>
         </Form.Group>
        </Col>
        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label className="d-flex align-items-center gap-2"><ShieldCheck size={16}/>Role</Form.Label>
          <Form.Select value={employee.role||""} onChange={e=>setValue("employee","role",e.target.value||null)}>
           <option value="">Select Role</option>
           {roles.map(item=><option key={item._id} value={item._id}>{item.name}</option>)}
          </Form.Select>
         </Form.Group>
        </Col>

        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label className="d-flex align-items-center gap-2"><User size={16}/>First Name</Form.Label>
          <Form.Control value={employee.firstName||""} onChange={e=>setValue("employee","firstName",e.target.value)}/>
         </Form.Group>
        </Col>
        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label className="d-flex align-items-center gap-2"><User size={16}/>Last Name</Form.Label>
          <Form.Control value={employee.lastName||""} onChange={e=>setValue("employee","lastName",e.target.value)}/>
         </Form.Group>
        </Col>
        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label className="d-flex align-items-center gap-2"><IdCard size={16}/>Employee ID</Form.Label>
          <Form.Control value={employee.employeeId||""} onChange={e=>setValue("employee","employeeId",e.target.value)}/>
         </Form.Group>
        </Col>

        <Col md={6}>
         <Form.Group className="mb-3">
          <Form.Label className="d-flex align-items-center gap-2"><Mail size={16}/>Email</Form.Label>
          <Form.Control type="email" value={employee.email||""} onChange={e=>setValue("employee","email",e.target.value)}/>
         </Form.Group>
        </Col>
        <Col md={6}>
         <Form.Group className="mb-3">
          <Form.Label className="d-flex align-items-center gap-2"><Phone size={16}/>Phone</Form.Label>
          <Form.Control value={employee.phone||""} onChange={e=>setValue("employee","phone",e.target.value)}/>
         </Form.Group>
        </Col>

        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label>Employment Type</Form.Label>
          <Form.Select value={employee.employmentType||"part-time"} onChange={e=>setValue("employee","employmentType",e.target.value)}>
           <option value="full-time">full-time</option>
           <option value="part-time">part-time</option>
           <option value="contract">contract</option>
           <option value="temporary">temporary</option>
           <option value="seasonal">seasonal</option>
          </Form.Select>
         </Form.Group>
        </Col>
        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label>Pay Type</Form.Label>
          <Form.Select value={employee.payType||"hourly"} onChange={e=>setValue("employee","payType",e.target.value)}>
           <option value="hourly">hourly</option>
           <option value="salary">salary</option>
          </Form.Select>
         </Form.Group>
        </Col>
        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label>Status</Form.Label>
          <Form.Select value={employee.status||"active"} onChange={e=>setValue("employee","status",e.target.value)}>
           <option value="active">active</option>
           <option value="inactive">inactive</option>
           <option value="terminated">terminated</option>
           <option value="on-leave">on-leave</option>
           <option value="vacation">vacation</option>
          </Form.Select>
         </Form.Group>
        </Col>

        <Col md={4} className="d-flex align-items-center">
         <Form.Check label="Overtime Eligible" checked={!!employee.overtimeEligible} onChange={e=>setValue("employee","overtimeEligible",e.target.checked)}/>
        </Col>
        <Col md={4} className="d-flex align-items-center">
         <Form.Check label="Manager" checked={!!employee.isManager} onChange={e=>setValue("employee","isManager",e.target.checked)}/>
        </Col>
        <Col md={4} className="d-flex align-items-center">
         <Form.Check label="Active" checked={!!employee.isActive} onChange={e=>setValue("employee","isActive",e.target.checked)}/>
        </Col>

        <Col md={3}>
         <Form.Group className="mb-3">
          <Form.Label className="d-flex align-items-center gap-2"><CalendarDays size={16}/>Hire Date</Form.Label>
          <Form.Control type="date" value={employee.hireDate||""} onChange={e=>setValue("employee","hireDate",e.target.value||null)}/>
         </Form.Group>
        </Col>
        <Col md={3}>
         <Form.Group className="mb-3">
          <Form.Label className="d-flex align-items-center gap-2"><CalendarDays size={16}/>Original Hire Date</Form.Label>
          <Form.Control type="date" value={employee.originalHireDate||""} onChange={e=>setValue("employee","originalHireDate",e.target.value||null)}/>
         </Form.Group>
        </Col>
        <Col md={3}>
         <Form.Group className="mb-3">
          <Form.Label className="d-flex align-items-center gap-2"><CalendarDays size={16}/>Last Hire Date</Form.Label>
          <Form.Control type="date" value={employee.lastHireDate||""} onChange={e=>setValue("employee","lastHireDate",e.target.value||null)}/>
         </Form.Group>
        </Col>
        <Col md={3}>
         <Form.Group className="mb-3">
          <Form.Label className="d-flex align-items-center gap-2"><CalendarDays size={16}/>Last Archived At</Form.Label>
          <Form.Control type="date" value={employee.lastArchivedAt||""} onChange={e=>setValue("employee","lastArchivedAt",e.target.value||null)}/>
         </Form.Group>
        </Col>

        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label className="d-flex align-items-center gap-2"><DollarSign size={16}/>Hourly Rate</Form.Label>
          <Form.Control type="number" step="0.01" value={employee.hourlyRate??0} onChange={e=>setValue("employee","hourlyRate",e.target.value===""?0:Number(e.target.value))}/>
         </Form.Group>
        </Col>
        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label className="d-flex align-items-center gap-2"><DollarSign size={16}/>Salary Amount</Form.Label>
          <Form.Control type="number" step="0.01" value={employee.salaryAmount??0} onChange={e=>setValue("employee","salaryAmount",e.target.value===""?0:Number(e.target.value))}/>
         </Form.Group>
        </Col>
        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label className="d-flex align-items-center gap-2"><Clock3 size={16}/>Preferred Hours Per Week</Form.Label>
          <Form.Control type="number" value={employee.preferredHoursPerWeek??0} onChange={e=>setValue("employee","preferredHoursPerWeek",e.target.value===""?0:Number(e.target.value))}/>
         </Form.Group>
        </Col>

        <Col md={6}>
         <Form.Group className="mb-3">
          <Form.Label>Min Hours Per Week</Form.Label>
          <Form.Control type="number" value={employee.minHoursPerWeek??0} onChange={e=>setValue("employee","minHoursPerWeek",e.target.value===""?0:Number(e.target.value))}/>
         </Form.Group>
        </Col>
        <Col md={6}>
         <Form.Group className="mb-3">
          <Form.Label>Max Hours Per Week</Form.Label>
          <Form.Control type="number" value={employee.maxHoursPerWeek??40} onChange={e=>setValue("employee","maxHoursPerWeek",e.target.value===""?40:Number(e.target.value))}/>
         </Form.Group>
        </Col>

        <Col md={12}>
         <Form.Group className="mb-3">
          <Form.Label>Preferred Shift Types</Form.Label>
          <div className="d-flex flex-wrap gap-3">
           {["morning","afternoon","evening","night","overnight","custom"].map(item=>(
            <Form.Check
             key={item}
             type="checkbox"
             label={item}
             checked={(employee.preferredShiftTypes||[]).includes(item)}
             onChange={()=>toggleArrayValue("employee","preferredShiftTypes",item)}
            />
           ))}
          </div>
         </Form.Group>
        </Col>

        <Col md={12}>
         <Form.Group className="mb-3">
          <Form.Label>Skills (comma separated)</Form.Label>
          <Form.Control
           value={Array.isArray(employee.skills)?employee.skills.join(", "):""}
           onChange={e=>setValue("employee","skills",e.target.value.split(",").map(item=>item.trim()).filter(Boolean))}
          />
         </Form.Group>
        </Col>

        <Col md={12}>
         <Form.Group className="mb-3">
          <Form.Label className="d-flex align-items-center gap-2"><MapPin size={16}/>Shift Locations</Form.Label>
          <div className="d-flex flex-wrap gap-3">
           {shiftLocations.map(item=>(
            <Form.Check
             key={item._id}
             type="checkbox"
             label={item.name}
             checked={(employee.shiftLocations||[]).includes(item._id)}
             onChange={()=>toggleArrayValue("employee","shiftLocations",item._id)}
            />
           ))}
          </div>
         </Form.Group>
        </Col>

        <Col md={4} className="d-flex align-items-center">
         <Form.Check label="Archived" checked={!!employee.isArchived} onChange={e=>setValue("employee","isArchived",e.target.checked)}/>
        </Col>
        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label>Archived By</Form.Label>
          <Form.Select value={employee.archivedBy||""} onChange={e=>setValue("employee","archivedBy",e.target.value||null)}>
           <option value="">Select User</option>
           {users.map(item=><option key={item._id} value={item._id}>{item.username||item.name||item.email}</option>)}
          </Form.Select>
         </Form.Group>
        </Col>
        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label>Archive Reason</Form.Label>
          <Form.Control value={employee.archiveReason||""} onChange={e=>setValue("employee","archiveReason",e.target.value)}/>
         </Form.Group>
        </Col>

        <Col md={6}>
         <Form.Group className="mb-3">
          <Form.Label>Unarchived At</Form.Label>
          <Form.Control type="date" value={employee.unarchivedAt||""} onChange={e=>setValue("employee","unarchivedAt",e.target.value||null)}/>
         </Form.Group>
        </Col>
        <Col md={6}>
         <Form.Group className="mb-3">
          <Form.Label>Unarchived By</Form.Label>
          <Form.Select value={employee.unarchivedBy||""} onChange={e=>setValue("employee","unarchivedBy",e.target.value||null)}>
           <option value="">Select User</option>
           {users.map(item=><option key={item._id} value={item._id}>{item.username||item.name||item.email}</option>)}
          </Form.Select>
         </Form.Group>
        </Col>

        <Col md={12}>
         <div className="d-flex justify-content-between align-items-center mb-2">
          <Form.Label className="mb-0 d-flex align-items-center gap-2"><FileText size={16}/>Employee Notes</Form.Label>
          <Button type="button" variant="outline-secondary" size="sm" onClick={addEmployeeNote}>Add Note</Button>
         </div>
         {(employee.notes||[]).map((note,index)=>(
          <Row key={index} className="mb-2">
           <Col md={3}>
            <Form.Control type="date" value={note.date?String(note.date).slice(0,10):""} onChange={e=>updateEmployeeNote(index,"date",e.target.value)}/>
           </Col>
           <Col md={8}>
            <Form.Control value={note.text||""} onChange={e=>updateEmployeeNote(index,"text",e.target.value)}/>
           </Col>
           <Col md={1}>
            <Button type="button" variant="outline-danger" size="sm" onClick={()=>removeEmployeeNote(index)}>X</Button>
           </Col>
          </Row>
         ))}
        </Col>
       </Row>
      </Card.Body>
     </Card>
    </Tab>

    <Tab eventKey="details" title="Employee Details">
     <Card className="shadow-sm border-0">
      <Card.Body>
       <Row className="mb-3">
        <Col md={12}>
         <div className="d-flex align-items-center gap-2">
          <Contact size={18}/>
          <h6 className="mb-0">Employee Details</h6>
         </div>
         <div className="text-muted small mt-1">
          Business: {selectedBusiness?.legalName||"—"}{selectedDepartment?.name?` • Department: ${selectedDepartment.name}`:""}{selectedRole?.name?` • Role: ${selectedRole.name}`:""}
         </div>
        </Col>
       </Row>

       <Row>
        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label>Middle Name</Form.Label>
          <Form.Control value={employeeDetails.middleName||""} onChange={e=>setValue("employeeDetails","middleName",e.target.value)}/>
         </Form.Group>
        </Col>
        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label>Date of Birth</Form.Label>
          <Form.Control type="date" value={employeeDetails.dateOfBirth||""} onChange={e=>setValue("employeeDetails","dateOfBirth",e.target.value||null)}/>
         </Form.Group>
        </Col>
        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label>Gender</Form.Label>
          <Form.Control value={employeeDetails.gender||""} onChange={e=>setValue("employeeDetails","gender",e.target.value)}/>
         </Form.Group>
        </Col>

        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label>Marital Status</Form.Label>
          <Form.Control value={employeeDetails.maritalStatus||""} onChange={e=>setValue("employeeDetails","maritalStatus",e.target.value)}/>
         </Form.Group>
        </Col>
        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label>Alternate Phone</Form.Label>
          <Form.Control value={employeeDetails.alternatePhone||""} onChange={e=>setValue("employeeDetails","alternatePhone",e.target.value)}/>
         </Form.Group>
        </Col>
        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label>Alternate Email</Form.Label>
          <Form.Control type="email" value={employeeDetails.alternateEmail||""} onChange={e=>setValue("employeeDetails","alternateEmail",e.target.value)}/>
         </Form.Group>
        </Col>

        <Col md={6}>
         <Form.Group className="mb-3">
          <Form.Label>Address Line 1</Form.Label>
          <Form.Control value={employeeDetails.addressLine1||""} onChange={e=>setValue("employeeDetails","addressLine1",e.target.value)}/>
         </Form.Group>
        </Col>
        <Col md={6}>
         <Form.Group className="mb-3">
          <Form.Label>Address Line 2</Form.Label>
          <Form.Control value={employeeDetails.addressLine2||""} onChange={e=>setValue("employeeDetails","addressLine2",e.target.value)}/>
         </Form.Group>
        </Col>

        <Col md={3}>
         <Form.Group className="mb-3">
          <Form.Label>City</Form.Label>
          <Form.Control value={employeeDetails.city||""} onChange={e=>setValue("employeeDetails","city",e.target.value)}/>
         </Form.Group>
        </Col>
        <Col md={3}>
         <Form.Group className="mb-3">
          <Form.Label>State</Form.Label>
          <Form.Select value={employeeDetails.stateRef||""} onChange={e=>setValue("employeeDetails","stateRef",e.target.value||null)}>
           <option value="">Select State</option>
           {states.map(item=><option key={item._id} value={item._id}>{item.name}</option>)}
          </Form.Select>
         </Form.Group>
        </Col>
        <Col md={3}>
         <Form.Group className="mb-3">
          <Form.Label>County</Form.Label>
          <Form.Select value={employeeDetails.countyRef||""} onChange={e=>setValue("employeeDetails","countyRef",e.target.value||null)}>
           <option value="">Select County</option>
           {counties.map(item=><option key={item._id} value={item._id}>{item.name}</option>)}
          </Form.Select>
         </Form.Group>
        </Col>
        <Col md={3}>
         <Form.Group className="mb-3">
          <Form.Label>Country</Form.Label>
          <Form.Select value={employeeDetails.countryRef||""} onChange={e=>setValue("employeeDetails","countryRef",e.target.value||null)}>
           <option value="">Select Country</option>
           {countries.map(item=><option key={item._id} value={item._id}>{item.name}</option>)}
          </Form.Select>
         </Form.Group>
        </Col>

        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label>Postal Code</Form.Label>
          <Form.Control value={employeeDetails.postalCode||""} onChange={e=>setValue("employeeDetails","postalCode",e.target.value)}/>
         </Form.Group>
        </Col>
        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label>National ID Last 4</Form.Label>
          <Form.Control value={employeeDetails.nationalIdLast4||""} onChange={e=>setValue("employeeDetails","nationalIdLast4",e.target.value)}/>
         </Form.Group>
        </Col>
        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label>Tax ID Last 4</Form.Label>
          <Form.Control value={employeeDetails.taxIdLast4||""} onChange={e=>setValue("employeeDetails","taxIdLast4",e.target.value)}/>
         </Form.Group>
        </Col>

        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label>Hire Source</Form.Label>
          <Form.Control value={employeeDetails.hireSource||""} onChange={e=>setValue("employeeDetails","hireSource",e.target.value)}/>
         </Form.Group>
        </Col>
        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label>Termination Date</Form.Label>
          <Form.Control type="date" value={employeeDetails.terminationDate||""} onChange={e=>setValue("employeeDetails","terminationDate",e.target.value||null)}/>
         </Form.Group>
        </Col>
        <Col md={4} className="d-flex align-items-center">
         <Form.Check label="Rehire Eligible" checked={!!employeeDetails.rehireEligible} onChange={e=>setValue("employeeDetails","rehireEligible",e.target.checked)}/>
        </Col>

        <Col md={12}>
         <div className="d-flex justify-content-between align-items-center mb-2">
          <Form.Label className="mb-0 d-flex align-items-center gap-2"><FileText size={16}/>Employee Details Notes</Form.Label>
          <Button type="button" variant="outline-secondary" size="sm" onClick={addEmployeeDetailsNote}>Add Note</Button>
         </div>
         {(employeeDetails.notes||[]).map((note,index)=>(
          <Row key={index} className="mb-2">
           <Col md={3}>
            <Form.Control type="date" value={note.date?String(note.date).slice(0,10):""} onChange={e=>updateEmployeeDetailsNote(index,"date",e.target.value)}/>
           </Col>
           <Col md={8}>
            <Form.Control value={note.text||""} onChange={e=>updateEmployeeDetailsNote(index,"text",e.target.value)}/>
           </Col>
           <Col md={1}>
            <Button type="button" variant="outline-danger" size="sm" onClick={()=>removeEmployeeDetailsNote(index)}>X</Button>
           </Col>
          </Row>
         ))}
        </Col>
       </Row>
      </Card.Body>
     </Card>
    </Tab>

    <Tab eventKey="emergency" title="Emergency Contact">
     <Card className="shadow-sm border-0">
      <Card.Body>
       <Row className="mb-3">
        <Col md={12}>
         <div className="d-flex align-items-center gap-2">
          <HeartHandshake size={18}/>
          <h6 className="mb-0">Emergency Contact</h6>
         </div>
         <div className="text-muted small mt-1">
          Business: {selectedBusiness?.legalName||"—"} • Employee: {employeeLabel}
         </div>
        </Col>
       </Row>

       <Row>
        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control value={emergencyContact.name||""} onChange={e=>setValue("emergencyContact","name",e.target.value)}/>
         </Form.Group>
        </Col>
        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label>Relationship</Form.Label>
          <Form.Control value={emergencyContact.relationship||""} onChange={e=>setValue("emergencyContact","relationship",e.target.value)}/>
         </Form.Group>
        </Col>
        <Col md={4}>
         <Form.Group className="mb-3">
          <Form.Label>Phone</Form.Label>
          <Form.Control value={emergencyContact.phone||""} onChange={e=>setValue("emergencyContact","phone",e.target.value)}/>
         </Form.Group>
        </Col>

        <Col md={6}>
         <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" value={emergencyContact.email||""} onChange={e=>setValue("emergencyContact","email",e.target.value)}/>
         </Form.Group>
        </Col>
        <Col md={6}>
         <Form.Group className="mb-3">
          <Form.Label>Address</Form.Label>
          <Form.Control value={emergencyContact.address||""} onChange={e=>setValue("emergencyContact","address",e.target.value)}/>
         </Form.Group>
        </Col>

        <Col md={12}>
         <Form.Group className="mb-3">
          <Form.Label>Notes</Form.Label>
          <Form.Control as="textarea" rows={3} value={emergencyContact.notes||""} onChange={e=>setValue("emergencyContact","notes",e.target.value)}/>
         </Form.Group>
        </Col>

        <Col md={3} className="d-flex align-items-center">
         <Form.Check label="Primary Contact" checked={!!emergencyContact.isPrimary} onChange={e=>setValue("emergencyContact","isPrimary",e.target.checked)}/>
        </Col>
        <Col md={3} className="d-flex align-items-center">
         <Form.Check label="Active" checked={!!emergencyContact.isActive} onChange={e=>setValue("emergencyContact","isActive",e.target.checked)}/>
        </Col>
       </Row>
      </Card.Body>
     </Card>
    </Tab>
   </Tabs>

   <div className="d-flex gap-2">
    <Button type="submit" disabled={loading}>{loading?"Saving...":"Save"}</Button>
   </div>
  </Form>
 );
}

export default EmployeeTabbedForm;