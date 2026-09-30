import "../styles/InfoPages.css";

function TermsOfService(){
 return(
  <main className="terms-page">
   <section className="terms-page-hero">
    <div className="terms-page-hero-main">
     <p className="terms-page-eyebrow">Legal</p>
     <h1 className="terms-page-title">Terms of Service</h1>
     <p className="terms-page-lead">These terms govern the use of this website and its services.</p>
    </div>
   </section>

   <section className="terms-page-content">
    <aside className="terms-page-sidebar">
     <p className="terms-page-sidebar-eyebrow">Service Agreement</p>
     <h2 className="terms-page-sidebar-title">Use the system responsibly</h2>
     <p className="terms-page-sidebar-text">These terms explain the responsibilities that apply when accessing the application and its services.</p>
     <p className="terms-page-effective">Effective March 9, 2026</p>
    </aside>

    <div className="terms-page-sections">
     <article className="terms-page-section"><div className="terms-page-section-number">01</div><div><h2>Acceptance of Terms</h2><p>By accessing or using this website, you agree to comply with and be bound by these Terms of Service. If you do not agree with these terms, you should not use this website.</p></div></article>
     <article className="terms-page-section"><div className="terms-page-section-number">02</div><div><h2>Use of the Website</h2><p>You agree to use the website only for lawful purposes and in a manner that does not interfere with the rights of others or restrict their use of the service.</p><p>Unauthorized use of the website may result in termination of access.</p></div></article>
     <article className="terms-page-section"><div className="terms-page-section-number">03</div><div><h2>User Content</h2><p>Any content you submit or upload remains your responsibility. You must ensure that your content does not violate any laws or infringe on the rights of others.</p><p>We reserve the right to remove content that violates these terms.</p></div></article>
     <article className="terms-page-section"><div className="terms-page-section-number">04</div><div><h2>Intellectual Property</h2><p>All website content including design, text, graphics, and functionality is protected by intellectual property laws and may not be copied or redistributed without permission.</p></div></article>
     <article className="terms-page-section"><div className="terms-page-section-number">05</div><div><h2>Limitation of Liability</h2><p>This website is provided &quot;as is&quot; without warranties of any kind. We are not responsible for any damages resulting from the use or inability to use this website.</p></div></article>
     <article className="terms-page-section"><div className="terms-page-section-number">06</div><div><h2>Termination</h2><p>We reserve the right to suspend or terminate access to the website at any time if these terms are violated.</p></div></article>
     <article className="terms-page-section"><div className="terms-page-section-number">07</div><div><h2>Changes to Terms</h2><p>These Terms of Service may be updated periodically. Continued use of the website after changes indicates acceptance of the updated terms.</p></div></article>
     <article className="terms-page-section"><div className="terms-page-section-number">08</div><div><h2>Contact</h2><p>If you have any questions regarding these Terms of Service, please contact us through the website&apos;s contact page.</p></div></article>
    </div>
   </section>
  </main>
 );
}

export default TermsOfService;
