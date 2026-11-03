// src/pages/ContactUs.jsx
import {useState} from "react";
import {Alert,Form,Button} from "react-bootstrap";
import bannerImage from "../images/hero_image1.png";
import "../styles/ContactUs.css";

function ContactUs(){
 const emptyForm={firstName:"",lastName:"",email:"",subject:"",message:""};
 const [formData,setFormData]=useState(emptyForm);
 const [status,setStatus]=useState({type:"",message:""});
 const [sending,setSending]=useState(false);

 const handleChange=event=>setFormData(current=>({...current,[event.target.name]:event.target.value}));
 const handleSubmit=async event=>{
  event.preventDefault();
  setSending(true);
  setStatus({type:"",message:""});
  try{
   const response=await fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(formData)});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(data?.message||"Your message could not be sent.");
   setFormData(emptyForm);
   setStatus({type:"success",message:data.message});
  }catch(error){
   setStatus({type:"danger",message:error.message});
  }finally{
   setSending(false);
  }
 };

 return(
  <main className="contact-page">
   <section className="contact-hero">
    <img src={bannerImage} alt="Fresh Roots Flavor Kitchen"/>
    <div className="contact-hero-overlay"></div>
    <div className="contact-hero-content">
     <div className="contact-hero-main">
      <p className="contact-eyebrow">Get In Touch</p>
      <h1 className="contact-title">Contact Us</h1>
      <p className="contact-lead">Have a question, suggestion, or issue? Send us a message and we'll get back to you.</p>
     </div>
     <div className="contact-hero-info">
      <h2>Questions and feedback</h2>
      <p>Use this form for questions about Fresh Roots Flavor Kitchen, our menu, services, or anything that needs our attention.</p>
     </div>
    </div>
   </section>
   <section className="contact-content">
    <aside className="contact-sidebar">
     <p className="contact-sidebar-eyebrow">Contact</p>
     <h2>Send a message</h2>
     <p>Include a clear subject and enough detail to help us understand your question or request.</p>
    </aside>
    <div className="contact-form-area">
     {status.message&&<Alert variant={status.type} dismissible onClose={()=>setStatus({type:"",message:""})}>{status.message}</Alert>}
     <Form onSubmit={handleSubmit}>
      <div className="contact-form-row">
       <div className="contact-field">
        <Form.Label htmlFor="contactFirstName">First Name:</Form.Label>
        <Form.Control type="text" id="contactFirstName" name="firstName" value={formData.firstName} onChange={handleChange} required/>
       </div>
       <div className="contact-field">
        <Form.Label htmlFor="contactLastName">Last Name:</Form.Label>
        <Form.Control type="text" id="contactLastName" name="lastName" value={formData.lastName} onChange={handleChange} required/>
       </div>
      </div>
      <div className="contact-field">
       <Form.Label htmlFor="contactEmail">Email:</Form.Label>
       <Form.Control type="email" id="contactEmail" name="email" value={formData.email} onChange={handleChange} required/>
      </div>
      <div className="contact-field">
       <Form.Label htmlFor="contactSubject">Subject:</Form.Label>
       <Form.Control type="text" id="contactSubject" name="subject" value={formData.subject} onChange={handleChange} required/>
      </div>
      <div className="contact-field contact-message-field">
       <Form.Label htmlFor="contactMessage">Message:</Form.Label>
       <Form.Control as="textarea" rows={6} id="contactMessage" name="message" value={formData.message} onChange={handleChange} required/>
      </div>
      <Button type="submit" variant="primary" disabled={sending}>{sending?"Sending...":"Send Message"}</Button>
     </Form>
    </div>
   </section>
  </main>
 );
}

export default ContactUs;
