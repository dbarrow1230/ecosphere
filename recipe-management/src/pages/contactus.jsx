import Alert from "../components/AppAlert.jsx";
import {useState} from "react";
import {Container,Row,Col,Form,Button,Card} from "react-bootstrap";

function ContactUs(){
 const [formData,setFormData]=useState({name:"",email:"",subject:"",message:""});
 const [saving,setSaving]=useState(false);
 const [alert,setAlert]=useState(null);

 const change=e=>setFormData(prev=>({...prev,[e.target.name]:e.target.value}));
 const submit=async e=>{
  e.preventDefault();
  try{
   setSaving(true);setAlert(null);
   const res=await fetch("/api/contacts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(formData)});
   const data=await res.json().catch(()=>null);
   if(!res.ok)throw new Error(data?.message||"Failed to send message.");
   setFormData({name:"",email:"",subject:"",message:""});
   setAlert({variant:"success",message:data?.message||"Your message has been received."});
  }catch(err){setAlert({variant:"danger",message:err.message});}finally{setSaving(false);}
 };

 return(
  <Container className="py-5">

   <Row className="justify-content-center mb-4">
    <Col lg={8} className="text-center">
     <h1 className="mb-3">Contact Us</h1>
     <p className="text-muted">
      Have a question, suggestion, or issue? Send us a message and we'll get back to you.
     </p>
    </Col>
   </Row>

   <Row className="justify-content-center">
    <Col lg={8}>

     <Card className="shadow-sm">
      <Card.Body>

       {alert?<Alert variant={alert.variant} onClose={()=>setAlert(null)}>{alert.message}</Alert>:null}
       <Form onSubmit={submit}>

        <Row className="mb-3">
         <Col md={6}>
          <Form.Group controlId="contactName">
           <Form.Label>Name</Form.Label>
           <Form.Control name="name" type="text" placeholder="Your name" value={formData.name} onChange={change} required/>
          </Form.Group>
         </Col>

         <Col md={6}>
          <Form.Group controlId="contactEmail">
           <Form.Label>Email</Form.Label>
           <Form.Control name="email" type="email" placeholder="name@example.com" value={formData.email} onChange={change} required/>
          </Form.Group>
         </Col>
        </Row>

        <Form.Group className="mb-3" controlId="contactSubject">
         <Form.Label>Subject</Form.Label>
         <Form.Control name="subject" type="text" placeholder="What is this about?" value={formData.subject} onChange={change} required/>
        </Form.Group>

        <Form.Group className="mb-4" controlId="contactMessage">
         <Form.Label>Message</Form.Label>
         <Form.Control name="message" as="textarea" rows={6} placeholder="Write your message here..." value={formData.message} onChange={change} required/>
        </Form.Group>

        <div className="d-grid">
         <Button type="submit" variant="primary" size="lg" disabled={saving}>
          {saving?"Sending...":"Send Message"}
         </Button>
        </div>

       </Form>

      </Card.Body>
     </Card>

    </Col>
   </Row>

  </Container>
 );

}

export default ContactUs;
