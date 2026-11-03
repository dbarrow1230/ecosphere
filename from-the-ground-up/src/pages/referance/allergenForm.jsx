import {useEffect,useState} from "react";
import {Alert,Button,Card,Col,Container,Form,Row,Spinner} from "react-bootstrap";
import {useNavigate,useParams} from "react-router-dom";

const emptyForm={
 name:"",
 code:"",
 emoji:"",
 description:"",
 severityLevel:"medium",
 isMajor:false,
 isActive:true
};

function AllergenFormPage(){
 const [form,setForm]=useState(emptyForm);
 const [loading,setLoading]=useState(false);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const navigate=useNavigate();
 const {id}=useParams();

 const isEdit=Boolean(id);

 const fetchAllergen=async()=>{
  try{
   setLoading(true);
   setError("");

   const res=await fetch(`/api/allergens/${id}`);
   const data=await res.json();

   if(!res.ok||!data.success){
    throw new Error(data.message||"Failed to load allergen");
   }

   setForm({
    name:data.data.name||"",
    code:data.data.code||"",
    emoji:data.data.emoji||"",
    description:data.data.description||"",
    severityLevel:data.data.severityLevel||"medium",
    isMajor:Boolean(data.data.isMajor),
    isActive:data.data.isActive!==false
   });
  }catch(error){
   setError(error.message);
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  if(isEdit){
   fetchAllergen();
  }
 },[id]);

 const handleChange=(e)=>{
  const {name,value,type,checked}=e.target;

  setForm(prev=>({
   ...prev,
   [name]:type==="checkbox"?checked:value
  }));
 };

 const handleSubmit=async(e)=>{
  e.preventDefault();

  try{
   setSaving(true);
   setError("");

   const url=isEdit?`/api/allergens/${id}`:"/api/allergens";
   const method=isEdit?"PUT":"POST";

   const res=await fetch(url,{
    method,
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(form)
   });

   const data=await res.json();

   if(!res.ok||!data.success){
    throw new Error(data.message||"Failed to save allergen");
   }

   navigate("/referance/allergens");
  }catch(error){
   setError(error.message);
  }finally{
   setSaving(false);
  }
 };

 return (
  <Container fluid className="py-4">
   <Row className="mb-3 align-items-center">
    <Col>
     <h1 className="mb-1">{isEdit?"Edit Allergen":"Add Allergen"}</h1>
     <p className="text-muted mb-0">{isEdit?"Update allergen details.":"Create a new allergen reference."}</p>
    </Col>

    <Col xs="auto">
     <Button type="button" variant="secondary" onClick={()=>navigate("/referance/allergens")}>
      Back
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
    <Card>
     <Card.Body>
      <Form onSubmit={handleSubmit}>
       <Row className="g-3">
        <Col md={4}>
         <Form.Group>
          <Form.Label>Name</Form.Label>
          <Form.Control
           type="text"
           name="name"
           value={form.name}
           onChange={handleChange}
           required
          />
         </Form.Group>
        </Col>

        <Col md={3}>
         <Form.Group>
          <Form.Label>Code</Form.Label>
          <Form.Control
           type="text"
           name="code"
           value={form.code}
           onChange={handleChange}
           required
          />
         </Form.Group>
        </Col>

        <Col md={2}>
         <Form.Group>
          <Form.Label>Emoji</Form.Label>
          <Form.Control
           type="text"
           name="emoji"
           value={form.emoji}
           onChange={handleChange}
          />
         </Form.Group>
        </Col>

        <Col md={3}>
         <Form.Group>
          <Form.Label>Severity</Form.Label>
          <Form.Select
           name="severityLevel"
           value={form.severityLevel}
           onChange={handleChange}
          >
           <option value="low">Low</option>
           <option value="medium">Medium</option>
           <option value="high">High</option>
           <option value="severe">Severe</option>
          </Form.Select>
         </Form.Group>
        </Col>

        <Col md={12}>
         <Form.Group>
          <Form.Label>Description</Form.Label>
          <Form.Control
           as="textarea"
           rows={4}
           name="description"
           value={form.description}
           onChange={handleChange}
          />
         </Form.Group>
        </Col>

        <Col md={6}>
         <Form.Check
          type="checkbox"
          name="isMajor"
          label="Major Allergen"
          checked={form.isMajor}
          onChange={handleChange}
         />
        </Col>

        <Col md={6}>
         <Form.Check
          type="checkbox"
          name="isActive"
          label="Active"
          checked={form.isActive}
          onChange={handleChange}
         />
        </Col>

        <Col md={12} className="d-flex gap-2">
         <Button type="submit" disabled={saving}>
          {saving?(
           <>
            <Spinner size="sm" className="me-2"/>
            Saving
           </>
          ):"Save"}
         </Button>

         <Button type="button" variant="secondary" onClick={()=>navigate("/referance/allergens")}>
          Cancel
         </Button>
        </Col>
       </Row>
      </Form>
     </Card.Body>
    </Card>
   )}
  </Container>
 );
}

export default AllergenFormPage;