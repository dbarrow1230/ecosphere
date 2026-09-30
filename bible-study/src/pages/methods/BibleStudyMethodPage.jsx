// /src/pages/methods/BibleStudyMethodPage.jsx
import {useCallback,useEffect,useMemo,useState} from "react";
import {useNavigate,useParams,useSearchParams} from "react-router-dom";
import BibleStudyMethodForm from "../forms/methods/BibleStudyMethodForm.jsx";
import bannerImage from "../../images/oringinal-language.png";
import "../../styles/methods.css";

const API_BASE="/api/methods";
const ICON_IMAGE_BASE="/images/method-icons";

const safeArray=value=>Array.isArray(value)?value:[];
const hasText=value=>typeof value==="string"&&value.trim()!=="";
const hasItems=value=>Array.isArray(value)&&value.length>0;
const INVALID_FILE_NAME_CHARS=/[<>:"/\\|?*]/g;
const CONTROL_CHARS=new RegExp(`[${String.fromCharCode(0)}-${String.fromCharCode(31)}]`,"g");

const getRefLabel=value=>{
 if(!value)return"";
 if(typeof value==="string")return value;
 if(typeof value==="object")return value.title||value.name||value.label||value.slug||"";
 return"";
};

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
 if(isImageFileName(value))return `${ICON_IMAGE_BASE}/${cleanIconFileName(value)}`;

 return"";
}

function MethodIcon({icon,title,className="method-hero-icon"}){
 const[failed,setFailed]=useState(false);
 const iconValue=String(icon||"").trim();
 const imageSrc=getIconSrc(iconValue);

 if(!iconValue)return null;

 if(imageSrc&&!failed){
  return(
   <span className={`${className} ${className}-image-wrap`}>
    <img
     className={`${className}-image`}
     src={imageSrc}
     alt={title?`${title} icon`:"Method icon"}
     onError={()=>setFailed(true)}
    />
   </span>
  );
 }

 if(isImageFileName(iconValue)||iconValue.startsWith("/images/")){
  return null;
 }

 return(
  <span className={`${className} ${className}-emoji`} aria-hidden="true">
   {iconValue}
  </span>
 );
}

function MetaBadge({label,value}){
 if(!hasText(value))return null;
 return(
  <span className="method-chip">
   <span className="method-chip-label">{label}:</span> {value}
  </span>
 );
}

function ListBlock({title,items=[]}){
 if(!hasItems(items))return null;
 return(
  <div className="method-block">
   <h3 className="method-block-title">{title}</h3>
   <ul className="method-list">
    {items.map((item,index)=>(
     <li key={index}>{item}</li>
    ))}
   </ul>
  </div>
 );
}

function TextBlock({title,text}){
 if(!hasText(text))return null;
 return(
  <div className="method-block">
   <h3 className="method-block-title">{title}</h3>
   <p className="method-text mb-0">{text}</p>
  </div>
 );
}

function StepsBlock({steps=[]}){
 if(!hasItems(steps))return null;
 const sorted=[...steps].sort((a,b)=>(a.order||0)-(b.order||0));
 return(
  <div className="method-block">
   <h3 className="method-block-title">Steps</h3>
   <div className="method-steps">
    {sorted.map((step,index)=>(
     <div key={index} className="method-step">
      <div className="method-step-number">{index+1}</div>
      <div className="method-step-body">
       {hasText(step.title)&&<h4 className="method-step-title">{step.title}</h4>}
       {hasText(step.content)&&<p className="method-text mb-0">{step.content}</p>}
      </div>
     </div>
    ))}
   </div>
  </div>
 );
}

function PromptGrid({title,items=[]}){
 if(!hasItems(items))return null;
 return(
  <div className="method-block">
   <h3 className="method-block-title">{title}</h3>
   <div className="row g-3">
    {items.map((item,index)=>(
     <div key={index} className="col-md-6">
      <div className="method-mini-card h-100">
       {hasText(item.title)&&<h4 className="method-mini-title">{item.title}</h4>}
       {hasText(item.prompt)&&<p className="method-text mb-0">{item.prompt}</p>}
      </div>
     </div>
    ))}
   </div>
  </div>
 );
}

function GroupedChecksBlock({title,items=[]}){
 if(!hasItems(items))return null;
 return(
  <div className="method-block">
   <h3 className="method-block-title">{title}</h3>
   <div className="row g-3">
    {items.map((item,index)=>(
     <div key={index} className="col-md-6">
      <div className="method-mini-card h-100">
       {hasText(item.title)&&<h4 className="method-mini-title">{item.title}</h4>}
       {hasItems(item.checks)&&(
        <ul className="method-list mb-0">
         {item.checks.map((check,checkIndex)=>(
          <li key={checkIndex}>{check}</li>
         ))}
        </ul>
       )}
      </div>
     </div>
    ))}
   </div>
  </div>
 );
}

function InterpretationPitfallsBlock({items=[]}){
 if(!hasItems(items))return null;
 return(
  <div className="method-block">
   <h3 className="method-block-title">Interpretation Pitfalls</h3>
   <div className="row g-3">
    {items.map((item,index)=>(
     <div key={index} className="col-md-6">
      <div className="method-mini-card h-100">
       {hasText(item.title)&&<h4 className="method-mini-title">{item.title}</h4>}
       {hasText(item.description)&&<p className="method-text mb-0">{item.description}</p>}
      </div>
     </div>
    ))}
   </div>
  </div>
 );
}

function TransformationMarkersBlock({items=[]}){
 if(!hasItems(items))return null;
 return(
  <div className="method-block">
   <h3 className="method-block-title">Transformation Markers</h3>
   <div className="row g-3">
    {items.map((item,index)=>(
     <div key={index} className="col-md-6">
      <div className="method-mini-card h-100">
       {hasText(item.category)&&<h4 className="method-mini-title">{item.category}</h4>}
       {hasItems(item.markers)&&(
        <ul className="method-list mb-0">
         {item.markers.map((marker,markerIndex)=>(
          <li key={markerIndex}>{marker}</li>
         ))}
        </ul>
       )}
      </div>
     </div>
    ))}
   </div>
  </div>
 );
}

function ExampleBlock({example}){
 if(!example)return null;
 const items=[
  hasText(example.reference)?["Reference",example.reference]:null,
  hasText(example.summary)?["Summary",example.summary]:null,
  hasText(example.observation)?["Observation",example.observation]:null,
  hasText(example.interpretation)?["Interpretation",example.interpretation]:null,
  hasText(example.application)?["Application",example.application]:null,
  hasText(example.prayer)?["Prayer",example.prayer]:null,
  hasText(example.memoryVerse)?["Memory Verse",example.memoryVerse]:null,
  hasText(example.journal)?["Journal",example.journal]:null
 ].filter(Boolean);

 if(!items.length)return null;

 return(
  <div className="method-block">
   <h3 className="method-block-title">Example</h3>
   <div className="row g-3">
    {items.map(([label,value],index)=>(
     <div key={index} className={label==="Summary"||label==="Reference"?"col-12":"col-md-6"}>
      <div className="method-mini-card h-100">
       <h4 className="method-mini-title">{label}</h4>
       <p className="method-text mb-0">{value}</p>
      </div>
     </div>
    ))}
   </div>
  </div>
 );
}

function ImagesBlock({images=[]}){
 if(!hasItems(images))return null;
 const sorted=[...images].sort((a,b)=>(a.order||0)-(b.order||0));
 return(
  <div className="method-block">
   <h3 className="method-block-title">Sample Images</h3>
   <div className="row g-3">
    {sorted.map((image,index)=>(
     <div key={index} className="col-md-6 col-lg-4">
      <div className="method-image-card h-100">
       <img src={image.url} alt={image.alt||image.caption||"Method sample"} className="img-fluid method-image"/>
       {hasText(image.caption)&&<p className="method-text mt-2 mb-2">{image.caption}</p>}
       {hasText(image.type)&&<span className="method-chip">{image.type}</span>}
      </div>
     </div>
    ))}
   </div>
  </div>
 );
}

function SectionTabs({tabs,activeTab,onChange}){
 return(
  <ul className="nav method-section-tabs mb-3">
   {tabs.map(tab=>(
    <li className="nav-item" key={tab.key}>
     <button
      type="button"
      className={`nav-link ${activeTab===tab.key?"active":""}`}
      onClick={()=>onChange(tab.key)}
     >
      {tab.label}
     </button>
    </li>
   ))}
  </ul>
 );
}

function DeleteConfirmModal({isOpen,methodTitle,onClose,onConfirm,deleting}){
 if(!isOpen)return null;
 return(
  <>
   <div className="modal fade show d-block" tabIndex="-1" aria-modal="true" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
     <div className="modal-content">
      <div className="modal-header">
       <h5 className="modal-title">Delete Bible Study Method</h5>
       <button type="button" className="btn-close" onClick={onClose}></button>
      </div>
      <div className="modal-body">
       <p className="mb-0">Are you sure you want to delete <strong>{methodTitle||"this method"}</strong>?</p>
      </div>
      <div className="modal-footer">
       <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={deleting}>Cancel</button>
       <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={deleting}>{deleting?"Deleting...":"Delete"}</button>
      </div>
     </div>
    </div>
   </div>
   <div className="modal-backdrop fade show"></div>
  </>
 );
}

function MethodFormModal({isOpen,mode,methodData,onClose,onSaved}){
 if(!isOpen)return null;
 return(
  <>
   <div className="modal fade show d-block" tabIndex="-1" aria-modal="true" role="dialog">
    <div className="modal-dialog modal-xl modal-dialog-scrollable">
     <div className="modal-content">
      <div className="modal-header">
       <h5 className="modal-title">{mode==="edit"?"Edit Bible Study Method":"Add Bible Study Method"}</h5>
       <button type="button" className="btn-close" onClick={onClose}></button>
      </div>
      <div className="modal-body">
       <BibleStudyMethodForm
        key={`${mode}-${methodData?._id||"new"}`}
        isModal={true}
        mode={mode}
        methodId={methodData?._id||""}
        initialData={methodData?{...methodData}:null}
        onSaved={onSaved}
        onCancel={onClose}
       />
      </div>
     </div>
    </div>
   </div>
   <div className="modal-backdrop fade show"></div>
  </>
 );
}

function OverviewPanel({method,onEdit,onDelete}){
 const[activeSection,setActiveSection]=useState("foundation");
 const categoryLabel=getRefLabel(method.category);
 const difficultyLabel=getRefLabel(method.difficulty);
 const methodFamilyLabel=getRefLabel(method.methodFamily);

 const sectionTabs=[
  {key:"foundation",label:"Foundation"},
  {key:"process",label:"Process"},
  {key:"study",label:"Study Flow"},
  {key:"prayer",label:"Prayer, Memory, and Journaling"},
  {key:"guardrails",label:"Guardrails"},
  {key:"example",label:"Example and Related"}
 ];

 return(
  <>
   <div className="method-hero">
    <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
     <div className="method-hero-title-row mb-0">
      <MethodIcon icon={method.icon} title={method.title}/>
      <h1 className="method-hero-title">{method.title}</h1>
     </div>
     <div className="d-flex gap-2 no-print">
      <button type="button" className="btn btn-outline-primary btn-sm" onClick={()=>onEdit(method)}>Edit</button>
      <button type="button" className="btn btn-outline-danger btn-sm" onClick={()=>onDelete(method)}>Delete</button>
     </div>
    </div>
    {hasText(method.subtitle)&&<p className="method-hero-subtitle">{method.subtitle}</p>}
    <div className="method-hero-meta">
     <MetaBadge label="Category" value={categoryLabel}/>
     <MetaBadge label="Difficulty" value={difficultyLabel}/>
     <MetaBadge label="Skill" value={method.skillLevel}/>
     <MetaBadge label="Time" value={method.timeRequired}/>
     <MetaBadge label="Effort" value={method.effortLevel}/>
     <MetaBadge label="Family" value={methodFamilyLabel}/>
    </div>
   </div>

   <div className="row g-3 mb-4">
    {hasText(method.description)&&<div className="col-md-6"><div className="method-summary-card h-100"><h3 className="method-summary-title">Description</h3><p className="method-text mb-0">{method.description}</p></div></div>}
    {hasText(method.purpose)&&<div className="col-md-6"><div className="method-summary-card h-100"><h3 className="method-summary-title">Purpose</h3><p className="method-text mb-0">{method.purpose}</p></div></div>}
    {hasItems(method.bestFor)&&<div className="col-md-6"><div className="method-summary-card h-100"><h3 className="method-summary-title">Best For</h3><ul className="method-list mb-0">{method.bestFor.slice(0,4).map((item,index)=><li key={index}>{item}</li>)}</ul></div></div>}
    {(hasText(method.whenNotToUse)||hasItems(method.lessIdealFor))&&<div className="col-md-6"><div className="method-summary-card h-100"><h3 className="method-summary-title">When Not To Use</h3>{hasText(method.whenNotToUse)?<p className="method-text mb-0">{method.whenNotToUse}</p>:<ul className="method-list mb-0">{method.lessIdealFor.map((item,index)=><li key={index}>{item}</li>)}</ul>}</div></div>}
   </div>

   <SectionTabs tabs={sectionTabs} activeTab={activeSection} onChange={setActiveSection}/>

   <div className="method-tab-panel">
    {activeSection==="foundation"&&(
     <>
      <TextBlock title="Overview" text={method.overview}/>
      <TextBlock title="What Is This Method?" text={method.whatIsThisMethod}/>
      <TextBlock title="Biblical Basis" text={method.biblicalBasis}/>
      <TextBlock title="Hermeneutical Basis" text={method.hermeneuticalBasis}/>
      <TextBlock title="Why This Method Is Valid in Scripture" text={method.whyThisMethodIsValidInScripture}/>
      <TextBlock title="Why Use This Method?" text={method.whyUseThisMethod}/>
      <ListBlock title="Best Use Cases" items={method.bestUseCases}/>
      <TextBlock title="When To Use" text={method.whenToUse}/>
      <TextBlock title="When Not To Use" text={method.whenNotToUse}/>
      <TextBlock title="How To Think About It" text={method.howToThinkAboutIt}/>
      <TextBlock title="Analogy" text={method.analogy}/>
      <TextBlock title="Main Outcome" text={method.mainOutcome}/>
      <ListBlock title="Audience" items={method.audience}/>
      <ListBlock title="Goals" items={method.goals}/>
      <ListBlock title="Learning Outcomes" items={method.learningOutcomes}/>
      <ListBlock title="Ideal Study Contexts" items={method.idealStudyContexts}/>
      <ListBlock title="Complementary Methods" items={method.complementaryMethods}/>
      <ListBlock title="Less Ideal For" items={method.lessIdealFor}/>
     </>
    )}

    {activeSection==="process"&&(
     <>
      <ListBlock title="Before You Begin" items={method.beforeYouBegin}/>
      <ListBlock title="Heart Posture" items={method.heartPosture}/>
      <ListBlock title="Spiritual Preparation" items={method.spiritualPreparation}/>
      <ListBlock title="Guardrails" items={method.guardrails}/>
      <ListBlock title="Requirements" items={method.requirements}/>
      <ListBlock title="Tools" items={method.tools}/>
      <ListBlock title="Required Tools" items={method.requiredTools}/>
      <ListBlock title="Optional Tools" items={method.optionalTools}/>
      <ListBlock title="Preparation Tips" items={method.preparationTips}/>
      <ListBlock title="Study Tips" items={method.studyTips}/>
      <ListBlock title="Variations" items={method.variations}/>
      <TextBlock title="Steps Overview" text={method.stepOverview}/>
      <StepsBlock steps={method.steps}/>
     </>
    )}

    {activeSection==="study"&&(
     <>
      <ListBlock title="Observation Prompts" items={method.observationPrompts}/>
      <ListBlock title="Interpretation Prompts" items={method.interpretationPrompts}/>
      <ListBlock title="Application Prompts" items={method.applicationPrompts}/>
      <ListBlock title="Reflection Questions" items={method.reflectionQuestions}/>
      <ListBlock title="Key Questions" items={method.keyQuestions}/>
      <ListBlock title="Observation Guide" items={method.observationGuide}/>
      <ListBlock title="Interpretation Guide" items={method.interpretationGuide}/>
      <ListBlock title="Application Guide" items={method.applicationGuide}/>
      <TextBlock title="Application" text={method.application}/>
     </>
    )}

    {activeSection==="prayer"&&(
     <>
      <PromptGrid title="Prayer Prompts" items={method.prayerPrompts}/>
      <ListBlock title="Prayer Focus" items={method.prayerFocus}/>
      <ListBlock title="Prayer Points" items={method.prayerPoints}/>
      <ListBlock title="Prayer Guide" items={method.prayerGuide}/>
      <TextBlock title="Prayer" text={method.prayer}/>
      <TextBlock title="Memory Verse" text={method.memoryVerse}/>
      <ListBlock title="Memorization Tips" items={method.memorizationTips}/>
      <ListBlock title="Journaling Prompts" items={method.journalingPrompts}/>
      <TextBlock title="Record Your Findings" text={method.recordYourFindings}/>
      <ListBlock title="Record Formats" items={method.recordFormats}/>
      <ListBlock title="Journaling Guidance" items={method.journalingGuidance}/>
     </>
    )}

    {activeSection==="guardrails"&&(
     <>
      <ListBlock title="Strengths" items={method.strengths}/>
      <ListBlock title="Benefits" items={method.benefits}/>
      <ListBlock title="Cautions" items={method.cautions}/>
      <ListBlock title="Common Mistakes" items={method.commonMistakes}/>
      <InterpretationPitfallsBlock items={method.interpretationPitfalls}/>
      <ListBlock title="Common Misconceptions" items={method.commonMisconceptions}/>
      <ListBlock title="Unrealistic Expectations" items={method.unrealisticExpectations}/>
      <ListBlock title="What Not To Do" items={method.whatNotToDo}/>
      <ListBlock title="Limitations" items={method.limitations}/>
      <GroupedChecksBlock title="Accuracy Checks" items={method.accuracyChecks}/>
      <ListBlock title="Sound Doctrine Checks" items={method.soundDoctrineChecks}/>
      <TextBlock title="Spiritual Outcome" text={method.spiritualOutcome}/>
      <TextBlock title="Core Spiritual Outcome" text={method.coreSpiritualOutcome}/>
      <TextBlock title="Discipline Reminder" text={method.disciplineReminder}/>
      <TransformationMarkersBlock items={method.transformationMarkers}/>
     </>
    )}

    {activeSection==="example"&&(
     <>
      <ImagesBlock images={method.methodImages}/>
      <ExampleBlock example={method.example}/>
      <TextBlock title="How This Method Fits in a Complete Study System" text={method.howThisMethodFitsInACompleteStudySystem}/>
      <TextBlock title="Role in Overall Bible Study" text={method.roleInOverallBibleStudy}/>
      <ListBlock title="Related Topics" items={method.relatedTopics}/>
      <ListBlock title="Related Practices" items={method.relatedPractices}/>
      <ListBlock title="Related Scriptures" items={method.relatedScriptures}/>
      <ListBlock title="Cross References" items={method.crossReferences}/>
      <ListBlock title="Follow Up Methods" items={method.followUpMethods}/>
      <ListBlock title="Suggested Passages" items={method.suggestedPassages}/>
      <ListBlock title="Tags" items={method.tags}/>
      <ListBlock title="Notes" items={method.notes}/>
      <TextBlock title="Closing" text={method.closing}/>
      <TextBlock title="Final Thought" text={method.finalThought}/>
     </>
    )}
   </div>
  </>
 );
}

function SubMethodView({subMethod,parentMethod,onEdit,onDelete}){
 return(
  <div className="method-submethod-wrap">
   <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
    <div className="method-submethod-header flex-grow-1 mb-0">
     <h2 className="method-submethod-title">{subMethod.title}</h2>
     {hasText(subMethod.description)&&<p className="method-text mb-2">{subMethod.description}</p>}
     {hasText(parentMethod?.title)&&<p className="method-submethod-parent mb-0">Part of: {parentMethod.title}</p>}
    </div>
    <div className="d-flex gap-2 no-print">
     <button type="button" className="btn btn-outline-primary btn-sm" onClick={()=>onEdit(parentMethod)}>Edit</button>
     <button type="button" className="btn btn-outline-danger btn-sm" onClick={()=>onDelete(parentMethod)}>Delete</button>
    </div>
   </div>
   <TextBlock title="Purpose" text={subMethod.purpose}/>
   <ListBlock title="Best For" items={subMethod.bestFor}/>
   <TextBlock title="When To Use" text={subMethod.whenToUse}/>
   <ListBlock title="Key Questions" items={subMethod.keyQuestions}/>
   <ListBlock title="Strengths" items={subMethod.strengths}/>
   <ListBlock title="Things to Watch" items={subMethod.cautions}/>
   <ListBlock title="Related Scriptures" items={subMethod.relatedScriptures}/>
   <ListBlock title="Helpful Tools" items={subMethod.tools}/>
   <ListBlock title="Practical Tips" items={subMethod.tips}/>
   <TextBlock title="Notes" text={subMethod.notes}/>
  </div>
 );
}

function normalizePrintList(items=[]){
 return safeArray(items)
  .flatMap(item=>String(item||"").split(","))
  .map(item=>item.trim())
  .filter(Boolean);
}

function PrintList({title,items=[]}){
 const listItems=normalizePrintList(items);
 if(!listItems.length)return null;

 return(
  <section className="method-print-section">
   <h3>{title}</h3>
   <ul>
    {listItems.map((item,index)=>(
     <li key={index}>{item}</li>
    ))}
   </ul>
  </section>
 );
}

function PrintText({title,text}){
 if(!hasText(text))return null;

 return(
  <section className="method-print-section">
   <h3>{title}</h3>
   <p>{text}</p>
  </section>
 );
}

function PrintSteps({steps=[]}){
 if(!hasItems(steps))return null;
 const sorted=[...steps].sort((a,b)=>(a.order||0)-(b.order||0));

 return(
  <section className="method-print-section">
   <h3>Steps</h3>
   <ol className="method-print-steps">
    {sorted.map((step,index)=>(
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
  <section className="method-print-section">
   <h3>Example</h3>
   <div className="method-print-example-grid">
    {rows.map(([label,value],index)=>(
     <div key={index} className="method-print-example-item">
      <strong>{label}</strong>
      <p>{value}</p>
     </div>
    ))}
   </div>
  </section>
 );
}

function PrintableMethod({method}){
 if(!method)return null;

 return(
  <article className="method-print-method">
   <header className="method-print-header">
    <h2>{method.title}</h2>
    {hasText(method.subtitle)&&<p>{method.subtitle}</p>}
   </header>

   <div className="method-print-summary">
    <PrintText title="Overview" text={method.description||method.overview||method.whatIsThisMethod}/>
    <PrintText title="Purpose" text={method.purpose||method.whyUseThisMethod}/>
    <PrintList title="Best For" items={method.bestFor||method.bestUseCases}/>
   </div>

   <PrintSteps steps={method.steps}/>
   <PrintList title="Key Questions" items={method.keyQuestions?.length?method.keyQuestions:method.reflectionQuestions}/>
   <PrintList title="Strengths" items={method.strengths?.length?method.strengths:method.benefits}/>
   <PrintList title="Things to Watch" items={method.cautions?.length?method.cautions:method.commonMistakes}/>
   <PrintList title="Related Scriptures" items={method.relatedScriptures}/>
   <PrintList title="Helpful Tools" items={method.tools?.length?method.tools:method.requiredTools}/>
   <PrintList title="Practical Tips" items={method.studyTips?.length?method.studyTips:method.preparationTips}/>
   <PrintExample example={method.example}/>
   <PrintText title="Final Thought" text={method.closing||method.finalThought||method.disciplineReminder||method.spiritualOutcome}/>
  </article>
 );
}

export default function BibleStudyMethodPage(){
 const{slug}=useParams();
 const navigate=useNavigate();
 const [searchParams]=useSearchParams();
 const returnToDashboard=searchParams.get("from")==="dashboard";
 const[methods,setMethods]=useState([]);
 const[activeMethodIndex,setActiveMethodIndex]=useState(0);
 const[activeSubTab,setActiveSubTab]=useState("main");
 const[loading,setLoading]=useState(true);
 const[error,setError]=useState("");
 const[showFormModal,setShowFormModal]=useState(false);
 const[formMode,setFormMode]=useState("add");
 const[editingMethod,setEditingMethod]=useState(null);
 const[showDeleteModal,setShowDeleteModal]=useState(false);
 const[deleting,setDeleting]=useState(false);
 const[deletingMethod,setDeletingMethod]=useState(null);

 const loadMethods=useCallback(async()=>{
  try{
   setLoading(true);
   setError("");

   const endpoint=slug?`${API_BASE}/slug/${encodeURIComponent(slug)}`:API_BASE;
   const res=await fetch(endpoint);
   const text=await res.text();
   const result=text?JSON.parse(text):null;

   if(!res.ok)throw new Error(result?.message||"Failed to load bible study methods");

   const data=slug
    ?[result?.data||result?.item||result?.method||result].filter(Boolean)
    :safeArray(result?.data);

   setMethods(data);

   if(hasItems(data)){
    setActiveMethodIndex(0);
    setActiveSubTab("main");
   }
  }catch(err){
   setError(err.message||"Failed to load bible study methods");
  }finally{
   setLoading(false);
  }
 },[slug]);

 useEffect(()=>{
  void Promise.resolve().then(loadMethods);
 },[loadMethods]);

 const activeMethod=methods[activeMethodIndex]||null;
 const subMethods=safeArray(activeMethod?.subMethods).sort((a,b)=>(a.order||0)-(b.order||0));

 const methodTabs=useMemo(()=>{
  return methods.map((item,index)=>({
   key:`method-${item?._id||index}`,
   label:item?.title||`Method ${index+1}`
  }));
 },[methods]);

 const subTabs=useMemo(()=>{
  return[
   {key:"main",label:"Overview"},
   ...subMethods.map((item,index)=>({key:`sub-${index}`,label:item.title||`Sub Method ${index+1}`}))
  ];
 },[subMethods]);

 const handleMethodTabChange=index=>{
  setActiveMethodIndex(index);
  setActiveSubTab("main");
 };

 const handleOpenAdd=()=>{
  setFormMode("add");
  setEditingMethod(null);
  setShowFormModal(true);
 };

 const handleOpenEdit=method=>{
  if(!method)return;
  setFormMode("edit");
  setEditingMethod({...method});
  setShowFormModal(true);
 };

 const handleOpenDelete=method=>{
  if(!method)return;
  setDeletingMethod(method);
  setShowDeleteModal(true);
 };

 const handlePrintMethods=mode=>{
  const target=mode==="all"
   ?"/methods/print"
   :`/methods/print/${encodeURIComponent(activeMethod?.slug||slug||"")}`;
  navigate(target,{state:{returnTo:slug?`/methods/${slug}`:"/methods"}});
 };

 const handleSaved=async savedMethod=>{
  const nextSlug=savedMethod?.slug||slug||"";
  const endpoint=nextSlug?`${API_BASE}/slug/${encodeURIComponent(nextSlug)}`:API_BASE;
  const res=await fetch(endpoint);
  const text=await res.text();
  const result=text?JSON.parse(text):null;
  const data=nextSlug
   ?[result?.data||result?.item||result?.method||result].filter(Boolean)
   :safeArray(result?.data);

  setMethods(data);
  setShowFormModal(false);
  setEditingMethod(null);
  setActiveMethodIndex(0);
  setActiveSubTab("main");
 };

 const handleDelete=async()=>{
  if(!deletingMethod?._id)return;
  try{
   setDeleting(true);
   const res=await fetch(`${API_BASE}/${deletingMethod._id}`,{method:"DELETE"});
   const result=await res.json();
   if(!res.ok)throw new Error(result.message||"Failed to delete bible study method");
   setShowDeleteModal(false);
   setDeletingMethod(null);
   await loadMethods();
  }catch(err){
   setError(err.message||"Failed to delete bible study method");
  }finally{
   setDeleting(false);
  }
 };

 if(loading){
  return(
   <div className="container py-4">
    <div className="alert alert-info mb-0">Loading methods...</div>
   </div>
  );
 }

 if(error){
  return(
   <div className="container py-4">
    <div className="alert alert-danger mb-0">{error}</div>
   </div>
  );
 }

 if(!hasItems(methods)){
  return(
   <div className="container py-4 method-page-wrap">
    <div className="method-page-banner mb-4">
     <img src={bannerImage} alt="Original Language Bible Study" className="method-page-banner-image"/>
    </div>

   <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
     <h1 className="h3 mb-0">Bible Study Methods</h1>
     <div className="d-flex gap-2">
      {returnToDashboard?(
       <button type="button" className="btn btn-secondary" onClick={()=>navigate("/dashboard")}>Back to Dashboard</button>
      ):null}
      <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>Add</button>
     </div>
    </div>
    <div className="alert alert-warning mb-0">Bible study methods not found.</div>

    <MethodFormModal
     isOpen={showFormModal}
     mode={formMode}
     methodData={editingMethod}
     onClose={()=>{
      setShowFormModal(false);
      setEditingMethod(null);
     }}
     onSaved={handleSaved}
    />
   </div>
  );
 }

 return(
  <div className="container py-4 method-page-wrap">
   <div className="method-page-banner mb-4">
    <img src={bannerImage} alt="Original Language Bible Study" className="method-page-banner-image"/>
   </div>

   <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 no-print">
    <h1 className="h3 mb-0">Bible Study Methods</h1>
    <div className="method-print-actions">
     {returnToDashboard?(
      <button type="button" className="btn btn-secondary" onClick={()=>navigate("/dashboard")}>Back to Dashboard</button>
     ):null}
     {activeMethod&&<button type="button" className="btn btn-secondary" onClick={()=>handlePrintMethods("current")}>Print Current Method</button>}
     <button type="button" className="btn btn-secondary" onClick={()=>handlePrintMethods("all")}>Print All Methods</button>
     <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>Add</button>
    </div>
   </div>

   <div className="method-print-current-document print-only">
    <PrintableMethod method={activeMethod}/>
   </div>

   <div className="method-print-all-document print-only">
    <h1>Bible Study Methods</h1>
    {methods.map(method=>(
     <PrintableMethod key={method?._id||method?.slug||method?.title} method={method}/>
    ))}
   </div>

   <ul className="nav nav-tabs flex-wrap method-tabs no-print">
    {methodTabs.map((tab,index)=>(
     <li className="nav-item" key={tab.key}>
      <button
       type="button"
       className={`nav-link ${activeMethodIndex===index?"active":""}`}
       onClick={()=>handleMethodTabChange(index)}
      >
       {tab.label}
      </button>
     </li>
    ))}
   </ul>

   {hasItems(subMethods)&&(
    <ul className="nav nav-pills flex-wrap method-subtabs no-print">
     {subTabs.map(tab=>(
      <li className="nav-item me-2 mb-2" key={tab.key}>
       <button
        type="button"
        className={`nav-link ${activeSubTab===tab.key?"active":""}`}
        onClick={()=>setActiveSubTab(tab.key)}
       >
        {tab.label}
       </button>
      </li>
     ))}
    </ul>
   )}

   <div className="method-card method-screen-content">
    <div className="card-body">
     <div className="tab-content">
      <div className={`tab-pane fade ${activeSubTab==="main"?"show active":""}`}>
       {activeSubTab==="main"&&activeMethod&&(
        <OverviewPanel
         method={activeMethod}
         onEdit={handleOpenEdit}
         onDelete={handleOpenDelete}
        />
       )}
      </div>

      {subMethods.map((subMethod,index)=>(
       <div key={index} className={`tab-pane fade ${activeSubTab===`sub-${index}`?"show active":""}`}>
        {activeSubTab===`sub-${index}`&&activeMethod&&(
         <SubMethodView
          subMethod={subMethod}
          parentMethod={activeMethod}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
         />
        )}
       </div>
      ))}
     </div>
    </div>
   </div>

   <MethodFormModal
    isOpen={showFormModal}
    mode={formMode}
    methodData={editingMethod}
    onClose={()=>{
     setShowFormModal(false);
     setEditingMethod(null);
    }}
    onSaved={handleSaved}
   />

   <DeleteConfirmModal
    isOpen={showDeleteModal}
    methodTitle={deletingMethod?.title}
    onClose={()=>{
     if(!deleting){
      setShowDeleteModal(false);
      setDeletingMethod(null);
     }
    }}
    onConfirm={handleDelete}
    deleting={deleting}
   />
  </div>
 );
}
