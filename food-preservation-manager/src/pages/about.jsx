import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

export default function About(){
 return(
  <main className="about-page py-5">
   <section className="about-hero py-5">
    <Container>
     <Row className="justify-content-center text-center">
      <Col lg={10} xl={9}>
       <p className="about-eyebrow mb-3">About the App</p>
       <h1 className="about-title mb-4">A Better Way to Track Food Preservation</h1>
       <p className="about-text mb-0">
        Food preservation is more than a process. It is a practice of planning, care, consistency, and creativity.
        This application was built to help you record, organize, and manage every batch you preserve in one place.
       </p>
      </Col>
     </Row>
    </Container>
   </section>

   <section className="py-4">
    <Container>
     <Row className="g-4">
      <Col lg={7}>
       <Card className="h-100 border-0 shadow-sm">
        <Card.Body className="p-4 p-lg-5">
         <h2 className="mb-3">What This App Does</h2>
         <p className="mb-3">
          Whether you are canning seasonal produce, fermenting vegetables, dehydrating herbs, freezing prepared foods,
          or vacuum sealing ingredients for storage, accurate record keeping matters.
         </p>
         <p className="mb-0">
          This app gives you a structured way to log preservation methods, ingredients, batch details, dates, storage
          notes, and outcomes so your work stays organized, searchable, and easier to repeat with confidence.
         </p>
        </Card.Body>
       </Card>
      </Col>

      <Col lg={5}>
       <Card className="h-100 border-0 shadow-sm">
        <Card.Body className="p-4 p-lg-5">
         <h2 className="mb-3">Why It Matters</h2>
         <p className="mb-0">
          Good preservation depends on more than the method itself. Timing, ingredients, storage conditions, and
          consistency all play a role. A reliable log helps you improve results, reduce waste, and build a lasting
          archive of what you preserve.
         </p>
        </Card.Body>
       </Card>
      </Col>
     </Row>
    </Container>
   </section>

   <section className="py-4">
    <Container>
     <Row className="g-4">
      <Col md={6} xl={3}>
       <Card className="h-100 border-0 shadow-sm">
        <Card.Body className="p-4">
         <h3 className="h5 mb-3">Track Methods</h3>
         <p className="mb-0">
          Log canning, fermenting, dehydrating, freezing, pickling, and vacuum sealing in one organized system.
         </p>
        </Card.Body>
       </Card>
      </Col>

      <Col md={6} xl={3}>
       <Card className="h-100 border-0 shadow-sm">
        <Card.Body className="p-4">
         <h3 className="h5 mb-3">Record Batch Details</h3>
         <p className="mb-0">
          Save ingredients, preparation notes, processing dates, and key information for every preserved batch.
         </p>
        </Card.Body>
       </Card>
      </Col>

      <Col md={6} xl={3}>
       <Card className="h-100 border-0 shadow-sm">
        <Card.Body className="p-4">
         <h3 className="h5 mb-3">Manage Storage</h3>
         <p className="mb-0">
          Keep track of storage locations, review dates, and preserved inventory with more clarity and consistency.
         </p>
        </Card.Body>
       </Card>
      </Col>

      <Col md={6} xl={3}>
       <Card className="h-100 border-0 shadow-sm">
        <Card.Body className="p-4">
         <h3 className="h5 mb-3">Build a History</h3>
         <p className="mb-0">
          Create a searchable record of your preservation work so successful batches are easier to repeat.
         </p>
        </Card.Body>
       </Card>
      </Col>
     </Row>
    </Container>
   </section>

   <section className="py-4">
    <Container>
     <Row className="justify-content-center">
      <Col lg={10}>
       <Card className="border-0 shadow-sm">
        <Card.Body className="p-4 p-lg-5 text-center">
         <h2 className="mb-3">Built for Real Preservation Work</h2>
         <p className="mb-0">
          This application was designed for practical use in real kitchens and real workflows. Whether you preserve
          occasionally, seasonally, or as part of a larger system, it helps you keep cleaner records and maintain a
          more reliable log of everything you preserve.
         </p>
        </Card.Body>
       </Card>
      </Col>
     </Row>
    </Container>
   </section>
  </main>
 );
}