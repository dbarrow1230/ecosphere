// src/pages/forms/PoemDisplayModal.jsx
import {useState} from "react";
import {Tab,Tabs} from "react-bootstrap";
import "../../styles/Poems.css";

function getImageValue(value){
 if(!value)return "";
 if(typeof value==="string")return value;
 return value?.url||value?.src||value?.path||value?.filename||"";
}

function getPoemImageUrl(poem){
 const direct=getImageValue(poem?.backgroundImage)||getImageValue(poem?.image)||getImageValue(poem?.coverImage)||getImageValue(poem?.featuredImage);
 if(direct)return direct;

 if(Array.isArray(poem?.images)&&poem.images.length){
  return getImageValue(poem.images.find(Boolean));
 }

 if(Array.isArray(poem?.imageFiles)&&poem.imageFiles.length){
  return getImageValue(poem.imageFiles.find(Boolean));
 }

 return "";
}

function hasText(value){
 return String(value||"").trim().length>0;
}

function hasArrayItems(value){
 return Array.isArray(value)&&value.some(item=>String(item||"").trim());
}

function renderArrayItems(items){
 const list=Array.isArray(items)?items.filter(item=>String(item||"").trim()):[];

 if(!list.length)return <p>—</p>;

 return(
  <ul>
   {list.map((item,index)=>(
    <li key={`${item}-${index}`}>{item}</li>
   ))}
  </ul>
 );
}

function getAuthorName(poem){
 return poem?.author?.displayName||`${poem?.author?.firstName||""} ${poem?.author?.lastName||""}`.trim()||"—";
}

function formatPoemCopyrightDate(poem){
 const date=new Date(poem?.copyright);
 if(Number.isNaN(date.getTime()))return "—";

 return new Intl.DateTimeFormat("en-US",{
  month:"long",
  day:"numeric",
  year:"numeric"
 }).format(date);
}

function getPublisherName(poem){
 if(typeof poem?.publisher==="string"&&poem.publisher.trim())return poem.publisher;
 if(typeof poem?.publisherName==="string"&&poem.publisherName.trim())return poem.publisherName;
 if(typeof poem?.publisher?.name==="string"&&poem.publisher.name.trim())return poem.publisher.name;
 if(typeof poem?.publisher?.displayName==="string"&&poem.publisher.displayName.trim())return poem.publisher.displayName;

 return "—";
}

function getPoemFolderPath(poem){
 return [poem?.collection,poem?.section,poem?.subsection]
  .map(item=>String(item||"").trim())
  .filter(Boolean)
  .join(" / ")||"—";
}

function getPoemStatusLabel(status){
 const normalized=String(status||"").trim().toLowerCase()==="complete"?"finished":String(status||"").trim().toLowerCase();
 const labels={
  draft:"Draft",
  "in-progress":"In Progress",
  incomplete:"Incomplete",
  revision:"Revision",
  finished:"Finished",
  archived:"Archived"
 };

 return labels[normalized]||"Finished";
}

function statusAllowsPublishing(status){
 const normalized=String(status||"").trim().toLowerCase()==="complete"?"finished":String(status||"").trim().toLowerCase();
 return normalized!=="draft"&&normalized!=="incomplete";
}

function formatPublishedWhere(poem){
 if(!poem?.isPublished||!statusAllowsPublishing(poem?.status))return "—";

 const labels={
  facebook:"Facebook",
  instagram:"Instagram",
  threads:"Threads",
  x:"X",
  website:"Website",
  blog:"Blog",
  journal:"Journal",
  book:"Book",
  other:"Other"
 };
 const list=Array.isArray(poem?.publishedWhere)?poem.publishedWhere:[];

 if(!list.length)return "Published";
 return list.map(item=>labels[item]||item).join(", ");
}

function PoemDisplayModal({poem,poemHtml}){
 const [activeTab,setActiveTab]=useState("authorNote");
 const imageUrl=getPoemImageUrl(poem);
 const analysis=poem?.analysis||{};
 const hasAuthorNote=hasText(poem?.authorNote);
 const hasAnalysis=hasText(analysis.formStructure)||hasArrayItems(analysis.theme)||hasArrayItems(analysis.tone)||hasArrayItems(analysis.language)||hasArrayItems(analysis.structure)||hasArrayItems(analysis.personalInterpretation)||hasArrayItems(analysis.broaderContextReflection)||hasText(analysis.overall);
 const hasDefinitions=Array.isArray(poem?.definitions)&&poem.definitions.some(item=>hasText(item?.term)||hasText(item?.meaning));

 if(!poem)return null;

 return(
  <article
   className={`poems-reader-template poems-reader-template-split${imageUrl?" has-watermark":""}`}
   style={imageUrl?{"--poem-watermark":`url("${imageUrl}")`}:undefined}
  >
   <section className="poems-reader-main">
    <div
     className="poems-reader-template-poem poem-tiptap-editor"
     dangerouslySetInnerHTML={{__html:poemHtml||""}}
    />
   </section>

   <aside className="poems-reader-side-tabs">
    <div className="poems-reader-side-title">Poem Notes</div>

    <div className="poems-reader-info-list">
     <div className="poems-reader-info-item">
      <span className="poems-reader-info-label">Author:</span>
      <span className="poems-reader-info-value">{getAuthorName(poem)}</span>
     </div>

     <div className="poems-reader-info-item">
      <span className="poems-reader-info-label">Genre:</span>
      <span className="poems-reader-info-value">{poem?.genre?.name||"—"}</span>
     </div>

     <div className="poems-reader-info-item">
      <span className="poems-reader-info-label">Folder:</span>
      <span className="poems-reader-info-value">{getPoemFolderPath(poem)}</span>
     </div>

     <div className="poems-reader-info-item">
      <span className="poems-reader-info-label">Status:</span>
      <span className="poems-reader-info-value">{getPoemStatusLabel(poem?.status)}</span>
     </div>

     <div className="poems-reader-info-item">
      <span className="poems-reader-info-label">Copyright:</span>
      <span className="poems-reader-info-value">{formatPoemCopyrightDate(poem)}</span>
     </div>

     <div className="poems-reader-info-item">
      <span className="poems-reader-info-label">Publisher:</span>
      <span className="poems-reader-info-value">{getPublisherName(poem)}</span>
     </div>

     <div className="poems-reader-info-item">
      <span className="poems-reader-info-label">Published Where:</span>
      <span className="poems-reader-info-value">{formatPublishedWhere(poem)}</span>
     </div>
    </div>

    <Tabs
     activeKey={activeTab}
     onSelect={(key)=>setActiveTab(key||"authorNote")}
     className="poems-reader-tabs"
    >
     <Tab eventKey="authorNote" title="Author Note">
      <div className="poems-reader-template-block">
       {hasAuthorNote?<p>{poem.authorNote}</p>:<p>—</p>}
      </div>
     </Tab>

     <Tab eventKey="analysis" title="Analysis">
      <div className="poems-reader-template-block">
       {hasAnalysis?(
        <>
         {analysis.formStructure?(
          <section className="poems-reader-analysis-section">
           <h3>Form/Structure</h3>
           <p>{analysis.formStructure}</p>
          </section>
         ):null}

         {hasArrayItems(analysis.theme)?(
          <section className="poems-reader-analysis-section">
           <h3>Theme</h3>
           {renderArrayItems(analysis.theme)}
          </section>
         ):null}

         {hasArrayItems(analysis.tone)?(
          <section className="poems-reader-analysis-section">
           <h3>Tone</h3>
           {renderArrayItems(analysis.tone)}
          </section>
         ):null}

         {hasArrayItems(analysis.language)?(
          <section className="poems-reader-analysis-section">
           <h3>Language</h3>
           {renderArrayItems(analysis.language)}
          </section>
         ):null}

         {hasArrayItems(analysis.structure)?(
          <section className="poems-reader-analysis-section">
           <h3>Structure</h3>
           {renderArrayItems(analysis.structure)}
          </section>
         ):null}

         {hasArrayItems(analysis.personalInterpretation)?(
          <section className="poems-reader-analysis-section">
           <h3>Personal Interpretation / Analysis</h3>
           {renderArrayItems(analysis.personalInterpretation)}
          </section>
         ):null}

         {hasArrayItems(analysis.broaderContextReflection)?(
          <section className="poems-reader-analysis-section">
           <h3>Reflection on the Broader Context</h3>
           {renderArrayItems(analysis.broaderContextReflection)}
          </section>
         ):null}

         {analysis.overall?(
          <section className="poems-reader-analysis-section">
           <h3>Overall</h3>
           <p>{analysis.overall}</p>
          </section>
         ):null}
        </>
       ):(
        <p>—</p>
       )}
      </div>
     </Tab>

     <Tab eventKey="definitions" title="Definitions">
      <div className="poems-reader-template-block">
       {hasDefinitions?(
        <ul>
         {poem.definitions.map((item,index)=>(
          <li key={`${item.term}-${index}`}>
           <strong>{item.term}:</strong> {item.meaning}
          </li>
         ))}
        </ul>
       ):(
        <p>—</p>
       )}
      </div>
     </Tab>
    </Tabs>
   </aside>
  </article>
 );
}

export default PoemDisplayModal;
