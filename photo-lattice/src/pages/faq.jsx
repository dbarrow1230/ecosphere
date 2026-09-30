// src/pages/faq.jsx
import {Container,Row,Col,Card} from "react-bootstrap";
import "../styles/faq.css";
import faqTemplate from "../components/FAQTemplate";

function FAQ(){

 const {eyebrow,title,lead,faqs}=faqTemplate;

 return(
  <section className="faq-page">
   <Container className="py-5">

    <Row className="justify-content-center mb-4">
     <Col lg={8} className="text-center">
      <p className="faq-page-eyebrow mb-2">{eyebrow}</p>
      <h1 className="faq-page-title mb-3">{title}</h1>
      <p className="faq-page-lead mb-0">{lead}</p>
     </Col>
    </Row>

    <Row className="g-4 justify-content-center">
     {faqs.map((item,index)=>(
      <Col md={6} lg={6} key={index}>
       <Card className="faq-page-card h-100">
        <Card.Body>
         <h2 className="faq-page-question">{item.question}</h2>
         <p className="faq-page-answer mb-0">{item.answer}</p>
        </Card.Body>
       </Card>
      </Col>
     ))}
    </Row>

   </Container>
  </section>
 );

}

export default FAQ;