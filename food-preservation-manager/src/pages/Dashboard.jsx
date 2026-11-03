// src/pages/Dashboard.jsx
import {useEffect,useMemo,useState} from "react";
import {Badge,Button,Card,Col,Container,ListGroup,ProgressBar,Row,Spinner,Table} from "react-bootstrap";
import {useNavigate} from "react-router-dom";

const emptyDashboardData={
 dehydrationSetups:[],
 dehydrationProcesses:[],
 dehydrators:[],
 products:[],
 productBatches:[],
 electricityAccounts:[],
 fuelAccounts:[],
 fuelSources:[]
};

const fetchJson=async url=>{
 const res=await fetch(url);
 const data=await res.json().catch(()=>null);

 if(!res.ok){
  throw new Error(data?.message||`Failed to load ${url}`);
 }

 return data;
};

const unwrapRows=(payload,...keys)=>{
 if(Array.isArray(payload))return payload;

 for(const key of keys){
  if(Array.isArray(payload?.[key]))return payload[key];
 }

 if(Array.isArray(payload?.data))return payload.data;
 return [];
};

const formatDate=value=>{
 if(!value)return "-";
 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return "-";
 return date.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});
};

const formatMoney=value=>{
 const raw=value?.$numberDecimal??value??0;
 const number=Number(raw);
 return `$${Number.isFinite(number)?number.toFixed(2):"0.00"}`;
};

const getSetupStatus=setup=>{
 const raw=String(setup?.status||setup?.projectStatus||"").trim().toLowerCase();
 if(raw)return raw;
 if(setup?.isActive===true)return "active";
 if(setup?.isActive===false)return "inactive";
 return "unknown";
};

const getStatusVariant=status=>{
 const normalized=String(status||"").trim().toLowerCase();
 if(["active","completed","available","in-stock"].includes(normalized))return "success";
 if(["paused","pending","low"].includes(normalized))return "warning";
 if(["cancelled","failed","out-of-stock"].includes(normalized))return "danger";
 if(["inactive","unknown"].includes(normalized))return "secondary";
 return "primary";
};

function Dashboard(){
 const navigate=useNavigate();
 const [data,setData]=useState(emptyDashboardData);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");

 useEffect(()=>{
  let ignore=false;

  const loadDashboard=async()=>{
   setLoading(true);
   setError("");

   try{
    const [
     setupsPayload,
     processesPayload,
     dehydratorsPayload,
     productsPayload,
     batchesPayload,
     electricityPayload,
     fuelAccountsPayload,
     fuelSourcesPayload
    ]=await Promise.all([
     fetchJson("/api/dehydration-setups"),
     fetchJson("/api/dehydration-processes"),
     fetchJson("/api/dehydrators"),
     fetchJson("/api/products"),
     fetchJson("/api/product-batches"),
     fetchJson("/api/electricity-accounts"),
     fetchJson("/api/fuel-accounts"),
     fetchJson("/api/fuel-sources")
    ]);

    if(ignore)return;

    setData({
     dehydrationSetups:unwrapRows(setupsPayload,"dehydrationSetups","setups"),
     dehydrationProcesses:unwrapRows(processesPayload,"dehydrationProcesses","processes"),
     dehydrators:unwrapRows(dehydratorsPayload,"dehydrators"),
     products:unwrapRows(productsPayload,"products"),
     productBatches:unwrapRows(batchesPayload,"productBatches","batches"),
     electricityAccounts:unwrapRows(electricityPayload,"electricityAccounts","accounts"),
     fuelAccounts:unwrapRows(fuelAccountsPayload,"fuelAccounts"),
     fuelSources:unwrapRows(fuelSourcesPayload,"fuelSources")
    });
   }catch(err){
    if(ignore)return;
    setData(emptyDashboardData);
    setError(err.message||"Failed to load dashboard data");
   }finally{
    if(!ignore)setLoading(false);
   }
  };

  loadDashboard();

  return()=>{ignore=true;};
 },[]);

 const metrics=useMemo(()=>{
  const activeSetups=data.dehydrationSetups.filter(setup=>getSetupStatus(setup)==="active").length;
  const inactiveSetups=data.dehydrationSetups.filter(setup=>getSetupStatus(setup)==="inactive").length;
  const activeDehydrators=data.dehydrators.filter(item=>item?.isActive!==false).length;
  const inactiveDehydrators=data.dehydrators.length-activeDehydrators;
  const activeProducts=data.products.filter(item=>item?.sellingControls?.isActive!==false).length;
  const totalAvailable=data.productBatches.reduce((sum,batch)=>sum+Number(batch?.quantities?.available||0),0);
  const totalOnHand=data.productBatches.reduce((sum,batch)=>sum+Number(batch?.quantities?.onHand||0),0);
  const totalCost=data.productBatches.reduce((sum,batch)=>sum+Number(batch?.costing?.totalCost?.$numberDecimal??batch?.costing?.totalCost??0),0);

  return{
   activeSetups,
   inactiveSetups,
   activeDehydrators,
   inactiveDehydrators,
   activeProducts,
   totalAvailable,
   totalOnHand,
   totalCost
  };
 },[data]);

 const recentSetups=useMemo(()=>{
  return [...data.dehydrationSetups]
   .sort((a,b)=>new Date(b?.createdAt||0)-new Date(a?.createdAt||0))
   .slice(0,5);
 },[data.dehydrationSetups]);

 const recentBatches=useMemo(()=>{
  return [...data.productBatches]
   .sort((a,b)=>new Date(b?.createdAt||0)-new Date(a?.createdAt||0))
   .slice(0,5);
 },[data.productBatches]);

 const dehydratorCapacity=useMemo(()=>{
  const totalWatts=data.dehydrators.reduce((sum,item)=>sum+Number(item?.watts||0),0);
  const activeWatts=data.dehydrators
   .filter(item=>item?.isActive!==false)
   .reduce((sum,item)=>sum+Number(item?.watts||0),0);

  return{
   totalWatts,
   activeWatts,
   percent:totalWatts?Math.round((activeWatts/totalWatts)*100):0
  };
 },[data.dehydrators]);

 return(
  <section className="dashboard-page py-4">
   <Container fluid="lg">
    <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
     <div>
      <p className="text-uppercase fw-bold text-muted mb-1">Food Preservation</p>
      <h1 className="mb-1">Dashboard</h1>
      <p className="text-muted mb-0">Track dehydration setups, equipment, products, batches, and energy references.</p>
     </div>

     <div className="d-flex flex-wrap gap-2">
      <Button onClick={()=>navigate("/dehydration/projects")}>Open Projects</Button>
      <Button variant="outline-primary" onClick={()=>navigate("/dehydration-setups/new")}>New Setup</Button>
      <Button variant="outline-primary" onClick={()=>navigate("/dehydrators")}>Dehydrators</Button>
     </div>
    </div>

    {loading?(
     <div className="d-flex justify-content-center align-items-center py-5">
      <Spinner animation="border"/>
     </div>
    ):(
     <>
      {error?(
       <Card className="mb-4 border-danger">
        <Card.Body className="text-danger">{error}</Card.Body>
       </Card>
      ):null}

      <Row className="g-4 mb-4">
       <DashboardMetric title="Dehydration Setups" value={data.dehydrationSetups.length} detail={`${metrics.activeSetups} active / ${metrics.inactiveSetups} inactive`}/>
       <DashboardMetric title="Dehydrators" value={data.dehydrators.length} detail={`${metrics.activeDehydrators} active / ${metrics.inactiveDehydrators} inactive`}/>
       <DashboardMetric title="Products" value={data.products.length} detail={`${metrics.activeProducts} active products`}/>
       <DashboardMetric title="Product Batches" value={data.productBatches.length} detail={`${metrics.totalAvailable} available / ${metrics.totalOnHand} on hand`}/>
      </Row>

      <Row className="g-4 mb-4">
       <Col xl={8}>
        <Card className="h-100">
         <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-3">
           <div>
            <h2 className="h4 mb-1">Recent Dehydration Setups</h2>
            <p className="text-muted mb-0">Latest setup templates and estimated preservation methods.</p>
           </div>
           <Button size="sm" variant="outline-primary" onClick={()=>navigate("/dehydration/projects")}>View All</Button>
          </div>

          <div className="table-responsive">
           <Table hover className="align-middle mb-0">
            <thead>
             <tr>
              <th>Item</th>
              <th>Method</th>
              <th>Dehydrator</th>
              <th>Status</th>
              <th>Created</th>
             </tr>
            </thead>
            <tbody>
             {recentSetups.length?recentSetups.map(setup=>{
              const status=getSetupStatus(setup);

              return(
               <tr key={setup._id}>
                <td>{setup.item||"Untitled"}</td>
                <td>{setup?.dehydrationMethods?.dehydratorMethod?.estimatedDuration?"Dehydrator":"Setup"}</td>
                <td>{setup?.dehydrator?.name||setup?.dehydrator?.brand||"-"}</td>
                <td><Badge bg={getStatusVariant(status)}>{status}</Badge></td>
                <td>{formatDate(setup.createdAt)}</td>
               </tr>
              );
             }):(
              <tr><td colSpan="5" className="text-center text-muted py-4">No dehydration setups found.</td></tr>
             )}
            </tbody>
           </Table>
          </div>
         </Card.Body>
        </Card>
       </Col>

       <Col xl={4}>
        <Card className="h-100">
         <Card.Body>
          <h2 className="h4 mb-3">Equipment & Energy</h2>

          <div className="mb-4">
           <div className="d-flex justify-content-between mb-2">
            <span>Active Dehydrator Watts</span>
            <span>{dehydratorCapacity.activeWatts} / {dehydratorCapacity.totalWatts} W</span>
           </div>
           <ProgressBar now={dehydratorCapacity.percent}/>
          </div>

          <ListGroup variant="flush">
           <ListGroup.Item className="d-flex justify-content-between px-0">
            <span>Electricity Accounts</span>
            <Badge bg="secondary">{data.electricityAccounts.length}</Badge>
           </ListGroup.Item>
           <ListGroup.Item className="d-flex justify-content-between px-0">
            <span>Fuel Accounts</span>
            <Badge bg="secondary">{data.fuelAccounts.length}</Badge>
           </ListGroup.Item>
           <ListGroup.Item className="d-flex justify-content-between px-0">
            <span>Fuel Sources</span>
            <Badge bg="secondary">{data.fuelSources.length}</Badge>
           </ListGroup.Item>
          </ListGroup>
         </Card.Body>
        </Card>
       </Col>
      </Row>

      <Row className="g-4">
       <Col xl={8}>
        <Card className="h-100">
         <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-3">
           <div>
            <h2 className="h4 mb-1">Recent Product Batches</h2>
            <p className="text-muted mb-0">Packaged output connected to preservation projects.</p>
           </div>
           <Badge bg="success">{formatMoney(metrics.totalCost)} total cost</Badge>
          </div>

          <div className="table-responsive">
           <Table hover className="align-middle mb-0">
            <thead>
             <tr>
              <th>Batch</th>
              <th>Product</th>
              <th>Lot</th>
              <th>Available</th>
              <th>Expiry</th>
             </tr>
            </thead>
            <tbody>
             {recentBatches.length?recentBatches.map(batch=>(
              <tr key={batch._id}>
               <td>{batch.batchNumber||batch.code||"-"}</td>
               <td>{batch?.product?.name||"-"}</td>
               <td>{batch.lotNumber||"-"}</td>
               <td>{batch?.quantities?.available??0}</td>
               <td>{formatDate(batch?.dates?.expiryDate)}</td>
              </tr>
             )):(
              <tr><td colSpan="5" className="text-center text-muted py-4">No product batches found.</td></tr>
             )}
            </tbody>
           </Table>
          </div>
         </Card.Body>
        </Card>
       </Col>

       <Col xl={4}>
        <Card className="h-100">
         <Card.Body>
          <h2 className="h4 mb-3">Quick Actions</h2>
          <div className="d-grid gap-2">
           <Button onClick={()=>navigate("/dehydration-setups/new")}>Create Dehydration Setup</Button>
           <Button variant="outline-primary" onClick={()=>navigate("/dehydration/projects")}>Review Projects</Button>
           <Button variant="outline-primary" onClick={()=>navigate("/dehydrators")}>Manage Dehydrators</Button>
           <Button variant="outline-primary" onClick={()=>navigate("/electricity-accounts")}>Manage Electricity</Button>
           <Button variant="outline-primary" onClick={()=>navigate("/energy-dashboard")}>Energy Dashboard</Button>
          </div>
         </Card.Body>
        </Card>
       </Col>
      </Row>
     </>
    )}
   </Container>
  </section>
 );
}

function DashboardMetric({title,value,detail}){
 return(
  <Col xl={3} md={6}>
   <Card className="h-100">
    <Card.Body>
     <p className="text-muted mb-2">{title}</p>
     <h2 className="mb-1">{value}</h2>
     <small className="text-muted">{detail}</small>
    </Card.Body>
   </Card>
  </Col>
 );
}

export default Dashboard;
