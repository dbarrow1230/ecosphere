import {useEffect,useMemo,useState} from "react";
import {Alert,Container,Form,Modal,Spinner,Tab,Tabs} from "react-bootstrap";
import {useSearchParams} from "react-router-dom";
import {richTextToPlainText} from "../utils/richText.js";
import {Link} from "react-router-dom";
import RichTextEditor from "../components/RichTextEditor.jsx";
import RichTextContent from "../components/RichTextContent.jsx";
import "../styles/QuestionPools.css";

const getObjectId=value=>typeof value==="string"?value:value?._id||value?.id||"";
const alphabetTabs=["ALL",..."ABCDEFGHIJKLMNOPQRSTUVWXYZ","#"];
const firstLetter=value=>{
 const first=String(value||"").trim().charAt(0).toUpperCase();
 return /^[A-Z]$/.test(first)?first:"#";
};
const getStoredUserId=()=>{
 for(const key of ["userInfo","user","authUser","currentUser"]){
  try{
   const parsed=JSON.parse(localStorage.getItem(key)||sessionStorage.getItem(key)||"null");
   const id=getObjectId(parsed?.user||parsed?.data||parsed);
   if(id)return id;
  }catch{continue;}
 }
 return "";
};

export default function QuestionPoolsPage(){
 const userId=getStoredUserId();
 const [searchParams,setSearchParams]=useSearchParams();
 const [zettels,setZettels]=useState([]);
 const [domains,setDomains]=useState([]);
 const domain=searchParams.get("domain")||"all";
 const query=searchParams.get("q")||"";
 const [selectedTopic,setSelectedTopic]=useState("");
 const [sortMode,setSortMode]=useState("title-asc");
 const [letterFilter,setLetterFilter]=useState("ALL");
 const [researchFilter,setResearchFilter]=useState("unanswered");
 const [savingQuestion,setSavingQuestion]=useState("");
 const [savingAnswer,setSavingAnswer]=useState(false);
 const [answer,setAnswer]=useState("");
 const [editingAnswer,setEditingAnswer]=useState(false);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");

 useEffect(()=>{
  if(!userId){queueMicrotask(()=>setLoading(false));return;}
  const query=`?userId=${encodeURIComponent(userId)}`;
  Promise.all([
   fetch(`/api/zettels${query}`,{credentials:"include"}).then(response=>response.json()),
   fetch(`/api/domains${query}`,{credentials:"include"}).then(response=>response.json())
  ]).then(([zettelData,domainData])=>{
   setZettels(Array.isArray(zettelData?.data)?zettelData.data:[]);
   setDomains(Array.isArray(domainData?.data)?domainData.data:[]);
  }).catch(loadError=>setError(loadError.message)).finally(()=>setLoading(false));
 },[userId]);

 const topics=useMemo(()=>{
  const grouped=new Map();
  zettels.forEach(zettel=>{
  if(domain!=="all"&&getObjectId(zettel.domainId)!==domain)return;
   const title=zettel.title||"Untitled Zettel";
   const researched=new Set((zettel.researchedQuestions||[]).map(question=>String(question).trim()));
   const questions=(zettel.questions||[]).map(question=>String(question||"").trim()).filter(Boolean).map(question=>({
    key:`${zettel._id}:${question}`,
    text:question,
    topicTitle:title,
    zettelObjectId:zettel._id,
    answer:zettel.questionAnswers?.find(item=>String(item.question).trim()===question)?.answer||"",
    answered:!!richTextToPlainText(zettel.questionAnswers?.find(item=>String(item.question).trim()===question)?.answer||"").trim(),
    needsResearch:(zettel.needsResearchQuestions||[]).some(item=>String(item).trim()===question),
    researched:researched.has(question)
   }));
   if(!questions.length)return;
   const key=title.toLocaleLowerCase();
   const topic=grouped.get(key)||{key,title,questions:[],zettelIds:[]};
   topic.questions.push(...questions);
   topic.zettelIds.push(zettel.zettelId);
   grouped.set(key,topic);
  });
  return [...grouped.values()].map(topic=>({...topic,questions:[...new Map(topic.questions.map(question=>[question.key,question])).values()]})).sort((a,b)=>a.title.localeCompare(b.title));
 },[domain,zettels]);
 const searchText=query.trim().toLocaleLowerCase();
 const matchesQuestion=question=>{
  if(researchFilter==="answered"&&!question.answered)return false;
  if(researchFilter==="unanswered"&&question.answered)return false;
  if(researchFilter==="researched"&&!question.researched)return false;
  if(researchFilter==="needs-research"&&!question.needsResearch)return false;
  return !searchText||[question.text,question.topicTitle,richTextToPlainText(question.answer)].some(value=>value.toLocaleLowerCase().includes(searchText));
 };
 const filteredTopics=topics.filter(topic=>letterFilter==="ALL"||firstLetter(topic.title)===letterFilter)
  .map(topic=>({...topic,questions:topic.questions.filter(matchesQuestion)})).filter(topic=>topic.questions.length)
  .sort((left,right)=>{
   if(sortMode==="questions-desc")return right.questions.length-left.questions.length||left.title.localeCompare(right.title);
   if(sortMode==="questions-asc")return left.questions.length-right.questions.length||left.title.localeCompare(right.title);
   return sortMode==="title-desc"?right.title.localeCompare(left.title):left.title.localeCompare(right.title);
  });
 const allQuestionsTopic=useMemo(()=>({
  key:"__all__",
  title:domain==="all"?"All Zettel Questions":"All Questions in This Domain",
  questions:[...new Map(filteredTopics.flatMap(topic=>topic.questions).map(question=>[question.key,question])).values()]
 }),[domain,filteredTopics]);
 const topicOptions=topics.length?[allQuestionsTopic,...filteredTopics]:[];
 const activeTopic=topicOptions.find(topic=>topic.key===selectedTopic)||allQuestionsTopic;
 const visibleQuestions=activeTopic.questions;
 const selectedQuestion=topics.flatMap(topic=>topic.questions).find(question=>question.zettelObjectId===searchParams.get("zettel")&&question.text===searchParams.get("question"));
 const sourceZettel=selectedQuestion&&zettels.find(record=>record._id===selectedQuestion.zettelObjectId);
 const savedAnswer=sourceZettel?.questionAnswers?.find(item=>item.question===selectedQuestion?.text)?.answer||"";
 useEffect(()=>{
  setAnswer(savedAnswer);
  setEditingAnswer(!savedAnswer);
 },[selectedQuestion?.key,savedAnswer]);
 const selectQuestion=question=>{
  const next=new URLSearchParams(searchParams);
  next.set("question",question.text);
  next.set("zettel",question.zettelObjectId);
  setSearchParams(next);
 };
 const closeAnswerCard=()=>{
  const next=new URLSearchParams(searchParams);
  next.delete("question");
  next.delete("zettel");
  setSearchParams(next,{replace:true});
 };
 const requestCloseAnswerCard=()=>{
  if(savingAnswer)return;
  closeAnswerCard();
 };
 const cancelAnswer=()=>{
  setAnswer(savedAnswer);
  if(savedAnswer)setEditingAnswer(false);
  else closeAnswerCard();
 };
 const saveAnswer=async()=>{
  if(!selectedQuestion||!richTextToPlainText(answer).trim())return;
  setSavingAnswer(true);
  setError("");
  try{
   const response=await fetch(`/api/zettels/${selectedQuestion.zettelObjectId}/questions/answer`,{
    method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",
    body:JSON.stringify({userId,question:selectedQuestion.text,answer})
   });
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Unable to save answer");
   setEditingAnswer(false);
   setZettels(current=>current.map(record=>record._id===selectedQuestion.zettelObjectId?{
    ...record,
    questionAnswers:[...(record.questionAnswers||[]).filter(item=>item.question!==selectedQuestion.text),data.data]
   }:record));
  }catch(saveError){setError(saveError.message);}
  finally{setSavingAnswer(false);}
 };
 const deleteAnswer=async()=>{
  if(!selectedQuestion||!window.confirm(`Delete the saved answer to “${selectedQuestion.text}”? The question will remain in the pool.`))return;
  setSavingAnswer(true);
  setError("");
  try{
   const response=await fetch(`/api/zettels/${selectedQuestion.zettelObjectId}/questions/answer`,{
    method:"DELETE",headers:{"Content-Type":"application/json"},credentials:"include",
    body:JSON.stringify({userId,question:selectedQuestion.text})
   });
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Unable to delete answer");
   setZettels(current=>current.map(record=>record._id===selectedQuestion.zettelObjectId?{
    ...record,
    questionAnswers:(record.questionAnswers||[]).filter(item=>item.question!==selectedQuestion.text)
   }:record));
   closeAnswerCard();
  }catch(deleteError){setError(deleteError.message);}
  finally{setSavingAnswer(false);}
 };
 const updateSearch=(key,value)=>{
  const next=new URLSearchParams(searchParams);
  if(value&&value!=="all")next.set(key,value);
  else next.delete(key);
  setSearchParams(next,{replace:true});
 };
 const clearAll=()=>{const next=new URLSearchParams(searchParams);next.delete("domain");next.delete("q");setSearchParams(next,{replace:true});setResearchFilter("all");setSelectedTopic("");setLetterFilter("ALL");setSortMode("title-asc");};
 const letterCounts=useMemo(()=>{
  const counts=new Map(alphabetTabs.map(letter=>[letter,0]));
  topics.forEach(topic=>{
   counts.set("ALL",counts.get("ALL")+1);
   const letter=firstLetter(topic.title);
   counts.set(letter,counts.get(letter)+1);
  });
  return counts;
 },[topics]);

 const setResearchStatus=async(question,status)=>{
  const zettel=zettels.find(record=>record._id===question.zettelObjectId);
  if(!zettel)return;
  const researched=new Set((zettel.researchedQuestions||[]).map(item=>String(item).trim()));
  const needsResearch=new Set((zettel.needsResearchQuestions||[]).map(item=>String(item).trim()));
  researched.delete(question.text);
  needsResearch.delete(question.text);
  if(status==="researched")researched.add(question.text);
  if(status==="needs-research")needsResearch.add(question.text);
  setSavingQuestion(question.key);
  setError("");
  try{
   const response=await fetch(`/api/zettels/${zettel._id}`,{
    method:"PUT",
    headers:{"Content-Type":"application/json"},
    credentials:"include",
    body:JSON.stringify({userId,researchedQuestions:[...researched],needsResearchQuestions:[...needsResearch]})
   });
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Unable to update question status");
   setZettels(current=>current.map(record=>record._id===zettel._id?data.data:record));
  }catch(updateError){
   setError(updateError.message);
  }finally{
   setSavingQuestion("");
  }
 };

 if(loading)return <Container className="py-5 text-center"><Spinner animation="border"/></Container>;
 return <Container fluid className="py-5 px-4">
  <p className="dashboard-section-kicker mb-1">Review questions by domain</p>
  <h1>Question Pools</h1>
  {error&&<Alert variant="danger">{error}</Alert>}
  <div className="question-pool-toolbar">
   <Form.Group className="question-pool-domain">
    <Form.Label>Domain</Form.Label>
    <div className="question-pool-search-control">
    <Form.Select value={domain} onChange={event=>{updateSearch("domain",event.target.value);setSelectedTopic("");}}>
     <option value="all">All domains</option>
     {domains.map(item=><option key={item._id} value={item._id}>{item.name}</option>)}
    </Form.Select>
    <button type="button" disabled={domain==="all"} onClick={()=>{updateSearch("domain","all");setSelectedTopic("");}}>Clear domain</button>
    </div>
   </Form.Group>
   <Form.Group className="question-pool-filter">
    <Form.Label>Show</Form.Label>
    <div className="question-pool-search-control">
    <Form.Select value={researchFilter} onChange={event=>setResearchFilter(event.target.value)}>
     <option value="unanswered">Unanswered</option>
     <option value="answered">Answered</option>
     <option value="all">All questions</option>
     <option value="needs-research">Needs research</option>
     <option value="researched">Researched</option>
    </Form.Select>
    <button type="button" disabled={researchFilter==="all"} onClick={()=>setResearchFilter("all")}>Clear show</button>
    </div>
   </Form.Group>
   <Form.Group className="question-pool-search">
    <Form.Label htmlFor="question-pool-search">Search questions</Form.Label>
    <div className="question-pool-search-control">
     <Form.Control id="question-pool-search" type="search" value={query} onChange={event=>{updateSearch("q",event.target.value);setSelectedTopic("");setLetterFilter("ALL");}} placeholder="Search questions or answers..." aria-label="Search questions"/>
     <button type="button" disabled={!query} onClick={()=>{updateSearch("q","");setSelectedTopic("");setLetterFilter("ALL");}} aria-label="Clear question search">Clear search</button>
    </div>
   </Form.Group>
   <button type="button" className="btn btn-outline-secondary" onClick={clearAll}>Clear all</button>
  </div>
  {!topics.length?<Alert variant="light">No questions found in this domain.</Alert>:
   <section className="question-pool-workspace">
   <aside className="question-pool-topics" aria-label="Question topics">
    <div className="question-pool-column-heading">Topics</div>
    <div className="question-pool-index-tools">
     <Form.Select size="sm" value={sortMode} onChange={event=>setSortMode(event.target.value)} aria-label="Sort question topics">
      <option value="title-asc">Title A–Z</option>
      <option value="title-desc">Title Z–A</option>
      <option value="questions-desc">Most questions</option>
      <option value="questions-asc">Fewest questions</option>
     </Form.Select>
    </div>
    <nav className="question-pool-alphabet" aria-label="Filter question topics by first letter">
     {alphabetTabs.map(letter=><button type="button" key={letter} className={letterFilter===letter?"is-active":""} disabled={!letterCounts.get(letter)} aria-pressed={letterFilter===letter} onClick={()=>{setLetterFilter(letter);setSelectedTopic("");}}>{letter==="ALL"?"All":letter}</button>)}
    </nav>
    <div className="question-pool-topic-scroll">
      {topicOptions.map(topic=><button type="button" key={topic.key} className={`question-pool-topic${activeTopic?.key===topic.key?" is-selected":""}`} onClick={()=>setSelectedTopic(topic.key)}>
       <span>{topic.title}</span>
       <small>{topic.questions.length} {topic.questions.length===1?"question":"questions"}</small>
      </button>)}
     </div>
    </aside>
    <article className="question-pool-detail">
     <div className="question-pool-column-heading">Question Pool</div>
     <div className="question-pool-card">
      <header><h2>{activeTopic.title}</h2><span>{activeTopic.questions.length} {activeTopic.questions.length===1?"question":"questions"}</span></header>
      {!visibleQuestions.length?<p className="question-pool-empty">{researchFilter==="needs-research"?"No questions are marked Needs research. Open a question and set its Research status to add it here.":researchFilter==="researched"?"No questions are marked Researched.":"No questions match this filter."}</p>:<ol>{visibleQuestions.map(question=><li key={question.key} className={question.researched?"is-researched":""}>
       <div className="question-pool-question-row">
        <input className="question-pool-checkbox" type="checkbox" id={`question-${question.key}`} checked={question.answered||question.researched} disabled={question.answered||savingQuestion===question.key} onChange={()=>setResearchStatus(question,question.researched?"none":"researched")} aria-label={`Mark ${question.text} as researched`}/>
        <button type="button" className={`question-pool-question-link${selectedQuestion?.key===question.key?" is-selected":""}`} onClick={()=>selectQuestion(question)}>{question.text}</button><small className="question-answer-status">{question.answered?"Answered":"Unanswered"}{question.needsResearch?" · Needs research":question.researched?" · Researched":""}</small>
       </div>
      </li>)}</ol>}
     </div>
    </article>
   </section>}
     {selectedQuestion&&<Modal show onHide={requestCloseAnswerCard} centered scrollable size="xl" backdrop="static" keyboard={!savingAnswer} className="question-answer-modal" aria-labelledby="question-answer-modal-title">
      <Modal.Header closeButton={!savingAnswer}><Modal.Title id="question-answer-modal-title">{selectedQuestion.text}</Modal.Title></Modal.Header>
      <Modal.Body>
      {error&&<Alert variant="danger">{error}</Alert>}
      <p className="question-answer-source">From <Link to={`/notes/${sourceZettel._id}`}>{selectedQuestion.topicTitle}</Link></p>
      <Form.Group className="question-research-status">
       <Form.Label htmlFor="question-research-status">Research status</Form.Label>
       <Form.Select id="question-research-status" value={selectedQuestion.needsResearch?"needs-research":selectedQuestion.researched?"researched":"none"} disabled={!!savingQuestion} onChange={event=>setResearchStatus(selectedQuestion,event.target.value)}>
        <option value="none">Not marked for research</option>
        <option value="needs-research">Needs research</option>
        <option value="researched">Researched</option>
       </Form.Select>
      </Form.Group>
      <Tabs key={selectedQuestion.key} defaultActiveKey="answer" className="question-answer-tabs">
       <Tab eventKey="answer" title="Answer">
      {savedAnswer&&!editingAnswer?<>
       <RichTextContent value={savedAnswer} className="question-answer-content"/>
       <div className="d-flex flex-wrap gap-2 mt-3">
        <button type="button" className="btn btn-primary" onClick={()=>{setAnswer(savedAnswer);setEditingAnswer(true);}}>Edit</button>
        <button type="button" className="btn btn-outline-danger" onClick={deleteAnswer} disabled={savingAnswer}>{savingAnswer?"Deleting…":"Delete"}</button>
        <button type="button" className="btn btn-outline-secondary" onClick={requestCloseAnswerCard}>Close</button>
       </div>
      </>:<>
       <Form.Label htmlFor="question-answer-editor">Your answer</Form.Label>
       <div id="question-answer-editor"><RichTextEditor key={selectedQuestion.key} value={answer} onChange={setAnswer} placeholder="Write your answer here…" minHeight="12rem" disabled={savingAnswer}/></div>
       <div className="d-flex flex-wrap gap-2 mt-3">
        <button type="button" className="btn btn-primary" onClick={saveAnswer} disabled={savingAnswer||answer===savedAnswer||!richTextToPlainText(answer).trim()}>{savingAnswer?"Saving…":"Save answer"}</button>
        <button type="button" className="btn btn-outline-secondary" onClick={cancelAnswer} disabled={savingAnswer}>Cancel</button>
       </div>
      </>}
       </Tab>
       <Tab eventKey="context" title="Source note & related questions">
      <section className="question-answer-notes">
       <h3>{sourceZettel.title}</h3><RichTextContent value={sourceZettel.mainIdea}/><RichTextContent value={sourceZettel.body}/>
       <h3>Other questions from this note</h3>
       <ul>{topics.flatMap(topic=>topic.questions).filter(question=>question.zettelObjectId===selectedQuestion.zettelObjectId&&question.key!==selectedQuestion.key).map(question=><li key={question.key}><button type="button" className="question-pool-question-link" onClick={()=>selectQuestion(question)}>{question.text}</button> <small>{question.answered?"Answered":"Unanswered"}</small></li>)}</ul>
      </section>
       </Tab>
      </Tabs>
      </Modal.Body>
     </Modal>}
 </Container>;
}
