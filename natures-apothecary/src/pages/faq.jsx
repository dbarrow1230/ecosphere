// src/pages/faq.jsx
import {useMemo,useState} from "react";
import "../styles/FAQ.css";
import faqTemplate from "../components/FAQTemplate";

function FAQ(){

 const {eyebrow,title,lead,sourceCredit,faqs}=faqTemplate;
 const [activeGroup,setActiveGroup]=useState(0);

 const groups=useMemo(()=>[
  {name:"Start",label:"Getting Started",items:faqs.slice(0,6)},
  {name:"Plan",label:"Story Planning",items:faqs.slice(6,13)},
  {name:"Build",label:"Characters & World",items:faqs.slice(13,18)},
  {name:"Draft",label:"Plot & Drafting",items:faqs.slice(18,24)},
  {name:"Finish",label:"Progress & Revision",items:faqs.slice(24)}
 ],[faqs]);

 return(
  <main className="faq-page">

   <section className="faq-hero">
    <div className="faq-hero-left">
     <p className="faq-page-eyebrow">{eyebrow}</p>
     <h1 className="faq-page-title">{title}</h1>
    </div>

    <div className="faq-hero-right">
     <p className="faq-page-lead">{lead}</p>

     {sourceCredit&&(
      <div className="faq-source-box">
       <h2>{sourceCredit.title}</h2>
       <p>{sourceCredit.text}</p>
       <p className="faq-source-citation">{sourceCredit.citation}</p>
      </div>
     )}
    </div>
   </section>

   <section className="faq-workspace">

    <aside className="faq-topic-nav">
     <p className="faq-topic-kicker">Browse By Section</p>

     {groups.map((group,index)=>(
      <button
       type="button"
       key={group.name}
       className={activeGroup===index?"active":""}
       onClick={()=>setActiveGroup(index)}
      >
       <span>{group.name}</span>
       <strong>{group.label}</strong>
      </button>
     ))}
    </aside>

    <section className="faq-panel">
     <div className="faq-panel-header">
      <p>{groups[activeGroup].name}</p>
      <h2>{groups[activeGroup].label}</h2>
     </div>

     <div className="faq-list">
      {groups[activeGroup].items.map((item,index)=>(
       <details className="faq-item" key={`${groups[activeGroup].name}-${index}`}>
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