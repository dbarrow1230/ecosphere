// src/pages/about.jsx
import "../styles/About.css";
import aboutTemplate from "../components/AboutTemplate";
import heroImage from "../images/hero.png";

function About(){

 const {eyebrow,title,lead,sections}=aboutTemplate;

 return(
  <section className="about-page">
   <div className="about-page-container">

    <div
     className="about-page-hero"
     style={{
      backgroundImage:`linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)),url(${heroImage})`,
      backgroundSize:"cover",
      backgroundPosition:"center",
      backgroundRepeat:"no-repeat"
     }}
    >
     <p className="about-page-eyebrow">{eyebrow}</p>
     <h1 className="about-page-title">{title}</h1>
     <p className="about-page-lead">{lead}</p>
    </div>

    <div className="about-page-grid">

     {sections.map((section,index)=>(
      <article className="about-page-card" key={index}>
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
      </article>
     ))}

    </div>

   </div>
  </section>
 );

}

export default About;