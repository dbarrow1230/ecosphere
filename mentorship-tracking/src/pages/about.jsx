// src/pages/About.jsx
import "../styles/About.css";

function About(){

 return(
  <section className="about-page">
   <div className="about-page-container">

    <div className="about-page-hero">
     <p className="about-page-eyebrow">About</p>
     <h1 className="about-page-title">Mentorship Tracking System</h1>
     <p className="about-page-lead">
      This system is built to track, document, and manage mentee progress throughout structured mentorship programs. It provides a centralized place to monitor sessions, verify hours, record development, and maintain supporting documentation.
     </p>
    </div>

    <div className="about-page-grid">

     <article className="about-page-card">
      <h2 className="about-page-heading">Purpose</h2>
      <p className="about-page-text">
       The platform exists to support accurate mentorship tracking and accountability. It allows mentors to maintain detailed records of each mentee’s progress, ensuring that all required hours, sessions, and outcomes are documented clearly.
      </p>
      <p className="about-page-text">
       It is designed to serve as both a working tool and a reference system in case verification or reporting is required by external programs or institutions.
      </p>
     </article>

     <article className="about-page-card">
      <h2 className="about-page-heading">What This System Tracks</h2>
      <p className="about-page-text">
       The application manages mentee records, scheduled sessions, and structured weekly tracking. It includes timesheets, SMART goals, session notes, and progress summaries aligned to each mentee’s program.
      </p>
      <p className="about-page-text">
       It also stores supporting evidence such as images of production work and uploaded documents to validate progress and activity.
      </p>
     </article>

     <article className="about-page-card">
      <h2 className="about-page-heading">System Design</h2>
      <p className="about-page-text">
       The interface is built as a functional system rather than a promotional space. It prioritizes clarity, organization, and ease of access so that information can be recorded and retrieved efficiently.
      </p>
      <p className="about-page-text">
       The structure is centered around each mentee, with all related data organized by week to maintain consistency across sessions, files, and progress tracking.
      </p>
     </article>

     <article className="about-page-card">
      <h2 className="about-page-heading">Core Principles</h2>
      <ul className="about-page-list">
       <li>Accurate record keeping</li>
       <li>Clear weekly structure</li>
       <li>Centralized mentee data</li>
       <li>Verifiable documentation</li>
       <li>Consistent tracking across all mentees</li>
      </ul>
     </article>

    </div>

   </div>
  </section>
 );

}

export default About;