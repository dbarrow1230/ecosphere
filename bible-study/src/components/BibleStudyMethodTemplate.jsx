// src/components/BibleStudyMethodTemplate.jsx
import {useEffect,useMemo,useState} from "react";
import {useSearchParams} from "react-router-dom";
import "./BibleStudyMethodTemplate.css";

const ICON_IMAGE_BASE="/images/method-icons";
const INVALID_FILE_NAME_CHARS=/[<>:"/\\|?*]/g;
const CONTROL_CHARS=new RegExp(`[${String.fromCharCode(0)}-${String.fromCharCode(31)}]`,"g");

function cleanIconFileName(value){
 const raw=String(value||"").trim();
 if(!raw)return"";

 const fileName=raw
  .split("?")[0]
  .split("#")[0]
  .replace(/\\/g,"/")
  .split("/")
  .pop();

 const safeName=String(fileName||"")
  .replace(INVALID_FILE_NAME_CHARS,"_")
  .replace(CONTROL_CHARS,"_")
  .replace(/\s+/g,"-")
  .replace(/-+/g,"-")
  .trim();

 return safeName.replace(/^(\d+[-_\s]+)+/,"")||safeName;
}

function isImageFileName(value){
 return /\.(png|jpe?g|webp|gif|svg)$/i.test(String(value||"").trim());
}

function isExternalOrDataImage(value){
 const icon=String(value||"").trim();
 return /^https?:\/\//i.test(icon)||icon.startsWith("data:image/");
}

function getIconSrc(icon){
 const value=String(icon||"").trim();
 if(!value)return"";

 if(isExternalOrDataImage(value))return value;
 if(value.startsWith("/images/"))return value;
 if(value.startsWith("images/"))return`/${value}`;
 if(isImageFileName(value))return`${ICON_IMAGE_BASE}/${cleanIconFileName(value)}`;

 return"";
}

function StudyMethodIcon({icon,title}){
 const[failed,setFailed]=useState(false);
 const iconValue=String(icon||"").trim();
 const imageSrc=getIconSrc(iconValue);

 if(!iconValue)return null;

 if(imageSrc&&!failed){
  return(
   <span className="study-method-title-icon-wrap">
    <img
     className="study-method-title-icon"
     src={imageSrc}
     alt={title?`${title} icon`:"Study method icon"}
     onError={()=>setFailed(true)}
    />
   </span>
  );
 }

 if(isImageFileName(iconValue)||iconValue.startsWith("/images/")||iconValue.startsWith("images/")){
  return null;
 }

 return(
  <span className="study-method-title-emoji" aria-hidden="true">
   {iconValue}
  </span>
 );
}

function normalizeListItems(items=[]){
 return items
  .flatMap(item=>String(item||"").split(","))
  .map(item=>item.trim())
  .filter(Boolean);
}

function slugify(value){
 return String(value||"")
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s-]/g,"")
  .replace(/\s+/g,"-")
  .replace(/-+/g,"-");
}

function getSlug(value){
 return value?.slug||slugify(value?.title||value?.name||"");
}

function SummaryItem({label,children}){
 if(!children)return null;

 return(
  <div className="study-method-summary-item">
   <h2>{label}</h2>
   <p>{children}</p>
  </div>
 );
}

function SummaryList({label,items=[]}){
 const listItems=normalizeListItems(items);
 if(!listItems.length)return null;

 return(
  <div className="study-method-summary-item">
   <h2>{label}</h2>
   <p>{listItems.join("; ")}</p>
  </div>
 );
}

function BibleStudyMethodTemplate({
 title,
 subtitle,
 icon,
 description,
 purpose,
 bestFor=[],
 steps=[],
 keyQuestions=[],
 strengths=[],
 cautions=[],
 example,
 relatedScriptures=[],
 tips=[],
 tools=[],
 closing,
 showPrintToolbar=true
}){
 const[searchParams]=useSearchParams();
 const[methodDetail,setMethodDetail]=useState(null);
 const requestedSubMethod=String(searchParams.get("sub")||"").trim();
 const bestForItems=normalizeListItems(bestFor);
 const keyQuestionItems=normalizeListItems(keyQuestions);
 const strengthItems=normalizeListItems(strengths);
 const cautionItems=normalizeListItems(cautions);
 const relatedScriptureItems=normalizeListItems(relatedScriptures);
 const toolItems=normalizeListItems(tools);
 const tipItems=normalizeListItems(tips);
 const selectedSubMethod=useMemo(()=>{
  if(!requestedSubMethod)return null;
  const subMethods=Array.isArray(methodDetail?.subMethods)?methodDetail.subMethods:[];
  return subMethods.find(subMethod=>getSlug(subMethod)===requestedSubMethod)||null;
 },[methodDetail,requestedSubMethod]);
 const isSubMethodMode=!!requestedSubMethod;
 const displayTitle=selectedSubMethod?.title||title;
 const displaySubtitle=isSubMethodMode?`Part of: ${title}`:subtitle;
 const displayDescription=isSubMethodMode?selectedSubMethod?.description||"":description;
 const displayPurpose=isSubMethodMode?selectedSubMethod?.purpose||"":purpose;
 const displayBestForItems=isSubMethodMode?normalizeListItems(selectedSubMethod?.bestFor||[]):bestForItems;
 const displayKeyQuestionItems=isSubMethodMode?normalizeListItems(selectedSubMethod?.keyQuestions||[]):keyQuestionItems;
 const displayStrengthItems=isSubMethodMode?normalizeListItems(selectedSubMethod?.strengths||[]):strengthItems;
 const displayCautionItems=isSubMethodMode?normalizeListItems(selectedSubMethod?.cautions||[]):cautionItems;
 const displayRelatedScriptureItems=isSubMethodMode?normalizeListItems(selectedSubMethod?.relatedScriptures||[]):relatedScriptureItems;
 const displayToolItems=isSubMethodMode?normalizeListItems(selectedSubMethod?.tools||[]):toolItems;
 const displayTipItems=isSubMethodMode?normalizeListItems(selectedSubMethod?.tips||selectedSubMethod?.studyTips||[]):tipItems;
 const displayClosing=isSubMethodMode?selectedSubMethod?.notes||"":closing;

 useEffect(()=>{
  if(!requestedSubMethod)return undefined;
  let isMounted=true;
  const slug=String(window.location.pathname||"").split("/").filter(Boolean).pop();
  if(!slug)return undefined;

  const loadMethodDetail=async()=>{
   try{
    const res=await fetch(`/api/methods/slug/${encodeURIComponent(slug)}`);
    const data=await res.json().catch(()=>({}));
    if(!res.ok)throw new Error(data?.message||"Failed to load method");
    if(isMounted)setMethodDetail(data?.data||data?.item||data?.method||data||null);
   }catch{
    if(isMounted)setMethodDetail(null);
   }
  };

  loadMethodDetail();

  return()=>{
   isMounted=false;
  };
 },[requestedSubMethod]);

 const handlePrint=()=>{
  const slug=String(window.location.pathname||"")
   .split("/")
   .filter(Boolean)
   .pop();
  const target=slug?`/methods/print/${encodeURIComponent(slug)}`:"/methods/print";
  window.open(target,"_blank","noopener,noreferrer");
 };

 return(
  <section className="study-method-page">
   <div className="study-method-page-inner">
    {showPrintToolbar&&(
     <div className="study-method-print-toolbar no-print">
      <button type="button" className="btn btn-primary" onClick={handlePrint}>Print Method</button>
     </div>
    )}

    <header className="study-method-header">
     <div className="study-method-title-row">
      <StudyMethodIcon icon={icon} title={displayTitle}/>
      <div className="study-method-header-content">
       <div className="study-method-title-text">
        <h1 className="study-method-title">{displayTitle}</h1>
        {displaySubtitle&&<p className="study-method-subtitle">{displaySubtitle}</p>}
       </div>

       {(displayDescription||displayPurpose||displayBestForItems.length>0)&&(
        <div className="study-method-header-summary">
         <SummaryItem label="Overview">{displayDescription}</SummaryItem>
         <SummaryItem label="Purpose">{displayPurpose}</SummaryItem>
         <SummaryList label="Best For" items={displayBestForItems}/>
        </div>
       )}
      </div>
     </div>
    </header>

    <div className="study-method-grid">

     <div className="study-method-main">

      {selectedSubMethod?.whenToUse&&(
       <section className="study-method-section">
        <h2>When To Use</h2>
        <p>{selectedSubMethod.whenToUse}</p>
       </section>
      )}

      {!selectedSubMethod&&steps.length>0&&(
       <section className="study-method-section">
        <h2>Steps</h2>
        <div className="study-method-steps">
         {steps.map((item,index)=>(
          <article key={index} className="study-method-step-card">
           <div className="study-method-step-number">{index+1}</div>
           <div className="study-method-step-content">
            {item.title&&<h3 className="study-method-step-title">{item.title}</h3>}
            {item.content&&<p>{item.content}</p>}
           </div>
          </article>
         ))}
        </div>
       </section>
      )}

      {!selectedSubMethod&&example&&(
       <section className="study-method-section study-method-example">
        <h2>Example</h2>
        <div className="study-method-example-grid">
         {example.reference&&(
          <div className="study-method-example-reference">
           <span className="study-method-example-label">Reference</span>
           <p>{example.reference}</p>
          </div>
         )}

         {example.summary&&(
          <div className="study-method-example-summary">
           <span className="study-method-example-label">Summary</span>
           <p>{example.summary}</p>
          </div>
         )}

         {example.points&&example.points.length>0&&example.points.map((item,index)=>{
          const parts=String(item||"").split(": ");
          const label=parts.length>1?parts[0]:"Point";
          const value=parts.length>1?parts.slice(1).join(": "):item;

          return(
           <div key={index} className="study-method-example-card">
            <span className="study-method-example-label">{label}</span>
            <p>{value}</p>
           </div>
          );
         })}
        </div>
       </section>
      )}

      {displayClosing&&(
       <section className="study-method-section study-method-closing">
        <h2>{selectedSubMethod?"Notes":"Final Thought"}</h2>
        <p>{displayClosing}</p>
       </section>
      )}

     </div>

     <aside className="study-method-sidebar">

      {displayKeyQuestionItems.length>0&&(
       <section className="study-method-section">
        <h2>Key Questions</h2>
        <ul className="study-method-list">
         {displayKeyQuestionItems.map((item,index)=>(
          <li key={index}>{item}</li>
         ))}
        </ul>
       </section>
      )}

      {displayStrengthItems.length>0&&(
       <section className="study-method-section">
        <h2>Strengths</h2>
        <ul className="study-method-list">
         {displayStrengthItems.map((item,index)=>(
          <li key={index}>{item}</li>
         ))}
        </ul>
       </section>
      )}

      {displayCautionItems.length>0&&(
       <section className="study-method-section">
        <h2>Things to Watch</h2>
        <ul className="study-method-list">
         {displayCautionItems.map((item,index)=>(
          <li key={index}>{item}</li>
         ))}
        </ul>
       </section>
      )}

      {displayRelatedScriptureItems.length>0&&(
       <section className="study-method-section">
        <h2>Related Scriptures</h2>
        <ul className="study-method-list">
         {displayRelatedScriptureItems.map((item,index)=>(
          <li key={index}>{item}</li>
         ))}
        </ul>
       </section>
      )}

      {displayToolItems.length>0&&(
       <section className="study-method-section">
        <h2>Helpful Tools</h2>
        <ul className="study-method-list">
         {displayToolItems.map((item,index)=>(
          <li key={index}>{item}</li>
         ))}
        </ul>
       </section>
      )}

      {displayTipItems.length>0&&(
       <section className="study-method-section">
        <h2>Practical Tips</h2>
        <ul className="study-method-list">
         {displayTipItems.map((item,index)=>(
          <li key={index}>{item}</li>
         ))}
        </ul>
       </section>
      )}

     </aside>

    </div>

   </div>
  </section>
 );
}

export default BibleStudyMethodTemplate;
