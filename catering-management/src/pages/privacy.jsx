import {Container,Row,Col,Card} from "react-bootstrap";

function Privacy(){

 return(
  <Container className="py-5">

   <Row className="justify-content-center mb-4">
    <Col lg={8} className="text-center">
     <h1 className="mb-3">Privacy Policy</h1>
     <p className="text-muted">
      This Privacy Policy explains how information may be collected, used, and protected when you use this website.
     </p>
    </Col>
   </Row>

   <Row className="justify-content-center">
    <Col lg={9}>

     <Card className="shadow-sm">
      <Card.Body className="p-4">

       <section className="mb-4">
        <h2 className="h4 mb-3">1. Information We Collect</h2>
        <p className="mb-2">
         We may collect information you provide directly, such as your name, email address, and any message submitted through forms on this website.
        </p>
        <p className="mb-0">
         We may also collect limited technical information automatically, such as browser type, device information, pages visited, and general usage data.
        </p>
       </section>

       <section className="mb-4">
        <h2 className="h4 mb-3">2. How We Use Information</h2>
        <p className="mb-2">
         Information may be used to respond to inquiries, improve the website, maintain security, and provide a better user experience.
        </p>
        <p className="mb-0">
         We do not sell personal information to third parties.
        </p>
       </section>

       <section className="mb-4">
        <h2 className="h4 mb-3">3. Cookies and Analytics</h2>
        <p className="mb-2">
         This website may use cookies or similar technologies to support functionality, remember preferences, and understand how visitors use the site.
        </p>
        <p className="mb-0">
         You can usually control cookies through your browser settings.
        </p>
       </section>

       <section className="mb-4">
        <h2 className="h4 mb-3">4. Third-Party Services</h2>
        <p className="mb-2">
         Some features may rely on third-party services such as hosting providers, analytics tools, embedded content, or contact form services.
        </p>
        <p className="mb-0">
         Those services may process information according to their own privacy policies.
        </p>
       </section>

       <section className="mb-4">
        <h2 className="h4 mb-3">5. Data Security</h2>
        <p className="mb-0">
         Reasonable measures may be used to protect your information, but no method of transmission or storage is completely secure.
        </p>
       </section>

       <section className="mb-4">
        <h2 className="h4 mb-3">6. Your Choices</h2>
        <p className="mb-2">
         You may choose not to provide personal information through forms on this website.
        </p>
        <p className="mb-0">
         If you would like to request updates or removal of information you submitted, please contact us directly.
        </p>
       </section>

       <section className="mb-4">
        <h2 className="h4 mb-3">7. Children&apos;s Privacy</h2>
        <p className="mb-0">
         This website is not intended for children under 13, and we do not knowingly collect personal information from children.
        </p>
       </section>

       <section className="mb-4">
        <h2 className="h4 mb-3">8. Changes to This Policy</h2>
        <p className="mb-0">
         This Privacy Policy may be updated from time to time. Any changes will be posted on this page with the revised effective date.
        </p>
       </section>

       <section>
        <h2 className="h4 mb-3">9. Contact</h2>
        <p className="mb-2">
         If you have questions about this Privacy Policy, please contact us through the website&apos;s contact page.
        </p>
        <p className="mb-0 text-muted">
         Effective date: March 9, 2026
        </p>
       </section>

      </Card.Body>
     </Card>

    </Col>
   </Row>

  </Container>
 );

}

export default Privacy;