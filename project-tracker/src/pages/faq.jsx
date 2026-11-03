import {Container,Row,Col,Accordion} from "react-bootstrap";

function FAQ(){

 return(
  <Container className="py-5">

   <Row className="justify-content-center mb-4">
    <Col lg={8} className="text-center">
     <h1 className="mb-3">Frequently Asked Questions</h1>
     <p className="text-muted">
      Answers to common questions about using Zettelkasten.
     </p>
    </Col>
   </Row>

   <Row className="justify-content-center">
    <Col lg={8}>

     <Accordion defaultActiveKey="0">

      <Accordion.Item eventKey="0">
       <Accordion.Header>What is Zettelkasten?</Accordion.Header>
       <Accordion.Body>
        Zettelkasten is a note-taking and knowledge management method that
        organizes ideas as small connected notes. It helps you build a
        network of thoughts rather than a collection of isolated documents.
       </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="1">
       <Accordion.Header>How do notes connect together?</Accordion.Header>
       <Accordion.Body>
        Notes can reference other notes using links or tags. This creates a
        web of ideas where related concepts naturally connect and grow
        over time.
       </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="2">
       <Accordion.Header>What are notebooks?</Accordion.Header>
       <Accordion.Body>
        Notebooks are collections of related notes. They help organize
        larger topics while still allowing each note to remain small and
        focused.
       </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="3">
       <Accordion.Header>How do tags work?</Accordion.Header>
       <Accordion.Body>
        Tags allow you to label notes with keywords. This makes it easier
        to find related ideas across notebooks and topics.
       </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="4">
       <Accordion.Header>Can I export my notes?</Accordion.Header>
       <Accordion.Body>
        Yes. Notes can be exported depending on the tools integrated with
        the system. This allows you to back up or move your knowledge base
        when needed.
       </Accordion.Body>
      </Accordion.Item>

     </Accordion>

    </Col>
   </Row>

  </Container>
 );

}

export default FAQ;