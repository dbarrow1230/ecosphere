import {useLayoutEffect,useMemo,useRef,useState} from "react";
import {Badge,Button,Form,InputGroup} from "react-bootstrap";
import SortedList from "./SortedList.jsx";
import "../styles/KnowledgeWorkflowWorkspace.css";

const alphabetTabs=["ALL",..."ABCDEFGHIJKLMNOPQRSTUVWXYZ","#"];
const sortOptions=[
 {value:"title-asc",label:"Title A–Z"},
 {value:"title-desc",label:"Title Z–A"},
 {value:"updated-desc",label:"Recently updated"},
 {value:"updated-asc",label:"Oldest updated"},
 {value:"id-asc",label:"Record ID A–Z"}
];
const compareText=(left,right)=>String(left||"").localeCompare(String(right||""),undefined,{sensitivity:"base",numeric:true});
const firstLetter=value=>{
 const first=String(value||"").trim().charAt(0).toUpperCase();
 return /^[A-Z]$/.test(first)?first:"#";
};

function KnowledgeWorkflowWorkspace({
 eyebrow,
 title,
 records,
 selectedId,
 getRecordId,
 getRecordTitle,
 getSearchText,
 getRecordClassName,
 isFavorite,
 onSelect,
 header,
 actions,
 children
}){
 const [search,setSearch]=useState("");
 const [sortMode,setSortMode]=useState("title-asc");
 const [letterFilter,setLetterFilter]=useState("ALL");
 const [workspaceHeight,setWorkspaceHeight]=useState(null);
 const workspaceRef=useRef(null);

 useLayoutEffect(()=>{
  const fitWorkspace=()=>{
   const workspace=workspaceRef.current;
   if(!workspace||window.matchMedia("(max-width: 900px)").matches){
    setWorkspaceHeight(null);
    return;
   }
   const viewportHeight=window.visualViewport?.height||window.innerHeight;
   const top=workspace.getBoundingClientRect().top;
   setWorkspaceHeight(Math.max(240,Math.floor(viewportHeight-top-16)));
  };
  fitWorkspace();
  window.addEventListener("resize",fitWorkspace);
  window.visualViewport?.addEventListener("resize",fitWorkspace);
  return()=>{
   window.removeEventListener("resize",fitWorkspace);
   window.visualViewport?.removeEventListener("resize",fitWorkspace);
  };
 },[]);

 const visibleRecords=useMemo(()=>{
  const query=search.trim().toLocaleLowerCase();
  const filtered=records.filter(record=>{
   const title=String(getRecordTitle(record)||"").toLocaleLowerCase();
   const id=String(getRecordId(record)||"").toLocaleLowerCase();
   const additional=query?String(getSearchText?.(record)||[record.summary,record.description,record.body,record.mainIdea,record.content,record.outline,record.rawCapture,record.topic,record.copiedText,record.roleUse,record.author,record.publisher,record.tags,record.questions,record.notes].flat().filter(Boolean).join(" ")).toLocaleLowerCase():"";
   return (letterFilter==="ALL"||firstLetter(title)===letterFilter)&&(!query||title.includes(query)||id.includes(query)||additional.includes(query));
  });
  return filtered.sort((left,right)=>{
   if(sortMode==="updated-desc"||sortMode==="updated-asc"){
    const delta=new Date(left.updatedAt||left.createdAt||0)-new Date(right.updatedAt||right.createdAt||0);
    if(delta)return sortMode==="updated-desc"?-delta:delta;
   }
   if(sortMode==="id-asc")return compareText(getRecordId(left),getRecordId(right));
   const delta=compareText(getRecordTitle(left),getRecordTitle(right));
   return sortMode==="title-desc"?-delta:delta;
  });
 },[getRecordId,getRecordTitle,getSearchText,records,search,sortMode,letterFilter]);

 const letterCounts=useMemo(()=>{
  const counts=new Map(alphabetTabs.map(letter=>[letter,0]));
  records.forEach(record=>{
   counts.set("ALL",counts.get("ALL")+1);
   const letter=firstLetter(getRecordTitle(record));
   counts.set(letter,counts.get(letter)+1);
  });
  return counts;
 },[records,getRecordTitle]);

 useLayoutEffect(()=>{
  if(!selectedId)return;
  const selected=workspaceRef.current?.querySelector('.knowledge-workspace-index-item[aria-current="true"]');
  selected?.scrollIntoView({block:"nearest",inline:"nearest"});
 },[selectedId,visibleRecords]);

 return(
  <section ref={workspaceRef} className="knowledge-workspace-card" aria-label={title} style={workspaceHeight?{height:`${workspaceHeight}px`}:undefined}>
   <header className="knowledge-workspace-card-header">
    <div>
     <span>{eyebrow}</span>
     <h2>{title}</h2>
    </div>
    <div className="knowledge-workspace-header-tools">
     <div className="knowledge-workspace-actions">{actions}</div>
     <Badge pill>{visibleRecords.length===records.length?records.length:`${visibleRecords.length} of ${records.length}`} {records.length===1?"record":"records"}</Badge>
    </div>
   </header>

   <div className="knowledge-workspace-shell">
    <aside className="knowledge-workspace-index" aria-label={`${title} index`}>
     <div className="knowledge-workspace-index-tools">
      <InputGroup size="sm" className="knowledge-workspace-search">
       <Form.Control
        type="search"
        value={search}
        onChange={event=>{setSearch(event.target.value);setLetterFilter("ALL");}}
        placeholder={`Search ${title.toLocaleLowerCase()}...`}
        aria-label={`Search ${title}`}
       />
       <Button variant="outline-secondary" type="button" disabled={!search} onClick={()=>setSearch("")} aria-label={`Clear ${title} search`}>Clear</Button>
      </InputGroup>
      <Form.Select size="sm" value={sortMode} onChange={event=>setSortMode(event.target.value)} aria-label={`Sort ${title}`}>
       {sortOptions.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}
      </Form.Select>
     </div>
     <nav className="knowledge-workspace-alphabet" aria-label={`Filter ${title} by first letter`}>
      {alphabetTabs.map(letter=><button key={letter} type="button" className={letterFilter===letter?"is-active":""} disabled={!letterCounts.get(letter)} aria-pressed={letterFilter===letter} onClick={()=>setLetterFilter(letter)}>{letter==="ALL"?"All":letter}</button>)}
     </nav>
     <SortedList
      items={visibleRecords}
      sort={false}
      getKey={record=>record._id||getRecordId(record)}
      getLabel={getRecordTitle}
      className="knowledge-workspace-records"
      wrapItems={false}
      renderItem={record=>{
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
     }}
     >
      <p className="knowledge-workspace-empty">No records match your search.</p>
     </SortedList>
    </aside>

    <article className="knowledge-workspace-reader">
     <header className="knowledge-workspace-reader-header">
     <div>{header}</div>
     </header>
     <div className="knowledge-workspace-content">{children}</div>
    </article>
   </div>
  </section>
 );
}

export default KnowledgeWorkflowWorkspace;
