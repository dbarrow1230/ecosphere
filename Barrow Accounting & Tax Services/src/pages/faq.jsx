// src/pages/faq.jsx
import {useState} from "react";
import faqTemplate from "../components/FAQTemplate.jsx";
import "../styles/FAQ.css";

function FAQ(){
 const {eyebrow,title,lead,groups}=faqTemplate;
 const [activeGroup,setActiveGroup]=useState(0);
 const group=groups[activeGroup];

 return(
  <main className="faq-page">
   <section className="faq-hero">
    <div className="faq-hero-left">
     <p className="faq-page-eyebrow">{eyebrow}</p>
     <h1 className="faq-page-title">{title}</h1>
    </div>
    <div className="faq-hero-right">
     <p className="faq-page-lead">{lead}</p>
    </div>
   </section>

   <section className="faq-workspace">
    <aside className="faq-topic-nav">
     <p className="faq-topic-kicker">Browse By Section</p>
     {groups.map((item,index)=>(
      <button type="button" key={item.name} className={activeGroup===index?"active":""} onClick={()=>setActiveGroup(index)}>
       <span>{item.name}</span>
       <strong>{item.label}</strong>
      </button>
     ))}
    </aside>

    <section className="faq-panel">
     <div className="faq-panel-header">
      <p>{group.name}</p>
      <h2>{group.label}</h2>
     </div>
     <div className="faq-list">
      {group.faqs.map((item,index)=>(
       <details className="faq-item" key={item.question}>
        <summary>
         <span>{String(index+1).padStart(2,"0")}</span>
         <strong>{item.question}</strong>
        </summary>
        <p>{item.answer}</p>
       </details>
      ))}
     </div>
    </section>
   </section>
  </main>
 );
}

export default FAQ;
