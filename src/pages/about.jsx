// src/pages/about.jsx
import aboutTemplate from "../components/AboutTemplate.jsx";
import "../styles/About.css";

function About(){
 const {eyebrow,title,lead,sidebar,sections}=aboutTemplate;

 return(
  <main className="about-page">
   <section className="about-page-hero is-single">
    <div className="about-page-hero-main">
     <p className="about-page-eyebrow">{eyebrow}</p>
     <h1 className="about-page-title">{title}</h1>
     <p className="about-page-lead">{lead}</p>
    </div>
   </section>

   <section className="about-page-content">
    <aside className="about-page-sidebar">
     <p className="about-page-sidebar-eyebrow">{sidebar.eyebrow}</p>
     <h2 className="about-page-sidebar-title">{sidebar.title}</h2>
     <p className="about-page-sidebar-text">{sidebar.text}</p>
    </aside>

    <div className="about-page-sections">
     {sections.map((section,index)=>(
      <article className="about-page-section" key={section.heading}>
       <div className="about-page-section-number">{String(index+1).padStart(2,"0")}</div>
       <div className="about-page-section-body">
        <h2 className="about-page-heading">{section.heading}</h2>
        {section.text?.map(paragraph=><p className="about-page-text" key={paragraph}>{paragraph}</p>)}
        {section.list&&<ul className="about-page-list">{section.list.map(item=><li key={item}>{item}</li>)}</ul>}
       </div>
      </article>
     ))}
    </div>
   </section>
  </main>
 );
}

export default About;
