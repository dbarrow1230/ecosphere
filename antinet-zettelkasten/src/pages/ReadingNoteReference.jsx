import React from "react";
import {Row,Col} from "react-bootstrap";
import "../styles/ReadingNoteReference.css";

const ReadingNoteReference=()=>{
 const symbols=[
  {symbol:"*",title:"Remember This",description:"Use when you want to capture something simply because you want to remember it later."},
  {symbol:"Q",title:"Question",description:"Use when something you read raises a question you want to answer, investigate, research, or think about later."},
  {symbol:"!",title:"Important",description:"Use when something stands out as especially significant or deserves extra attention."},
  {symbol:"C",title:"Connection",description:"Use when something connects with another idea, note, subject, project, experience, or piece of knowledge."},
  {symbol:"I",title:"Idea",description:"Use when the reading causes a new idea, interpretation, possibility, creative thought, or observation to occur to you."},
  {symbol:'"',title:"Quotation",description:"Use when the exact wording from the source is worth preserving. Record the page number or location."},
  {symbol:"?",title:"Needs Clarification",description:"Use when you do not understand something yet or need to return to it for clarification."},
  {symbol:"D",title:"Definition",description:"Use when the source gives a definition you want to preserve or when a term is being clearly defined."},
  {symbol:"X",title:"Disagree / Challenge",description:"Use when you disagree with a statement, question the author's claim, or want to challenge an interpretation."},
  {symbol:"R",title:"Research Further",description:"Use when the subject needs additional research beyond the source you are currently reading."},
  {symbol:"E",title:"Example",description:"Use when the source gives an example that helps explain, demonstrate, or clarify an idea."},
  {symbol:"A",title:"Apply / Use",description:"Use when you see a practical, creative, academic, technical, or other future use for the information."},
  {symbol:"↔",title:"Compare / Contrast",description:"Use when you want to compare or contrast the information with another source, idea, method, argument, or example."},
  {symbol:"S",title:"Summary / Key Point",description:"Use when you want to capture the main point of a section, chapter, argument, or passage."},
  {symbol:"F",title:"Fact",description:"Use when you want to preserve a specific factual piece of information."},
  {symbol:"H",title:"Historical Context",description:"Use when information provides historical background, development, chronology, or context."},
  {symbol:"M",title:"Method / Process",description:"Use when the source explains a method, sequence, procedure, workflow, or process."},
  {symbol:"P",title:"Principle",description:"Use when the information expresses a general principle, rule, or underlying concept that applies beyond one example."},
  {symbol:"T",title:"Term / Terminology",description:"Use when you encounter terminology, vocabulary, naming conventions, or specialized language you want to retain."}
 ];

 return(
  <div className="reading-note-reference py-4">
   <div className="reading-note-title-row">
    <h1 className="reading-note-page-title">Reading Note Symbols</h1>
    <button type="button" className="btn btn-outline-primary reading-note-print" onClick={()=>window.print()}>Print US Letter</button>
   </div>
   <p className="reading-note-intro mb-5">
    Shorthand markers for taking quick notes while reading before processing them later.
   </p>

   <Row className="g-4 align-items-stretch">
    <Col lg={4}>
     <div className="reading-note-card h-100">
      <h2 className="reading-note-section-title h4 mb-4">Markers</h2>

      {symbols.map((item,index)=>(
       <div key={index} className="reading-note-marker d-flex align-items-start mb-4">
        <div className="reading-note-symbol fs-4 fw-bold me-3">
         {item.symbol}
        </div>
        <div>
         <div className="reading-note-marker-title fw-bold">{item.title}</div>
         <div className="reading-note-marker-description">{item.description}</div>
        </div>
       </div>
      ))}
     </div>
    </Col>

    <Col lg={8}>
     <div className="reading-note-card h-100">
      <h2 className="reading-note-section-title h4 mb-4">Complete Reading Note Example</h2>

      <div className="reading-note-example mb-5">
       <div><strong>Book:</strong> Professional Cooking — Wayne Gisslen</div>
       <div className="mb-4"><strong>Chapter:</strong> Stocks and Sauces</div>

       <div className="mb-2"><span className="reading-note-example-marker">*</span> p. 143 — standard mirepoix ratio: 2 onion : 1 carrot : 1 celery</div>
       <div className="mb-2"><span className="reading-note-example-marker">F</span> p. 146 — brown stock bones are browned before simmering</div>
       <div className="mb-2"><span className="reading-note-example-marker">M</span> p. 151 — skim impurities during stock production</div>
       <div className="mb-4"><span className="reading-note-example-marker">P</span> p. 162 — roux cooking time changes flavor and thickening power</div>

       <div className="mb-3"><strong className="reading-note-example-marker">Q</strong> — Why does darker roux have less thickening power?</div>
       <div className="mb-3"><strong className="reading-note-example-important">!</strong> — Remember this for sauce development.</div>
       <div className="mb-3"><strong className="reading-note-example-connection">C</strong> — Connect this to starch gelatinization.</div>
       <div className="mb-3"><strong className="reading-note-example-research">R</strong> — Research how roux color affects thickening power.</div>
       <div className="mb-3"><strong className="reading-note-example-definition">D</strong> — Mirepoix: aromatic vegetable mixture commonly used as a flavor base.</div>
       <div className="mb-3"><strong className="reading-note-example-example">E</strong> — Brown stock is an example of browning ingredients before extraction to develop deeper flavor.</div>
       <div className="mb-3"><strong className="reading-note-example-apply">A</strong> — Apply this when developing or scaling sauce recipes.</div>
       <div className="mb-3"><strong className="reading-note-example-compare">↔</strong> — Compare white roux, blond roux, and brown roux.</div>
       <div className="mb-3"><strong className="reading-note-example-challenge">X</strong> — Challenge any claim that one roux stage is automatically better than another without considering the intended sauce.</div>
       <div className="mb-3"><strong className="reading-note-example-summary">S</strong> — Key point: stock and sauce techniques depend on controlling extraction, heat, browning, and thickening.</div>
       <div className="mb-3"><strong className="reading-note-example-history">H</strong> — Note any historical discussion of classical stock and sauce systems.</div>
       <div className="mb-3"><strong className="reading-note-example-term">T</strong> — Terms to retain: mirepoix, roux, gelatinization, brown stock.</div>
       <div className="mb-3"><strong className="reading-note-example-idea">I</strong> — Cooking time changes not only flavor and color but also how an ingredient functions.</div>
       <div className="mb-3"><strong className="reading-note-example-clarification">?</strong> — I need clarification on exactly why darker roux thickens less.</div>
       <div><strong className="reading-note-example-quotation">"</strong> — Record an exact quotation here when the author's wording itself is worth preserving.</div>
      </div>

      <h2 className="reading-note-section-title h4 mb-3">How to Use the Markers</h2>

      <div className="reading-note-help">
       <p>
        Start with the source and chapter, then write short page-based notes as you read.
        Add markers to show why you captured something. You can use one marker or combine
        several when the same note serves more than one purpose.
       </p>

       <p className="mb-0">
        The markers are shorthand for reading, not rigid categories. Their purpose is to
        help you quickly capture what matters without stopping to fully process the note
        while you are still reading.
       </p>
      </div>
     </div>
    </Col>
   </Row>
  </div>
 );
};

export default ReadingNoteReference;