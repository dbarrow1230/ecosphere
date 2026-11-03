import {useCallback,useEffect,useMemo,useState} from "react";
import {Card,Container,Row,Col,Button,Form,Spinner,Alert,Badge} from "react-bootstrap";
import {Calendar as BigCalendar,dateFnsLocalizer,Views} from "react-big-calendar";
import {format,parse,startOfWeek,getDay,addDays,setHours,setMinutes,startOfMonth,endOfMonth,startOfWeek as dfStartOfWeek,endOfWeek as dfEndOfWeek,startOfDay} from "date-fns";
import enUS from "date-fns/locale/en-US";
import {CalendarDays,RefreshCw,Filter} from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../styles/shift/ShiftCalendarPage.css";

const locales={"en-US":enUS};

const localizer=dateFnsLocalizer({
 format,
 parse,
 startOfWeek:(date)=>startOfWeek(date,{weekStartsOn:0}),
 getDay,
 locales
});

const dayLabels=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function ShiftCalendarPage(){

 const [employees,setEmployees]=useState([]);
 const [availability,setAvailability]=useState([]);
 const [events,setEvents]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [view,setView]=useState(Views.MONTH);
 const [date,setDate]=useState(new Date());
 const [selectedEmployee,setSelectedEmployee]=useState("all");
 const [selectedDepartment,setSelectedDepartment]=useState("all");

 const fetchData=useCallback(async()=>{
  setLoading(true);
  setError("");

  try{
   const [employeeRes,availabilityRes]=await Promise.all([
    fetch("/api/employees"),
    fetch("/api/availability")
   ]);

   const employeeJson=await employeeRes.json().catch(()=>[]);
   const availabilityJson=await availabilityRes.json().catch(()=>[]);

   if(!employeeRes.ok)throw new Error(employeeJson?.message||"Failed to load employees.");
   if(!availabilityRes.ok)throw new Error(availabilityJson?.message||"Failed to load availability.");

   setEmployees(Array.isArray(employeeJson)?employeeJson:(employeeJson?.data||[]));
   setAvailability(Array.isArray(availabilityJson)?availabilityJson:(availabilityJson?.data||[]));
  }catch(err){
   setError(err?.message||"Failed to load shift calendar data.");
  }finally{
   setLoading(false);
  }
 },[]);

 useEffect(()=>{
  fetchData();
 },[fetchData]);

 const departments=useMemo(()=>{
  const map=new Map();
  employees.forEach((employee)=>{
   const departmentId=employee?.department?._id||employee?.department||"";
   const departmentName=employee?.department?.name||employee?.departmentName||"";
   if(departmentId&&departmentName&&!map.has(String(departmentId))){
    map.set(String(departmentId),{id:String(departmentId),name:departmentName});
   }
  });
  return Array.from(map.values()).sort((a,b)=>a.name.localeCompare(b.name));
 },[employees]);

 const filteredEmployees=useMemo(()=>{
  return employees.filter((employee)=>{
   const matchesEmployee=selectedEmployee==="all"||String(employee?._id)===selectedEmployee;
   const departmentId=employee?.department?._id||employee?.department||"";
   const matchesDepartment=selectedDepartment==="all"||String(departmentId)===selectedDepartment;
   return matchesEmployee&&matchesDepartment;
  });
 },[employees,selectedEmployee,selectedDepartment]);

 const filteredEmployeeIds=useMemo(()=>{
  return new Set(filteredEmployees.map((employee)=>String(employee?._id)));
 },[filteredEmployees]);

 const employeeMap=useMemo(()=>{
  const map=new Map();
  employees.forEach((employee)=>{
   map.set(String(employee?._id),employee);
  });
  return map;
 },[employees]);

 const getRangeForView=useCallback((currentDate,currentView)=>{
  if(currentView===Views.DAY){
   const start=startOfDay(currentDate);
   const end=addDays(start,1);
   return {start,end};
  }

  if(currentView===Views.WEEK){
   const start=dfStartOfWeek(currentDate,{weekStartsOn:0});
   const end=addDays(dfEndOfWeek(currentDate,{weekStartsOn:0}),1);
   return {start,end};
  }

  if(currentView===Views.AGENDA){
   const start=startOfDay(currentDate);
   const end=addDays(start,30);
   return {start,end};
  }

  const start=dfStartOfWeek(startOfMonth(currentDate),{weekStartsOn:0});
  const end=addDays(dfEndOfWeek(endOfMonth(currentDate),{weekStartsOn:0}),1);
  return {start,end};
 },[]);

 const createEventDateTime=(baseDate,timeString)=>{
  const [hourString,minuteString]=String(timeString||"00:00").split(":");
  return setMinutes(setHours(new Date(baseDate),Number(hourString||0)),Number(minuteString||0));
 };

 const buildAvailabilityEvents=useCallback(()=>{
  const range=getRangeForView(date,view);
  const built=[];

  availability.forEach((availabilityItem)=>{
   const employeeId=String(availabilityItem?.employee?._id||availabilityItem?.employee||"");
   if(!employeeId||!filteredEmployeeIds.has(employeeId))return;

   const employee=employeeMap.get(employeeId);
   if(!employee)return;

   const fullName=employee?.fullName||`${employee?.firstName||""} ${employee?.lastName||""}`.trim()||employee?.employeeId||"Employee";
   const roleName=employee?.role?.name||employee?.roleName||"";
   const departmentName=employee?.department?.name||employee?.departmentName||"";

   for(let cursor=new Date(range.start);cursor<range.end;cursor=addDays(cursor,1)){
    const dayOfWeek=getDay(cursor);

    const override=(availabilityItem?.overrides||[]).find((item)=>{
     if(!item?.date)return false;
     return format(new Date(item.date),"yyyy-MM-dd")===format(cursor,"yyyy-MM-dd");
    });

    if(override){
     if(override.isAvailable===false)continue;
     (override.ranges||[]).forEach((timeRange,index)=>{
      if(!timeRange?.start||!timeRange?.end)return;
      const start=createEventDateTime(cursor,timeRange.start);
      const end=createEventDateTime(cursor,timeRange.end);
      built.push({
       id:`${employeeId}-${format(cursor,"yyyyMMdd")}-override-${index}`,
       title:`${fullName} ${format(start,"h:mm a")} - ${format(end,"h:mm a")}`,
       start,
       end,
       resource:{
        employeeId,
        fullName,
        roleName,
        departmentName,
        source:"override",
        dayLabel:dayLabels[dayOfWeek]
       }
      });
     });
     continue;
    }

    const weekly=(availabilityItem?.weekly||[]).find((item)=>Number(item?.dayOfWeek)===dayOfWeek);

    if(!weekly||weekly.isAvailable===false)continue;

    (weekly.ranges||[]).forEach((timeRange,index)=>{
     if(!timeRange?.start||!timeRange?.end)return;
     const start=createEventDateTime(cursor,timeRange.start);
     const end=createEventDateTime(cursor,timeRange.end);
     built.push({
      id:`${employeeId}-${format(cursor,"yyyyMMdd")}-weekly-${index}`,
      title:`${fullName} ${format(start,"h:mm a")} - ${format(end,"h:mm a")}`,
      start,
      end,
      resource:{
       employeeId,
       fullName,
       roleName,
       departmentName,
       source:"weekly",
       dayLabel:dayLabels[dayOfWeek]
      }
     });
    });
   }
  });

  return built;
 },[availability,date,view,filteredEmployeeIds,employeeMap,getRangeForView]);

 useEffect(()=>{
  setEvents(buildAvailabilityEvents());
 },[buildAvailabilityEvents]);

 const eventStyleGetter=(event)=>{
  const source=event?.resource?.source||"weekly";
  return {
   style:{
    backgroundColor:source==="override"?"#0d6efd":"#198754",
    border:"none",
    borderRadius:"6px",
    color:"#fff",
    padding:"2px 6px",
    fontSize:"0.85rem"
   }
  };
 };

 const formats={
  eventTimeRangeFormat:({start,end},culture,loc)=>`${loc.format(start,"h:mm a",culture)} - ${loc.format(end,"h:mm a",culture)}`,
  dayHeaderFormat:(value,culture,loc)=>loc.format(value,"EEEE MMM d",culture),
  dayRangeHeaderFormat:({start,end},culture,loc)=>`${loc.format(start,"MMM d",culture)} - ${loc.format(end,"MMM d",culture)}`
 };

 const selectedCountLabel=`${events.length} shift${events.length===1?"":"s"} shown`;

 return(
  <Container fluid className="py-4">
   <Row className="justify-content-center">
    <Col xxl={11}>
     <Card className="shadow-sm border-0">
      <Card.Body className="p-4">
       <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div>
         <div className="d-flex align-items-center gap-2 mb-2">
          <CalendarDays size={24}/>
          <h2 className="mb-0">Shift Calendar</h2>
         </div>
         <div className="text-muted">Employee shift times by day from preferred availability stored in the database.</div>
        </div>

        <div className="d-flex align-items-center gap-2">
         <Badge bg="dark" className="px-3 py-2">{selectedCountLabel}</Badge>
         <Button variant="outline-secondary" onClick={fetchData} disabled={loading}>
          <span className="d-inline-flex align-items-center gap-2">
           {loading?<Spinner size="sm" animation="border"/>:<RefreshCw size={16}/>}
           Refresh
          </span>
         </Button>
        </div>
       </div>

       {error?(
        <Alert variant="danger" className="mb-4">{error}</Alert>
       ):null}

       <Card className="border mb-4">
        <Card.Body>
         <div className="d-flex align-items-center gap-2 mb-3">
          <Filter size={18}/>
          <h5 className="mb-0">Filters</h5>
         </div>

         <Row className="g-3">
          <Col md={4}>
           <Form.Group>
            <Form.Label>Employee</Form.Label>
            <Form.Select value={selectedEmployee} onChange={(e)=>setSelectedEmployee(e.target.value)}>
             <option value="all">All Employees</option>
             {employees.map((employee)=>(
              <option key={String(employee?._id)} value={String(employee?._id)}>
               {employee?.fullName||`${employee?.firstName||""} ${employee?.lastName||""}`.trim()||employee?.employeeId}
              </option>
             ))}
            </Form.Select>
           </Form.Group>
          </Col>

          <Col md={4}>
           <Form.Group>
            <Form.Label>Department</Form.Label>
            <Form.Select value={selectedDepartment} onChange={(e)=>setSelectedDepartment(e.target.value)}>
             <option value="all">All Departments</option>
             {departments.map((department)=>(
              <option key={department.id} value={department.id}>{department.name}</option>
             ))}
            </Form.Select>
           </Form.Group>
          </Col>

          <Col md={4}>
           <Form.Group>
            <Form.Label>View</Form.Label>
            <Form.Select value={view} onChange={(e)=>setView(e.target.value)}>
             <option value={Views.MONTH}>Month</option>
             <option value={Views.WEEK}>Week</option>
             <option value={Views.DAY}>Day</option>
             <option value={Views.AGENDA}>Agenda</option>
            </Form.Select>
           </Form.Group>
          </Col>
         </Row>
        </Card.Body>
       </Card>

       <Card className="border">
        <Card.Body className="p-2 p-lg-3">
         <div style={{height:"78vh",minHeight:"650px"}}>
          <BigCalendar
           localizer={localizer}
           events={events}
           startAccessor="start"
           endAccessor="end"
           view={view}
           views={[Views.MONTH,Views.WEEK,Views.DAY,Views.AGENDA]}
           date={date}
           onView={setView}
           onNavigate={setDate}
           popup
           selectable={false}
           step={15}
           timeslots={2}
           defaultView={Views.MONTH}
           eventPropGetter={eventStyleGetter}
           formats={formats}
           tooltipAccessor={(event)=>{
            const resource=event?.resource||{};
            return [
             resource.fullName||"",
             resource.roleName?`Role: ${resource.roleName}`:"",
             resource.departmentName?`Department: ${resource.departmentName}`:"",
             `${format(event.start,"EEEE, MMM d")} ${format(event.start,"h:mm a")} - ${format(event.end,"h:mm a")}`
            ].filter(Boolean).join("\n");
           }}
           components={{
            event:({event})=>(
             <div className="rbc-event-content">
              <div className="fw-semibold">{event.resource?.fullName||event.title}</div>
              <div>{format(event.start,"h:mm a")} - {format(event.end,"h:mm a")}</div>
             </div>
            )
           }}
          />
         </div>
        </Card.Body>
       </Card>
      </Card.Body>
     </Card>
    </Col>
   </Row>
  </Container>
 );
}

export default ShiftCalendarPage;