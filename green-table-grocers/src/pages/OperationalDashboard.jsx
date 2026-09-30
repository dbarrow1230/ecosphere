import {useEffect,useState} from "react";
import {Alert,Card,Col,Container,Row,Spinner} from "react-bootstrap";

const resources=[
 {label:"Products",endpoint:"/api/products"},
 {label:"Inventory items",endpoint:"/api/inventory"},
 {label:"Stores",endpoint:"/api/stores"},
 {label:"Orders",endpoint:"/api/orders"}
];

function OperationalDashboard(){
 const [counts,setCounts]=useState({});
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");

 useEffect(()=>{
  let active=true;
  const load=async()=>{
   setLoading(true);
   setError("");
   try{
    const results=await Promise.all(resources.map(async resource=>{
     const response=await fetch(resource.endpoint);
     const data=await response.json().catch(()=>null);
     if(!response.ok)throw new Error(data?.message||`Unable to load ${resource.label.toLowerCase()}.`);
     const rows=Array.isArray(data?.data)?data.data:Array.isArray(data)?data:[];
     return [resource.label,rows.length];
    }));
    if(active)setCounts(Object.fromEntries(results));
   }catch(requestError){
    if(active)setError(requestError.message);
   }finally{
    if(active)setLoading(false);
   }
  };
  load();
  return()=>{active=false;};
 },[]);

 return(
  <Container fluid="lg" className="py-4">
   <h1>Dashboard</h1>
   <p className="text-muted">Current Green Table Grocers records.</p>
   {error?<Alert variant="danger">{error}</Alert>:null}
   {loading?<div className="text-center py-5"><Spinner/></div>:<Row className="g-3">{resources.map(resource=><Col md={6} xl={3} key={resource.endpoint}><Card className="h-100"><Card.Body><Card.Subtitle className="text-muted mb-2">{resource.label}</Card.Subtitle><Card.Title className="display-6 mb-0">{counts[resource.label]||0}</Card.Title></Card.Body></Card></Col>)}</Row>}
  </Container>
 );
}

export default OperationalDashboard;
