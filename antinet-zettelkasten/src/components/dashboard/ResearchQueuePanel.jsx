import {useMemo,useState} from "react";
import {Link} from "react-router-dom";
import {Form} from "react-bootstrap";

const id=value=>typeof value==="string"?value:value?._id||value?.id||"";

export default function ResearchQueuePanel({zettels=[],domains=[]}){
 const [query,setQuery]=useState("");
 const researchDomains=useMemo(()=>domains.filter(item=>[item.name,item.code].some(value=>["research","research domain"].includes(String(value||"").trim().replace(/[\s_-]+/g," ").toLocaleLowerCase()))),[domains]);
 const researchIds=useMemo(()=>new Set(researchDomains.map(item=>id(item))),[researchDomains]);
 const questions=useMemo(()=>{
  const matching=zettels.filter(record=>researchIds.has(id(record.domainId)));
  const done=new Set(matching.flatMap(record=>record.researchedQuestions||[]).map(value=>String(value).trim().toLocaleLowerCase()));
  const unique=new Map();
  for(const record of matching){
   for(const raw of record.questions||[]){
    const question=String(raw||"").trim();
    const key=question.toLocaleLowerCase();
    if(!question||done.has(key)||unique.has(key))continue;
    if(query&&!question.toLocaleLowerCase().includes(query.toLocaleLowerCase()))continue;
    unique.set(key,{question,zettelTitle:record.title||"Untitled note",domainId:id(record.domainId),zettelId:record._id});
   }
  }
  return [...unique.values()];
 },[zettels,researchIds,query]);
 return <section className="dashboard-section dashboard-research-queue" aria-label="Research queue">
  <div className="dashboard-section-head"><div><p className="dashboard-section-kicker">Research domain</p><h2 className="dashboard-section-title">Research next</h2></div><Link to={researchDomains[0]?`/question-pools?domain=${encodeURIComponent(id(researchDomains[0]))}`:"/question-pools"} className="btn btn-outline-primary">Question pool</Link></div>
  <Form.Control type="search" aria-label="Filter Research-domain questions" placeholder="Find a research question…" value={query} onChange={event=>setQuery(event.target.value)}/>
  {questions.length?<><p className="dashboard-research-queue-count">{questions.length} unfinished {questions.length===1?"question":"questions"}</p><ul>{questions.slice(0,5).map(item=><li key={item.question.toLocaleLowerCase()}><Link to={`/question-pools?q=${encodeURIComponent(item.question)}&question=${encodeURIComponent(item.question)}&zettel=${encodeURIComponent(item.zettelId)}${item.domainId?`&domain=${encodeURIComponent(item.domainId)}`:""}`}><strong>{item.question}</strong><span>{item.zettelTitle}</span></Link></li>)}</ul>{questions.length>5&&<Link to={researchDomains[0]?`/question-pools?domain=${encodeURIComponent(id(researchDomains[0]))}`:"/question-pools"}>View more</Link>}</>:<p className="mb-0">{researchDomains.length?"No unfinished questions in the Research domain.":"No Research domain is configured."}</p>}
 </section>;
}
