// /pages/shift/AvailabilityPage.jsx
import {useEffect,useMemo,useState} from "react";
import {Container,Row,Col,Card,Form,Button,Alert,Spinner} from "react-bootstrap";
import {CalendarDays,Save,Plus,Trash2} from "lucide-react";

const dayLabels=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const emptyRange=()=>({start:"09:00",end:"17:00"});

function AvailabilityPage(){

 const [employees,setEmployees]=useState([]);
 const [selectedEmployee,setSelectedEmployee]=useState("");
 const [availability,setAvailability]=useState({weekly:[],overrides:[]});
 const [loading,setLoading]=useState(false);
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState("");
 const [variant,setVariant]=useState("secondary");

 useEffect(()=>{
  fetchEmployees();
 },[]);

 const fetchEmployees=async()=>{
  try{
   const res=await fetch("/api/employees");
   const data=await res.json().catch(()=>[]);
   if(res.ok)setEmployees(Array.isArray(data)?data:(data?.data||[]));
  }catch{}
 };

 const fetchAvailability=async(employeeId)=>{
  if(!employeeId)return;
  setLoading(true);
  try{
   const res=await fetch(`/api/availability?employee=${employeeId}`);
   const data=await res.json().catch(()=>({weekly:[],overrides:[]}));
   if(res.ok){
    setAvailability({
     weekly:data?.weekly||[],
     overrides:data?.overrides||[]
    });
   }
  }catch{
   setAvailability({weekly:[],overrides:[]});
  }finally{
   setLoading(false);
  }
 };

 const handleEmployeeChange=(id)=>{
  setSelectedEmployee(id);
  fetchAvailability(id);
 };

 const getDayAvailability=(dayIndex)=>{
  return availability.weekly.find((d)=>Number(d.dayOfWeek)===dayIndex)||{
   dayOfWeek:dayIndex,
   isAvailable:false,
   ranges:[]
  };
 };

 const updateDay=(dayIndex,updates)=>{
  setAvailability((prev)=>{
   const existing=prev.weekly.find((d)=>Number(d.dayOfWeek)===dayIndex);
   let updatedWeekly=[...prev.weekly];

   if(existing){
    updatedWeekly=updatedWeekly.map((d)=>
     Number(d.dayOfWeek)===dayIndex?{...d,...updates}:d
    );
   }else{
    updatedWeekly.push({
     dayOfWeek:dayIndex,
     isAvailable:false,
     ranges:[],
     ...updates
    });
   }

   return {...prev,weekly:updatedWeekly};
  });
 };

 const addRange=(dayIndex)=>{
  const day=getDayAvailability(dayIndex);
  const ranges=[...(day.ranges||[]),emptyRange()];
  updateDay(dayIndex,{ranges});
 };

 const updateRange=(dayIndex,index,key,value)=>{
  const day=getDayAvailability(dayIndex);
  const ranges=[...(day.ranges||[])];
  ranges[index]={...ranges[index],[key]:value};
  updateDay(dayIndex,{ranges});
 };

 const removeRange=(dayIndex,index)=>{
  const day=getDayAvailability(dayIndex);
  const ranges=(day.ranges||[]).filter((_,i)=>i!==index);
  updateDay(dayIndex,{ranges});
 };

 const toggleDay=(dayIndex)=>{
  const day=getDayAvailability(dayIndex);
  updateDay(dayIndex,{isAvailable:!day.isAvailable});
 };

 const handleSave=async()=>{
  if(!selectedEmployee)return;

  setSaving(true);
  setMessage("");

  try{
   const res=await fetch("/api/availability",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
     employee:selectedEmployee,
     weekly:availability.weekly
    })
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok){
    setVariant("danger");
    setMessage(data?.message||"Failed to save availability.");
   }else{
    setVariant("success");
    setMessage("Availability saved.");
   }
  }catch{
   setVariant("danger");
   setMessage("Network error.");
  }finally{
   setSaving(false);
  }
 };

 const selectedEmployeeName=useMemo(()=>{
  const emp=employees.find((e)=>String(e._id)===selectedEmployee);
  return emp?.fullName||`${emp?.firstName||""} ${emp?.lastName||""}`.trim();
 },[employees,selectedEmployee]);

 return(
  <Container fluid className="py-4">
   <Row className="justify-content-center">
    <Col xl={10}>
     <Card className="shadow-sm border-0">
      <Card.Body className="p-4">

       <div className="d-flex align-items-center gap-2 mb-3">
        <CalendarDays size={22}/>
        <h2 className="mb-0">Availability</h2>
       </div>

       <Form.Group className="mb-4">
        <Form.Label>Select Employee</Form.Label>
        <Form.Select value={selectedEmployee} onChange={(e)=>handleEmployeeChange(e.target.value)}>
         <option value="">Select employee</option>
         {employees.map((emp)=>(
          <option key={emp._id} value={emp._id}>
           {emp.fullName||`${emp.firstName} ${emp.lastName}`}
          </option>
         ))}
        </Form.Select>
       </Form.Group>

       {message?(
        <Alert variant={variant}>{message}</Alert>
       ):null}

       {loading?(
        <div className="text-center py-5">
         <Spinner animation="border"/>
        </div>
       ):selectedEmployee?(
        <>
         <h5 className="mb-3">{selectedEmployeeName}</h5>

         <Row className="g-3">
          {dayLabels.map((label,dayIndex)=>{
           const day=getDayAvailability(dayIndex);

           return(
            <Col md={6} key={dayIndex}>
             <Card className="border">
              <Card.Body>

               <div className="d-flex justify-content-between align-items-center mb-2">
                <strong>{label}</strong>
                <Form.Check
                 type="switch"
                 checked={day.isAvailable}
                 onChange={()=>toggleDay(dayIndex)}
                />
               </div>

               {day.isAvailable&&(
                <>
                 {(day.ranges||[]).map((range,index)=>(
                  <Row className="mb-2" key={index}>
                   <Col xs={5}>
                    <Form.Control
                     type="time"
                     value={range.start}
                     onChange={(e)=>updateRange(dayIndex,index,"start",e.target.value)}
                    />
                   </Col>
                   <Col xs={5}>
                    <Form.Control
                     type="time"
                     value={range.end}
                     onChange={(e)=>updateRange(dayIndex,index,"end",e.target.value)}
                    />
                   </Col>
                   <Col xs={2}>
                    <Button variant="outline-danger" size="sm" onClick={()=>removeRange(dayIndex,index)}>
                     <Trash2 size={14}/>
                    </Button>
                   </Col>
                  </Row>
                 ))}

                 <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={()=>addRange(dayIndex)}
                  className="d-flex align-items-center gap-1"
                 >
                  <Plus size={14}/>
                  Add Time
                 </Button>
                </>
               )}

              </Card.Body>
             </Card>
            </Col>
           );
          })}
         </Row>

         <div className="mt-4 text-end">
          <Button onClick={handleSave} disabled={saving}>
           <span className="d-inline-flex align-items-center gap-2">
            {saving?<Spinner size="sm" animation="border"/>:<Save size={16}/>}
            Save Availability
           </span>
          </Button>
         </div>
        </>
       ):null}

      </Card.Body>
     </Card>
    </Col>
   </Row>
  </Container>
 );
}

export default AvailabilityPage;