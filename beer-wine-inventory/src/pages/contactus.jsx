import {Mail,User,AtSign,Tag,MessageSquare,Send} from "lucide-react";
import "../styles/contact.css";

export default function ContactUs(){
 return <section className="contact-page">
  <h1><Mail size={30} aria-hidden="true"/>Contact Us</h1>
  <form className="contact-form">
   <div className="contact-details">
    <div className="contact-field"><label htmlFor="contactName"><User size={16} aria-hidden="true"/>Name:</label><input className="form-control" id="contactName" name="name" type="text" autoComplete="name"/></div>
    <div className="contact-field"><label htmlFor="contactEmail"><AtSign size={16} aria-hidden="true"/>Email:</label><input className="form-control" id="contactEmail" name="email" type="email" autoComplete="email"/></div>
   </div>
   <div className="contact-field contact-subject"><label htmlFor="contactSubject"><Tag size={16} aria-hidden="true"/>Subject:</label><input className="form-control" id="contactSubject" name="subject" type="text"/></div>
   <div className="contact-field contact-message"><label htmlFor="contactMessage"><MessageSquare size={16} aria-hidden="true"/>Message:</label><textarea className="form-control" id="contactMessage" name="message" rows={8}/></div>
   <div className="contact-actions"><button type="submit" className="btn btn-primary"><Send size={16} aria-hidden="true"/>Send Message</button></div>
  </form>
 </section>;
}
