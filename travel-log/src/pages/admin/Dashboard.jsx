// src/pages/Dashboard.jsx
import {useState,useEffect,useMemo} from "react";
import {Container,Row,Col,Card,Table,Badge,Button,ProgressBar,ListGroup,Modal,Form} from "react-bootstrap";
import {useNavigate} from "react-router-dom";

function Dashboard(){

 const navigate=useNavigate();

 const initialTaskFormData={
  title:"",
  description:"",
  event:"",
  order:"",
  priority:"normal",
  status:"pending",
  dueDate:"",
  notes:""
 };

 const [events,setEvents]=useState([]);
 const [clients,setClients]=useState([]);
 const [orders,setOrders]=useState([]);
 const [inventory,setInventory]=useState([]);
 const [tasks,setTasks]=useState([]);
 const [kitchenPrep,setKitchenPrep]=useState([]);
 const [loading,setLoading]=useState(true);
 const [showTaskModal,setShowTaskModal]=useState(false);
 const [savingTask,setSavingTask]=useState(false);
 const [taskFormData,setTaskFormData]=useState(initialTaskFormData);

 const formatDate=value=>{
  if(!value) return "-";
  const date=new Date(value);
  if(Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});
 };

 const getStatusBg=status=>{
  const normalized=String(status||"").trim().toLowerCase();
  if(normalized==="confirmed"||normalized==="active"||normalized==="completed"||normalized==="done"||normalized==="in-stock") return "success";
  if(normalized==="prep"||normalized==="in-prep"||normalized==="warning"||normalized==="low"||normalized==="in-progress") return "warning";
  if(normalized==="critical"||normalized==="out-of-stock"||normalized==="cancelled") return "danger";
  return "secondary";
 };

 const getOrderStatusLabel=status=>{
  const normalized=String(status||"").trim().toLowerCase();
  if(normalized==="in-prep") return "In Prep";
  if(normalized==="confirmed") return "Confirmed";
  if(normalized==="completed") return "Completed";
  if(normalized==="cancelled") return "Cancelled";
  if(normalized==="draft") return "Draft";
  return "Pending";
 };

 const loadDashboardData=async()=>{
  try{
   setLoading(true);

   const [
    eventsRes,
    clientsRes,
    ordersRes,
    inventoryRes,
    tasksRes,
    kitchenPrepRes
   ]=await Promise.all([
    fetch("/api/events"),
    fetch("/api/clients"),
    fetch("/api/orders"),
    fetch("/api/inventory"),
    fetch("/api/tasks"),
    fetch("/api/kitchen-prep")
   ]);

   const eventsData=eventsRes&&eventsRes.ok?await eventsRes.json():{};
   const clientsData=clientsRes&&clientsRes.ok?await clientsRes.json():{};
   const ordersData=ordersRes&&ordersRes.ok?await ordersRes.json():{};
   const inventoryData=inventoryRes&&inventoryRes.ok?await inventoryRes.json():{};
   const tasksData=tasksRes&&tasksRes.ok?await tasksRes.json():{};
   const kitchenPrepData=kitchenPrepRes&&kitchenPrepRes.ok?await kitchenPrepRes.json():{};

   setEvents(Array.isArray(eventsData?.events)?eventsData.events:Array.isArray(eventsData?.data)?eventsData.data:Array.isArray(eventsData)?eventsData:[]);
   setClients(Array.isArray(clientsData?.clients)?clientsData.clients:Array.isArray(clientsData?.data)?clientsData.data:Array.isArray(clientsData)?clientsData:[]);
   setOrders(Array.isArray(ordersData?.orders)?ordersData.orders:Array.isArray(ordersData?.data)?ordersData.data:Array.isArray(ordersData)?ordersData:[]);
   setInventory(Array.isArray(inventoryData?.inventory)?inventoryData.inventory:Array.isArray(inventoryData?.items)?inventoryData.items:Array.isArray(inventoryData?.data)?inventoryData.data:Array.isArray(inventoryData)?inventoryData:[]);
   setTasks(Array.isArray(tasksData?.tasks)?tasksData.tasks:Array.isArray(tasksData?.data)?tasksData.data:Array.isArray(tasksData)?tasksData:[]);
   setKitchenPrep(Array.isArray(kitchenPrepData?.kitchenPrep)?kitchenPrepData.kitchenPrep:Array.isArray(kitchenPrepData?.data)?kitchenPrepData.data:Array.isArray(kitchenPrepData)?kitchenPrepData:[]);
  }catch(err){
   console.error("Error loading dashboard data:",err);
   setEvents([]);
   setClients([]);
   setOrders([]);
   setInventory([]);
   setTasks([]);
   setKitchenPrep([]);
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  loadDashboardData();
 },[]);

 const handleTaskChange=e=>{
  const {name,value}=e.target;
  setTaskFormData(prev=>({...prev,[name]:value}));
 };

 const resetTaskForm=()=>{
  setTaskFormData(initialTaskFormData);
 };

 const closeTaskModal=()=>{
  setShowTaskModal(false);
  resetTaskForm();
 };

 const handleTaskSubmit=async e=>{
  e.preventDefault();
  try{
   setSavingTask(true);

   const payload={
    title:taskFormData.title,
    description:taskFormData.description,
    event:taskFormData.event||null,
    order:taskFormData.order||null,
    priority:taskFormData.priority,
    status:taskFormData.status,
    dueDate:taskFormData.dueDate||null,
    notes:taskFormData.notes
   };

   const res=await fetch("/api/tasks",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   const data=await res.json();
   const savedTask=data?.task||data?.data;

   if(res.ok&&savedTask){
    setTasks(prev=>[savedTask,...prev]);
    closeTaskModal();
   }else{
    console.error("Failed to save task:",data?.message||"Unknown error");
   }
  }catch(err){
   console.error("Error saving task:",err);
  }finally{
   setSavingTask(false);
  }
 };

 const metrics=useMemo(()=>{
  const now=new Date();
  const today=new Date();
  today.setHours(0,0,0,0);

  const weekEnd=new Date(today);
  weekEnd.setDate(weekEnd.getDate()+7);

  const next48Hours=new Date();
  next48Hours.setHours(next48Hours.getHours()+48);

  const monthStart=new Date(now.getFullYear(),now.getMonth(),1);
  const lastMonthStart=new Date(now.getFullYear(),now.getMonth()-1,1);
  const lastMonthEnd=new Date(now.getFullYear(),now.getMonth(),0,23,59,59,999);

  const eventsThisWeek=events.filter(event=>{
   const eventDate=new Date(event.eventDate);
   return !Number.isNaN(eventDate.getTime())&&eventDate>=today&&eventDate<weekEnd;
  }).length;

  const next48=events.filter(event=>{
   const eventDate=new Date(event.eventDate);
   return !Number.isNaN(eventDate.getTime())&&eventDate>=today&&eventDate<=next48Hours;
  }).length;

  const activeClients=clients.filter(client=>{
   const status=String(client?.status||"").trim().toLowerCase();
   return status==="active"||status==="";
  }).length;

  const openOrders=orders.filter(order=>{
   const status=String(order?.status||"").trim().toLowerCase();
   return status!=="completed"&&status!=="cancelled";
  }).length;

  const inProduction=kitchenPrep.filter(item=>String(item?.status||"").trim().toLowerCase()==="in-progress").length;

  const monthlyRevenue=orders.reduce((sum,order)=>{
   const status=String(order?.status||"").trim().toLowerCase();
   if(status==="cancelled"||status==="draft") return sum;
   const createdAt=order?.createdAt?new Date(order.createdAt):null;
   if(!createdAt||Number.isNaN(createdAt.getTime())||createdAt<monthStart) return sum;
   const rawTotal=order?.total?.$numberDecimal??order?.total??0;
   const total=Number(rawTotal);
   return Number.isNaN(total)?sum:sum+total;
  },0);

  const lastMonthRevenue=orders.reduce((sum,order)=>{
   const status=String(order?.status||"").trim().toLowerCase();
   if(status==="cancelled"||status==="draft") return sum;
   const createdAt=order?.createdAt?new Date(order.createdAt):null;
   if(!createdAt||Number.isNaN(createdAt.getTime())||createdAt<lastMonthStart||createdAt>lastMonthEnd) return sum;
   const rawTotal=order?.total?.$numberDecimal??order?.total??0;
   const total=Number(rawTotal);
   return Number.isNaN(total)?sum:sum+total;
  },0);

  const revenueChange=lastMonthRevenue>0?Math.round(((monthlyRevenue-lastMonthRevenue)/lastMonthRevenue)*100):0;

  return{
   eventsThisWeek,
   next48,
   activeClients,
   openOrders,
   inProduction,
   monthlyRevenue,
   revenueChange
  };
 },[events,clients,orders,kitchenPrep]);

 const upcomingEvents=useMemo(()=>{
  const now=new Date();
  return [...events]
   .filter(event=>{
    const eventDate=new Date(event.eventDate);
    return !Number.isNaN(eventDate.getTime())&&eventDate>=now;
   })
   .sort((a,b)=>new Date(a.eventDate)-new Date(b.eventDate))
   .slice(0,4);
 },[events]);

 const dashboardTasks=useMemo(()=>{
  if(tasks.length){
   return [...tasks]
    .sort((a,b)=>{
     const aDone=String(a?.status||"").trim().toLowerCase()==="completed";
     const bDone=String(b?.status||"").trim().toLowerCase()==="completed";
     if(aDone!==bDone) return aDone-bDone;
     return new Date(a?.dueDate||0)-new Date(b?.dueDate||0);
    })
    .slice(0,4)
    .map((task,index)=>({
     id:task._id||index,
     text:task.title||task.description||"Untitled task",
     done:String(task.status||"").trim().toLowerCase()==="completed",
     status:task.status||"pending"
    }));
  }

  return[
   {id:1,text:"No tasks available",done:false,status:"pending"}
  ];
 },[tasks]);

 const lowStock=useMemo(()=>{
  return [...inventory]
   .filter(item=>{
    const status=String(item?.status||"").trim().toLowerCase();
    return status==="low"||status==="out-of-stock";
   })
   .sort((a,b)=>{
    const priority=status=>{
     if(status==="out-of-stock") return 0;
     if(status==="low") return 1;
     return 2;
    };
    return priority(String(a.status||"").trim().toLowerCase())-priority(String(b.status||"").trim().toLowerCase());
   })
   .slice(0,4);
 },[inventory]);

 const kitchenProduction=useMemo(()=>{
  const getStationName=item=>{
   if(item?.station&&typeof item.station==="object") return item.station.name||"Unassigned";
   return "Unassigned";
  };

  const groupMap={};

  kitchenPrep.forEach(item=>{
   const stationName=getStationName(item);
   if(!groupMap[stationName]){
    groupMap[stationName]={name:stationName,total:0,completed:0};
   }
   groupMap[stationName].total+=1;
   if(String(item?.status||"").trim().toLowerCase()==="completed"){
    groupMap[stationName].completed+=1;
   }
  });

  return Object.values(groupMap)
   .map(group=>({
    name:group.name,
    total:group.total,
    completed:group.completed,
    percent:group.total?Math.round((group.completed/group.total)*100):0
   }))
   .sort((a,b)=>b.total-a.total)
   .slice(0,4);
 },[kitchenPrep]);

 const orderOverview=useMemo(()=>{
  return{
   draft:orders.filter(order=>String(order?.status||"").trim().toLowerCase()==="draft").length,
   pending:orders.filter(order=>String(order?.status||"").trim().toLowerCase()==="pending").length,
   confirmed:orders.filter(order=>String(order?.status||"").trim().toLowerCase()==="confirmed").length,
   inPrep:orders.filter(order=>String(order?.status||"").trim().toLowerCase()==="in-prep").length,
   completed:orders.filter(order=>String(order?.status||"").trim().toLowerCase()==="completed").length
  };
 },[orders]);

 return(
  <>
   <section className="dashboard-page py-4">
    <Container fluid="lg">

     <Row className="g-4 mb-4">
      <Col xl={3} md={6}>
       <Card className="h-100">
        <Card.Body>
         <p className="text-muted mb-2">Events This Week</p>
         <h2 className="mb-1">{loading?"...":metrics.eventsThisWeek}</h2>
         <small className="text-muted">{loading?"Loading...":`${metrics.next48} scheduled in the next 48 hours`}</small>
        </Card.Body>
       </Card>
      </Col>

      <Col xl={3} md={6}>
       <Card className="h-100">
        <Card.Body>
         <p className="text-muted mb-2">Active Clients</p>
         <h2 className="mb-1">{loading?"...":metrics.activeClients}</h2>
         <small className="text-muted">{loading?"Loading...":`${clients.length} total client records`}</small>
        </Card.Body>
       </Card>
      </Col>

      <Col xl={3} md={6}>
       <Card className="h-100">
        <Card.Body>
         <p className="text-muted mb-2">Open Orders</p>
         <h2 className="mb-1">{loading?"...":metrics.openOrders}</h2>
         <small className="text-muted">{loading?"Loading...":`${metrics.inProduction} prep items currently in progress`}</small>
        </Card.Body>
       </Card>
      </Col>

      <Col xl={3} md={6}>
       <Card className="h-100">
        <Card.Body>
         <p className="text-muted mb-2">Monthly Revenue</p>
         <h2 className="mb-1">{loading?"...":`$${metrics.monthlyRevenue.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`}</h2>
         <small className="text-muted">{loading?"Loading...":`${metrics.revenueChange>=0?"Up":"Down"} ${Math.abs(metrics.revenueChange)}% from last month`}</small>
        </Card.Body>
       </Card>
      </Col>
     </Row>

     <Row className="g-4 mb-4">
      <Col xl={8}>
       <Card className="h-100">
        <Card.Body>
         <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
           <h3 className="h4 mb-1">Upcoming Events</h3>
           <p className="text-muted mb-0">Track bookings, guest counts, and service status.</p>
          </div>

          <Button variant="primary" onClick={()=>navigate("/events")}>New Event</Button>
         </div>

         <div className="table-responsive">
          <Table hover className="align-middle mb-0">
           <thead>
            <tr>
             <th>Client</th>
             <th>Date</th>
             <th>Time</th>
             <th>Guests</th>
             <th>Status</th>
            </tr>
           </thead>

           <tbody>
            {loading&&(
             <tr>
              <td colSpan="5" className="text-center text-muted py-4">Loading events...</td>
             </tr>
            )}

            {!loading&&upcomingEvents.length===0&&(
             <tr>
              <td colSpan="5" className="text-center text-muted py-4">No upcoming events found.</td>
             </tr>
            )}

            {!loading&&upcomingEvents.map(event=>(
             <tr key={event._id||event.id}>
              <td>{event.eventName||event.clientName||"-"}</td>
              <td>{formatDate(event.eventDate)}</td>
              <td>{event.eventTime||"-"}</td>
              <td>{event.guestCount??"-"}</td>
              <td><Badge bg={getStatusBg(event.status)}>{event.status||"-"}</Badge></td>
             </tr>
            ))}
           </tbody>
          </Table>
         </div>
        </Card.Body>
       </Card>
      </Col>

      <Col xl={4}>
       <Card className="h-100">
        <Card.Body>
         <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
           <h3 className="h4 mb-1">Today’s Tasks</h3>
           <p className="text-muted mb-0">Keep service and prep on schedule.</p>
          </div>
          <Button size="sm" variant="primary" onClick={()=>setShowTaskModal(true)}>Add Task</Button>
         </div>

         <ListGroup variant="flush">
          {loading&&(
           <ListGroup.Item className="px-0 text-muted">Loading tasks...</ListGroup.Item>
          )}

          {!loading&&dashboardTasks.map(task=>(
           <ListGroup.Item key={task.id} className="px-0 d-flex align-items-start justify-content-between">
            <span className={task.done?"text-muted text-decoration-line-through":"text-body"}>{task.text}</span>
            <Badge bg={getStatusBg(task.status)}>{task.done?"Done":"Open"}</Badge>
           </ListGroup.Item>
          ))}
         </ListGroup>
        </Card.Body>
       </Card>
      </Col>
     </Row>

     <Row className="g-4">
      <Col xl={4} md={6}>
       <Card className="h-100">
        <Card.Body>
         <h3 className="h4 mb-3">Kitchen Production</h3>

         {loading&&(
          <div className="text-muted">Loading kitchen prep...</div>
         )}

         {!loading&&kitchenProduction.length===0&&(
          <div className="text-muted">No kitchen prep items found.</div>
         )}

         {!loading&&kitchenProduction.map(item=>(
          <div key={item.name} className="mb-3">
           <div className="d-flex justify-content-between mb-2">
            <span>{item.name}</span>
            <span>{item.percent}%</span>
           </div>
           <ProgressBar now={item.percent}/>
          </div>
         ))}
        </Card.Body>
       </Card>
      </Col>

      <Col xl={4} md={6}>
       <Card className="h-100">
        <Card.Body>
         <h3 className="h4 mb-3">Low Inventory</h3>

         <ListGroup variant="flush">
          {loading&&(
           <ListGroup.Item className="px-0 text-muted">Loading inventory...</ListGroup.Item>
          )}

          {!loading&&lowStock.length===0&&(
           <ListGroup.Item className="px-0 text-muted">No low inventory items found.</ListGroup.Item>
          )}

          {!loading&&lowStock.map(stock=>(
           <ListGroup.Item key={stock._id||stock.id} className="px-0 d-flex align-items-center justify-content-between">
            <span>{stock.name||stock.item||"-"}</span>
            <Badge bg={getStatusBg(stock.status)}>{stock.status==="out-of-stock"?"Critical":stock.status==="low"?"Low":stock.status}</Badge>
           </ListGroup.Item>
          ))}
         </ListGroup>
        </Card.Body>
       </Card>
      </Col>

      <Col xl={4} md={12}>
       <Card className="h-100">
        <Card.Body>
         <h3 className="h4 mb-3">Order Status Breakdown</h3>

         <ListGroup variant="flush">
          <ListGroup.Item className="px-0 d-flex align-items-center justify-content-between">
           <span>{getOrderStatusLabel("draft")}</span>
           <Badge bg={getStatusBg("draft")}>{loading?"...":orderOverview.draft}</Badge>
          </ListGroup.Item>
          <ListGroup.Item className="px-0 d-flex align-items-center justify-content-between">
           <span>{getOrderStatusLabel("pending")}</span>
           <Badge bg={getStatusBg("pending")}>{loading?"...":orderOverview.pending}</Badge>
          </ListGroup.Item>
          <ListGroup.Item className="px-0 d-flex align-items-center justify-content-between">
           <span>{getOrderStatusLabel("confirmed")}</span>
           <Badge bg={getStatusBg("confirmed")}>{loading?"...":orderOverview.confirmed}</Badge>
          </ListGroup.Item>
          <ListGroup.Item className="px-0 d-flex align-items-center justify-content-between">
           <span>{getOrderStatusLabel("in-prep")}</span>
           <Badge bg={getStatusBg("in-prep")}>{loading?"...":orderOverview.inPrep}</Badge>
          </ListGroup.Item>
          <ListGroup.Item className="px-0 d-flex align-items-center justify-content-between">
           <span>{getOrderStatusLabel("completed")}</span>
           <Badge bg={getStatusBg("completed")}>{loading?"...":orderOverview.completed}</Badge>
          </ListGroup.Item>
         </ListGroup>

         <div className="d-grid gap-2 mt-3">
          <Button variant="primary" onClick={()=>navigate("/orders")}>Create Order</Button>
          <Button variant="outline-primary" onClick={()=>navigate("/clients")}>Add Client</Button>
          <Button variant="outline-primary" onClick={()=>setShowTaskModal(true)}>Add Task</Button>
          <Button variant="outline-primary" onClick={()=>navigate("/reports")}>View Reports</Button>
         </div>
        </Card.Body>
       </Card>
      </Col>
     </Row>

    </Container>
   </section>

   <Modal show={showTaskModal} onHide={closeTaskModal} centered>
    <Modal.Header closeButton>
     <Modal.Title>Add Task</Modal.Title>
    </Modal.Header>

    <Form onSubmit={handleTaskSubmit}>
     <Modal.Body>
      <Form.Group className="mb-3" controlId="dashboardTaskTitle">
       <Form.Label>Title</Form.Label>
       <Form.Control type="text" name="title" value={taskFormData.title} onChange={handleTaskChange} placeholder="Task title" required/>
      </Form.Group>

      <Form.Group className="mb-3" controlId="dashboardTaskDescription">
       <Form.Label>Description</Form.Label>
       <Form.Control as="textarea" rows={3} name="description" value={taskFormData.description} onChange={handleTaskChange} placeholder="Task description"/>
      </Form.Group>

      <Row className="mb-3">
       <Col md={6}>
        <Form.Group controlId="dashboardTaskEvent">
         <Form.Label>Event</Form.Label>
         <Form.Select name="event" value={taskFormData.event} onChange={handleTaskChange}>
          <option value="">Select event</option>
          {events.map(event=>(
           <option key={event._id} value={event._id}>{event.eventName}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group controlId="dashboardTaskOrder">
         <Form.Label>Order</Form.Label>
         <Form.Select name="order" value={taskFormData.order} onChange={handleTaskChange}>
          <option value="">Select order</option>
          {orders.map(order=>(
           <option key={order._id} value={order._id}>{order.orderNumber}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>
      </Row>

      <Row className="mb-3">
       <Col md={4}>
        <Form.Group controlId="dashboardTaskPriority">
         <Form.Label>Priority</Form.Label>
         <Form.Select name="priority" value={taskFormData.priority} onChange={handleTaskChange}>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group controlId="dashboardTaskStatus">
         <Form.Label>Status</Form.Label>
         <Form.Select name="status" value={taskFormData.status} onChange={handleTaskChange}>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
         </Form.Select>
        </Form.Group>
       </Col>

       <Col md={4}>
        <Form.Group controlId="dashboardTaskDueDate">
         <Form.Label>Due Date</Form.Label>
         <Form.Control type="datetime-local" name="dueDate" value={taskFormData.dueDate} onChange={handleTaskChange}/>
        </Form.Group>
       </Col>
      </Row>

      <Form.Group controlId="dashboardTaskNotes">
       <Form.Label>Notes</Form.Label>
       <Form.Control as="textarea" rows={3} name="notes" value={taskFormData.notes} onChange={handleTaskChange} placeholder="Notes"/>
      </Form.Group>
     </Modal.Body>

     <Modal.Footer>
      <Button variant="outline-secondary" onClick={closeTaskModal}>Cancel</Button>
      <Button type="submit" variant="primary" disabled={savingTask}>{savingTask?"Saving...":"Save Task"}</Button>
     </Modal.Footer>
    </Form>
   </Modal>
  </>
 );
}

export default Dashboard;