// src/pages/Resources.jsx
import {Card} from "react-bootstrap";
import "../styles/resources.css";

function Resources(){

 return(
  <div className="resources-page">
   <div className="resources-page-container">

    <div className="resources-page-hero">
     <p className="resources-page-eyebrow">Resources</p>
     <h1 className="resources-page-title">Support, Access, and Practical Next Steps</h1>
     <p className="resources-page-lead">This page brings together the main support areas connected to From The Ground Up, including help pathways, essential services, training support, and ways to engage
      with the work through volunteering, donating, or partnership.</p>
    </div>

    <div className="resources-page-grid">

     <Card className="resources-page-card">
      <Card.Body>
       <h2 className="resources-page-heading">Get Help</h2>
       <p className="resources-page-text">From The Ground Up is designed for people navigating homelessness, instability, and related barriers who are ready for a structured, community-based environment.
        Access may be coordinated through outreach teams, shelters, partner agencies, and direct organizational contact as capacity allows. </p>
      </Card.Body>
     </Card>

     <Card className="resources-page-card">
      <Card.Body>
       <h2 className="resources-page-heading">Housing and Stabilization Support</h2>
       <p className="resources-page-text"> Resource support includes case management, housing stabilization planning, social worker consultations, and structured pathways toward more secure
        long-term living.</p>
       <ul className="resources-page-list">
        <li>Case management</li>
        <li>Housing pathway support</li>
        <li>Resident accountability structure</li>
        <li>Stability-centered planning</li>
       </ul>
      </Card.Body>
     </Card>

     <Card className="resources-page-card">
      <Card.Body>
       <h2 className="resources-page-heading">Essential Daily Services</h2>
       <p className="resources-page-text"> We recognize that dignity starts with practical support. Essential services help remove immediate barriers and make it easier for residents to focus on
        healing, growth, and participation. </p>
       <ul className="resources-page-list">
        <li>Clothing distribution</li>
        <li>Laundry access</li>
        <li>Showers and hygiene support</li>
        <li>Grooming and barbering services</li>
       </ul>
      </Card.Body>
     </Card>

     <Card className="resources-page-card">
      <Card.Body>
       <h2 className="resources-page-heading">Food and Nutrition Resources</h2>
       <p className="resources-page-text">Food support includes community meals, pantry access, nutrition education,  and fresh produce integration through culinary and grow programs. Food is
        treated as part of wellness, dignity, and shared community care. </p>
       <ul className="resources-page-list">
        <li>Community meals</li>
        <li>Pantry support</li>
        <li>Nutrition education</li>
        <li>Fresh produce access</li>
       </ul>
      </Card.Body>
     </Card>

     <Card className="resources-page-card">
      <Card.Body>
       <h2 className="resources-page-heading">Workforce and Training Resources</h2>
       <p className="resources-page-text">Residents can build skills through multiple tracks tied to real work, real responsibilities, and employment readiness. Resource support may
        include mentorship, training, certification preparation, and practical learning opportunities. </p>
       <ul className="resources-page-list">
        <li>Construction and renovation training</li>
        <li>Culinary instruction</li>
        <li>IT and digital skills support</li>
        <li>Hydroponics and food production learning</li>
       </ul>
      </Card.Body>
     </Card>

     <Card className="resources-page-card">
      <Card.Body>
       <h2 className="resources-page-heading">Technology and Job Readiness</h2>
       <p className="resources-page-text">Technology resources help residents prepare for work and navigate modern systems with more confidence. Support may include resume help, digital
        literacy, device troubleshooting, and online job search preparation. </p>
      </Card.Body>
     </Card>

     <Card className="resources-page-card">
      <Card.Body>
       <h2 className="resources-page-heading">Volunteer</h2>
       <p className="resources-page-text">Volunteers can support the work through time, skills, mentorship, hands-on service, supply drives, and community assistance. People with experience in
        trades, food service, technology, gardening, communications, and support services can all contribute in meaningful ways. </p>
      </Card.Body>
     </Card>

     <Card className="resources-page-card">
      <Card.Body>
       <h2 className="resources-page-heading">Donate</h2>
       <p className="resources-page-text">
        Donations help build and sustain the program. Support may include financial contributions, clothing, hygiene items, tools, equipment, technology,
        kitchen resources, and supplies that directly strengthen daily operations and resident support. </p>
      </Card.Body>
     </Card>

     <Card className="resources-page-card">
      <Card.Body>
       <h2 className="resources-page-heading">Partner With Us</h2>
       <p className="resources-page-text"> We welcome partnerships with schools, unions, employers, city agencies, food rescue groups, nonprofits, donors, and community organizations that
        want to help create training pathways, resource support, and long-term  opportunity for residents. </p>
      </Card.Body>
     </Card>

     <Card className="resources-page-card">
      <Card.Body>
       <h2 className="resources-page-heading">Contact and Connection</h2>
       <p className="resources-page-text">For services, referrals, donations, volunteering, or partnership opportunities, the next step is to connect through the organization’s
        contact channels. As the initiative expands, resource access points can grow alongside location and program capacity. </p>
      </Card.Body>
     </Card>

    </div>

   </div>
  </div>
 );

}

export default Resources;