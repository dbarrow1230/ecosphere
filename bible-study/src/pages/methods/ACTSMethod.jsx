// src/pages/methods/ACTSMethod.jsx
import {useEffect,useState} from "react";
import {useLocation,useNavigate} from "react-router-dom";
import {useIcons} from "@shared";
import BibleStudyMethodTemplate from "../../components/BibleStudyMethodTemplate.jsx";

const API_BASE="/api/methods";

const ACTS_KEYS=[
 "acts-bible-study-method",
 "acts-study-method",
 "acts-method",
 "acts"
];

function normalizeText(value){
 return String(value||"")
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g,"-")
  .replace(/^-+|-+$/g,"");
}

function getSlugFromPath(pathname){
 return String(pathname||"")
  .split("/")
  .filter(Boolean)
  .pop();
}

function getMethodList(payload){
 if(Array.isArray(payload))return payload;
 if(Array.isArray(payload?.data))return payload.data;
 if(Array.isArray(payload?.items))return payload.items;
 if(Array.isArray(payload?.results))return payload.results;
 return [];
}

function findACTSMethod(methods){
 return methods.find(method=>{
  const titleKey=normalizeText(method.title);
  const slugKey=normalizeText(method.slug);
  const subtitleKey=normalizeText(method.subtitle);

  return(
   ACTS_KEYS.includes(titleKey)||
   ACTS_KEYS.includes(slugKey)||
   subtitleKey==="ask-chapter-think-scripture"
  );
 })||null;
}

function ACTSMethod(){

 const location=useLocation();
 const navigate=useNavigate();
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

    const res=await fetch(API_BASE);
    const result=await res.json();

    if(!res.ok)throw new Error(result.message||"Failed to fetch ACTS method");

    const methods=getMethodList(result);
    const matchedMethod=findACTSMethod(methods);

    if(!matchedMethod){
     throw new Error("ACTS method not found.");
    }

    const dbSlug=String(matchedMethod.slug||"").trim();
    const currentSlug=getSlugFromPath(location.pathname);

    if(dbSlug&&currentSlug!==dbSlug){
     navigate(`/methods/${dbSlug}`,{replace:true});
    }

    if(isMounted)setMethod(matchedMethod);
   }
   catch(err){
    if(isMounted)setError(err.message||"Failed to fetch ACTS method");
   }
   finally{
    if(isMounted)setLoading(false);
   }
  };

  fetchMethod();

  return()=>{
   isMounted=false;
  };
 },[location.pathname,navigate]);

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
    <div className="alert alert-warning mb-0">ACTS method not found.</div>
   </div>
  );
 }

 return(
  <BibleStudyMethodTemplate
   title={method.title||"ACTS Bible Study Method"}
   subtitle={method.subtitle||"Ask, Chapter, Think, Scripture"}
   icon={method.icon||FontAwesomeIcons.Bible}
   description={method.description||method.overview||method.whatIsThisMethod||"The ACTS Bible Study Method is a simple devotional method that helps the reader ask God for understanding, read the chapter carefully, think about personal application, and write out one Scripture that stands out."}
   purpose={method.purpose||method.whyUseThisMethod||"To help Bible readers slow down, understand a chapter more clearly, and respond to one meaningful verse from the reading."}
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

export default ACTSMethod;