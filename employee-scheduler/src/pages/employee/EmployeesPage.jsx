// src/pages/employee/EmployeesPage.jsx
import {useEffect,useMemo,useState} from "react";
import {Button,Card,Col,Form,Modal,Row,Table,Spinner,Alert,Badge} from "react-bootstrap";
import EmployeeForm from "../forms/employee/EmployeeForm";

const employeeInitialState={
 employee:{
  business:"",
  department:"",
  firstName:"",
  lastName:"",
  email:"",
  phone:"",
  employeeId:"",
  role:"",
  employmentType:"part-time",
  payType:"hourly",
  overtimeEligible:true,
  status:"active",
  hireDate:"",
  originalHireDate:"",
  lastHireDate:"",
  lastArchivedAt:"",
  hourlyRate:0,
  salaryAmount:0,
  minHoursPerWeek:0,
  maxHoursPerWeek:40,
  preferredHoursPerWeek:0,
  preferredShiftTypes:[],
  skills:[],
  shiftLocations:[],
  isManager:false,
  employeeDetails:"",
  emergencyContact:"",
  notes:[],
  isActive:true,
  isArchived:false,
  archivedAt:"",
  archivedBy:"",
  archiveReason:"",
  unarchivedAt:"",
  unarchivedBy:""
 },
 employeeDetails:{
  business:"",
  employee:"",
  middleName:"",
  dateOfBirth:"",
  gender:"",
  maritalStatus:"",
  addressLine1:"",
  addressLine2:"",
  city:"",
  stateRef:"",
  countyRef:"",
  countryRef:"",
  postalCode:"",
  alternatePhone:"",
  alternateEmail:"",
  nationalIdLast4:"",
  taxIdLast4:"",
  hireSource:"",
  terminationDate:"",
  rehireEligible:true,
  notes:[]
 },
 emergencyContact:{
  business:"",
  employee:"",
  name:"",
  relationship:"",
  phone:"",
  email:"",
  address:"",
  notes:"",
  isPrimary:true,
  isActive:true
 },
 activeTab:"employee"
};

function EmployeesPage(){
 const [employees,setEmployees]=useState([]);
 const [businesses,setBusinesses]=useState([]);
 const [departments,setDepartments]=useState([]);
 const [roles,setRoles]=useState([]);
 const [shiftLocations,setShiftLocations]=useState([]);
 const [users,setUsers]=useState([]);
 const [states,setStates]=useState([]);
 const [counties,setCounties]=useState([]);
 const [countries,setCountries]=useState([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [deleting,setDeleting]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [search,setSearch]=useState("");
 const [statusFilter,setStatusFilter]=useState("");
 const [showFormModal,setShowFormModal]=useState(false);
 const [showDeleteModal,setShowDeleteModal]=useState(false);
 const [formMode,setFormMode]=useState("add");
 const [selectedEmployee,setSelectedEmployee]=useState(null);
 const [formData,setFormData]=useState(employeeInitialState);

 const loadOptions=async()=>{
  const requests=[
   fetch("/api/businesses").then(r=>r.json()).catch(()=>({data:[]})),
   fetch("/api/departments").then(r=>r.json()).catch(()=>({data:[]})),
   fetch("/api/users/roles").then(r=>r.json()).catch(()=>({data:[]})),
   fetch("/api/shift-locations").then(r=>r.json()).catch(()=>({data:[]})),
   fetch("/api/users").then(r=>r.json()).catch(()=>({data:[]})),
   fetch("/api/states").then(r=>r.json()).catch(()=>({data:[]})),
   fetch("/api/counties").then(r=>r.json()).catch(()=>({data:[]})),
   fetch("/api/countries").then(r=>r.json()).catch(()=>({data:[]}))
  ];

  const [businessesRes,departmentsRes,rolesRes,shiftLocationsRes,usersRes,statesRes,countiesRes,countriesRes]=await Promise.all(requests);

  setBusinesses(Array.isArray(businessesRes)?businessesRes:businessesRes?.data||[]);
  setDepartments(Array.isArray(departmentsRes)?departmentsRes:departmentsRes?.data||[]);
  setRoles(Array.isArray(rolesRes)?rolesRes:rolesRes?.data||[]);
  setShiftLocations(Array.isArray(shiftLocationsRes)?shiftLocationsRes:shiftLocationsRes?.data||[]);
  setUsers(Array.isArray(usersRes)?usersRes:usersRes?.data||[]);
  setStates(Array.isArray(statesRes)?statesRes:statesRes?.data||[]);
  setCounties(Array.isArray(countiesRes)?countiesRes:countiesRes?.data||[]);
  setCountries(Array.isArray(countriesRes)?countriesRes:countriesRes?.data||[]);
 };

 const loadEmployees=async()=>{
  const res=await fetch("/api/employees");
  const data=await res.json();
  if(!res.ok)throw new Error(data?.message||"Failed to load employees");
  setEmployees(Array.isArray(data)?data:data?.data||[]);
 };

 useEffect(()=>{
  const init=async()=>{
   try{
    setLoading(true);
    setError("");
    await Promise.all([loadEmployees(),loadOptions()]);
   }catch(err){
    setError(err?.message||"Failed to load employees");
   }finally{
    setLoading(false);
   }
  };
  init();
 },[]);

 const filteredEmployees=useMemo(()=>{
  return employees.filter(item=>{
   const fullName=`${item?.firstName||""} ${item?.lastName||""}`.trim().toLowerCase();
   const email=(item?.email||"").toLowerCase();
   const employeeId=(item?.employeeId||"").toLowerCase();
   const status=(item?.status||"").toLowerCase();
   const value=search.trim().toLowerCase();
   if(statusFilter&&status!==statusFilter.toLowerCase())return false;
   if(!value)return true;
   return fullName.includes(value)||email.includes(value)||employeeId.includes(value);
  });
 },[employees,search,statusFilter]);

 const resetForm=()=>{
  setFormData(employeeInitialState);
  setSelectedEmployee(null);
  setFormMode("add");
 };

 const normalizeDate=value=>{
  if(!value)return "";
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return "";
  return date.toISOString().slice(0,10);
 };

 const mapEmployeeToForm=item=>{
  return{
   employee:{
    business:item?.business?._id||item?.business||"",
    department:item?.department?._id||item?.department||"",
    firstName:item?.firstName||"",
    lastName:item?.lastName||"",
    email:item?.email||"",
    phone:item?.phone||"",
    employeeId:item?.employeeId||"",
    role:item?.role?._id||item?.role||"",
    employmentType:item?.employmentType||"part-time",
    payType:item?.payType||"hourly",
    overtimeEligible:item?.overtimeEligible!==undefined?item.overtimeEligible:true,
    status:item?.status||"active",
    hireDate:normalizeDate(item?.hireDate),
    originalHireDate:normalizeDate(item?.originalHireDate),
    lastHireDate:normalizeDate(item?.lastHireDate),
    lastArchivedAt:normalizeDate(item?.lastArchivedAt),
    hourlyRate:item?.hourlyRate??0,
    salaryAmount:item?.salaryAmount??0,
    minHoursPerWeek:item?.minHoursPerWeek??0,
    maxHoursPerWeek:item?.maxHoursPerWeek??40,
    preferredHoursPerWeek:item?.preferredHoursPerWeek??0,
    preferredShiftTypes:Array.isArray(item?.preferredShiftTypes)?item.preferredShiftTypes:[],
    skills:Array.isArray(item?.skills)?item.skills:[],
    shiftLocations:Array.isArray(item?.shiftLocations)?item.shiftLocations.map(loc=>loc?._id||loc):[],
    isManager:item?.isManager||false,
    employeeDetails:item?.employeeDetails?._id||item?.employeeDetails||"",
    emergencyContact:item?.emergencyContact?._id||item?.emergencyContact||"",
    notes:Array.isArray(item?.notes)?item.notes.map(note=>({...note,date:normalizeDate(note?.date)})):[],
    isActive:item?.isActive!==undefined?item.isActive:true,
    isArchived:item?.isArchived||false,
    archivedAt:normalizeDate(item?.archivedAt),
    archivedBy:item?.archivedBy?._id||item?.archivedBy||"",
    archiveReason:item?.archiveReason||"",
    unarchivedAt:normalizeDate(item?.unarchivedAt),
    unarchivedBy:item?.unarchivedBy?._id||item?.unarchivedBy||""
   },
   employeeDetails:{
    business:item?.employeeDetails?.business?._id||item?.business?._id||item?.business||"",
    employee:item?._id||"",
    middleName:item?.employeeDetails?.middleName||"",
    dateOfBirth:normalizeDate(item?.employeeDetails?.dateOfBirth),
    gender:item?.employeeDetails?.gender||"",
    maritalStatus:item?.employeeDetails?.maritalStatus||"",
    addressLine1:item?.employeeDetails?.addressLine1||"",
    addressLine2:item?.employeeDetails?.addressLine2||"",
    city:item?.employeeDetails?.city||"",
    stateRef:item?.employeeDetails?.stateRef?._id||item?.employeeDetails?.stateRef||"",
    countyRef:item?.employeeDetails?.countyRef?._id||item?.employeeDetails?.countyRef||"",
    countryRef:item?.employeeDetails?.countryRef?._id||item?.employeeDetails?.countryRef||"",
    postalCode:item?.employeeDetails?.postalCode||"",
    alternatePhone:item?.employeeDetails?.alternatePhone||"",
    alternateEmail:item?.employeeDetails?.alternateEmail||"",
    nationalIdLast4:item?.employeeDetails?.nationalIdLast4||"",
    taxIdLast4:item?.employeeDetails?.taxIdLast4||"",
    hireSource:item?.employeeDetails?.hireSource||"",
    terminationDate:normalizeDate(item?.employeeDetails?.terminationDate),
    rehireEligible:item?.employeeDetails?.rehireEligible!==undefined?item.employeeDetails.rehireEligible:true,
    notes:Array.isArray(item?.employeeDetails?.notes)?item.employeeDetails.notes.map(note=>({...note,date:normalizeDate(note?.date)})):[],
   },
   emergencyContact:{
    business:item?.business?._id||item?.business||"",
    employee:item?._id||"",
    name:item?.emergencyContact?.name||"",
    relationship:item?.emergencyContact?.relationship||"",
    phone:item?.emergencyContact?.phone||"",
    email:item?.emergencyContact?.email||"",
    address:item?.emergencyContact?.address||"",
    notes:item?.emergencyContact?.notes||"",
    isPrimary:item?.emergencyContact?.isPrimary!==undefined?item.emergencyContact.isPrimary:true,
    isActive:item?.emergencyContact?.isActive!==undefined?item.emergencyContact.isActive:true
   },
   activeTab:"employee"
  };
 };

 const openAddModal=()=>{
  resetForm();
  setShowFormModal(true);
 };

 const openEditModal=item=>{
  setFormMode("edit");
  setSelectedEmployee(item);
  setFormData(mapEmployeeToForm(item));
  setShowFormModal(true);
 };

 const openDeleteModal=item=>{
  setSelectedEmployee(item);
  setShowDeleteModal(true);
 };

 const closeFormModal=()=>{
  setShowFormModal(false);
  resetForm();
 };

 const closeDeleteModal=()=>{
  setShowDeleteModal(false);
  setSelectedEmployee(null);
 };

 const submitEmployee=async payload=>{
  const method=formMode==="edit"?"PUT":"POST";
  const url=formMode==="edit"?`/api/employees/${selectedEmployee._id}`:"/api/employees";
  const res=await fetch(url,{
   method,
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify(payload)
  });
  const data=await res.json();
  if(!res.ok)throw new Error(data?.message||"Failed to save employee");
  return Array.isArray(data)?data:data?.data||data;
 };

 const submitEmployeeDetails=async(employeeId,businessId)=>{
  const payload={
   ...formData.employeeDetails,
   employee:employeeId,
   business:formData.employeeDetails.business||businessId
  };

  if(!payload.employee||!payload.business)return null;

  const hasExisting=selectedEmployee?.employeeDetails?._id||selectedEmployee?.employeeDetails;
  const hasAnyValue=Object.entries(payload).some(([key,value])=>{
   if(key==="employee"||key==="business")return false;
   if(Array.isArray(value))return value.length>0;
   if(typeof value==="boolean")return true;
   return value!==""&&value!==null&&value!==undefined;
  });

  if(!hasAnyValue&&!hasExisting)return null;

  const method=hasExisting?"PUT":"POST";
  const url=hasExisting?`/api/employee-details/${selectedEmployee.employeeDetails._id||selectedEmployee.employeeDetails}`:"/api/employee-details";
  const res=await fetch(url,{
   method,
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify(payload)
  });
  const data=await res.json();
  if(!res.ok)throw new Error(data?.message||"Failed to save employee details");
  return Array.isArray(data)?data:data?.data||data;
 };

 const submitEmergencyContact=async(employeeId,businessId)=>{
  const payload={
   ...formData.emergencyContact,
   employee:employeeId,
   business:formData.emergencyContact.business||businessId
  };

  if(!payload.employee||!payload.business)return null;

  const hasExisting=selectedEmployee?.emergencyContact?._id||selectedEmployee?.emergencyContact;
  const hasAnyValue=Object.entries(payload).some(([key,value])=>{
   if(key==="employee"||key==="business")return false;
   if(typeof value==="boolean")return true;
   return value!==""&&value!==null&&value!==undefined;
  });

  if(!hasAnyValue&&!hasExisting)return null;

  const method=hasExisting?"PUT":"POST";
  const url=hasExisting?`/api/emergency-contacts/${selectedEmployee.emergencyContact._id||selectedEmployee.emergencyContact}`:"/api/emergency-contacts";
  const res=await fetch(url,{
   method,
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify(payload)
  });
  const data=await res.json();
  if(!res.ok)throw new Error(data?.message||"Failed to save emergency contact");
  return Array.isArray(data)?data:data?.data||data;
 };

 const handleSubmit=async e=>{
  e.preventDefault();
  try{
   setSaving(true);
   setError("");
   setSuccess("");

   const employeePayload={
    ...formData.employee,
    employeeDetails:formMode==="edit"?(selectedEmployee?.employeeDetails?._id||selectedEmployee?.employeeDetails||null):null,
    emergencyContact:formMode==="edit"?(selectedEmployee?.emergencyContact?._id||selectedEmployee?.emergencyContact||null):null
   };

   const employeeResponse=await submitEmployee(employeePayload);
   const employeeId=employeeResponse?._id||selectedEmployee?._id;
   const businessId=employeeResponse?.business?._id||employeeResponse?.business||employeePayload.business;

   const employeeDetailsResponse=await submitEmployeeDetails(employeeId,businessId);
   const emergencyContactResponse=await submitEmergencyContact(employeeId,businessId);

   if(employeeDetailsResponse||emergencyContactResponse){
    await fetch(`/api/employees/${employeeId}`,{
     method:"PUT",
     headers:{"Content-Type":"application/json"},
     body:JSON.stringify({
      employeeDetails:employeeDetailsResponse?._id||employeeResponse?.employeeDetails||null,
      emergencyContact:emergencyContactResponse?._id||employeeResponse?.emergencyContact||null
     })
    });
   }

   await loadEmployees();
   setSuccess(formMode==="edit"?"Employee updated successfully":"Employee created successfully");
   closeFormModal();
  }catch(err){
   setError(err?.message||"Failed to save employee");
  }finally{
   setSaving(false);
  }
 };

 const handleDelete=async()=>{
  if(!selectedEmployee?._id)return;
  try{
   setDeleting(true);
   setError("");
   setSuccess("");

   const employeeDetailsId=selectedEmployee?.employeeDetails?._id||selectedEmployee?.employeeDetails||"";
   const emergencyContactId=selectedEmployee?.emergencyContact?._id||selectedEmployee?.emergencyContact||"";

   if(employeeDetailsId){
    await fetch(`/api/employee-details/${employeeDetailsId}`,{method:"DELETE"});
   }

   if(emergencyContactId){
    await fetch(`/api/emergency-contacts/${emergencyContactId}`,{method:"DELETE"});
   }

   const res=await fetch(`/api/employees/${selectedEmployee._id}`,{method:"DELETE"});
   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||"Failed to delete employee");

   await loadEmployees();
   setSuccess("Employee deleted successfully");
   closeDeleteModal();
  }catch(err){
   setError(err?.message||"Failed to delete employee");
  }finally{
   setDeleting(false);
  }
 };

 return(
  <div className="container-fluid py-3">
   <Row className="mb-3">
    <Col md={8}>
     <h3 className="mb-0">Employees</h3>
    </Col>
    <Col md={4} className="text-md-end">
     <Button onClick={openAddModal}>Add Employee</Button>
    </Col>
   </Row>

   {error?<Alert variant="danger">{error}</Alert>:null}
   {success?<Alert variant="success">{success}</Alert>:null}

   <Card>
    <Card.Body>
     <Row className="mb-3">
      <Col md={8}>
       <Form.Control
        placeholder="Search by name, email, or employee ID"
        value={search}
        onChange={e=>setSearch(e.target.value)}
       />
      </Col>
      <Col md={4}>
       <Form.Select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
        <option value="">All Statuses</option>
        <option value="active">active</option>
        <option value="inactive">inactive</option>
        <option value="terminated">terminated</option>
        <option value="on-leave">on-leave</option>
        <option value="vacation">vacation</option>
       </Form.Select>
      </Col>
     </Row>

     {loading?(
      <div className="py-4 text-center">
       <Spinner animation="border"/>
      </div>
     ):(
      <Table responsive striped hover>
       <thead>
        <tr>
         <th>Employee ID</th>
         <th>Name</th>
         <th>Email</th>
         <th>Department</th>
         <th>Role</th>
         <th>Status</th>
         <th>Pay Type</th>
         <th>Actions</th>
        </tr>
       </thead>
       <tbody>
        {filteredEmployees.length?filteredEmployees.map(item=>(
         <tr key={item._id}>
          <td>{item.employeeId}</td>
          <td>{item.fullName||`${item.firstName||""} ${item.lastName||""}`.trim()}</td>
          <td>{item.email}</td>
          <td>{item.department?.name||""}</td>
          <td>{item.role?.name||""}</td>
          <td>
           <Badge bg={item.status==="active"?"success":item.status==="terminated"?"danger":"secondary"}>
            {item.status}
           </Badge>
          </td>
          <td>{item.payType}</td>
          <td className="d-flex gap-2">
           <Button size="sm" variant="outline-primary" onClick={()=>openEditModal(item)}>Edit</Button>
           <Button size="sm" variant="outline-danger" onClick={()=>openDeleteModal(item)}>Delete</Button>
          </td>
         </tr>
        )):(
         <tr>
          <td colSpan={8} className="text-center py-4">No employees found</td>
         </tr>
        )}
       </tbody>
      </Table>
     )}
    </Card.Body>
   </Card>

   <Modal show={showFormModal} onHide={closeFormModal} size="xl" backdrop="static">
    <Modal.Header closeButton>
     <Modal.Title>{formMode==="edit"?"Edit Employee":"Add Employee"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <EmployeeForm
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      loading={saving}
      businesses={businesses}
      departments={departments}
      roles={roles}
      shiftLocations={shiftLocations}
      users={users}
      states={states}
      counties={counties}
      countries={countries}
      employees={employees}
     />
    </Modal.Body>
   </Modal>

   <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
    <Modal.Header closeButton>
     <Modal.Title>Delete Employee</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     Are you sure you want to delete <strong>{selectedEmployee?.fullName||`${selectedEmployee?.firstName||""} ${selectedEmployee?.lastName||""}`.trim()}</strong>?
    </Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={closeDeleteModal} disabled={deleting}>Cancel</Button>
     <Button variant="danger" onClick={handleDelete} disabled={deleting}>
      {deleting?"Deleting...":"Delete"}
     </Button>
    </Modal.Footer>
   </Modal>
  </div>
 );
}

export default EmployeesPage;