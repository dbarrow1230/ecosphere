// src/pages/Reports.jsx
import {useState,useEffect,useMemo} from "react";
import {Container,Row,Col,Card,Table,Form} from "react-bootstrap";

function Reports(){

 const [events,setEvents]=useState([]);
 const [orders,setOrders]=useState([]);
 const [loading,setLoading]=useState(true);

 const [range,setRange]=useState("this-month");

 const getNumber=value=>{
  if(value===null||value===undefined) return 0;
  if(typeof value==="object"&&value.$numberDecimal!==undefined){
   return Number(value.$numberDecimal);
  }
  return Number(value)||0;
 };

 const fetchData=async()=>{
  try{
   setLoading(true);

   const [eventsRes,ordersRes]=await Promise.all([
    fetch("/api/events"),
    fetch("/api/orders")
   ]);

   const eventsData=await eventsRes.json();
   const ordersData=await ordersRes.json();

   setEvents(
    Array.isArray(eventsData?.events)
     ?eventsData.events
     :Array.isArray(eventsData?.data)
     ?eventsData.data
     :[]
   );

   setOrders(
    Array.isArray(ordersData?.orders)
     ?ordersData.orders
     :Array.isArray(ordersData?.data)
     ?ordersData.data
     :[]
   );

  }catch(err){
   console.error("Reports load error:",err);
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  fetchData();
 },[]);

 const inRange=(date,start,end)=>{
  if(!date) return false;
  const d=new Date(date);
  return d>=start&&d<=end;
 };

 const summary=useMemo(()=>{

  const now=new Date();

  const startOfWeek=new Date(now);
  startOfWeek.setDate(now.getDate()-now.getDay());

  const startOfMonth=new Date(now.getFullYear(),now.getMonth(),1);
  const startOfLastMonth=new Date(now.getFullYear(),now.getMonth()-1,1);
  const endOfLastMonth=new Date(now.getFullYear(),now.getMonth(),0);

  const startOfYear=new Date(now.getFullYear(),0,1);

  const calc=(start,end)=>{
   const ev=events.filter(e=>inRange(e.eventDate,start,end)).length;

   const ord=orders.filter(o=>inRange(o.createdAt,start,end));

   const orderCount=ord.length;

   const revenue=ord.reduce((sum,o)=>sum+getNumber(o.total),0);

   const avg=orderCount>0?revenue/orderCount:0;

   return{
    events:ev,
    orders:orderCount,
    revenue,
    avg
   };
  };

  const week=calc(startOfWeek,now);
  const month=calc(startOfMonth,now);
  const lastMonth=calc(startOfLastMonth,endOfLastMonth);
  const ytd=calc(startOfYear,now);

  const growth=lastMonth.revenue
   ?((month.revenue-lastMonth.revenue)/lastMonth.revenue)*100
   :0;

  return{
   week,
   month,
   lastMonth,
   ytd,
   growth
  };

 },[events,orders]);

 const formatMoney=v=>"$"+v.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});

 const rows=[
  {
   period:"This Week",
   events:summary.week.events,
   orders:summary.week.orders,
   revenue:formatMoney(summary.week.revenue),
   avgOrder:formatMoney(summary.week.avg)
  },
  {
   period:"This Month",
   events:summary.month.events,
   orders:summary.month.orders,
   revenue:formatMoney(summary.month.revenue),
   avgOrder:formatMoney(summary.month.avg)
  },
  {
   period:"Last Month",
   events:summary.lastMonth.events,
   orders:summary.lastMonth.orders,
   revenue:formatMoney(summary.lastMonth.revenue),
   avgOrder:formatMoney(summary.lastMonth.avg)
  },
  {
   period:"Year to Date",
   events:summary.ytd.events,
   orders:summary.ytd.orders,
   revenue:formatMoney(summary.ytd.revenue),
   avgOrder:formatMoney(summary.ytd.avg)
  }
 ];

 return(
  <section className="reports-page py-4">
   <Container fluid="lg">

    <Row className="g-4 mb-4">

     <Col lg={8}>
      <div>
       <p className="text-muted mb-2">Business Reporting</p>
       <h1 className="mb-2">Reports</h1>
       <p className="text-muted mb-0">
        Review event activity, order volume, and revenue performance.
       </p>
      </div>
     </Col>

     <Col lg={4}>
      <Card className="h-100">
       <Card.Body>

        <Row className="g-3 text-center">

         <Col xs={4}>
          <p className="text-muted mb-1">Revenue</p>
          <h3 className="mb-0">{formatMoney(summary.month.revenue)}</h3>
         </Col>

         <Col xs={4}>
          <p className="text-muted mb-1">Events</p>
          <h3 className="mb-0">{summary.month.events}</h3>
         </Col>

         <Col xs={4}>
          <p className="text-muted mb-1">Orders</p>
          <h3 className="mb-0">{summary.month.orders}</h3>
         </Col>

        </Row>

       </Card.Body>
      </Card>
     </Col>

    </Row>

    <Row className="g-4 mb-4">

     <Col lg={3}>
      <Card className="h-100">
       <Card.Body>
        <p className="text-muted mb-2">Monthly Revenue</p>
        <h2 className="mb-1">{formatMoney(summary.month.revenue)}</h2>
       </Card.Body>
      </Card>
     </Col>

     <Col lg={3}>
      <Card className="h-100">
       <Card.Body>
        <p className="text-muted mb-2">Average Order</p>
        <h2 className="mb-1">{formatMoney(summary.month.avg)}</h2>
       </Card.Body>
      </Card>
     </Col>

     <Col lg={3}>
      <Card className="h-100">
       <Card.Body>
        <p className="text-muted mb-2">Top Category</p>
        <h2 className="mb-1">—</h2>
       </Card.Body>
      </Card>
     </Col>

     <Col lg={3}>
      <Card className="h-100">
       <Card.Body>
        <p className="text-muted mb-2">Growth</p>
        <h2 className="mb-1">{summary.growth.toFixed(1)}%</h2>
       </Card.Body>
      </Card>
     </Col>

    </Row>

    <Row className="g-4">

     <Col lg={4}>
      <Card className="h-100">
       <Card.Body>

        <h2 className="h4 mb-3">Filter Reports</h2>

        <Form>

         <Form.Group className="mb-3">
          <Form.Label>Date Range</Form.Label>
          <Form.Select value={range} onChange={e=>setRange(e.target.value)}>
           <option value="this-week">This Week</option>
           <option value="this-month">This Month</option>
           <option value="last-month">Last Month</option>
           <option value="ytd">Year to Date</option>
          </Form.Select>
         </Form.Group>

         <Form.Group>
          <Form.Label>Notes</Form.Label>
          <Form.Control as="textarea" rows={5}/>
         </Form.Group>

        </Form>

       </Card.Body>
      </Card>
     </Col>

     <Col lg={8}>
      <Card className="h-100">
       <Card.Body>

        <h2 className="h4 mb-3">Performance Summary</h2>

        <div className="table-responsive">

         <Table hover className="align-middle mb-0">

          <thead>
           <tr>
            <th>Period</th>
            <th>Events</th>
            <th>Orders</th>
            <th>Revenue</th>
            <th>Average Order</th>
           </tr>
          </thead>

          <tbody>

           {rows.map((row,i)=>(
            <tr key={i}>
             <td>{row.period}</td>
             <td>{row.events}</td>
             <td>{row.orders}</td>
             <td>{row.revenue}</td>
             <td>{row.avgOrder}</td>
            </tr>
           ))}

          </tbody>

         </Table>

        </div>

       </Card.Body>
      </Card>
     </Col>

    </Row>

   </Container>
  </section>
 );
}

export default Reports;