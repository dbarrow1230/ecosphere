import "../styles/staticPages.css";
import barrowLogo from "../assets/Barrow Publications Logo 1.png";

function TermsOfService(){

 return(
  <main className="static-page static-page-burgundy">

   <header className="static-page-header">

    <img
     src={barrowLogo}
     alt="Barrow Publications logo"
     className="static-page-logo-img"
    />

    <h1>Terms of Service</h1>
    <p>These terms govern the use of this website and its services.</p>
   </header>

   <section className="static-page-content">

    <section className="static-page-section">
     <h2>1. Acceptance of Terms</h2>
     <p className="mb-0">
      By accessing or using this website, you agree to comply with and be bound by these Terms of Service. If you do not agree with these terms, you should not use this website.
     </p>
    </section>

    <section className="static-page-section">
     <h2>2. Use of the Website</h2>
     <p className="mb-2">
      You agree to use the website only for lawful purposes and in a manner that does not interfere with the rights of others or restrict their use of the service.
     </p>
     <p className="mb-0">
      Unauthorized use of the website may result in termination of access.
     </p>
    </section>

    <section className="static-page-section">
     <h2>3. User Content</h2>
     <p className="mb-2">
      Any content you submit or upload remains your responsibility. You must ensure that your content does not violate any laws or infringe on the rights of others.
     </p>
     <p className="mb-0">
      We reserve the right to remove content that violates these terms.
     </p>
    </section>

    <section className="static-page-section">
     <h2>4. Intellectual Property</h2>
     <p className="mb-0">
      All website content including design, text, graphics, and functionality is protected by intellectual property laws and may not be copied or redistributed without permission.
     </p>
    </section>

    <section className="static-page-section">
     <h2>5. Limitation of Liability</h2>
     <p className="mb-0">
      This website is provided "as is" without warranties of any kind. We are not responsible for any damages resulting from the use or inability to use this website.
     </p>
    </section>

    <section className="static-page-section">
     <h2>6. Termination</h2>
     <p className="mb-0">
      We reserve the right to suspend or terminate access to the website at any time if these terms are violated.
     </p>
    </section>

    <section className="static-page-section">
     <h2>7. Changes to Terms</h2>
     <p className="mb-0">
      These Terms of Service may be updated periodically. Continued use of the website after changes indicates acceptance of the updated terms.
     </p>
    </section>

    <section className="static-page-section">
     <h2>8. Contact</h2>
     <p className="mb-2">
      If you have any questions regarding these Terms of Service, please contact us through the website's contact page.
     </p>
     <p className="mb-0 text-muted">
      Effective date: March 9, 2026
     </p>
    </section>

   </section>

  </main>
 );

}

export default TermsOfService;