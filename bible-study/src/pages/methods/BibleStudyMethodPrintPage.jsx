import {useEffect,useMemo,useState} from "react";
import {useLocation,useNavigate,useParams} from "react-router-dom";
import "../../styles/methods.css";

const API_BASE="/api/methods";

const ALIASES={
 "book-study-method":"book-bible-study-method",
 "chapter-study-method":"chapter-bible-study-method",
 "inductive-study-method":"inductive-bible-study-method",
 "soap-method":"soap-bible-study-method",
 "feast-method":"feast-bible-study-method",
 "feast-study-method":"feast-bible-study-method",
 "acts-method":"acts-bible-study-method",
 "acts-study-method":"acts-bible-study-method",
 "parallel-passage-study-method":"parallel-passage-bible-study-method",
 "cross-reference-study-method":"cross-reference-bible-study-method",
 "devotional-study-method":"devotional-bible-study-method",
 "meditation-study-method":"meditation-bible-study-method",
 "lectio-divina-method":"lectio-divina-bible-study-method",
 "character-study-method":"character-bible-study-method",
 "leadership-study-method":"leadership-bible-study-method",
 "biographical-study-method":"biographical-bible-study-method",
 "word-study-method":"word-bible-study-method",
 "key-word-study-method":"key-word-bible-study-method",
 "original-language-study-method":"original-language-bible-study-method",
 "topical-study-method":"topical-bible-study-method",
 "doctrinal-study-method":"doctrinal-bible-study-method",
 "thematic-study-method":"thematic-bible-study-method",
 "outline-study-method":"outline-bible-study-method",
 "expository-study-method":"expository-bible-study-method",
 "verse-by-verse-study-method":"verse-by-verse-bible-study-method",
 "passage-study-method":"passage-bible-study-method",
 "observation-study-method":"observation-bible-study-method",
 "application-study-method":"application-bible-study-method"
};

const safeArray=value=>Array.isArray(value)?value:[];
const hasText=value=>typeof value==="string"&&value.trim()!=="";
const getRefLabel=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(typeof value==="object")return value.title||value.name||value.label||value.slug||"";
 return "";
};

function normalizeList(items=[]){
 return safeArray(items)
  .flatMap(item=>String(item||"").split(","))
  .map(item=>item.trim())
  .filter(Boolean);
}

function PrintText({title,text}){
 if(!hasText(text))return null;
 return(
  <section className="method-print-plain-section">
   <h3>{title}</h3>
   <p>{text}</p>
  </section>
 );
}

function PrintMeta({method}){
 const rows=[
  ["Category",getRefLabel(method.category)],
  ["Difficulty",getRefLabel(method.difficulty)],
  ["Skill",method.skillLevel],
  ["Time",method.timeRequired],
  ["Effort",method.effortLevel],
  ["Family",getRefLabel(method.methodFamily)]
 ].filter(([,value])=>hasText(value));

 if(!rows.length)return null;

 return(
  <dl className="method-print-plain-meta">
   {rows.map(([label,value])=>(
    <div key={label}>
     <dt>{label}</dt>
     <dd>{value}</dd>
    </div>
   ))}
  </dl>
 );
}

function PrintList({title,items=[]}){
 const list=normalizeList(items);
 if(!list.length)return null;
 return(
  <section className="method-print-plain-section">
   <h3>{title}</h3>
   <ul>
    {list.map((item,index)=><li key={index}>{item}</li>)}
   </ul>
  </section>
 );
}

function PrintGroup({title,children}){
 const content=safeArray(children).filter(Boolean);
 if(!content.length)return null;
 return(
  <section className="method-print-plain-group">
   <h3>{title}</h3>
   {content}
  </section>
 );
}

function PrintSteps({steps=[]}){
 const list=safeArray(steps).sort((a,b)=>(a.order||0)-(b.order||0));
 if(!list.length)return null;
 return(
  <section className="method-print-plain-section">
   <h3>Steps</h3>
   <ol>
    {list.map((step,index)=>(
     <li key={index}>
      {hasText(step.title)&&<strong>{step.title}</strong>}
      {hasText(step.content)&&<span>{step.content}</span>}
     </li>
    ))}
   </ol>
  </section>
 );
}

function PrintExample({example}){
 if(!example)return null;
 const rows=[
  ["Reference",example.reference],
  ["Summary",example.summary],
  ["Observation",example.observation],
  ["Interpretation",example.interpretation],
  ["Application",example.application],
  ["Prayer",example.prayer],
  ["Memory Verse",example.memoryVerse],
  ["Journal",example.journal]
 ].filter(([,value])=>hasText(value));

 if(!rows.length)return null;

 return(
  <section className="method-print-plain-section">
   <h3>Example</h3>
   {rows.map(([label,value],index)=>(
    <div key={index} className="method-print-plain-example">
     <strong>{label}</strong>
     <p>{value}</p>
    </div>
   ))}
  </section>
 );
}

function MethodPrintArticle({method}){
 if(!method)return null;

 return(
  <article className="method-print-plain-method">
   <h2>{method.title}</h2>
   {hasText(method.subtitle)&&<p className="method-print-plain-subtitle">{method.subtitle}</p>}
   <PrintMeta method={method}/>

   <PrintGroup title="Main Page Summary">
    <PrintText title="Description" text={method.description}/>
    <PrintText title="Purpose" text={method.purpose}/>
    <PrintList title="Best For" items={method.bestFor}/>
    <PrintText title="When Not To Use" text={method.whenNotToUse}/>
    <PrintList title="Less Ideal For" items={method.lessIdealFor}/>
   </PrintGroup>

   <PrintGroup title="Foundation">
    <PrintText title="Overview" text={method.overview}/>
    <PrintText title="What Is This Method?" text={method.whatIsThisMethod}/>
    <PrintText title="Biblical Basis" text={method.biblicalBasis}/>
    <PrintText title="Hermeneutical Basis" text={method.hermeneuticalBasis}/>
    <PrintText title="Why This Method Is Valid in Scripture" text={method.whyThisMethodIsValidInScripture}/>
    <PrintText title="Why Use This Method?" text={method.whyUseThisMethod}/>
    <PrintList title="Best Use Cases" items={method.bestUseCases}/>
    <PrintText title="When To Use" text={method.whenToUse}/>
    <PrintText title="When Not To Use" text={method.whenNotToUse}/>
    <PrintText title="How To Think About It" text={method.howToThinkAboutIt}/>
    <PrintText title="Analogy" text={method.analogy}/>
    <PrintText title="Main Outcome" text={method.mainOutcome}/>
    <PrintList title="Audience" items={method.audience}/>
    <PrintList title="Goals" items={method.goals}/>
    <PrintList title="Learning Outcomes" items={method.learningOutcomes}/>
    <PrintList title="Ideal Study Contexts" items={method.idealStudyContexts}/>
    <PrintList title="Complementary Methods" items={method.complementaryMethods}/>
    <PrintList title="Less Ideal For" items={method.lessIdealFor}/>
   </PrintGroup>

   <PrintGroup title="Process">
    <PrintList title="Before You Begin" items={method.beforeYouBegin}/>
    <PrintList title="Heart Posture" items={method.heartPosture}/>
    <PrintList title="Spiritual Preparation" items={method.spiritualPreparation}/>
    <PrintList title="Guardrails" items={method.guardrails}/>
    <PrintList title="Requirements" items={method.requirements}/>
    <PrintList title="Tools" items={method.tools}/>
    <PrintList title="Required Tools" items={method.requiredTools}/>
    <PrintList title="Optional Tools" items={method.optionalTools}/>
    <PrintList title="Preparation Tips" items={method.preparationTips}/>
    <PrintList title="Study Tips" items={method.studyTips}/>
    <PrintList title="Variations" items={method.variations}/>
    <PrintText title="Steps Overview" text={method.stepOverview}/>
    <PrintSteps steps={method.steps}/>
   </PrintGroup>

   <PrintGroup title="Study Flow">
    <PrintList title="Observation Prompts" items={method.observationPrompts}/>
    <PrintList title="Interpretation Prompts" items={method.interpretationPrompts}/>
    <PrintList title="Application Prompts" items={method.applicationPrompts}/>
    <PrintList title="Reflection Questions" items={method.reflectionQuestions}/>
    <PrintList title="Key Questions" items={method.keyQuestions}/>
    <PrintList title="Observation Guide" items={method.observationGuide}/>
    <PrintList title="Interpretation Guide" items={method.interpretationGuide}/>
    <PrintList title="Application Guide" items={method.applicationGuide}/>
    <PrintText title="Application" text={method.application}/>
   </PrintGroup>

   <PrintGroup title="Prayer, Memory, and Journaling">
    <PrintList title="Prayer Focus" items={method.prayerFocus}/>
    <PrintList title="Prayer Points" items={method.prayerPoints}/>
    <PrintList title="Prayer Guide" items={method.prayerGuide}/>
    <PrintText title="Prayer" text={method.prayer}/>
    <PrintText title="Memory Verse" text={method.memoryVerse}/>
    <PrintList title="Memorization Tips" items={method.memorizationTips}/>
    <PrintList title="Journaling Prompts" items={method.journalingPrompts}/>
    <PrintText title="Record Your Findings" text={method.recordYourFindings}/>
    <PrintList title="Record Formats" items={method.recordFormats}/>
    <PrintList title="Journaling Guidance" items={method.journalingGuidance}/>
   </PrintGroup>

   <PrintGroup title="Guardrails">
    <PrintList title="Strengths" items={method.strengths}/>
    <PrintList title="Benefits" items={method.benefits}/>
    <PrintList title="Cautions" items={method.cautions}/>
    <PrintList title="Common Mistakes" items={method.commonMistakes}/>
    <PrintList title="Common Misconceptions" items={method.commonMisconceptions}/>
    <PrintList title="Unrealistic Expectations" items={method.unrealisticExpectations}/>
    <PrintList title="What Not To Do" items={method.whatNotToDo}/>
    <PrintList title="Limitations" items={method.limitations}/>
    <PrintList title="Sound Doctrine Checks" items={method.soundDoctrineChecks}/>
    <PrintText title="Spiritual Outcome" text={method.spiritualOutcome}/>
    <PrintText title="Core Spiritual Outcome" text={method.coreSpiritualOutcome}/>
    <PrintText title="Discipline Reminder" text={method.disciplineReminder}/>
   </PrintGroup>

   <PrintGroup title="Example and Related">
    <PrintList title="Related Topics" items={method.relatedTopics}/>
    <PrintList title="Related Practices" items={method.relatedPractices}/>
    <PrintList title="Related Scriptures" items={method.relatedScriptures}/>
    <PrintList title="Cross References" items={method.crossReferences}/>
    <PrintList title="Follow Up Methods" items={method.followUpMethods}/>
    <PrintList title="Suggested Passages" items={method.suggestedPassages}/>
    <PrintList title="Tags" items={method.tags}/>
    <PrintList title="Notes" items={method.notes}/>
   </PrintGroup>

   <PrintExample example={method.example}/>
   <PrintText title="Final Thought" text={method.closing||method.finalThought||method.disciplineReminder||method.spiritualOutcome}/>
  </article>
 );
}

function getMethodList(payload){
 if(Array.isArray(payload))return payload;
 if(Array.isArray(payload?.data))return payload.data;
 if(Array.isArray(payload?.items))return payload.items;
 if(Array.isArray(payload?.results))return payload.results;
 return [];
}

export default function BibleStudyMethodPrintPage(){
 const {slug}=useParams();
 const location=useLocation();
 const navigate=useNavigate();
 const resolvedSlug=useMemo(()=>slug?ALIASES[slug]||slug:"",[slug]);
 const isSingleMethodPrint=Boolean(resolvedSlug);
 const [methods,setMethods]=useState([]);
 const [selectedSlug,setSelectedSlug]=useState("");
 const [printScope,setPrintScope]=useState(resolvedSlug?"selected":"all");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");

 useEffect(()=>{
  document.body.classList.add("method-print-preview-active");

  return()=>{
   document.body.classList.remove("method-print-preview-active");
  };
 },[]);

 useEffect(()=>{
  let active=true;

  const load=async()=>{
   try{
    setLoading(true);
    setError("");
    const res=await fetch(API_BASE);
    const text=await res.text();
    const payload=text?JSON.parse(text):null;

    if(!res.ok)throw new Error(payload?.message||"Failed to load methods for printing");

    const next=getMethodList(payload);
    if(active)setMethods(next);
   }catch(err){
    if(active)setError(err.message||"Failed to load methods for printing");
   }finally{
    if(active)setLoading(false);
   }
  };

  load();

  return()=>{
   active=false;
  };
 },[]);

 const effectiveSelectedSlug=selectedSlug||resolvedSlug||methods[0]?.slug||"";

 const selectedMethod=useMemo(()=>{
  if(!effectiveSelectedSlug)return methods[0]||null;
  return methods.find(method=>method?.slug===effectiveSelectedSlug)||methods[0]||null;
 },[effectiveSelectedSlug,methods]);

 const printableMethods=!isSingleMethodPrint&&printScope==="all"?methods:[selectedMethod].filter(Boolean);

 const handlePrint=scope=>{
  setPrintScope(isSingleMethodPrint?"selected":scope);
  window.setTimeout(()=>window.print(),50);
 };

 const handleCancel=()=>{
  if(location.state?.returnTo){
   navigate(location.state.returnTo,{replace:true});
   return;
  }

  if(isSingleMethodPrint&&effectiveSelectedSlug){
   navigate(`/methods/${effectiveSelectedSlug}`,{replace:true});
   return;
  }

  navigate("/methods",{replace:true});
 };

 return(
  <main className={`method-print-plain-page ${isSingleMethodPrint?"method-print-single-page":"method-print-index-page"}`}>
   <div className="method-print-plain-toolbar no-print">
    <div className="method-print-plain-controls">
     {isSingleMethodPrint?(
      <span className="method-print-plain-context" aria-hidden="true"></span>
     ):(
      <label>
       Method
       <select value={effectiveSelectedSlug} onChange={event=>{
        setSelectedSlug(event.target.value);
        setPrintScope("selected");
       }}>
        {methods.map(method=>(
         <option key={method?._id||method?.slug||method?.title} value={method?.slug||""}>
          {method?.title||"Untitled Method"}
         </option>
        ))}
       </select>
      </label>
     )}
    </div>
    <div className="method-print-plain-actions">
     <button type="button" className="btn btn-secondary" onClick={()=>handlePrint("selected")}>
      {isSingleMethodPrint?"Print Method":"Print Selected"}
     </button>
     {!isSingleMethodPrint&&(
      <button type="button" className="btn btn-secondary" onClick={()=>handlePrint("all")}>Print All</button>
     )}
     <button type="button" className="btn btn-primary" onClick={handleCancel}>Cancel</button>
    </div>
   </div>

   {loading&&<p>Loading printable methods...</p>}
   {error&&<p className="text-danger">{error}</p>}
   {!loading&&!error&&!methods.length&&<p>No methods found.</p>}

   {printableMethods.map(method=>(
    <MethodPrintArticle key={method?._id||method?.slug||method?.title} method={method}/>
   ))}
  </main>
 );
}
