// src/pages/methods/FEASTMethod.jsx
import {useEffect,useState} from "react";
import {useIcons} from "@shared";
import BibleStudyMethodTemplate from "../../components/BibleStudyMethodTemplate.jsx";

function FEASTMethod(){

 const{FontAwesomeIcons}=useIcons();
 const[method,setMethod]=useState(null);
 const[loading,setLoading]=useState(true);
 const[error,setError]=useState("");

 useEffect(()=>{
  let isMounted=true;

  const fetchMethod=async()=>{
   try{
    setLoading(true);
    setError("");

    const res=await fetch("/api/methods/slug/feast-bible-study-method");
    const result=await res.json();

    if(!res.ok)throw new Error(result.message||"Failed to fetch FEAST method");

    if(isMounted)setMethod(result.data||null);
   }
   catch(err){
    if(isMounted)setError(err.message||"Failed to fetch FEAST method");
   }
   finally{
    if(isMounted)setLoading(false);
   }
  };

  fetchMethod();

  return()=>{
   isMounted=false;
  };
 },[]);

 if(loading){
  return(
   <div className="container py-4">
    <div className="alert alert-info mb-0">Loading method...</div>
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

 if(!method){
  return(
   <div className="container py-4">
    <div className="alert alert-warning mb-0">FEAST method not found.</div>
   </div>
  );
 }

 return(
  <BibleStudyMethodTemplate
   title={method.title||"FEAST Method"}
   subtitle={method.subtitle||"How to Feast on the Word of God"}
   icon={method.icon||FontAwesomeIcons.Bible}
   description={method.description||method.overview||method.whatIsThisMethod||"The FEAST Method helps the reader slow down with Scripture by focusing the heart, engaging the passage, assessing the meaning, sparking personal transformation, and turning back to God in worshipful response."}
   purpose={method.purpose||method.whyUseThisMethod||"To move from reading Scripture quickly to receiving it personally, thoughtfully, and prayerfully."}
   bestFor={method.bestFor?.length?method.bestFor:[
    "Personal devotional study",
    "Short daily Bible reading",
    "Journaling Scripture responses",
    "Turning Bible reading into prayer",
    "Applying one passage personally"
   ]}
   steps={method.steps?.length?method.steps:[
    {
     title:"Focus",
     content:"Ask God to focus your heart and mind on Him. Begin with the question: What do You want me to learn today?",
     order:1
    },
    {
     title:"Engage",
     content:"Read the passage carefully and engage it by writing down your observations. Ask: What does it say?",
     order:2
    },
    {
     title:"Assess",
     content:"Assess the main idea of the passage. Consider what it meant to the original audience before applying it to yourself.",
     order:3
    },
    {
     title:"Spark",
     content:"Ask the Holy Spirit to spark transformation in your life. Ask: How does this apply to me?",
     order:4
    },
    {
     title:"Turn",
     content:"Turn your mind and heart toward God in worship, prayer, obedience, and response. Ask: How should I respond to God?",
     order:5
    }
   ]}
   keyQuestions={method.keyQuestions?.length?method.keyQuestions:[
    "What does God want me to learn today?",
    "What does the passage say?",
    "What did this mean to the original audience?",
    "How does this apply to me?",
    "How should I respond to God?"
   ]}
   strengths={method.strengths?.length?method.strengths:(method.benefits?.length?method.benefits:[
    "Simple and memorable structure",
    "Strong devotional focus",
    "Connects observation with application",
    "Encourages prayerful response",
    "Works well with journaling"
   ])}
   cautions={method.cautions?.length?method.cautions:(method.commonMistakes?.length?method.commonMistakes:[
    "Do not skip the original meaning of the passage.",
    "Do not make the application before observing the text.",
    "Do not turn the method into only emotional reflection.",
    "Do not ignore context when assessing meaning."
   ])}
   example={{
    reference:method.example?.reference||"",
    summary:method.example?.summary||"",
    points:[
     method.example?.observation?`Observation: ${method.example.observation}`:"",
     method.example?.interpretation?`Interpretation: ${method.example.interpretation}`:"",
     method.example?.application?`Application: ${method.example.application}`:"",
     method.example?.prayer?`Prayer: ${method.example.prayer}`:"",
     method.example?.memoryVerse?`Memory Verse: ${method.example.memoryVerse}`:"",
     method.example?.journal?`Journal: ${method.example.journal}`:""
    ].filter(Boolean)
   }}
   relatedScriptures={method.relatedScriptures?.length?method.relatedScriptures:[
    "Psalm 119:18",
    "Psalm 119:105",
    "James 1:22",
    "Colossians 3:16",
    "Psalm 46:10"
   ]}
   tools={method.tools?.length?method.tools:(method.requiredTools?.length?method.requiredTools:[
    "Bible",
    "Notebook or journal",
    "Pen",
    "Quiet place",
    "Prayerful attention"
   ])}
   tips={method.studyTips?.length?method.studyTips:(method.preparationTips?.length?method.preparationTips:[
    "Start with a short passage.",
    "Write one clear observation before moving on.",
    "Separate original meaning from personal application.",
    "End by writing a prayer response.",
    "Choose one action step to live out."
   ])}
   closing={method.closing||method.disciplineReminder||method.spiritualOutcome||"Feast on the Word slowly enough that Scripture shapes your heart, renews your mind, and turns you back toward God."}
  />
 );
}

export default FEASTMethod;
