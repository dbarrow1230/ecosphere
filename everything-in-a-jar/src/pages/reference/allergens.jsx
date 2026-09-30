import {useEffect,useState} from "react";
import {Alert,Button,Card,Col,Container,Row,Spinner,Table} from "react-bootstrap";
import {useNavigate} from "react-router-dom";

function AllergensPage(){
 const [allergens,setAllergens]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const navigate=useNavigate();

 const fetchAllergens=async()=>{
  try{
   setLoading(true);
   setError("");

   const res=await fetch("/api/allergens");
   const data=await res.json();

   if(!res.ok||!data.success){
    throw new Error(data.message||"Failed to load allergens");
   }

   setAllergens(data.data||[]);
  }catch(error){
   setError(error.message);
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  fetchAllergens();
 },[]);

 const handleDelete=async(id)=>{
  try{
   setError("");

   const res=await fetch(`/api/allergens/${id}`,{
    method:"DELETE"
   });

   const data=await res.json();

   if(!res.ok||!data.success){
    throw new Error(data.message||"Failed to delete allergen");
   }

   fetchAllergens();
  }catch(error){
   setError(error.message);
  }
 };

 const majorAllergens=allergens.filter(allergen=>allergen.isMajor);
 const otherAllergens=allergens.filter(allergen=>!allergen.isMajor);

 const renderRows=(rows)=>(
  rows.map(allergen=>(
   <tr key={allergen._id}>
    <td>{allergen.emoji}</td>
    <td>{allergen.name}</td>
    <td>{allergen.code}</td>
    <td>{allergen.severityLevel}</td>
    <td>{allergen.isActive?"Active":"Inactive"}</td>
    <td className="text-end">
     <Button
      type="button"
      variant="outline-primary"
      size="sm"
      className="me-2"
      onClick={()=>navigate(`/referance/allergens/${allergen._id}/edit`)}
     >
      Edit
     </Button>

     <Button
      type="button"
      variant="outline-danger"
      size="sm"
      onClick={()=>handleDelete(allergen._id)}
     >
      Delete
     </Button>
    </td>
   </tr>
  ))
 );

 return (
  <Container fluid className="py-4">
   <Row className="mb-3 align-items-center">
    <Col>
     <h1 className="mb-1">Allergens</h1>
     <p className="text-muted mb-0">Manage major and other allergens.</p>
    </Col>

    <Col xs="auto">
     <Button type="button" onClick={()=>navigate("/referance/allergens/new")}>
      Add Allergen
     </Button>
    </Col>
   </Row>

   {error&&(
    <Alert variant="danger">{error}</Alert>
   )}

   {loading?(
    <div className="text-center py-5">
     <Spinner/>
    </div>
   ):(
    <>
     <Card className="mb-4">
      <Card.Header>
       <strong>Major Allergens</strong>
      </Card.Header>

      <Card.Body className="p-0">
       <Table responsive hover className="mb-0">
        <thead>
         <tr>
          <th>Emoji</th>
          <th>Name</th>
          <th>Code</th>
          <th>Severity</th>
          <th>Status</th>
          <th className="text-end">Actions</th>
         </tr>
        </thead>

        <tbody>
         {majorAllergens.length?renderRows(majorAllergens):(
          <tr>
           <td colSpan="6" className="text-center text-muted py-4">
            No major allergens found.
           </td>
          </tr>
         )}
        </tbody>
       </Table>
      </Card.Body>
     </Card>

     <Card>
      <Card.Header>
       <strong>Other Allergens</strong>
      </Card.Header>

      <Card.Body className="p-0">
       <Table responsive hover className="mb-0">
        <thead>
         <tr>
          <th>Emoji</th>
          <th>Name</th>
          <th>Code</th>
          <th>Severity</th>
          <th>Status</th>
          <th className="text-end">Actions</th>
         </tr>
        </thead>

        <tbody>
         {otherAllergens.length?renderRows(otherAllergens):(
          <tr>
           <td colSpan="6" className="text-center text-muted py-4">
            No other allergens found.
           </td>
          </tr>
         )}
        </tbody>
       </Table>
      </Card.Body>
     </Card>
    </>
   )}
  </Container>
 );
}

export default AllergensPage;