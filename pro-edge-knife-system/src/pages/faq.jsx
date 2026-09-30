// src/pages/faq.jsx
import {useMemo,useState,useEffect} from "react";
import "../styles/InfoPages.css";
import faqTemplate from "../components/FAQTemplate";

function FAQ(){

 const {eyebrow,title,lead,sourceCredit,faqs=[]}=faqTemplate;
 const [activeGroup,setActiveGroup]=useState(0);

 const groups=useMemo(()=>[
  {name:"Start",label:"Getting Started",items:faqs.slice(0,3)},
  {name:"Records",label:"Record Roles",items:faqs.slice(3,10)},
  {name:"Rules",label:"Rules & IDs",items:faqs.slice(10,15)},
  {name:"Workflow",label:"Processing & Graph",items:faqs.slice(15,19)},
  {name:"Use",label:"Creative & Research Use",items:faqs.slice(19)}
 ].filter(group=>group.items.length>0),[faqs]);

 useEffect(()=>{
  if(activeGroup>=groups.length){
   queueMicrotask(()=>setActiveGroup(0));
  }
 },[activeGroup,groups.length]);

 const currentGroup=groups[activeGroup];

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

   {currentGroup&&(
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
       <p>{currentGroup.name}</p>
       <h2>{currentGroup.label}</h2>
      </div>

      <div className="faq-list">
       {currentGroup.items.map((item,index)=>(
        <details className="faq-item" key={`${currentGroup.name}-${index}`}>
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
   )}

  </main>
 );

}

export default FAQ;
