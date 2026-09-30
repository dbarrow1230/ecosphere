// src/pages/contact.jsx
import "../styles/Contact.css";

function ContactUs(){

 return(
  <main className="contact-page">

   <section className="contact-page-hero">
    <div className="contact-page-hero-main">
     <p className="contact-page-eyebrow">Contact</p>
     <h1 className="contact-page-title">Contact Us</h1>
     <p className="contact-page-lead">
      Have a question, suggestion, or issue with Novel Planner? Send a message and we will review it.
     </p>
    </div>

    <aside className="contact-page-info">
     <h2>What to include</h2>
     <p>
      Tell us what you were working on, what page or feature you were using, and what you need help with.
     </p>
    </aside>
   </section>

   <section className="contact-page-content">

    <aside className="contact-page-sidebar">
     <p className="contact-page-sidebar-eyebrow">Support</p>
     <h2 className="contact-page-sidebar-title">Send a clear message</h2>
     <p className="contact-page-sidebar-text">
      Use this form for questions, feedback, feature requests, or problems with the application.
     </p>
    </aside>

    <form className="contact-page-form">

     <div className="contact-page-row">
      <div className="contact-page-field">
       <label htmlFor="contactName">Name</label>
       <input id="contactName" type="text" placeholder="Your name"/>
      </div>

      <div className="contact-page-field">
       <label htmlFor="contactEmail">Email</label>
       <input id="contactEmail" type="email" placeholder="name@example.com"/>
      </div>
     </div>

     <div className="contact-page-field">
      <label htmlFor="contactSubject">Subject</label>
      <input id="contactSubject" type="text" placeholder="What is this about?"/>
     </div>

     <div className="contact-page-field">
      <label htmlFor="contactMessage">Message</label>
      <textarea id="contactMessage" rows={8} placeholder="Write your message here..."></textarea>
     </div>

     <button className="contact-page-button" type="submit">
      Send Message
     </button>

    </form>

   </section>

  </main>
 );

}

export default ContactUs;