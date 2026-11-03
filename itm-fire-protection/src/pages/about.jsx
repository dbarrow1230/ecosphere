// src/pages/about.jsx
import {Container,Row,Col,Card} from "react-bootstrap";
import {Check} from "lucide-react";
import "../styles/About.css";
import {assets} from "../utils/assets";
import usePageMeta from "../utils/usePageMeta";
import aboutTemplate from "../components/AboutTemplate";

function About(){

 const {eyebrow,title,lead,sidebar,sections}=aboutTemplate;

 usePageMeta("About | ITM Fire Protection & Equipment","About ITM Fire Protection & Equipment.");

 return(
  <main className="itm-about">

   <section className="itm-about-hero">
    <Container fluid className="itm-about-hero-inner">
     <Row className="align-items-stretch g-4">

      <Col xs={12} xl={9} className="d-flex">
       <div className="itm-about-hero-copy">
        <p className="itm-about-eyebrow">{eyebrow}</p>
        <h1 className="itm-about-title">{title}</h1>
        <p className="itm-about-lead">{lead}</p>
       </div>
      </Col>

      <Col xs={12} xl={3} className="d-flex">
       <Card className="itm-about-asset-card">
        <Card.Body className="itm-about-asset-body">
         <img src={assets.logo} alt="ITM Fire Protection & Equipment" className="itm-about-logo"/>
        </Card.Body>
       </Card>
      </Col>

     </Row>
    </Container>
   </section>

   <section className="itm-about-content">
    <Container fluid className="itm-about-content-inner">
     <Row className="align-items-start g-4">

      <Col xs={12} xl={9}>
       <Card className="itm-about-sections-card">
        <Card.Body className="itm-about-sections">

         {sections.map((section,index)=>(
          <article className="itm-about-section" key={index}>
           <Row className="g-3">

            <Col xs={12} md="auto">
             <div className="itm-about-section-number">
              {String(index+1).padStart(2,"0")}
             </div>
            </Col>

            <Col>
             <div className="itm-about-section-body">
              <h2 className="itm-about-heading">{section.heading}</h2>

              {section.text&&section.text.map((paragraph,i)=>(
               <p className="itm-about-text" key={i}>{paragraph}</p>
              ))}

              {section.list&&(
               <ul className="itm-about-list">
                {section.list.map((item,i)=>(
                 <li key={i}>
                  <Check className="itm-about-list-icon" size={18} strokeWidth={2.5}/>
                  <span>{item}</span>
                 </li>
                ))}
               </ul>
              )}
             </div>
            </Col>

           </Row>
          </article>
         ))}

        </Card.Body>
       </Card>
      </Col>

      <Col xs={12} xl={3}>
       <Card className="itm-about-sidebar">
        <Card.Body>
         <p className="itm-about-sidebar-eyebrow">{sidebar.eyebrow}</p>
         <h2 className="itm-about-sidebar-title">{sidebar.title}</h2>
         <p className="itm-about-sidebar-text">{sidebar.text}</p>
        </Card.Body>
       </Card>
      </Col>

     </Row>
    </Container>
   </section>

  </main>
 );

}

export default About;