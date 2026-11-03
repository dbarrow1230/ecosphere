// src/pages/about.jsx
import "../styles/About.css";
import aboutTemplate from "../components/AboutTemplate";

function About(){

 const {eyebrow,title,lead,sourceCredit,sections}=aboutTemplate;

 return(
  <main className="about-page">

   <section className="about-page-hero">
    <div className="about-page-hero-main">
     <p className="about-page-eyebrow">{eyebrow}</p>
     <h1 className="about-page-title">{title}</h1>
     <p className="about-page-lead">{lead}</p>
    </div>

    {sourceCredit&&(
     <aside className="about-page-source">
      <h2 className="about-page-source-title">{sourceCredit.title}</h2>
      <p className="about-page-source-text">{sourceCredit.text}</p>
      <p className="about-page-source-citation">{sourceCredit.citation}</p>
     </aside>
    )}
   </section>

   <section className="about-page-content">
    <aside className="about-page-sidebar">
     <p className="about-page-sidebar-eyebrow">Application Overview</p>
     <h2 className="about-page-sidebar-title">Built for publishing operations</h2>
     <p className="about-page-sidebar-text">
      Barrow Publications organizes acquisitions, editorial, production, release planning, marketing, sales, rights, and admin work into a routed publishing workspace.
     </p>
    </aside>

    <div className="about-page-sections">
     {sections.map((section,index)=>(
      <article className="about-page-section" key={index}>
       <div className="about-page-section-number">
        {String(index+1).padStart(2,"0")}
       </div>

       <div className="about-page-section-body">
        <h2 className="about-page-heading">{section.heading}</h2>

        {section.text&&section.text.map((paragraph,i)=>(
         <p className="about-page-text" key={i}>
          {paragraph}
         </p>
        ))}

        {section.list&&(
         <ul className="about-page-list">
          {section.list.map((item,i)=>(
           <li key={i}>{item}</li>
          ))}
         </ul>
        )}
       </div>
      </article>
     ))}
    </div>
   </section>

  </main>
 );

}

export default About;
