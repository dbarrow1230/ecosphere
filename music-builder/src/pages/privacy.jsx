import "../styles/InfoPages.css";

const sections = [
  {
    title: "Information We Collect",
    content: (
      <>
        <p>
          We may collect information you provide directly, such as your name, email address, and any message submitted through forms on this website.
        </p>
        <p>
          We may also collect limited technical information automatically, such as browser type, device information, pages visited, and general usage data.
        </p>
      </>
    ),
  },
  {
    title: "How We Use Information",
    content: (
      <>
        <p>
          Information may be used to respond to inquiries, improve the website, maintain security, and provide a better user experience.
        </p>
        <p>We do not sell personal information to third parties.</p>
      </>
    ),
  },
  {
    title: "Cookies and Analytics",
    content: (
      <>
        <p>
          This website may use cookies or similar technologies to support functionality, remember preferences, and understand how visitors use the site.
        </p>
        <p>You can usually control cookies through your browser settings.</p>
      </>
    ),
  },
  {
    title: "Third-Party Services",
    content: (
      <>
        <p>
          Some features may rely on third-party services such as hosting providers, analytics tools, embedded content, or contact form services.
        </p>
        <p>Those services may process information according to their own privacy policies.</p>
      </>
    ),
  },
  {
    title: "Data Security",
    content: (
      <p>
        Reasonable measures may be used to protect your information, but no method of transmission or storage is completely secure.
      </p>
    ),
  },
  {
    title: "Your Choices",
    content: (
      <>
        <p>You may choose not to provide personal information through forms on this website.</p>
        <p>
          If you would like to request updates or removal of information you submitted, please contact us directly.
        </p>
      </>
    ),
  },
  {
    title: "Children's Privacy",
    content: (
      <p>
        This website is not intended for children under 13, and we do not knowingly collect personal information from children.
      </p>
    ),
  },
  {
    title: "Changes to This Policy",
    content: (
      <p>
        This Privacy Policy may be updated from time to time. Any changes will be posted on this page with the revised effective date.
      </p>
    ),
  },
  {
    title: "Contact",
    content: (
      <p>
        If you have questions about this Privacy Policy, please contact us through the website&apos;s contact page.
      </p>
    ),
  },
];

function Privacy() {
  return (
    <main className="privacy-page">
      <header className="privacy-page-hero">
        <p className="privacy-page-eyebrow">Privacy</p>
        <h1 className="privacy-page-title">Privacy Policy</h1>
        <p className="privacy-page-lead">
          This Privacy Policy explains how information may be collected, used, and protected when you use this website.
        </p>
      </header>

      <div className="privacy-page-content">
        <aside className="privacy-page-sidebar">
          <p className="privacy-page-sidebar-eyebrow">Data Practices</p>
          <h2>Your information and choices</h2>
          <p>
            This policy explains what information may be collected, why it may be used, and the choices available to you.
          </p>
          <p className="privacy-page-effective-date">Effective March 9, 2026</p>
        </aside>

        <div className="privacy-page-sections">
          {sections.map((section, index) => (
            <section className="privacy-page-section" key={section.title}>
              <span className="privacy-page-section-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h2>{section.title}</h2>
                {section.content}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Privacy;
