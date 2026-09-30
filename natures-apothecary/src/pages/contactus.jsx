import {useState} from "react";
import {Container,Row,Col,Form,Button,Card} from "react-bootstrap";
import Alert from "../components/PopupAlert.jsx";

function ContactUs(){
 const [draft,setDraft]=useState(()=>{
  try{return JSON.parse(sessionStorage.getItem("apothecary-contact-draft"))||{};}
  catch{return {};}
 });
 const [feedback,setFeedback]=useState(null);
 const change=event=>setDraft(prev=>({...prev,[event.target.name]:event.target.value}));
 const saveDraft=event=>{
  event.preventDefault();
  try{
   sessionStorage.setItem("apothecary-contact-draft",JSON.stringify(draft));
   setFeedback({variant:"success",message:"Draft saved in this browser tab. No message has been sent."});
  }catch{setFeedback({variant:"danger",message:"Your browser could not save the draft. Keep this page open to retain your text."});}
 };

 return(
  <Container className="py-5">

   <Row className="justify-content-center mb-4">
    <Col lg={8} className="text-center">
     <h1 className="mb-3">Contact Us</h1>
     <p className="text-muted">
      Prepare a question, suggestion, or message for our team.
     </p>
    </Col>
   </Row>

   <Row className="justify-content-center">
    <Col lg={8}>

     <Card className="shadow-sm">
      <Card.Body>

       <Alert variant="info">Message delivery is not available yet. You can save a draft in this browser tab and return to it after refreshing.</Alert>
       {feedback&&<Alert variant={feedback.variant}>{feedback.message}</Alert>}
       <Form onSubmit={saveDraft}>

        <Row className="mb-3">
         <Col md={6}>
          <Form.Group controlId="contactName">
           <Form.Label>Name</Form.Label>
           <Form.Control name="name" value={draft.name||""} onChange={change} type="text" placeholder="Your name"/>
          </Form.Group>
         </Col>

         <Col md={6}>
          <Form.Group controlId="contactEmail">
           <Form.Label>Email</Form.Label>
           <Form.Control name="email" value={draft.email||""} onChange={change} type="email" placeholder="name@example.com"/>
          </Form.Group>
         </Col>
        </Row>

        <Form.Group className="mb-3" controlId="contactSubject">
         <Form.Label>Subject</Form.Label>
         <Form.Control name="subject" value={draft.subject||""} onChange={change} type="text" placeholder="What is this about?"/>
        </Form.Group>

        <Form.Group className="mb-4" controlId="contactMessage">
         <Form.Label>Message</Form.Label>
         <Form.Control name="message" value={draft.message||""} onChange={change} as="textarea" rows={6} placeholder="Write your message here..."/>
        </Form.Group>

        <div className="d-grid">
         <Button type="submit" variant="primary" size="lg">
          Save Draft
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
