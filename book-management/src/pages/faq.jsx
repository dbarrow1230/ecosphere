import "../styles/staticPages.css";
import barrowLogo from "../assets/Barrow Publications Logo 1.png";

function FAQ(){

 return(
  <main className="static-page static-page-burgundy">

   <header className="static-page-header">
    <img
     src={barrowLogo}
     alt="Barrow Publications logo"
     className="static-page-logo-img"
    />

    <h1>Frequently Asked Questions</h1>
    <p>Answers to common questions about using Library Book Manager.</p>
   </header>

   <section className="static-page-content">

    <section className="static-page-section">
     <h2>What is Library Book Manager?</h2>
     <p>Library Book Manager helps organize books, authors, publishers, formats, catalog metadata, loans, reading plans, and library reports.</p>
    </section>

    <section className="static-page-section">
     <h2>How do book records connect together?</h2>
     <p>Book records can connect to authors, publishers, subjects, genres, formats, acquisition details, identifiers, reading status, and loan records.</p>
    </section>

    <section className="static-page-section">
     <h2>Can I manage different book formats?</h2>
     <p>The catalog supports print, digital, audio, and other format records, including identifiers such as ISBN, eISBN, ASIN, and custom filing codes.</p>
    </section>

    <section className="static-page-section">
     <h2>Can I filter and review my catalog?</h2>
     <p>You can search and filter by title, author, publisher, subject, genre, format, acquisition source, and other catalog details.</p>
    </section>

    <section className="static-page-section">
     <h2>Can I print cards or catalog pages?</h2>
     <p>Print tools are available for catalog cards and selected library ranges, depending on the print layout selected.</p>
    </section>

   </section>

  </main>
 );

}

export default FAQ;