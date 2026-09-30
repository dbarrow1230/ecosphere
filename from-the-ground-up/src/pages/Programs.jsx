// src/pages/Programs.jsx
import {Card} from "react-bootstrap";
import "../styles/programs.css";

function Programs(){

 return(
  <section className="programs-page">
   <div className="programs-page-container">

    <div className="programs-page-hero">
     <p className="programs-page-eyebrow">Programs</p>
     <h1 className="programs-page-title">What We Build Through From The Ground Up</h1>
     <p className="programs-page-lead">
      Our programs are designed to restore dignity, create structure, develop practical skills,
      and build long-term stability through housing support, workforce training, essential services,
      and community participation.
     </p>
    </div>

    <div className="programs-page-grid">

     <Card className="programs-page-card">
      <Card.Body>
       <h2 className="programs-page-heading">Housing Stabilization</h2>
       <p className="programs-page-text">
        We support individuals transitioning out of homelessness through structured living,
        case management, housing pathways, and community accountability. The goal is not
        temporary placement alone, but long-term stability and a real foundation for growth.
       </p>
       <ul className="programs-page-list">
        <li>Transitional support</li>
        <li>Case management</li>
        <li>Housing pathway planning</li>
        <li>Community-based stability</li>
       </ul>
      </Card.Body>
     </Card>

     <Card className="programs-page-card">
      <Card.Body>
       <h2 className="programs-page-heading">Workforce Development</h2>
       <p className="programs-page-text">
        Workforce development is built into the structure of the program. Residents build
        skills through hands-on work, training tracks, mentorship, certifications, and
        employment preparation tied to real responsibilities and real opportunity.
       </p>
       <ul className="programs-page-list">
        <li>Construction and renovation training</li>
        <li>Culinary arts training</li>
        <li>IT and digital skills development</li>
        <li>Hydroponics and gardening instruction</li>
       </ul>
      </Card.Body>
     </Card>

     <Card className="programs-page-card">
      <Card.Body>
       <h2 className="programs-page-heading">Culinary and Kitchen Collective</h2>
       <p className="programs-page-text">
        The culinary program teaches residents cooking fundamentals, food safety, meal
        planning, nutrition, and group meal production. It supports both job readiness
        and daily community care through healthy, thoughtfully prepared food.
       </p>
       <ul className="programs-page-list">
        <li>Cooking fundamentals</li>
        <li>Nutrition and meal planning</li>
        <li>Safe food handling and ServSafe preparation</li>
        <li>Batch cooking and kitchen practice</li>
       </ul>
      </Card.Body>
     </Card>

     <Card className="programs-page-card">
      <Card.Body>
       <h2 className="programs-page-heading">Grow Lab and Food Production</h2>
       <p className="programs-page-text">
        Our grow program teaches sustainable food production through hydroponics, vertical
        growing, soil-based methods where possible, and food preservation. Produce can be
        integrated directly into community meals and culinary training.
       </p>
       <ul className="programs-page-list">
        <li>Hydroponic growing systems</li>
        <li>Seed propagation and plant development</li>
        <li>Nutrient and water management</li>
        <li>Food preservation and composting</li>
       </ul>
      </Card.Body>
     </Card>

     <Card className="programs-page-card">
      <Card.Body>
       <h2 className="programs-page-heading">IT and Technology</h2>
       <p className="programs-page-text">
        Technology training helps residents build essential digital confidence and practical
        job-readiness skills. It also creates opportunities for residents with stronger IT
        backgrounds to support others and help maintain internal systems.
       </p>
       <ul className="programs-page-list">
        <li>Basic digital literacy</li>
        <li>Resume and document preparation</li>
        <li>Online job search support</li>
        <li>Device repair and network basics</li>
       </ul>
      </Card.Body>
     </Card>

     <Card className="programs-page-card">
      <Card.Body>
       <h2 className="programs-page-heading">Essentials and Dignity Services</h2>
       <p className="programs-page-text">
        Stability starts with dignity. Our essential services support residents with the
        resources needed for daily life, personal care, confidence, and readiness for work
        and community participation.
       </p>
       <ul className="programs-page-list">
        <li>Clothing distribution</li>
        <li>Laundry access</li>
        <li>Showers and hygiene support</li>
        <li>Grooming and barbering services</li>
       </ul>
      </Card.Body>
     </Card>

     <Card className="programs-page-card">
      <Card.Body>
       <h2 className="programs-page-heading">Community Food Programs</h2>
       <p className="programs-page-text">
        Food is part of care, stability, and community. Our food programs provide meals,
        pantry support, and nutrition education while reinforcing participation, health,
        and shared responsibility.
       </p>
       <ul className="programs-page-list">
        <li>Community meals</li>
        <li>Pantry support</li>
        <li>Nutrition education</li>
        <li>Fresh produce integration</li>
       </ul>
      </Card.Body>
     </Card>

     <Card className="programs-page-card">
      <Card.Body>
       <h2 className="programs-page-heading">Resident Empowerment</h2>
       <p className="programs-page-text">
        Empowerment is part of the program model, not an extra feature. Residents build
        confidence and leadership through mentorship, shared responsibility, and meaningful
        participation in the life of the community.
       </p>
       <ul className="programs-page-list">
        <li>Peer mentorship</li>
        <li>Leadership development</li>
        <li>Community participation</li>
        <li>Responsibility and accountability</li>
       </ul>
      </Card.Body>
     </Card>

    </div>

   </div>
  </section>
 );

}

export default Programs;