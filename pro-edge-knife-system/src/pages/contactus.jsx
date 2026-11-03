import {useEffect,useState} from "react";
import {Alert,Button,Form,Spinner} from "react-bootstrap";
import "../styles/InfoPages.css";

const emptyForm={name:"",email:"",subject:"",message:""};

function ContactUs(){
 const [formData,setFormData]=useState(emptyForm);
 const [submitting,setSubmitting]=useState(false);
 const [alert,setAlert]=useState({type:"",message:""});

 useEffect(()=>{
  if(!alert.message)return undefined;
  const timer=setTimeout(()=>setAlert({type:"",message:""}),5000);
  return()=>clearTimeout(timer);
 },[alert]);

 const handleChange=event=>{
  const {name,value}=event.target;
  setFormData(current=>({...current,[name]:value}));
 };

 const handleSubmit=async event=>{
  event.preventDefault();
  setSubmitting(true);
  setAlert({type:"",message:""});
  try{
   const response=await fetch("/api/contact",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    credentials:"include",
    body:JSON.stringify(formData)
   });
   const data=await response.json();
   if(!response.ok)throw new Error(data?.message||"Unable to send your message.");
   setFormData(emptyForm);
   setAlert({type:"success",message:data?.message||"Your message was sent successfully."});
  }catch(error){
   setAlert({type:"danger",message:error.message});
  }finally{
   setSubmitting(false);
  }
 };

 return(
  <main className="contact-page info-page">
   <header className="info-page-hero info-page-hero-split">
    <div>
     <p className="info-page-eyebrow">Get in touch</p>
     <h1 className="info-page-title">Contact Us</h1>
     <p className="info-page-lead">Have a question, suggestion, or issue? Send a message and we’ll get back to you.</p>
    </div>
    <div className="info-page-hero-note">
     <h2>Questions and feedback</h2>
     <p>Use this form for application questions, workflow feedback, or problems that need attention.</p>
    </div>
   </header>

   <section className="info-page-content">
    <aside className="info-page-sidebar">
     <p className="info-page-eyebrow">Contact</p>
     <h2>Send a message</h2>
     <p>Include a clear subject and enough detail to understand your question or issue.</p>
    </aside>

    <Form className="contact-form info-page-main" onSubmit={handleSubmit}>
     {alert.message&&<Alert variant={alert.type} dismissible onClose={()=>setAlert({type:"",message:""})}>{alert.message}</Alert>}
     <div className="contact-form-row">
      <Form.Group className="contact-form-field" controlId="contactName">
       <Form.Label>Name</Form.Label>
       <Form.Control name="name" value={formData.name} onChange={handleChange} maxLength={120} required/>
      </Form.Group>
      <Form.Group className="contact-form-field" controlId="contactEmail">
       <Form.Label>Email</Form.Label>
       <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} maxLength={254} required/>
      </Form.Group>
     </div>
     <Form.Group className="contact-form-field" controlId="contactSubject">
      <Form.Label>Subject</Form.Label>
      <Form.Control name="subject" value={formData.subject} onChange={handleChange} maxLength={200} required/>
     </Form.Group>
     <Form.Group className="contact-form-field" controlId="contactMessage">
      <Form.Label>Message</Form.Label>
      <Form.Control as="textarea" rows={6} name="message" value={formData.message} onChange={handleChange} maxLength={5000} required/>
     </Form.Group>
     <div className="contact-form-actions">
      <Button type="submit" variant="primary" disabled={submitting}>
       {submitting?<><Spinner as="span" size="sm" animation="border"/> Sending</>:"Send Message"}
      </Button>
     </div>
    </Form>
   </section>
  </main>
 );
}

export default ContactUs;
