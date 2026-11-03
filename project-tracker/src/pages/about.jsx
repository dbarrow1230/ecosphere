// src/pages/about.jsx
import "../styles/About.css";

function About(){

 return(
  <section className="about-page">
   <div className="about-page-container">

    <div className="about-page-hero">
     <p className="about-page-eyebrow">About</p>
     <h1 className="about-page-title">Project Tracker</h1>
     <p className="about-page-lead">
      Project Tracker is a focused workspace for planning, organizing, and managing projects with clarity. It brings tasks, timelines, progress, and team visibility together in one place so work stays structured, actionable, and easy to follow.
     </p>
    </div>

    <div className="about-page-grid">

     <article className="about-page-card">
      <h2 className="about-page-heading">What It Does</h2>
      <p className="about-page-text">
       Project Tracker helps users manage work from start to finish through clear project organization, task tracking, calendar visibility, and workflow-based planning. It is built to reduce clutter, improve follow-through, and keep priorities visible.
      </p>
      <p className="about-page-text">
       Whether you are managing personal work, collaborative projects, or ongoing planning cycles, the goal is to make progress easier to see and easier to maintain.
      </p>
     </article>

     <article className="about-page-card">
      <h2 className="about-page-heading">Core Features</h2>
      <p className="about-page-text">
       The application supports structured project management through project views, task organization, board-based workflow, calendar scheduling, and reporting. Each area is designed to keep information connected without making the interface feel overloaded.
      </p>
      <p className="about-page-text">
       From high-level planning to day-to-day execution, Project Tracker is meant to support both overview and detail in the same workspace.
      </p>
     </article>

     <article className="about-page-card">
      <h2 className="about-page-heading">Why It Exists</h2>
      <p className="about-page-text">
       Project Tracker was created to make project management feel cleaner, more deliberate, and more usable. The focus is not just on listing tasks, but on creating a system where projects have structure, progress is visible, and work can move forward with less friction.
      </p>
     </article>

     <article className="about-page-card">
      <h2 className="about-page-heading">What Users Gain</h2>
      <ul className="about-page-list">
       <li>Clear project organization and visibility</li>
       <li>Task tracking with better workflow control</li>
       <li>Board and timeline views for planning</li>
       <li>Calendar support for scheduling and deadlines</li>
       <li>A cleaner way to manage progress from one place</li>
      </ul>
     </article>

    </div>

   </div>
  </section>
 );

}

export default About;