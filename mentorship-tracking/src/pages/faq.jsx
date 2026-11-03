import {Accordion} from "react-bootstrap";

function FAQ(){

 return(
  <>
   <header className="pt-5 px-3 px-lg-4 mb-4">
     <h1 className="mb-3">Frequently Asked Questions</h1>
     <p className="text-muted">
      Answers to common questions about using the Culinary Mentorship Tracker.
     </p>
   </header>

     <Accordion defaultActiveKey="0" className="px-3 px-lg-4 pb-5">

      <Accordion.Item eventKey="0">
       <Accordion.Header>What is the Culinary Mentorship Tracker?</Accordion.Header>
       <Accordion.Body>
        The Culinary Mentorship Tracker is a private recordkeeping system for managing mentee progress, tracking weekly mentorship sessions, recording notes, monitoring SMART goals, and maintaining supporting documents and images.
       </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="1">
       <Accordion.Header>Who can access this system?</Accordion.Header>
       <Accordion.Body>
        This system is intended for mentor use only. It is protected through your login so mentee records, contact information, notes, images, and documents remain private and accessible only to authorized use.
       </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="2">
       <Accordion.Header>What information can be tracked for each mentee?</Accordion.Header>
       <Accordion.Body>
        Each mentee record can include contact details, program information, externship dates, weekly session records, timesheets, SMART goals, mentor notes, uploaded documents, and images of weekly work production.
       </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="3">
       <Accordion.Header>How are files organized?</Accordion.Header>
       <Accordion.Body>
        Images and documents are stored under each mentee’s folder so records stay organized and easy to retrieve. Images are saved in the mentee’s images folder, while documents are saved directly under the mentee’s main folder.
       </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="4">
       <Accordion.Header>Why are weekly sessions important in the system?</Accordion.Header>
       <Accordion.Body>
        Weekly sessions create the core structure for mentorship tracking. They allow you to document discussions, action steps, follow-up notes, completed tasks, and progress across the six-week mentorship period.
       </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="5">
       <Accordion.Header>Can the system track timesheets and approvals?</Accordion.Header>
       <Accordion.Body>
        Yes. The tracker can record weekly timesheets, total hours, and approval status so mentorship activity and required program hours can be monitored accurately.
       </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="6">
       <Accordion.Header>What are SMART goals used for here?</Accordion.Header>
       <Accordion.Body>
        SMART goals are used to document structured goals for each mentee and monitor progress over time. This helps keep mentorship focused, measurable, and aligned with program objectives.
       </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="7">
       <Accordion.Header>Can this system help with reporting?</Accordion.Header>
       <Accordion.Body>
        Yes. Because it stores sessions, notes, hours, goals, images, and documents in one place, the system makes it easier to provide updates, confirm progress, and support claims when information is requested by a school or program.
       </Accordion.Body>
      </Accordion.Item>

     </Accordion>

  </>
 );

}

export default FAQ;
