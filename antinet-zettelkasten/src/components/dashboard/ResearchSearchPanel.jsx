import {useMemo,useState} from "react";
import {Link} from "react-router-dom";
import {Form} from "react-bootstrap";
import {richTextToPlainText} from "../../utils/richText.js";

const id=value=>typeof value==="string"?value:value?._id||value?.id||"";
const text=value=>Array.isArray(value)?value.map(text).join(" "):richTextToPlainText(value||"");

export default function ResearchSearchPanel({domains=[],zettels=[],structures=[],sources=[],entities=[],fleetingNotes=[],outputs=[]}){
 const [query,setQuery]=useState("");
 const [domain,setDomain]=useState("all");
 const results=useMemo(()=>{
  const term=query.trim().toLocaleLowerCase();
  if(!term)return [];
  const collections=[
   {label:"Zettel",records:zettels,path:record=>`/notes/${record._id}`,fields:["title","mainIdea","body","tags"]},
   {label:"Structure note",records:structures,path:record=>`/structures/${record._id}`,fields:["title","purpose","summary","outline","tags"]},
   {label:"Source",records:sources,path:record=>`/references/${record._id}`,fields:["title","summary","copiedText","tags"]},
   {label:"Entity",records:entities,path:record=>`/entities/${record._id}`,fields:["name","description","roleUse","tags"]},
   {label:"Fleeting note",records:fleetingNotes,path:()=>"/inbox",fields:["topic","rawCapture","notes"]},
   {label:"Output",records:outputs,path:record=>`/outputs/${record._id}`,fields:["title","description","body","tags"]}
  ];
  const questionResults=zettels.flatMap(record=>{
   if(domain!=="all"&&id(record.domainId)!==domain)return [];
   return (record.questions||[]).filter(question=>String(question).toLocaleLowerCase().includes(term)).map(question=>({
    key:`question:${record._id}:${question}`,
    label:"Question",
    title:question,
    path:`/question-pools?q=${encodeURIComponent(question)}&question=${encodeURIComponent(question)}&zettel=${encodeURIComponent(record._id)}${domain!=="all"?`&domain=${encodeURIComponent(domain)}`:""}`
   }));
  });
  const recordResults=collections.flatMap(collection=>collection.records.filter(record=>
   (domain==="all"||id(record.domainId)===domain)&&collection.fields.some(field=>text(record[field]).toLocaleLowerCase().includes(term))
  ).map(record=>({
   key:`${collection.label}:${record._id}`,
   label:collection.label,
   title:record.title||record.name||record.topic||record.mainIdea||record.rawCapture?.slice(0,100)||"Untitled record",
   path:collection.path(record)
  })));
  const uniqueQuestions=[...new Map(questionResults.map(result=>[result.title.trim().toLocaleLowerCase(),result])).values()];
  return [...uniqueQuestions,...recordResults].slice(0,30);
 },[query,domain,zettels,structures,sources,entities,fleetingNotes,outputs]);

 return <section className="dashboard-research" aria-label="Research search">
  <div><p className="dashboard-section-kicker mb-1">Begin research</p><h2>Ask your knowledge base</h2><p>Search your questions and related notes, sources, entities, and drafts.</p></div>
  <div className="dashboard-research-controls">
   <div className="dashboard-research-search-field">
    <Form.Control type="search" aria-label="Search questions and records" placeholder="Ask a question or search for safety…" value={query} onChange={event=>setQuery(event.target.value)}/>
    <button type="button" onClick={()=>setQuery("")} disabled={!query} aria-label="Clear dashboard search">Clear search</button>
   </div>
   <Form.Select aria-label="Filter research by domain" value={domain} onChange={event=>setDomain(event.target.value)}><option value="all">All domains</option>{domains.map(item=><option key={item._id} value={item._id}>{item.name}</option>)}</Form.Select>
   <Link className="btn btn-outline-primary" to={`/question-pools${query.trim()?`?q=${encodeURIComponent(query.trim())}${domain!=="all"?`&domain=${encodeURIComponent(domain)}`:""}`:""}`}>Question pool</Link>
  </div>
  {query.trim()&&<div className="dashboard-research-results" aria-live="polite">
   {results.length?<ul>{results.map(result=><li key={result.key}><Link to={result.path}><span>{result.label}</span><strong>{result.title}</strong></Link></li>)}</ul>:<p>No matching questions or records in this domain.</p>}
  </div>}
 </section>;
}
