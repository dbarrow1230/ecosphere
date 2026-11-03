import {useEffect,useMemo,useState} from "react";
import {useNavigate,useParams} from "react-router-dom";
import axios from "axios";
import {Button,Modal,Spinner} from "react-bootstrap";
import SmartGoalForm from "./forms/SmartGoalsForm.jsx";
import WeeklySessionForm from "./forms/WeeklySessionForm.jsx";
import TimeSheetForm from "./forms/TimeSheetForm.jsx";
import MentorNoteForm from "./forms/MentorNoteForm.jsx";
import "../styles/MentorshipTrackerPage.css";

const initialTracker={
 program:"",courseNumber:"",courseName:"",courses:[],changeNoticeHours:1,suggestions:[],research:[],actionPlanNotes:"",
 alignment:{goalsRelevant:true,hoursOnTrack:true,menteeEngaged:true,meetingPlanWorking:true,notes:""}
};
const viewTabs=[
 ["profile","Profile"],["agreement","Agreement"],["sessions","Mentoring Log"],["timesheets","Timesheets"],
 ["goals","SMART Goals"],["notes","Notes to Self"],["guidance","Guidance & Plan"],["summary","Summary"],["questions","Questions"],["reference","Mentor Reference"]
];
const editTabs=[["course","Course & Agreement"],["sessions","Mentoring Log"],["timesheets","Timesheets"],["goals","SMART Goals"],["notes","Notes to Self"],["guidance","Guidance"],["summary","Summary Snapshot"],["alignment","Alignment"],["plan","Action Plan"]];
const mentorReferenceSections=[
 {
  title:"Mentor Benefits",
  paragraphs:[
   "Mentoring is a valuable tool for developing our most important asset, the student. A successful mentoring process relies on partners sharing common goals and expectations, committing to the mentoring relationship, and building mutual trust and respect.",
   "Both the mentor and the mentee grow and give back through the mentoring process. As a mentor, you have the chance to reflect on your accomplishments and challenges as a reminder of the lessons you’ve learned. By sharing your expertise, you create a legacy and help guide someone else’s career path. This also allows you to review and reenergize your personal career goals."
  ],
  items:["Personal satisfaction in helping someone grow professionally","Learning from the mentee","Building new relationships","Developing your skill as a teacher—helping someone clarify their career goals","Developing your skill as a guide—helping someone navigate the waters of the SPH","Developing your skill as an advisor—helping someone find their strengths and weaknesses"]
 },
 {
  title:"Choosing a Mentoring Partnership",
  paragraphs:["As you reflect on being a mentor, think about whom you would like as a mentee and what you would like to impart. After all, this will be a partnership."],
  items:["Do you want someone who seems to be following your exact career path?","Do you want someone who has skills in which you have strengths?","Do you want someone who has different or similar skills compared to you?","Do you want someone who has an interest in skills and knowledge similar to yours, but does not possess those competencies now?","Do you want someone who is motivated by upward mobility?"]
 },
 {
  title:"Mentor Roles and Responsibilities",
  paragraphs:["Development of your mentee depends on exploring career aspirations, strengths, and weaknesses, collaborating on means to get there, implementing strategies, and evaluating along the way. You, as the mentor, provide the light for the mentee to follow. Sharing your wisdom and past experiences is what the mentee looks for."],
  items:["Support the mentee’s development of professional and interpersonal competencies through strategic questioning, goal setting, and planning.","Create a supportive and trusting environment.","Agree to, and schedule, uninterrupted time with your mentee.","Stay accessible, committed, and engaged during the length of the program.","Actively listen and question.","Give feedback to the mentee on their goals, situations, plans, and ideas.","Encourage your mentee by giving genuine, positive reinforcement.","Serve as a positive role model.","Provide frank and kind corrective feedback, if necessary.","Openly and honestly share lessons learned from your own experience.","Keep discussions on track.","Respect your mentee’s time and resources.","Participate in the scheduled events for the program.","Seek assistance if questions arise that you cannot answer."]
 },
 {
  title:"Practical Questioning Tips for Mentors",
  paragraphs:["As a mentor, it can be very tempting to jump in and solve your mentee’s problems for them. However, your role is to help the mentee think for themselves, and to do that, you need to ask thought-provoking questions. Help your partner self-discover. Questions should usually be open-ended, meaning they cannot be answered with just one word.","We want you to be a questioning coach. Use questions to help your mentee reflect on their experiences and learn from yours."],
  items:["Uncover additional facts and information about your mentee.","Confirm your mentee’s goals, aspirations, and needs.","Explore strong feelings about situations.","Define problems and possible solutions.","Discover your mentee’s commitment to their growth."]
 },
 {
  title:"Exploratory Questions",
  paragraphs:["Use these questions to assess the real issues and gain a greater understanding."],
  items:["What are the most interesting aspects of your job?","Why did you pick this to concentrate on?","What do you want to gain?","What do you want to be known for?","What do you understand the issue to be?","What tells you that your assessment is correct? What are other people’s perceptions of this issue?","What assumptions are you making here?","What other ideas do you have?","How long has this been an issue?","What did you learn from past experiences that you didn’t expect to learn?","What are the reasons behind an issue?","Have you tried to resolve this issue before? Why or why not? If yes, what was the result?","What choices do you have?","What progress have you made?","How are you using the things or ideas we’ve spoken about?","What results are you looking for?"]
 },
 {
  title:"Empowering Questions",
  paragraphs:["Use these questions to assist the mentee to think for themself."],
  items:["What are the skills you want to develop?","What strategies come to mind when looking at a situation?","What do you see as possible solutions here?","What outcomes are you after here? Are these outcomes reasonable given the circumstances?","What resources are available to help you move forward?","What key players do you need help from?","What forces may help and/or hinder you?","What other information do you need to arrive at a solution?","What are the pros and cons of each solution?","What is the first step you need to take to achieve your preferred outcome?","What alternative strategies should you develop?","How will you know you have mastered or successfully enhanced a competency?","How will you apply your new skill?"]
 },
 {
  title:"Giving Feedback—Checklist for Mentors",
  paragraphs:["Think of feedback as a teaching or counseling opportunity. Exhibit positive or neutral body language.","Use I statements. Give examples from your experience. Don’t say “but” or “however.” Avoid statements that describe someone instead of their actions. Ensure feedback is specific.","Give the other person an opportunity to ask questions or share their viewpoint. Listen carefully not only to the words but also to the feelings and body language of the speaker. Don’t become defensive. Don’t interrupt when the other person is responding.","Allow time and privacy for feedback—avoid or minimize distractions and set aside uninterrupted time for your feedback session."],
  items:["Do use good eye contact.","Do use an interested or neutral facial expression.","Do nod your head to show understanding or agreement.","Do use a calm tone of voice and even voice volume.","Do sit slightly forward with relaxed arm and hand placement.","Do not reduce eye contact, scowl, or narrow your eyes.","Do not use a tense or aggressive posture.","Do not rock, bounce a pen, wring your hands, or use defensive gestures.","Do not place hands on hips, clench them tightly, cross arms tightly, or use a blank expression."]
 },
 {
  title:"Help Your Mentee Plan for Next Steps",
  paragraphs:["Ask questions such as:"],
  items:["What is a step you can take to reach your desired outcome?","What are some ways you can think of to resolve this challenge?","What resources are available to you?","What can I do to help you?"]
 },
 {
  title:"Tips for Being a Good Listener",
  paragraphs:["Be an active listener."],
  items:["Give the person your undivided attention.","Stay off your phone and computer and avoid disruptions.","Hear the person out without interrupting.","Be aware of non-verbal cues such as nodding, smiling, and maintaining eye contact.","Rephrase: “As I understand…”, “So, you’re saying that…”, or “Let me see if I got that…”","Summarize: “So, your three concerns are…”, “There seem to be a few issues…”, or “So, our main goals this time are…”"]
 },
 {
  title:"Initiating a Conversation",
  paragraphs:[
   "Dear Mr. Jones,",
   "My name is Joan Smith, and I am a student in the [Program] program. Thank you for volunteering your time to provide guidance and support to Escoffier students. I am interested in [Career Interest] after I graduate from Escoffier. I see from your profile that you [Profile Connection].",
   "Would you be willing to meet with me for 20 minutes within the next two weeks to discuss [Project, Goals, or Questions]? I would appreciate the opportunity to meet with you to get feedback and any advice on how I can advance my career.",
   "Thank you for your time! Warm regards, [Your Name]"
  ],
  items:[]
 }
];
const date=value=>value?new Date(value).toLocaleDateString("en-US",{timeZone:"UTC"}):"—";
const name=value=>`${value?.firstName||""} ${value?.lastName||""}`.trim();
const asId=value=>String(value?._id||value||"");
const phone=value=>{
 const digits=String(value||"").replace(/\D/g,"").slice(-10);
 return digits.length===10?`(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`:value||"—";
};
const website=value=>value&&!/^https?:\/\//i.test(value)?`https://${value}`:value;

const courseChoicesFor=mentee=>{
 const choices=[];
 (Array.isArray(mentee?.programs)?mentee.programs:[]).forEach(program=>{
  const programId=asId(program);
  const courses=Array.isArray(program?.courses)?program.courses:[];
  if(courses.length){
   courses.forEach((course,index)=>choices.push({
    key:`${programId}:${course.courseNumber||course.courseName||index}`,
    programId,courseId:asId(course),programName:program.courseName||"Unnamed program",
    courseNumber:course.courseNumber||"",courseName:course.courseName||""
   }));
  }
 });
 return choices;
};

export default function MentorshipTrackerPage({user}){
 const {id}=useParams();
 const navigate=useNavigate();
 const [data,setData]=useState({mentee:null,sessions:[],timesheets:[],goals:[],notes:[]});
 const [tracker,setTracker]=useState(initialTracker);
 const [form,setForm]=useState(initialTracker);
 const [menteeDraft,setMenteeDraft]=useState({});
 const [meetingMethods,setMeetingMethods]=useState([]);
 const [availablePrograms,setAvailablePrograms]=useState([]);
 const [activeTab,setActiveTab]=useState("profile");
 const [editTab,setEditTab]=useState("course");
 const [showEdit,setShowEdit]=useState(false);
 const [selectedGoal,setSelectedGoal]=useState(null);
 const [selectedSession,setSelectedSession]=useState(null);
 const [selectedTimesheet,setSelectedTimesheet]=useState(null);
 const [selectedNote,setSelectedNote]=useState(null);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");

 const courseChoices=useMemo(()=>courseChoicesFor({programs:availablePrograms}),[availablePrograms]);
 const selectedCourses=Array.isArray(tracker.courses)&&tracker.courses.length?tracker.courses:
  (tracker.courseName||tracker.courseNumber?[{
   program:asId(tracker.program),programName:tracker.program?.courseName||"",
   courseNumber:tracker.courseNumber||"",courseName:tracker.courseName||""
  }]:[]);
 const selectedPrograms=[...new Set(selectedCourses.map(course=>course.programName).filter(Boolean))];

 const load=async()=>{
  try{
   setLoading(true);setError("");
   const [menteeRes,sessionsRes,timesheetsRes,goalsRes,notesRes,trackerRes,methodsRes,programsRes]=await Promise.all([
    axios.get(`/api/mentees/${id}`),axios.get(`/api/weekly-sessions/mentee/${id}`),
    axios.get(`/api/timesheets/mentee/${id}`),axios.get(`/api/smart-goals/mentee/${id}`),
    axios.get(`/api/mentor-notes/mentee/${id}`),axios.get(`/api/mentorship-trackers/${id}`),axios.get("/api/meeting-methods"),axios.get("/api/programs")
   ]);
   const mentee=menteeRes.data?.mentee;
   const saved=trackerRes.data?.tracker||initialTracker;
   const choices=courseChoicesFor(mentee);
   const first=choices[0];
   const normalized={
    ...initialTracker,...saved,
    program:asId(saved.program)||first?.programId||"",
    courseNumber:saved.courseNumber||first?.courseNumber||"",
    courseName:saved.courseName||first?.courseName||"",
    courses:Array.isArray(saved.courses)&&saved.courses.length?saved.courses.map(course=>({...course,program:asId(course.program)})):
     (saved.courseName||first?[{
      program:asId(saved.program)||first?.programId||"",programName:saved.program?.courseName||first?.programName||"",
      courseNumber:saved.courseNumber||first?.courseNumber||"",courseName:saved.courseName||first?.courseName||""
     }]:[]),
    alignment:{...initialTracker.alignment,...saved.alignment}
   };
   setData({
    mentee,sessions:sessionsRes.data?.weeklySessions||[],timesheets:timesheetsRes.data?.timesheets||[],
    goals:goalsRes.data?.smartGoals||[],notes:notesRes.data?.mentorNotes||[]
   });
   setTracker(normalized);setForm(normalized);
   setMenteeDraft(mentee||{});
   setMeetingMethods(Array.isArray(methodsRes.data)?methodsRes.data:methodsRes.data?.meetingMethods||[]);
   setAvailablePrograms(Array.isArray(programsRes.data)?programsRes.data:programsRes.data?.programs||[]);
  }catch(err){setError(err.response?.data?.message||"Failed to load mentorship tracker.");}
  finally{setLoading(false);}
 };
 useEffect(()=>{load();},[id]);

 const openEdit=()=>{
  const assignedProgramIds=(data.mentee?.programs||[]).map(asId);
  const assignedPrograms=availablePrograms.filter(program=>assignedProgramIds.includes(asId(program)));
  const expandedCourses=assignedPrograms.flatMap(program=>(program.courses||[]).map(course=>({
   program:asId(program),programName:program.courseName||"Unnamed program",
   courseNumber:course.courseNumber||"",courseName:course.courseName||""
  })));
  const menteeCourses=assignedPrograms.flatMap(program=>(program.courses||[]).map(course=>({
   program:asId(program),course:asId(course)
  })));
  const hoursNeeded=assignedPrograms.reduce((total,program)=>total+Number(program.requiredHours||0),0);
  const first=expandedCourses[0];
  setForm({
   ...tracker,
   courses:expandedCourses,
   program:first?.program||"",
   courseNumber:first?.courseNumber||"",
   courseName:first?.courseName||""
  });
  setMenteeDraft({...data.mentee,courses:menteeCourses,hoursNeeded});
  setEditTab("course");
  setShowEdit(true);
 };
 const closeEdit=()=>{setForm(tracker);setMenteeDraft(data.mentee||{});setShowEdit(false);};
 const updateMentee=(key,value)=>setMenteeDraft(previous=>({...previous,[key]:value}));
 const toggleProgram=programId=>{
  const program=availablePrograms.find(item=>asId(item)===programId);
  if(!program)return;
  const selected=(menteeDraft.programs||[]).map(asId);
  const removing=selected.includes(programId);
  const programCourseIds=(program.courses||[]).map(course=>asId(course)).filter(Boolean);
  const nextPrograms=removing?(menteeDraft.programs||[]).filter(item=>asId(item)!==programId):[...(menteeDraft.programs||[]),programId];
  const selectedProgramHours=nextPrograms.reduce((total,item)=>{
   const selectedProgram=availablePrograms.find(programItem=>asId(programItem)===asId(item));
   return total+Number(selectedProgram?.requiredHours||0);
  },0);
  setMenteeDraft(previous=>({
   ...previous,
   programs:nextPrograms,
   hoursNeeded:selectedProgramHours,
   courses:removing?(previous.courses||[]).filter(item=>asId(item.program)!==programId):[
    ...(previous.courses||[]).filter(item=>asId(item.program)!==programId),
    ...programCourseIds.map(course=>({program:programId,course}))
   ]
  }));
  setForm(previous=>{
   const retained=(previous.courses||[]).filter(course=>asId(course.program)!==programId);
   const added=removing?[]:(program.courses||[]).map(course=>({
    program:programId,programName:program.courseName||"Unnamed program",
    courseNumber:course.courseNumber||"",courseName:course.courseName||""
   }));
   const courses=[...retained,...added];
   const first=courses[0];
   return {...previous,courses,program:first?.program||"",courseNumber:first?.courseNumber||"",courseName:first?.courseName||""};
  });
 };
 const openGoalForm=goal=>setSelectedGoal(goal||null);
 const saveGoal=async payload=>{
  if(payload._id){
   const {_id,...update}=payload;
   await axios.put(`/api/smart-goals/${_id}`,update);
  }else{
   await axios.post("/api/smart-goals/create",payload);
  }
  setSelectedGoal(null);
  await load();
 };
 const deleteGoal=async goalId=>{
  await axios.delete(`/api/smart-goals/${goalId}`);
  setSelectedGoal(null);
  await load();
 };
 const recordSaved=async()=>{setSelectedSession(null);setSelectedTimesheet(null);setSelectedNote(null);await load();};
 const saveTimesheet=async payload=>{
  const {_id,...body}=payload;
  if(_id)await axios.put(`/api/timesheets/${_id}`,body);
  else await axios.post("/api/timesheets/create",body);
  await recordSaved();
 };
 const deleteTimesheet=async recordId=>{await axios.delete(`/api/timesheets/${recordId}`);await recordSaved();};
 const saveNote=async payload=>{
  const {_id,...body}=payload;
  if(_id)await axios.put(`/api/mentor-notes/${_id}`,body);
  else await axios.post("/api/mentor-notes/create",body);
  await recordSaved();
 };
 const deleteNote=async recordId=>{await axios.delete(`/api/mentor-notes/${recordId}`);await recordSaved();};
 const toggleCourse=key=>{
  const choice=courseChoices.find(item=>item.key===key);
  if(!choice)return;
  setMenteeDraft(current=>{
   const currentCourses=Array.isArray(current.courses)?current.courses:[];
   const savedExists=currentCourses.some(item=>asId(item.program)===choice.programId&&asId(item.course)===choice.courseId);
   const updated=savedExists?currentCourses.filter(item=>!(asId(item.program)===choice.programId&&asId(item.course)===choice.courseId)):
    [...currentCourses,{program:choice.programId,course:choice.courseId}];
   return {...current,courses:updated};
  });
  setForm(previous=>{
   const courses=Array.isArray(previous.courses)?previous.courses:[];
   const exists=courses.some(course=>asId(course.program)===choice.programId&&course.courseNumber===choice.courseNumber&&course.courseName===choice.courseName);
   const next=exists?courses.filter(course=>!(asId(course.program)===choice.programId&&course.courseNumber===choice.courseNumber&&course.courseName===choice.courseName)):
    [...courses,{program:choice.programId,programName:choice.programName,courseNumber:choice.courseNumber,courseName:choice.courseName}];
   const first=next[0];
   return {...previous,courses:next,program:first?.program||"",courseNumber:first?.courseNumber||"",courseName:first?.courseName||""};
  });
 };
 const updateAlignment=(key,value)=>setForm(previous=>({...previous,alignment:{...previous.alignment,[key]:value}}));
 const save=async()=>{
  try{
   setSaving(true);setError("");
   const menteePayload={
    ...menteeDraft,
    programs:(menteeDraft.programs||[]).map(asId).filter(Boolean),
    courses:(menteeDraft.courses||[]).map(item=>({program:asId(item.program),course:asId(item.course)})).filter(item=>item.program&&item.course),
   meetingMethod:asId(menteeDraft.meetingMethod)||null,
    currentGoalProgress:menteeDraft.currentGoalProgress||null,
    meetingRegularity:menteeDraft.meetingRegularity||null,
    finalVerification:menteeDraft.finalVerification||null,
    status:asId(menteeDraft.status)||null,
    state:asId(menteeDraft.state)||null,
    country:asId(menteeDraft.country)||null
   };
   delete menteePayload._id;
   delete menteePayload.createdAt;
   delete menteePayload.updatedAt;
   await axios.put(`/api/mentees/${id}`,menteePayload);
   const payload={...form,program:asId(form.program),createdBy:user?._id||user?.id||null};
   const response=await axios.put(`/api/mentorship-trackers/${id}`,payload);
   const saved={...initialTracker,...response.data.tracker,program:asId(response.data.tracker?.program),alignment:{...initialTracker.alignment,...response.data.tracker?.alignment}};
   setTracker(saved);setForm(saved);setShowEdit(false);
  }catch(err){setError(err.response?.data?.message||"Failed to save mentorship tracker.");}
  finally{setSaving(false);}
 };

 if(loading)return <div className="tracker-loading"><Spinner animation="border"/></div>;
 if(!data.mentee)return <div className="tracker-page"><p>{error||"Mentee not found."}</p></div>;
 const mentee=data.mentee;
 const totalHours=data.timesheets.reduce((sum,item)=>sum+Number(item.hours||0),0);

 return <main className="tracker-page">
  <header className="tracker-page-header">
   <div><small>Externship Mentor Tracker</small><h1>{name(mentee)}</h1>
    <p className="tracker-selected-course"><strong>Selected Course:</strong><span>{selectedCourses.length?selectedCourses.map(course=>`${course.courseNumber?`${course.courseNumber} — `:""}${course.courseName}`).join(", "):"No course selected"}</span></p>
   </div>
   <div className="tracker-actions">
    <Button variant="secondary" onClick={()=>navigate("/mentees")}>Back</Button>
    <Button onClick={openEdit}>Edit Tracker</Button>
   </div>
  </header>
  {error?<div className="app-feedback app-feedback-danger">{error}</div>:null}

  <SectionTabs tabs={viewTabs} active={activeTab} onChange={setActiveTab} label="Tracker sections"/>

  {activeTab==="profile"?<section className="tracker-profile"><h2>Mentorship Profile</h2>
   <div className="tracker-paper-profile">
    <PaperRow><Field label="Mentee" value={name(mentee)}/></PaperRow>
    <PaperRow><Field label="Program" value={selectedPrograms.join(", ")||"—"}/></PaperRow>
    <PaperRow><Field label="Course" value={selectedCourses.length?selectedCourses.map(course=>`${course.courseNumber?`${course.courseNumber} — `:""}${course.courseName}`).join(", "):"—"}/></PaperRow>
    <PaperRow><Field label="Externship Start" value={date(mentee.externshipStartDate)}/><Field label="Externship End" value={date(mentee.externshipEndDate)}/></PaperRow>
    <PaperRow><Field label="Business" value={mentee.businessName||"—"}/><Field label="Website" value={mentee.website?<a href={website(mentee.website)} target="_blank" rel="noreferrer">{mentee.website}</a>:"—"}/></PaperRow>
    <PaperRow><Field label="Phone" value={phone(mentee.phone)}/><Field label="Email" value={mentee.email?<a href={`mailto:${mentee.email}`}>{mentee.email}</a>:"—"}/></PaperRow>
    <PaperRow><Field label="Hours Needed" value={mentee.hoursNeeded||150}/><Field label="Hours Recorded" value={totalHours}/></PaperRow>
   </div>
  </section>:null}

  {activeTab==="agreement"?<section><h2>Mentoring Agreement</h2>
   <p>Mentorship is a mutual commitment, both personal and professional, to growth. As an alumni mentor, my goal is to support you during your externship by offering guidance, perspective, and accountability as you work toward your business objectives. This document outlines our approach to communication and collaboration. It is meant to keep us aligned—not as a contract, but as a tool to clarify expectations and help you maximize this experience. Please review the sections carefully and keep a copy for your reference. We will revisit it as needed throughout your externship.</p>
   <h3>What I Expect from My Mentees</h3>
   <p>I expect us to communicate openly and consistently so we can build a strong, respectful mentoring relationship. That means being honest about your goals, strengths, challenges, and any personal factors that might affect how you work or what support you need.</p>
   <p>I expect you to take ownership of your externship experience. This is your opportunity to apply your learning in a real business context, whether it’s your own business or a partner organization. I’m here to mentor, not manage. I will support you, challenge you when needed, and share insight from my experience as a graduate and working professional. But you are responsible for showing up, following through, and driving your progress.</p>
   <p>I expect you to approach this relationship with professionalism and commitment, treating it like any other part of your business growth. That includes preparing for meetings, following up on action steps, and being accountable. I’m here to help you succeed, but that only works if we both take this seriously.</p>
   <p>Don’t worry about impressing me, I’m not evaluating you for a grade or writing a recommendation letter (unless requested and appropriate). I’m here because I want to see you grow. I’ll give you honest feedback, help you think critically about your decisions, and support your development not just as a student, but as a future business owner and leader.</p>
   <h3>What My Mentees Can Expect from Me</h3>
   <p>I commit to supporting your growth not just as a student, but as a budding professional and entrepreneur. Whether you're starting your own business or gaining experience through an externship, I’ll help you think critically, set achievable goals, and reflect on your progress. I’ll ask questions that challenge you to grow, not to judge, but to help you sharpen your mindset and decision-making skills.</p>
   <p>I commit to showing up. I’m balancing my career, projects, and responsibilities, but I take this mentorship seriously. I limit the number of people I mentor because I want to give each relationship my attention and respect. You can expect me to listen, provide honest feedback, and meet regularly based on what we agree works best. If you need more support, please don't hesitate to ask. I’m here for you.</p>
   <div className="tracker-paper-profile">
    <PaperRow><Field label="Preferred Day" value={mentee.preferredMeetingDay||"—"}/><Field label="Meeting Time" value={mentee.preferredMeetingTime||"—"}/></PaperRow>
    <PaperRow><Field label="Frequency" value={mentee.meetingFrequency||"—"}/><Field label="Duration" value={mentee.meetingDuration?`${mentee.meetingDuration} minutes`:"—"}/></PaperRow>
    <PaperRow><Field label="Best Contact Method" value={mentee.meetingMethod?.name||"—"}/><Field label="Change Notice" value={`${tracker.changeNoticeHours} hours`}/></PaperRow>
   </div>
   <p className="tracker-template-notice">Should unforeseen circumstances/events arise resulting in changes to the meeting time/day, we will give our mentoring partner at least <strong>{tracker.changeNoticeHours}</strong> hour(s) notice if possible.</p>
  </section>:null}

  {activeTab==="sessions"?<TrackerTable title="Mentoring Log" headers={["Date","Time","Competency Discussed","Action Plan Step","How & When Completed","Notes / Follow-up"]} rows={data.sessions.map(item=>[
    date(item.sessionDate),item.sessionDate?new Date(item.sessionDate).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):"—",
    item.competencyDiscussed||"—",item.actionPlanStep||"—",item.howWhenCompleted||"—",item.notes||"—"
   ])}/>:null}
  {activeTab==="timesheets"?<TrackerTable title="Externship Timesheets" headers={["Week","Week Starting","Week Ending","Total Hours","Status"]} rows={data.timesheets.map(item=>[
    item.weekNumber,date(item.weekStarting),date(item.weekEnding),item.hours,item.status
   ])}/>:null}
  {activeTab==="goals"?<TrackerTable title="SMART Goals" headers={["Goal","Specific","Measurable","Achievable","Relevant","Time-Bound"]} rows={data.goals.map((item,index)=>[
   index+1,item.specific||"—",item.measurable||"—",item.achievable||"—",item.relevant||"—",item.timeBound||"—"
  ])}/>:null}
  {activeTab==="notes"?<TrackerTable title="Notes to Self (Critical/Flagged Items)" headers={["Date","Category","Risk","Note","Follow-up"]} rows={data.notes.map(item=>[
   date(item.createdAt),item.category,item.riskLevel,item.note,item.followUpRequired?"Required":"No"
  ])}/>:null}
  {activeTab==="guidance"?<section><h2>Guidance & Action Plan</h2>
   <div className="tracker-template-guidance">
    <p>With the mentee, set goals that are focused, realistic, and aligned with their company's objectives. Practical goals should be SMART:</p>
    <dl className="tracker-smart-guide">
     <div><dt>S: Specific:</dt><dd>What, When, Where, Why, and Which?</dd></div>
     <div><dt>M: Measurable:</dt><dd>Metrics and Milestones. How much? What percentage? How can you measure the outcomes of this goal? In days, weeks, or years?</dd></div>
     <div><dt>A: Achievable:</dt><dd>Do you have the skills and tools to accomplish this objective? What else do you need to build? What type of experience and/or training do you need?</dd></div>
     <div><dt>R: Results-oriented:</dt><dd>Does this goal fit with your overall career and life objectives?</dd></div>
     <div><dt>T: Time-based:</dt><dd>Intermediate and final deadlines?</dd></div>
    </dl>
    <p>Focus on competencies that align with the mentee's goals. Build on both your strengths and weaknesses. Seek opportunities to learn through hands-on experience, as well as by observing and listening.</p>
   </div>
   <div className="tracker-guidance-columns"><TrackerList title="Suggestions" value={tracker.suggestions}/><TrackerList title="Research" value={tracker.research}/></div>
   <div className="tracker-notes-row"><strong>Mentee Action Plan:</strong><span>{tracker.actionPlanNotes||"No additional action-plan notes recorded."}</span></div>
  </section>:null}
  {activeTab==="summary"?<section><h2>Mentor Summary Snapshot</h2>
   <div className="tracker-paper-profile">
    <PaperRow><Field label="Mentee Progress Risk Level" value={mentee.riskLevel||"—"}/><Field label="Current SMART Goal Progress" value={mentee.currentGoalProgress||"—"}/></PaperRow>
    <PaperRow><Field label="Meeting Regularity" value={mentee.meetingRegularity||"—"}/><Field label="Final Verification" value={mentee.finalVerification||"—"}/></PaperRow>
   </div>
   <div className="tracker-summary-alignment">
    {[["goalsRelevant","Are goals still relevant to the mentee’s actual business activity?"],["hoursOnTrack","Are we on track to meet the required hours?"],["menteeEngaged","Does the mentee seem motivated, distracted, or overwhelmed?"],["meetingPlanWorking","Do we need to revisit the frequency or format of meetings?"]].map(([key,label])=>
     <div className="tracker-check-row" key={key}><span>{label}</span><strong>{tracker.alignment?.[key]?"Yes":"No"}</strong></div>)}
    <div className="tracker-notes-row"><strong>Alignment Notes:</strong><span>{tracker.alignment?.notes||"—"}</span></div>
   </div>
  </section>:null}
  {activeTab==="questions"?<section><h2>Mentorship Questions</h2>
   <div className="tracker-question-columns">
    <QuestionList title="Questions for Mentee" items={[
     "How can I help you achieve your goals?","What accomplishments are you most proud of? What helped you achieve these goals?",
     "What kind of lifestyle are you looking for?","Why are you interested in this type of work?","What strengths can you bring to this type of work?",
     "What has been your biggest challenge? What did you learn from it?","How often do you ask for feedback to learn more about yourself?",
     "What are you doing now to prepare for your next steps?","How does this fit into your long-term career goals?","What inspired you to seek mentorship?"
    ]}/>
    <QuestionList title="Questions for Mentor" items={[
     "What skills or personal qualities do you feel contribute most to success in this industry?","When were you most satisfied with your career?",
     "What do you wish you had known when you were starting your culinary career?","What are some steps I can take to start my own business?",
     "Where do you draw inspiration from?","How do you manage a healthy work-life balance?",
     "Is there anyone else you know that you think it would be good to talk to, and would you be willing to connect me with them?",
     "What resources have you found to help build your business/career"
    ]}/>
   </div>
  </section>:null}
  {activeTab==="reference"?<section><h2>Mentor Reference</h2>
   <div className="tracker-reference-sections">
    {mentorReferenceSections.map(section=><article key={section.title}>
     <h3>{section.title}</h3>
     {section.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}
     {section.items.length?<ul>{section.items.map(item=><li key={item}>{item}</li>)}</ul>:null}
    </article>)}
   </div>
  </section>:null}

  <TrackerEditModal show={showEdit} onClose={closeEdit} onSave={save} saving={saving} tabs={editTabs} activeTab={editTab} setActiveTab={setEditTab}
   form={form} setForm={setForm} choices={courseChoices} toggleCourse={toggleCourse} updateAlignment={updateAlignment}
   mentee={mentee} menteeDraft={menteeDraft} updateMentee={updateMentee} meetingMethods={meetingMethods}
   availablePrograms={availablePrograms} toggleProgram={toggleProgram} user={user} goals={data.goals} selectedGoal={selectedGoal} openGoalForm={openGoalForm}
   saveGoal={saveGoal} deleteGoal={deleteGoal} sessions={data.sessions} selectedSession={selectedSession} setSelectedSession={setSelectedSession}
   sessionSaved={recordSaved} timesheets={data.timesheets} selectedTimesheet={selectedTimesheet} setSelectedTimesheet={setSelectedTimesheet}
   saveTimesheet={saveTimesheet} deleteTimesheet={deleteTimesheet} notes={data.notes} selectedNote={selectedNote}
   setSelectedNote={setSelectedNote} saveNote={saveNote} deleteNote={deleteNote}/>
 </main>;
}

function SectionTabs({tabs,active,onChange,label}){
 return <nav className="tracker-section-tabs" aria-label={label}>{tabs.map(([key,text])=>
  <button type="button" key={key} className={active===key?"active":""} onClick={()=>onChange(key)}>{text}</button>)}</nav>;
}

function Field({label,value}){return <p><strong>{label}:</strong><span>{value}</span></p>;}
function PaperRow({children}){return <div className="tracker-paper-row">{children}</div>;}

function TrackerTable({title,headers,rows}){
 const table=<div className="tracker-table-wrap"><table><thead><tr>{headers.map(header=><th key={header}>{header}</th>)}</tr></thead><tbody>{rows.length?rows.map((row,index)=><tr key={index}>{row.map((cell,cellIndex)=><td key={cellIndex}>{cell}</td>)}</tr>):<tr><td colSpan={headers.length}>No records.</td></tr>}</tbody></table></div>;
 return title?<section><h2>{title}</h2>{table}</section>:table;
}

function TrackerList({title,value}){
 const list=Array.isArray(value)?value:[];
 return <div className="tracker-list"><h3>{title}</h3><ul>{list.length?list.map((item,index)=><li key={index}>{item}</li>):<li>No items recorded.</li>}</ul></div>;
}

function QuestionList({title,items}){
 return <div className="tracker-question-list"><h3>{title}</h3><ol>{items.map(item=><li key={item}>{item}</li>)}</ol></div>;
}

function TrackerEditModal({show,onClose,onSave,saving,tabs,activeTab,setActiveTab,form,setForm,choices,toggleCourse,updateAlignment,mentee,menteeDraft,updateMentee,meetingMethods,availablePrograms,toggleProgram,user,goals,selectedGoal,openGoalForm,saveGoal,deleteGoal,sessions,selectedSession,setSelectedSession,sessionSaved,timesheets,selectedTimesheet,setSelectedTimesheet,saveTimesheet,deleteTimesheet,notes,selectedNote,setSelectedNote,saveNote,deleteNote}){
 const isSelected=choice=>(form.courses||[]).some(course=>asId(course.program)===choice.programId&&course.courseNumber===choice.courseNumber&&course.courseName===choice.courseName);
 const updateList=(key,value)=>setForm(previous=>({...previous,[key]:value.split("\n")}));
 return <Modal show={show} onHide={onClose} size="lg" backdrop="static" keyboard={false} dialogClassName="tracker-edit-modal">
  <Modal.Header><Modal.Title>Edit Mentor Tracker</Modal.Title></Modal.Header>
  <Modal.Body>
   <SectionTabs tabs={tabs} active={activeTab} onChange={setActiveTab} label="Edit tracker sections"/>
   <div className="tracker-modal-form">
    {activeTab==="course"?<>
     <h3>Mentee and Contact</h3>
     <div className="tracker-form-pair"><TrackerInput label="First Name" value={menteeDraft.firstName} onChange={value=>updateMentee("firstName",value)}/><TrackerInput label="Last Name" value={menteeDraft.lastName} onChange={value=>updateMentee("lastName",value)}/></div>
     <div className="tracker-form-pair"><TrackerInput label="Email" type="email" value={menteeDraft.email} onChange={value=>updateMentee("email",value)}/><TrackerInput label="Phone" value={phone(menteeDraft.phone)==="—"?"":phone(menteeDraft.phone)} onChange={value=>updateMentee("phone",value)}/></div>
     <div className="tracker-form-pair"><TrackerInput label="Business" value={menteeDraft.businessName} onChange={value=>updateMentee("businessName",value)}/><TrackerInput label="Website" value={menteeDraft.website} onChange={value=>updateMentee("website",value)}/></div>
     <h3>Externship and Meeting Preferences</h3>
     <div className="tracker-form-pair"><TrackerInput label="Start Date" type="date" value={dateInput(menteeDraft.externshipStartDate)} onChange={value=>updateMentee("externshipStartDate",value)}/><TrackerInput label="End Date" type="date" value={dateInput(menteeDraft.externshipEndDate)} onChange={value=>updateMentee("externshipEndDate",value)}/></div>
     <div className="tracker-form-pair"><TrackerInput label="Preferred Day" value={menteeDraft.preferredMeetingDay} onChange={value=>updateMentee("preferredMeetingDay",value)}/><TrackerInput label="Preferred Time" type="time" value={menteeDraft.preferredMeetingTime} onChange={value=>updateMentee("preferredMeetingTime",value)}/></div>
     <div className="tracker-form-pair"><TrackerInput label="Duration" type="number" value={menteeDraft.meetingDuration} onChange={value=>updateMentee("meetingDuration",value)}/><TrackerInput label="Frequency" value={menteeDraft.meetingFrequency} onChange={value=>updateMentee("meetingFrequency",value)}/></div>
     <div className="tracker-form-row"><label>Meeting Method:</label><select value={asId(menteeDraft.meetingMethod)} onChange={event=>updateMentee("meetingMethod",event.target.value)}><option value="">Select method</option>{meetingMethods.map(method=><option key={method._id} value={method._id}>{method.name}</option>)}</select></div>
     <h3>Program and Associated Courses</h3>
     <ProgramCourseSelector programs={availablePrograms} selectedPrograms={(menteeDraft.programs||[]).map(asId)} toggleProgram={toggleProgram} choices={choices} isSelected={isSelected} toggleCourse={toggleCourse}/>
     <div className="tracker-form-row"><label htmlFor="tracker-change-notice">Change Notice:</label><input id="tracker-change-notice" type="number" min="0" value={form.changeNoticeHours} onChange={event=>setForm({...form,changeNoticeHours:event.target.value})}/><span>hours</span></div>
    </>:null}
    {activeTab==="guidance"?<>
     <div className="tracker-form-row tracker-form-row-top"><label htmlFor="tracker-suggestions">Suggestions:</label><textarea id="tracker-suggestions" value={(form.suggestions||[]).join("\n")} onChange={event=>updateList("suggestions",event.target.value)} placeholder="Enter one suggestion per line"/></div>
     <div className="tracker-form-row tracker-form-row-top"><label htmlFor="tracker-research">Research:</label><textarea id="tracker-research" value={(form.research||[]).join("\n")} onChange={event=>updateList("research",event.target.value)} placeholder="Enter one research item per line"/></div>
    </>:null}
    {activeTab==="summary"?<>
     <div className="tracker-form-pair">
      <div className="tracker-form-row"><label>Mentee Progress Risk Level:</label><select value={menteeDraft.riskLevel||"low"} onChange={event=>updateMentee("riskLevel",event.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
      <div className="tracker-form-row"><label>Current SMART Goal Progress:</label><select value={menteeDraft.currentGoalProgress||""} onChange={event=>updateMentee("currentGoalProgress",event.target.value)}><option value="">Select progress</option><option value="on-track">On Track</option><option value="needs-revision">Needs Revision</option></select></div>
     </div>
     <div className="tracker-form-pair">
      <div className="tracker-form-row"><label>Meeting Regularity:</label><select value={menteeDraft.meetingRegularity||""} onChange={event=>updateMentee("meetingRegularity",event.target.value)}><option value="">Select regularity</option><option value="consistent">Consistent</option><option value="infrequent">Infrequent</option></select></div>
      <div className="tracker-form-row"><label>Final Verification:</label><select value={menteeDraft.finalVerification||""} onChange={event=>updateMentee("finalVerification",event.target.value)}><option value="">Select verification</option><option value="portal-complete">Portal Complete</option><option value="manual-sheet-needed">Manual Sheet Needed</option></select></div>
     </div>
    </>:null}
    {activeTab==="goals"?<div className="tracker-goal-editor">
     <div className="tracker-goal-list"><button type="button" onClick={()=>openGoalForm(null)}>New SMART Goal</button>{goals.map((goal,index)=><button type="button" key={goal._id} className={selectedGoal?._id===goal._id?"active":""} onClick={()=>openGoalForm(goal)}>Goal {index+1}: {goal.specific}</button>)}</div>
     <SmartGoalForm key={selectedGoal?._id||"new-goal"} initialData={selectedGoal||{}} mode={selectedGoal?"edit":"add"} lockedMentee={mentee} currentUser={user} users={user?[user]:[]} statuses={[]} onSubmit={saveGoal} onDelete={deleteGoal} submitLabel={selectedGoal?"Update Goal":"Create Goal"}/>
    </div>:null}
    {activeTab==="sessions"?<div className="tracker-goal-editor"><RecordPicker label="New Session" records={sessions} selected={selectedSession} setSelected={setSelectedSession} text={item=>`Week ${item.weekNumber||"—"} — ${date(item.sessionDate)}`}/><WeeklySessionForm key={selectedSession?._id||"new-session"} mode={selectedSession?"edit":"create"} menteeId={mentee._id} mentee={mentee} session={selectedSession} user={user} onSuccess={sessionSaved} onCancel={()=>setSelectedSession(null)}/></div>:null}
    {activeTab==="timesheets"?<div className="tracker-goal-editor"><RecordPicker label="New Timesheet" records={timesheets} selected={selectedTimesheet} setSelected={setSelectedTimesheet} text={item=>`Week ${item.weekNumber||"—"}`}/><TimeSheetForm key={selectedTimesheet?._id||"new-timesheet"} initialData={selectedTimesheet||{}} mode={selectedTimesheet?"edit":"add"} lockedMentee={mentee} currentUser={user} users={user?[user]:[]} onSubmit={saveTimesheet} onDelete={deleteTimesheet}/></div>:null}
    {activeTab==="notes"?<div className="tracker-goal-editor"><RecordPicker label="New Note" records={notes} selected={selectedNote} setSelected={setSelectedNote} text={item=>`Week ${item.weekNumber||"—"} — ${item.category||"general"}`}/><MentorNoteForm key={selectedNote?._id||"new-note"} mentees={[mentee]} users={user?[user]:[]} notes={notes} initialData={selectedNote||{}} mode={selectedNote?"edit":"add"} lockedMentee={mentee} currentUser={user} onSubmit={saveNote} onDelete={deleteNote}/></div>:null}
    {activeTab==="alignment"?<>
     {[["goalsRelevant","Are goals still relevant to the mentee’s actual business activity?"],["hoursOnTrack","Are we on track to meet the required hours?"],["menteeEngaged","Does the mentee seem motivated, distracted, or overwhelmed?"],["meetingPlanWorking","Do we need to revisit the frequency or format of meetings?"]].map(([key,label])=>
      <div className="tracker-form-row tracker-alignment-row" key={key}><label>{label}:</label><button type="button" className={form.alignment?.[key]?"is-yes":"is-no"} onClick={()=>updateAlignment(key,!form.alignment?.[key])}>{form.alignment?.[key]?"✓ Yes":"× No"}</button></div>)}
     <div className="tracker-form-row tracker-form-row-top"><label htmlFor="tracker-alignment-notes">Alignment Notes:</label><textarea id="tracker-alignment-notes" value={form.alignment?.notes||""} onChange={event=>updateAlignment("notes",event.target.value)}/></div>
    </>:null}
    {activeTab==="plan"?<div className="tracker-form-row tracker-form-row-top"><label htmlFor="tracker-action-plan">Mentee Action Plan:</label><textarea id="tracker-action-plan" value={form.actionPlanNotes||""} onChange={event=>setForm({...form,actionPlanNotes:event.target.value})}/></div>:null}
   </div>
  </Modal.Body>
  <Modal.Footer><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={onSave} disabled={saving}>{saving?"Saving…":"Save Tracker"}</Button></Modal.Footer>
 </Modal>;
}

function RecordPicker({label,records,selected,setSelected,text}){
 return <div className="tracker-goal-list"><button type="button" onClick={()=>setSelected(null)}>{label}</button>{records.map(item=><button type="button" key={item._id} className={selected?._id===item._id?"active":""} onClick={()=>setSelected(item)}>{text(item)}</button>)}</div>;
}

const dateInput=value=>{
 if(!value)return "";
 const parsed=new Date(value);
 return Number.isNaN(parsed.getTime())?"":parsed.toISOString().slice(0,10);
};

function TrackerInput({label,value,type="text",onChange}){
 return <div className="tracker-form-row"><label>{label}:</label><input type={type} value={value??""} onChange={event=>onChange(event.target.value)}/></div>;
}

function ProgramCourseSelector({programs,selectedPrograms,toggleProgram,choices}){
 const [activeProgram,setActiveProgram]=useState("");
 useEffect(()=>{
  if(!programs.some(program=>asId(program)===activeProgram)){
   setActiveProgram(selectedPrograms[0]||asId(programs[0])||"");
  }
 },[activeProgram,programs,selectedPrograms]);
 const courses=choices.filter(choice=>choice.programId===activeProgram);
 const activeProgramRecord=programs.find(program=>asId(program)===activeProgram);
 const activeProgramSelected=selectedPrograms.includes(activeProgram);
 return <div className="tracker-program-course-selector">
  <div className="tracker-program-column">
   <h4>Programs</h4>
   {programs.map(program=>{
    const programId=asId(program);
    const selected=selectedPrograms.includes(programId);
    return <div className={`tracker-program-option ${activeProgram===programId?"active":""} ${selected?"selected":""}`} key={programId}>
     <input type="checkbox" checked={selected} onChange={()=>{setActiveProgram(programId);toggleProgram(programId);}} aria-label={`Assign ${program.courseName}`}/>
     <button type="button" onClick={()=>setActiveProgram(programId)}>{program.courseName||"Unnamed program"}</button>
    </div>;
   })}
  </div>
  <div className="tracker-program-hours-column">
   <h4>Required Hours</h4>
   <span>{activeProgramRecord?Number(activeProgramRecord.requiredHours||0):"—"}</span>
  </div>
  <div className="tracker-course-column">
   <h4>Courses</h4>
   {courses.length?courses.map(choice=><label key={choice.key} className="tracker-course-choice"><input type="checkbox" checked={activeProgramSelected} readOnly/><span>{choice.courseNumber?`${choice.courseNumber} — `:""}{choice.courseName}</span></label>):<p>No courses available for this program.</p>}
  </div>
 </div>;
}
