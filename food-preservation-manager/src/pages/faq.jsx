// src/pages/FAQ.jsx
import { Container, Row, Col, Accordion } from 'react-bootstrap';
import '../styles/About.css'
export default function FAQ(){
 return(
  <main className="faq-page py-5">
   <section className="faq-hero py-5">
    <Container>
     <Row className="justify-content-center text-center">
      <Col lg={10} xl={9}>
       <p className="faq-eyebrow mb-3">FAQ</p>
       <h1 className="faq-title mb-4">Frequently Asked Questions</h1>
       <p className="faq-text mb-0">
        Find answers to common questions about logging preservation methods, tracking batches, managing records, and using the app more effectively.
       </p>
      </Col>
     </Row>
    </Container>
   </section>

   <section className="py-4">
    <Container>
     <Row className="justify-content-center">
      <Col lg={10} xl={9}>
       <Accordion className="faq-accordion">
        <Accordion.Item eventKey="0" className="faq-item">
         <Accordion.Header>What is this app used for?</Accordion.Header>
         <Accordion.Body>
          This app is used to record, organize, and manage food preservation activity in one place. You can track methods, ingredients, dates, storage details, and notes for each batch you preserve.
         </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="1" className="faq-item">
         <Accordion.Header>What preservation methods can I log?</Accordion.Header>
         <Accordion.Body>
          You can log a range of preservation methods including canning, fermenting, dehydrating, freezing, pickling, and vacuum sealing, depending on how your application is configured.
         </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="2" className="faq-item">
         <Accordion.Header>Can I keep notes for each batch?</Accordion.Header>
         <Accordion.Body>
          Yes. Each batch can include notes for ingredients, preparation steps, process details, storage conditions, outcomes, and any observations you want to reference later.
         </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="3" className="faq-item">
         <Accordion.Header>Why should I track preservation dates?</Accordion.Header>
         <Accordion.Body>
          Tracking dates helps you maintain a clearer record of when food was processed, stored, reviewed, or rotated. It also makes it easier to compare batches and stay organized over time.
         </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="4" className="faq-item">
         <Accordion.Header>Can I use this app to manage inventory?</Accordion.Header>
         <Accordion.Body>
          Yes. The app helps you maintain a history of preserved foods and can support inventory tracking by showing what has been preserved, when it was processed, and how it is stored.
         </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="5" className="faq-item">
         <Accordion.Header>Is this app only for home food preservation?</Accordion.Header>
         <Accordion.Body>
          No. It can be useful for home kitchens, seasonal preservation projects, small food businesses, and anyone who needs a more consistent way to document preservation work.
         </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="6" className="faq-item">
         <Accordion.Header>Can I look back at previous batches?</Accordion.Header>
         <Accordion.Body>
          Yes. One of the main benefits of the app is keeping a searchable record of previous batches so you can review what worked, compare results, and repeat successful methods more easily.
         </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="7" className="faq-item">
         <Accordion.Header>How does this help improve consistency?</Accordion.Header>
         <Accordion.Body>
          When your methods, ingredients, dates, and notes are stored in one place, it becomes much easier to identify patterns, refine your process, and reproduce reliable results.
         </Accordion.Body>
        </Accordion.Item>
       </Accordion>
      </Col>
     </Row>
    </Container>
   </section>
  </main>
 );
}