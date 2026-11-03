import {Badge} from "react-bootstrap";
import "../styles/KnowledgeWorkflowWorkspace.css";

function KnowledgeWorkflowWorkspace({
 eyebrow,
 title,
 records,
 selectedId,
 getRecordId,
 getRecordTitle,
 getRecordClassName,
 isFavorite,
 onSelect,
 header,
 actions,
 children
}){
 return(
  <section className="knowledge-workspace-card" aria-label={title}>
   <header className="knowledge-workspace-card-header">
    <div>
     <span>{eyebrow}</span>
     <h2>{title}</h2>
    </div>
    <Badge pill>{records.length} {records.length===1?"record":"records"}</Badge>
   </header>

   <div className="knowledge-workspace-shell">
    <aside className="knowledge-workspace-index" aria-label={`${title} index`}>
     {records.map(record=>{
      const id=getRecordId(record);
      const recordTitle=getRecordTitle(record);
      return(
       <button
        type="button"
        className={[
         "knowledge-workspace-index-item",
         selectedId===record._id?"is-selected":"",
         getRecordClassName?.(record)||""
        ].filter(Boolean).join(" ")}
        key={record._id||id}
        onClick={()=>onSelect(record)}
        aria-current={selectedId===record._id?"true":undefined}
       >
        <span className="knowledge-workspace-index-title-row">
         <span className="knowledge-workspace-index-title" title={recordTitle}>{recordTitle}</span>
         {isFavorite?.(record)&&<b aria-label="Favorite">★</b>}
        </span>
        <code title={id}>{id}</code>
       </button>
      );
     })}
    </aside>

    <article className="knowledge-workspace-reader">
     <header className="knowledge-workspace-reader-header">
      <div>{header}</div>
      <div className="knowledge-workspace-actions">{actions}</div>
     </header>
     <div className="knowledge-workspace-content">{children}</div>
    </article>
   </div>
  </section>
 );
}

export default KnowledgeWorkflowWorkspace;
