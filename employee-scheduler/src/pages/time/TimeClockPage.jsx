// /pages/time/TimeClockPage.jsx
import {useMemo,useState} from "react";
import {Container,Row,Col,Card,Form,Button,Alert,Badge,Spinner} from "react-bootstrap";
import {Clock3,LogIn,LogOut,Coffee,UtensilsCrossed,RefreshCw,AlertTriangle,ShieldCheck,Delete} from "lucide-react";

function TimeClockPage(){

 const [businessId,setBusinessId]=useState("");
 const [clockId,setClockId]=useState("");
 const [shiftId,setShiftId]=useState("");
 const [status,setStatus]=useState("idle");
 const [message,setMessage]=useState("");
 const [variant,setVariant]=useState("secondary");
 const [loading,setLoading]=useState(false);
 const [entry,setEntry]=useState(null);
 const [lastAction,setLastAction]=useState("");
 const [showShiftField,setShowShiftField]=useState(false);

 const canSubmit=useMemo(()=>{
  return businessId.trim()&&clockId.trim().length===5;
 },[businessId,clockId]);

 const resetFeedback=()=>{
  setMessage("");
  setVariant("secondary");
 };

 const setSuccess=(text,data=null,action="")=>{
  setVariant("success");
  setMessage(text);
  if(data)setEntry(data);
  if(action)setLastAction(action);
  setStatus("success");
 };

 const setError=(text)=>{
  setVariant("danger");
  setMessage(text);
  setStatus("error");
 };

 const formatDateTime=(value)=>{
  if(!value)return "--";
  const date=new Date(value);
  return date.toLocaleString();
 };

 const formatMinutes=(value)=>{
  const minutes=Number(value||0);
  if(!minutes)return "0m";
  const hours=Math.floor(minutes/60);
  const mins=minutes%60;
  if(hours&&mins)return `${hours}h ${mins}m`;
  if(hours)return `${hours}h`;
  return `${mins}m`;
 };

 const currentStatus=entry?.status||"not-clocked-in";

 const handleDigit=(digit)=>{
  if(loading)return;
  setClockId((prev)=>{
   if(prev.length>=5)return prev;
   return `${prev}${digit}`;
  });
 };

 const handleBackspace=()=>{
  if(loading)return;
  setClockId((prev)=>prev.slice(0,-1));
 };

 const handleClear=()=>{
  if(loading)return;
  setClockId("");
 };

 const postAction=async(url,body,successText,actionName)=>{
  if(!canSubmit||loading)return;

  setLoading(true);
  resetFeedback();

  try{
   const response=await fetch(url,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(body)
   });

   const data=await response.json().catch(()=>({}));

   if(!response.ok){
    setError(data?.message||"Request failed.");
    return;
   }

   setSuccess(successText,data,actionName);
  }catch(error){
   setError(error?.message||"Network error.");
  }finally{
   setLoading(false);
  }
 };

 const handleClockIn=()=>{
  postAction(
   "/api/time/clock-in",
   {
    business:businessId.trim(),
    clockId:clockId.trim(),
    shiftId:shiftId.trim()||null,
    method:"kiosk"
   },
   "Clock-in recorded.",
   "clock-in"
  );
 };

 const handleClockOut=()=>{
  postAction(
   "/api/time/clock-out",
   {
    business:businessId.trim(),
    clockId:clockId.trim(),
    method:"kiosk"
   },
   "Clock-out recorded.",
   "clock-out"
  );
 };

 const handleBreakStart=()=>{
  postAction(
   "/api/time/break-start",
   {
    business:businessId.trim(),
    clockId:clockId.trim(),
    type:"break",
    method:"kiosk"
   },
   "Break started.",
   "break-start"
  );
 };

 const handleBreakEnd=()=>{
  postAction(
   "/api/time/break-end",
   {
    business:businessId.trim(),
    clockId:clockId.trim(),
    method:"kiosk"
   },
   "Break ended.",
   "break-end"
  );
 };

 const handleLunchStart=()=>{
  postAction(
   "/api/time/break-start",
   {
    business:businessId.trim(),
    clockId:clockId.trim(),
    type:"lunch",
    method:"kiosk"
   },
   "Lunch started.",
   "lunch-start"
  );
 };

 const handleLunchEnd=()=>{
  postAction(
   "/api/time/break-end",
   {
    business:businessId.trim(),
    clockId:clockId.trim(),
    method:"kiosk"
   },
   "Lunch ended.",
   "lunch-end"
  );
 };

 const handleRefresh=async()=>{
  if(!canSubmit||loading)return;

  setLoading(true);
  resetFeedback();

  try{
   const params=new URLSearchParams({
    business:businessId.trim(),
    clockId:clockId.trim()
   });

   const response=await fetch(`/api/time/active-entry?${params.toString()}`);
   const data=await response.json().catch(()=>({}));

   if(!response.ok){
    setError(data?.message||"Unable to load current status.");
    return;
   }

   setEntry(data||null);
   setVariant("info");
   setMessage("Status refreshed.");
   setStatus("success");
  }catch(error){
   setError(error?.message||"Network error.");
  }finally{
   setLoading(false);
  }
 };

 return(
  <Container fluid className="py-4">
   <Row className="justify-content-center">
    <Col xxl={9} xl={10}>
     <Card className="shadow-sm border-0">
      <Card.Body className="p-4 p-lg-5">

       <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div>
         <div className="d-flex align-items-center gap-2 mb-2">
          <Clock3 size={26}/>
          <h2 className="mb-0">Employee Time Clock</h2>
         </div>
         <div className="text-muted">Enter your 5-digit clock number to clock in, out, or manage breaks.</div>
        </div>

        <div className="d-flex align-items-center gap-2">
         <Badge bg={
          currentStatus==="active"?"success":
          currentStatus==="on-break"?"warning":
          currentStatus==="completed"?"secondary":
          currentStatus==="missed-clock-out"?"danger":
          "dark"
         } className="px-3 py-2 text-uppercase">
          {String(currentStatus).replace(/-/g," ")}
         </Badge>

         <Button variant="outline-secondary" onClick={handleRefresh} disabled={!canSubmit||loading}>
          {loading?<Spinner size="sm" animation="border"/>:<RefreshCw size={16}/>}
         </Button>
        </div>
       </div>

       {message?(
        <Alert variant={variant} className="d-flex align-items-start gap-2">
         {variant==="danger"?<AlertTriangle size={18} className="mt-1"/>:<ShieldCheck size={18} className="mt-1"/>}
         <div>{message}</div>
        </Alert>
       ):null}

       <Row className="g-4">
        <Col lg={5}>
         <Card className="border h-100 shadow-sm">
          <Card.Body className="p-4">
           <h4 className="mb-4">Clock Number Entry</h4>

           <Form.Group className="mb-3">
            <Form.Label>Business ID</Form.Label>
            <Form.Control value={businessId} onChange={(e)=>setBusinessId(e.target.value)} placeholder="Enter business ID"/>
           </Form.Group>

           <div className="mb-2">
            <div className="fw-semibold mb-2">Clock Number</div>
            <div className="border rounded-3 px-3 py-3 bg-white text-center">
             <div className="display-5 fw-bold mb-0" style={{letterSpacing:"0.45rem",minHeight:"3.5rem"}}>
              {clockId.padEnd(5,"•")}
             </div>
            </div>
            <div className="small text-muted mt-2">Employees enter the 5-digit numeric clock number only.</div>
           </div>

           {showShiftField?(
            <Form.Group className="mt-3">
             <Form.Label>Shift ID</Form.Label>
             <Form.Control value={shiftId} onChange={(e)=>setShiftId(e.target.value)} placeholder="Optional shift ID"/>
            </Form.Group>
           ):null}

           <div className="d-grid gap-2 mt-4">
            <Row className="g-2">
             {["1","2","3","4","5","6","7","8","9"].map((digit)=>(
              <Col xs={4} key={digit}>
               <Button variant="light" className="w-100 py-3 fs-4 fw-bold border" onClick={()=>handleDigit(digit)} disabled={loading}>
                {digit}
               </Button>
              </Col>
             ))}
             <Col xs={4}>
              <Button variant="outline-secondary" className="w-100 py-3" onClick={()=>setShowShiftField((prev)=>!prev)} disabled={loading}>
               Shift
              </Button>
             </Col>
             <Col xs={4}>
              <Button variant="light" className="w-100 py-3 fs-4 fw-bold border" onClick={()=>handleDigit("0")} disabled={loading}>
               0
              </Button>
             </Col>
             <Col xs={4}>
              <Button variant="outline-danger" className="w-100 py-3" onClick={handleBackspace} disabled={loading}>
               <Delete size={18}/>
              </Button>
             </Col>
            </Row>

            <Button variant="outline-dark" className="py-2" onClick={handleClear} disabled={loading}>
             Clear
            </Button>
           </div>
          </Card.Body>
         </Card>
        </Col>

        <Col lg={7}>
         <Row className="g-3">
          <Col md={6}>
           <Card className="border h-100 shadow-sm">
            <Card.Body className="d-grid gap-2">
             <h5 className="mb-2">Clock Actions</h5>

             <Button variant="success" size="lg" onClick={handleClockIn} disabled={!canSubmit||loading}>
              <span className="d-inline-flex align-items-center gap-2">
               <LogIn size={18}/>
               Clock In
              </span>
             </Button>

             <Button variant="danger" size="lg" onClick={handleClockOut} disabled={!canSubmit||loading}>
              <span className="d-inline-flex align-items-center gap-2">
               <LogOut size={18}/>
               Clock Out
              </span>
             </Button>
            </Card.Body>
           </Card>
          </Col>

          <Col md={6}>
           <Card className="border h-100 shadow-sm">
            <Card.Body className="d-grid gap-2">
             <h5 className="mb-2">Breaks & Lunch</h5>

             <Button variant="warning" size="lg" onClick={handleBreakStart} disabled={!canSubmit||loading}>
              <span className="d-inline-flex align-items-center gap-2">
               <Coffee size={18}/>
               Start Break
              </span>
             </Button>

             <Button variant="outline-warning" size="lg" onClick={handleBreakEnd} disabled={!canSubmit||loading}>
              End Break
             </Button>

             <Button variant="primary" size="lg" onClick={handleLunchStart} disabled={!canSubmit||loading}>
              <span className="d-inline-flex align-items-center gap-2">
               <UtensilsCrossed size={18}/>
               Start Lunch
              </span>
             </Button>

             <Button variant="outline-primary" size="lg" onClick={handleLunchEnd} disabled={!canSubmit||loading}>
              End Lunch
             </Button>
            </Card.Body>
           </Card>
          </Col>

          <Col xs={12}>
           <Card className="border shadow-sm">
            <Card.Body>
             <h5 className="mb-3">Current Entry</h5>

             <Row className="g-3">
              <Col md={4}>
               <div className="small text-muted mb-1">Last Action</div>
               <div className="fw-semibold text-uppercase">{lastAction||"--"}</div>
              </Col>

              <Col md={4}>
               <div className="small text-muted mb-1">Status</div>
               <div className="fw-semibold text-uppercase">{String(currentStatus).replace(/-/g," ")}</div>
              </Col>

              <Col md={4}>
               <div className="small text-muted mb-1">Clock Number</div>
               <div className="fw-semibold">{clockId||"--"}</div>
              </Col>

              <Col md={6}>
               <div className="small text-muted mb-1">Clock In</div>
               <div>{formatDateTime(entry?.clockIn)}</div>
              </Col>

              <Col md={6}>
               <div className="small text-muted mb-1">Clock Out</div>
               <div>{formatDateTime(entry?.clockOut)}</div>
              </Col>

              <Col md={4}>
               <div className="small text-muted mb-1">Worked</div>
               <div>{formatMinutes(entry?.totalWorkedMinutes)}</div>
              </Col>

              <Col md={4}>
               <div className="small text-muted mb-1">Breaks</div>
               <div>{formatMinutes(entry?.totalBreakMinutes)}</div>
              </Col>

              <Col md={4}>
               <div className="small text-muted mb-1">Overtime</div>
               <div>{formatMinutes(entry?.overtimeMinutes)}</div>
              </Col>
             </Row>
            </Card.Body>
           </Card>
          </Col>
         </Row>
        </Col>
       </Row>

      </Card.Body>
     </Card>
    </Col>
   </Row>
  </Container>
 );
}

export default TimeClockPage;