// src/pages/about.jsx
import "../styles/About.css";
import aboutTemplate from "../components/AboutTemplate";

function About(){
 const {eyebrow,title,lead,sections}=aboutTemplate;
 return(
  <main className="about-page">
   <section className="about-page-hero">
    <p className="about-page-eyebrow">{eyebrow}</p>
    <h1 className="about-page-title">{title}</h1>
    <p className="about-page-lead">{lead}</p>
   </section>
   <section className="about-page-content">
    <aside className="about-page-sidebar">
     <div className="about-page-section-number">01</div>
     <h2 className="about-page-sidebar-title">{sections[0].heading}</h2>
     {sections[0].text&&sections[0].text.map((paragraph,i)=>(
      <p className="about-page-sidebar-text" key={i}>{paragraph}</p>
     ))}
     {sections[0].list&&(
      <ul className="about-page-sidebar-list">
       {sections[0].list.map((item,i)=>(
        <li key={i}>{item}</li>
       ))}
      </ul>
     )}
    </aside>
    <div className="about-page-sections">
     {sections.slice(1).map((section,index)=>(
      <article className={`about-page-section about-page-section-${index+2}`} key={index}>
       <div className="about-page-section-number">{String(index+2).padStart(2,"0")}</div>
       <div className="about-page-section-body">
        <h2 className="about-page-heading">{section.heading}</h2>
        {section.text&&section.text.map((paragraph,i)=>(
         <p className="about-page-text" key={i}>{paragraph}</p>
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