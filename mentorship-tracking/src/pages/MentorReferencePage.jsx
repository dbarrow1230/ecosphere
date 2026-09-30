import {useState} from "react";
import {NavLink,useSearchParams} from "react-router-dom";
import {MessageCircle,MessagesSquare,UserRoundSearch} from "lucide-react";
import {Button,Form,Modal} from "react-bootstrap";
import "../styles/MentorReferencePage.css";

const pages={
 conversation:{title:"Initiating a Conversation",description:"Conversation example supplied by the school.",icon:MessageCircle},
 mentee:{title:"Questions for Your Mentee",description:"School questions for learning about your mentee's goals, experience, and direction.",icon:UserRoundSearch},
 mentor:{title:"Questions for Your Mentor",description:"School questions a mentee may ask during the mentoring relationship.",icon:MessagesSquare}
};

const menteeQuestions=[
 "How can I help you achieve your goals?",
 "What accomplishments are you most proud of? What helped you achieve these goals?",
 "What kind of lifestyle are you looking for?",
 "Why are you interested in this type of work?",
 "What strengths can you bring to this type of work?",
 "What has been your biggest challenge? What did you learn from it?",
 "How often do you ask for feedback to learn more about yourself?",
 "What are you doing now to prepare for your next steps?",
 "How does this fit into your long-term career goals?",
 "What inspired you to seek mentorship?"
];

const mentorQuestions=[
 "What skills or personal qualities do you feel contribute most to success in this industry?",
 "When were you most satisfied with your career?",
 "What do you wish you would have known when you were starting your culinary career?",
 "What are some steps I can take to start my own business?",
 "Where do you draw inspiration from?",
 "How do you manage a healthy work life balance?",
 "Is there anyone else you know that you think it would be good to talk to, and would you be willing to connect me with them?",
 "What resources have you found to be helpful in building your business or career?"
];

const KnifeMarker=()=>(
 <svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M15.5 3.5c2.8 2.2 3.3 5.5 1.2 7.6l-3.2 3.2-3.8-3.8 5.8-7Z"/>
  <path d="m11.5 12.5-8 8"/>
 </svg>
);

const ForkMarker=()=>(
 <svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M7 3v6M10 3v6M13 3v6M7 9c0 2.2 6 2.2 6 0M10 11v10"/>
 </svg>
);

function MentorReferencePage({page="mentee"}){
 const[searchParams]=useSearchParams();
 const menteeId=searchParams.get("mentee")||"";
 const suffix=menteeId?`?mentee=${menteeId}`:"";
 const config=pages[page]||pages.mentee;
 const Icon=config.icon;
 const questions=page==="mentor"?mentorQuestions:menteeQuestions;
 const[showConversationForm,setShowConversationForm]=useState(false);
 const[copyStatus,setCopyStatus]=useState("");
 const[conversation,setConversation]=useState({
  recipient:"",
  studentName:"",
  program:"",
  careerInterest:"",
  profileConnection:"",
  discussionItems:[{type:"Project",value:""}],
  closingName:""
 });
 const updateConversation=event=>setConversation(current=>({...current,[event.target.name]:event.target.value}));
 const updateDiscussionItem=(index,field,value)=>setConversation(current=>({
  ...current,
  discussionItems:current.discussionItems.map((item,itemIndex)=>itemIndex===index?{...item,[field]:value}:item)
 }));
 const addDiscussionItem=()=>setConversation(current=>({...current,discussionItems:[...current.discussionItems,{type:"Question",value:""}]}));
 const removeDiscussionItem=index=>setConversation(current=>({
  ...current,
  discussionItems:current.discussionItems.length===1
   ?[{type:"Project",value:""}]
   :current.discussionItems.filter((item,itemIndex)=>itemIndex!==index)
 }));
 const discussionSummary=conversation.discussionItems
  .filter(item=>item.value.trim())
  .map(item=>`${item.type}: ${item.value.trim()}`)
  .join("; ");
 const completedConversation=`Dear ${conversation.recipient||"[Recipient Name]"},

My name is ${conversation.studentName||"[Your Name]"}, I am a student in the ${conversation.program||"[Program]"} program. Thank you for volunteering your time to provide guidance and support to Escoffier students. I am interested in ${conversation.careerInterest||"[Career Interest]"} after I graduate from Escoffier. I see from your profile that you ${conversation.profileConnection||"[Profile Connection]"}.

Would you be willing to meet with me for 20 minutes in the next two weeks to discuss ${discussionSummary||"[Project, Goals, or Questions]"}? I would appreciate the opportunity to meet with you to get feedback and any advice on how I can advance my career.

Thank you for your time!

Warm regards,
${conversation.closingName||conversation.studentName||"[Your Name]"}`;
 const copyConversation=async()=>{
  await navigator.clipboard.writeText(completedConversation);
  setCopyStatus("Copied");
  setTimeout(()=>setCopyStatus(""),1800);
 };

 return(
  <main className="mentor-reference-page">
   <header className="mentor-reference-header">
    <div>
     <p>Escoffier mentor reference</p>
     <h1><Icon size={28}/>{config.title}</h1>
     <span>{config.description}</span>
    </div>
   </header>

   <nav className="reference-page-navigation" aria-label="School reference pages">
    <NavLink to={`/mentor-reference/initiating-a-conversation${suffix}`} className={({isActive})=>isActive?"active":""}>Initiating a Conversation</NavLink>
    <NavLink to={`/mentor-reference/questions-for-mentee${suffix}`} className={({isActive})=>isActive?"active":""}>Questions for Mentee</NavLink>
    <NavLink to={`/mentor-reference/questions-for-mentor${suffix}`} className={({isActive})=>isActive?"active":""}>Questions for Mentor</NavLink>
   </nav>

   {page==="conversation"?(
   <article className="reference-document reference-letter">
     <div className="reference-document-heading">
      <h2>Initiating a conversation:</h2>
      <Button type="button" variant="dark" onClick={()=>setShowConversationForm(true)}>Open Conversation Form</Button>
     </div>
     <p>Dear Mr. Jones,</p>
     <p>My name is Joan Smith, I am a student in the <span className="reference-blank">__________</span> program. Thank you for volunteering your time to provide guidance and support to Escoffier students. I am interested in <span className="reference-blank">__________</span> after I graduate from Escoffier. I see from your profile that you <span className="reference-blank">__________</span>.</p>
     <p>Would you be willing to meet with me for 20 minutes in the next two weeks to discuss <span className="reference-blank">__________</span> (Project/Goals/Question)? I would appreciate the opportunity to meet with you to get feedback and any advice on how I can advance my career.</p>
     <p>Thank you for your time!</p>
     <p>Warm regards,</p>
    </article>
   ):(
    <article className="reference-document">
     <h2>{config.title}</h2>
     <ul className="reference-question-list">{questions.map((question,index)=>(
      <li key={question}>
       <span className="reference-question-marker">{index%2?<ForkMarker/>:<KnifeMarker/>}</span>
       <span>{question}</span>
      </li>
     ))}</ul>
    </article>
   )}

   <Modal show={showConversationForm} onHide={()=>setShowConversationForm(false)} size="xl" dialogClassName="conversation-form-modal" centered backdrop="static">
    <Modal.Header closeButton><Modal.Title>Initiating a Conversation Form</Modal.Title></Modal.Header>
    <Modal.Body>
     <Form className="conversation-paper-form">
      <p>Dear <Form.Control aria-label="Recipient name" className="conversation-paper-input short" name="recipient" value={conversation.recipient} onChange={updateConversation}/>,</p>
      <p>
       My name is <Form.Control aria-label="Your name" className="conversation-paper-input medium" name="studentName" value={conversation.studentName} onChange={updateConversation}/>,
       I am a student in the <Form.Control aria-label="Program" className="conversation-paper-input medium" name="program" value={conversation.program} onChange={updateConversation}/> program.
       Thank you for volunteering your time to provide guidance and support to Escoffier students.
       I am interested in <Form.Control aria-label="Career interest" className="conversation-paper-input medium" name="careerInterest" value={conversation.careerInterest} onChange={updateConversation}/> after I graduate from Escoffier.
       I see from your profile that you <Form.Control aria-label="Profile connection" className="conversation-paper-input long" name="profileConnection" value={conversation.profileConnection} onChange={updateConversation}/>.
      </p>
      <p>Would you be willing to meet with me for 20 minutes in the next two weeks to discuss:</p>
      <div className="conversation-topic-array">
       {conversation.discussionItems.map((item,index)=>(
        <div className="conversation-topic-row" key={index}>
         <Form.Select aria-label={`Discussion item ${index+1} type`} value={item.type} onChange={event=>updateDiscussionItem(index,"type",event.target.value)}>
          <option value="Project">Project</option>
          <option value="Goal">Goal</option>
          <option value="Question">Question</option>
         </Form.Select>
         <Form.Control aria-label={`Discussion item ${index+1}`} value={item.value} onChange={event=>updateDiscussionItem(index,"value",event.target.value)}/>
         <Button type="button" variant="outline-danger" size="sm" onClick={()=>removeDiscussionItem(index)}>Remove</Button>
        </div>
       ))}
       <Button type="button" variant="outline-dark" size="sm" onClick={addDiscussionItem}>Add Project, Goal, or Question</Button>
      </div>
      <p>I would appreciate the opportunity to meet with you to get feedback and any advice on how I can advance my career.</p>
      <p>Thank you for your time!</p>
      <p>Warm regards,</p>
      <p><Form.Control aria-label="Closing name" className="conversation-paper-input medium" name="closingName" value={conversation.closingName} onChange={updateConversation}/></p>
     </Form>
    </Modal.Body>
    <Modal.Footer>
     <Button variant="outline-dark" onClick={copyConversation}>{copyStatus||"Copy Conversation"}</Button>
     <Button variant="secondary" onClick={()=>setShowConversationForm(false)}>Close</Button>
    </Modal.Footer>
   </Modal>
  </main>
 );
}

export default MentorReferencePage;
