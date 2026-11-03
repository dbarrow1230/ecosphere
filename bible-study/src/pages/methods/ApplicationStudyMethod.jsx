// src/pages/methods/ApplicationStudyMethod.jsx
import {useEffect,useState} from "react";
import BibleStudyMethodTemplate from "../../components/BibleStudyMethodTemplate.jsx";

const API_BASE="/api/methods";

function normalizeText(value){
 return String(value||"")
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g,"-")
  .replace(/^-+|-+$/g,"");
}

function findApplicationStudyMethod(methods){
 return methods.find(method=>{
  const titleKey=normalizeText(method.title);
  const slugKey=normalizeText(method.slug);
  const subtitleKey=normalizeText(method.subtitle);

  return(
   titleKey.includes("application-study")||
   titleKey.includes("application-method")||
   titleKey.includes("application")||
   slugKey.includes("application-study")||
   slugKey.includes("application-method")||
   slugKey.includes("application")||
   subtitleKey.includes("application")
  );
 })||null;
}

function ApplicationStudyMethod(){

 const[method,setMethod]=useState(null);
 const[loading,setLoading]=useState(true);
 const[error,setError]=useState("");

 useEffect(()=>{
  let isMounted=true;

  const fetchMethod=async()=>{
   try{
    setLoading(true);
    setError("");

    const res=await fetch(API_BASE);
    const result=await res.json();

    if(!res.ok)throw new Error(result.message||"Failed to fetch Application Study method");

    const methods=Array.isArray(result.data)?result.data:[];
    const matchedMethod=findApplicationStudyMethod(methods);

    if(isMounted)setMethod(matchedMethod);
   }
   catch(err){
    if(isMounted)setError(err.message||"Failed to fetch Application Study method");
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
    <div className="alert alert-warning mb-0">Application Study method not found.</div>
   </div>
  );
 }

 return(
  <BibleStudyMethodTemplate
   title={method.title||"Application Study Method"}
   subtitle={method.subtitle||""}
   icon={method.icon||"📖"}
   description={method.description||method.overview||method.whatIsThisMethod||""}
   purpose={method.purpose||method.whyUseThisMethod||""}
   bestFor={method.bestFor||[]}
   steps={method.steps||[]}
   keyQuestions={method.keyQuestions?.length?method.keyQuestions:(method.reflectionQuestions||[])}
   strengths={method.strengths?.length?method.strengths:(method.benefits||[])}
   cautions={method.cautions?.length?method.cautions:(method.commonMistakes||[])}
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
   relatedScriptures={method.relatedScriptures||[]}
   tools={method.tools?.length?method.tools:(method.requiredTools||[])}
   tips={method.studyTips?.length?method.studyTips:(method.preparationTips||[])}
   closing={method.closing||method.disciplineReminder||method.spiritualOutcome||""}
  />
 );
}

export default ApplicationStudyMethod;