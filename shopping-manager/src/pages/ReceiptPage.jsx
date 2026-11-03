import {useEffect,useRef,useState} from "react";
import {Alert,Button,Card,Modal,Spinner,Table} from "react-bootstrap";
import ReceiptForm from "./forms/ReceiptForm.jsx";

const unwrap=(data,key)=>data?.[key]||data?.data||data||[];
const getName=value=>typeof value==="object"?(value?.name||value?.username||value?.email||value?.receiptNumber||""):"";

export default function ReceiptPage(){
 const [receipts,setReceipts]=useState([]);
 const [lookups,setLookups]=useState({users:[],purchases:[],stores:[],currencies:[],states:[],countries:[]});
 const [loading,setLoading]=useState(true);
 const [selected,setSelected]=useState(null);
 const [deleteTarget,setDeleteTarget]=useState(null);
 const [showForm,setShowForm]=useState(false);
 const [alert,setAlert]=useState(null);
 const timerRef=useRef(null);

 const notify=(variant,message)=>{
  if(timerRef.current)clearTimeout(timerRef.current);
  setAlert({variant,message});
  timerRef.current=setTimeout(()=>setAlert(null),5000);
 };

 const loadData=async()=>{
  setLoading(true);
  try{
   const endpoints=["receipts","users","purchases","stores","currencies","states","countries"];
   const responses=await Promise.all(endpoints.map(endpoint=>fetch(`/api/${endpoint}`)));
   const payloads=await Promise.all(responses.map(response=>response.json()));
   if(!responses[0].ok)throw new Error(payloads[0].message||"Failed to load receipts");
   setReceipts(unwrap(payloads[0],"receipts"));
   setLookups({
    users:unwrap(payloads[1],"users"),purchases:unwrap(payloads[2],"purchases"),
    stores:unwrap(payloads[3],"stores"),currencies:unwrap(payloads[4],"currencies"),
    states:unwrap(payloads[5],"states"),countries:unwrap(payloads[6],"countries")
   });
  }catch(error){notify("danger",error.message||"Failed to load receipt data");}
  finally{setLoading(false);}
 };

 useEffect(()=>{
  // Initial API synchronization.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  loadData();
  return()=>{if(timerRef.current)clearTimeout(timerRef.current);};
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);

 const closeForm=()=>{setShowForm(false);setSelected(null);};
 const handleSuccess=async()=>{await loadData();closeForm();notify("success",`Receipt ${selected?"updated":"created"} successfully`);};
 const handleDelete=async()=>{
  if(!deleteTarget?._id)return;
  const response=await fetch(`/api/receipts/${deleteTarget._id}`,{method:"DELETE"});
  const data=await response.json();
  if(!response.ok){notify("danger",data.message||"Failed to delete receipt");return;}
  setDeleteTarget(null);await loadData();notify("success",data.message||"Receipt deleted successfully");
 };

 return(
  <div className="container py-4">
   <div className="d-flex justify-content-between align-items-center mb-3">
    <h3 className="mb-0">Receipts</h3>
    <Button onClick={()=>{setSelected(null);setShowForm(true);}}>Add Receipt</Button>
   </div>
   {alert?<Alert variant={alert.variant} dismissible onClose={()=>setAlert(null)}>{alert.message}</Alert>:null}
   <Card className="shadow-sm"><Card.Body>
    {loading?<div className="text-center py-4"><Spinner animation="border"/></div>:(
     <Table striped bordered hover responsive className="align-middle mb-0">
      <thead><tr><th>Number</th><th>User</th><th>Store</th><th>Date</th><th>Total</th><th>Actions</th></tr></thead>
      <tbody>{receipts.length?receipts.map(receipt=>(
       <tr key={receipt._id}>
        <td>{receipt.receiptNumber}</td><td>{getName(receipt.user)}</td><td>{getName(receipt.store)}</td>
        <td>{receipt.purchaseDate?new Date(receipt.purchaseDate).toLocaleDateString():""}</td>
        <td>{receipt.total}</td>
        <td className="d-flex gap-2">
         <Button size="sm" variant="outline-primary" onClick={()=>{setSelected(receipt);setShowForm(true);}}>Edit</Button>
         <Button size="sm" variant="outline-danger" onClick={()=>setDeleteTarget(receipt)}>Delete</Button>
        </td>
       </tr>
      )):<tr><td colSpan="6" className="text-center">No receipts found</td></tr>}</tbody>
     </Table>
    )}
   </Card.Body></Card>
   <Modal show={showForm} onHide={closeForm} size="xl" centered>
    <Modal.Header closeButton><Modal.Title>{selected?"Edit Receipt":"Add Receipt"}</Modal.Title></Modal.Header>
    <Modal.Body><ReceiptForm initialData={selected||{}} {...lookups} endpoint={selected?`/api/receipts/${selected._id}`:"/api/receipts"} method={selected?"PUT":"POST"} onSuccess={handleSuccess}/></Modal.Body>
   </Modal>
   <Modal show={!!deleteTarget} onHide={()=>setDeleteTarget(null)} centered>
    <Modal.Header closeButton><Modal.Title>Delete Receipt</Modal.Title></Modal.Header>
    <Modal.Body>Delete receipt {deleteTarget?.receiptNumber||"this record"}?</Modal.Body>
    <Modal.Footer><Button variant="secondary" onClick={()=>setDeleteTarget(null)}>Cancel</Button><Button variant="danger" onClick={handleDelete}>Delete</Button></Modal.Footer>
   </Modal>
  </div>
 );
}
