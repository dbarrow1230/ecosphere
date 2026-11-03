import {useEffect,useState} from "react";
import {Badge,Button,Card,Col,Container,Row,Spinner,Table} from "react-bootstrap";
import Alert from "../components/PopupAlert.jsx";
import {Link} from "react-router-dom";

function AllergensPage(){
 const [allergens,setAllergens]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");

 const loadAllergens=async()=>{
  try{
   setLoading(true);
   setError("");

   const res=await fetch("/api/allergens");
   const data=await res.json();

   if(!res.ok||!data.success){
    throw new Error(data.message||"Failed to load allergens");
   }

   setAllergens(Array.isArray(data.data)?data.data:[]);
  }catch(err){
   setAllergens([]);
   setError(err.message||"Failed to load allergens");
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  loadAllergens();
 },[]);

 const deleteAllergen=async allergen=>{
  if(!window.confirm(`Delete ${allergen.name||"this allergen"}?`))return;

  try{
   setError("");
   setMessage("");

   const res=await fetch(`/api/allergens/${allergen._id}`,{method:"DELETE"});
   const data=await res.json();

   if(!res.ok||!data.success){
    throw new Error(data.message||"Failed to delete allergen");
   }

   setAllergens(current=>current.filter(item=>item._id!==allergen._id));
   setMessage(data.message||"Allergen deleted");
  }catch(err){
   setError(err.message||"Failed to delete allergen");
  }
 };

 return(
  <section className="py-4">
   <Container fluid>
    <Row className="mb-3 align-items-center">
     <Col>
      <h1 className="mb-1">Allergens</h1>
      <p className="text-muted mb-0">Manage allergen reference records used by products and recipes.</p>
     </Col>

     <Col xs="auto">
      <Button as={Link} to="/admin/allergens/new">Add Allergen</Button>
     </Col>
    </Row>

    {error?<Alert variant="danger">{error}</Alert>:null}
    {message?<Alert variant="success">{message}</Alert>:null}

    <Card>
     <Card.Body className="p-0">
      {loading?(
       <div className="text-center py-5">
        <Spinner animation="border"/>
       </div>
      ):(
       <Table responsive hover className="mb-0 align-middle">
        <thead>
         <tr>
          <th>Name</th>
          <th>Code</th>
          <th>Severity</th>
          <th>Major</th>
          <th>Status</th>
          <th className="text-end">Actions</th>
         </tr>
        </thead>

        <tbody>
         {allergens.length===0?(
          <tr>
           <td colSpan="6" className="text-center text-muted py-4">No allergens found.</td>
          </tr>
         ):null}

         {allergens.map(allergen=>(
          <tr key={allergen._id}>
           <td>{allergen.emoji?`${allergen.emoji} `:""}{allergen.name}</td>
           <td>{allergen.code}</td>
           <td className="text-capitalize">{allergen.severityLevel||"medium"}</td>
           <td>{allergen.isMajor?"Yes":"No"}</td>
           <td>
            <Badge bg={allergen.isActive===false?"secondary":"success"}>
             {allergen.isActive===false?"Inactive":"Active"}
            </Badge>
           </td>
           <td className="text-end">
            <div className="d-flex gap-2 justify-content-end">
             <Button as={Link} to={`/admin/allergens/${allergen._id}`} size="sm" variant="outline-primary">Edit</Button>
             <Button type="button" size="sm" variant="outline-danger" onClick={()=>deleteAllergen(allergen)}>Delete</Button>
            </div>
           </td>
          </tr>
         ))}
        </tbody>
       </Table>
      )}
     </Card.Body>
    </Card>
   </Container>
  </section>
 );
}

export default AllergensPage;
