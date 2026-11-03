import {useEffect,useState} from "react";
import {Alert,Button,Card,Col,Container,Form,Row,Spinner} from "react-bootstrap";
import {useNavigate,useParams} from "react-router-dom";

const defaultFormData={
 name:"",
 code:"",
 emoji:"",
 severityLevel:"High",
 isMajor:false,
 isActive:true,
 notes:""
};

function AllergenForm(){
 const {id}=useParams();
 const navigate=useNavigate();
 const isEdit=Boolean(id);
 const [formData,setFormData]=useState(defaultFormData);
 const [loading,setLoading]=useState(isEdit);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");

 useEffect(()=>{
  if(!isEdit)return;

  let ignore=false;

  const loadAllergen=async()=>{
   try{
    setLoading(true);
    setError("");

    const res=await fetch(`/api/allergens/${id}`);
    const data=await res.json();

    if(!res.ok||!data.success){
     throw new Error(data.message||"Failed to load allergen");
    }

    if(ignore)return;

    setFormData({
     ...defaultFormData,
     ...data.data,
     code:String(data.data?.code||"").toUpperCase()
    });
   }catch(error){
    if(!ignore)setError(error.message);
   }finally{
    if(!ignore)setLoading(false);
   }
  };

  loadAllergen();

  return()=>{
   ignore=true;
  };
 },[id,isEdit]);

 const handleChange=event=>{
  const {name,value,type,checked}=event.target;

  setFormData(prev=>({
   ...prev,
   [name]:type==="checkbox"?checked:name==="code"?value.toUpperCase():value
  }));
 };

 const handleSubmit=async event=>{
  event.preventDefault();

  try{
   setSaving(true);
   setError("");

   const res=await fetch(isEdit?`/api/allergens/${id}`:"/api/allergens",{
    method:isEdit?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(formData)
   });

   const data=await res.json();

   if(!res.ok||!data.success){
    throw new Error(data.message||"Failed to save allergen");
   }

   navigate("/admin/allergens");
  }catch(error){
   setError(error.message);
  }finally{
   setSaving(false);
  }
 };

 return(
  <Container fluid className="py-4">
   <Row className="mb-3 align-items-center">
    <Col>
     <h1 className="mb-1">{isEdit?"Edit Allergen":"Add Allergen"}</h1>
     <p className="text-muted mb-0">Manage allergen labels used by recipes and food reference workflows.</p>
    </Col>

    <Col xs="auto">
     <Button type="button" variant="outline-secondary" onClick={()=>navigate("/admin/allergens")}>
      Back to Allergens
     </Button>
    </Col>
   </Row>

   {error&&<Alert variant="danger">{error}</Alert>}

   {loading?(
    <div className="text-center py-5">
     <Spinner/>
    </div>
   ):(
    <Form onSubmit={handleSubmit}>
     <Card className="border-0 shadow-sm">
      <Card.Body>
       <Row>
        <Col md={6}>
         <Form.Group className="mb-3" controlId="allergenName">
          <Form.Label>Name</Form.Label>
          <Form.Control name="name" value={formData.name} onChange={handleChange} required/>
         </Form.Group>
        </Col>

        <Col md={3}>
         <Form.Group className="mb-3" controlId="allergenCode">
          <Form.Label>Code</Form.Label>
          <Form.Control name="code" value={formData.code} onChange={handleChange} required/>
         </Form.Group>
        </Col>

        <Col md={3}>
         <Form.Group className="mb-3" controlId="allergenEmoji">
          <Form.Label>Emoji</Form.Label>
          <Form.Control name="emoji" value={formData.emoji} onChange={handleChange}/>
         </Form.Group>
        </Col>

        <Col md={6}>
         <Form.Group className="mb-3" controlId="allergenSeverity">
          <Form.Label>Severity</Form.Label>
          <Form.Select name="severityLevel" value={formData.severityLevel} onChange={handleChange}>
           <option value="Low">Low</option>
           <option value="Medium">Medium</option>
           <option value="High">High</option>
           <option value="Severe">Severe</option>
          </Form.Select>
         </Form.Group>
        </Col>

        <Col md={3}>
         <Form.Group className="mb-3" controlId="allergenIsMajor">
          <Form.Label>Major Allergen</Form.Label>
          <Form.Check type="switch" name="isMajor" checked={formData.isMajor} onChange={handleChange}/>
         </Form.Group>
        </Col>

        <Col md={3}>
         <Form.Group className="mb-3" controlId="allergenIsActive">
          <Form.Label>Active</Form.Label>
          <Form.Check type="switch" name="isActive" checked={formData.isActive} onChange={handleChange}/>
         </Form.Group>
        </Col>

        <Col md={12}>
         <Form.Group className="mb-3" controlId="allergenNotes">
          <Form.Label>Notes</Form.Label>
          <Form.Control as="textarea" rows={3} name="notes" value={formData.notes} onChange={handleChange}/>
         </Form.Group>
        </Col>
       </Row>
      </Card.Body>
     </Card>

     <div className="d-flex justify-content-end gap-2 mt-3">
      <Button type="button" variant="outline-secondary" onClick={()=>navigate("/admin/allergens")}>
       Cancel
      </Button>
      <Button type="submit" disabled={saving}>
       {saving?"Saving...":"Save Allergen"}
      </Button>
     </div>
    </Form>
   )}
  </Container>
 );
}

export default AllergenForm;
