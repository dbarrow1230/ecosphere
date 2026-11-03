import {useEffect,useMemo,useState} from "react";
import {Alert,Button,Card,Form,Modal,Spinner} from "react-bootstrap";
import {Link,useParams} from "react-router-dom";
import {plannerWorkflowSections} from "../../data/plannerWorkflowSections.js";
import CharacterDevelopmentEditor,{CharacterProfilesEditor} from "./editors/CharacterDevelopmentEditors.jsx";
import WorldBuildingEditor from "./editors/WorldBuildingEditors.jsx";
import PlotStructureEditor from "./editors/PlotStructureEditors.jsx";
import ChaptersScenesEditor from "./editors/ChaptersScenesEditors.jsx";
import WritingProgressEditor from "./editors/WritingProgressEditors.jsx";
import ResearchInspirationEditor from "./editors/ResearchInspirationEditors.jsx";
import RevisionEditingEditor from "./editors/RevisionEditingEditors.jsx";
import NotesExtrasEditor from "./editors/NotesExtrasEditors.jsx";
import CharacterDevelopmentView from "./views/CharacterDevelopmentViews.jsx";
import WorldBuildingView from "./views/WorldBuildingViews.jsx";
import PlotStructureView from "./views/PlotStructureViews.jsx";
import ChaptersScenesView from "./views/ChaptersScenesViews.jsx";
import WritingProgressView from "./views/WritingProgressViews.jsx";
import ResearchInspirationView from "./views/ResearchInspirationViews.jsx";
import RevisionEditingView from "./views/RevisionEditingViews.jsx";
import NotesExtrasView from "./views/NotesExtrasViews.jsx";
import {loadCurrentBusiness} from "../../utils/currentBusiness.js";
import "../../styles/PlannerPages.css";
import "../../styles/forms/TargetAudienceDemographicsForm.css";
import "../../styles/forms/WordCountGoalForm.css";
import "../../styles/forms/ProjectOverviewForms.css";

const slugFromPath=path=>path.split("/").filter(Boolean).pop();

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(typeof value==="object"){
  if(typeof value.$oid==="string")return value.$oid;
  if(typeof value._id==="string")return value._id;
  if(typeof value.id==="string")return value.id;
  if(typeof value._id?.$oid==="string")return value._id.$oid;
  if(typeof value.id?.$oid==="string")return value.id.$oid;
 }
 return "";
};

const getStoredUser=()=>{
 const keys=["userInfo","user","authUser","currentUser"];

 for(const key of keys){
  try{
   const raw=localStorage.getItem(key)||sessionStorage.getItem(key);
   if(!raw)continue;
   const parsed=JSON.parse(raw);
   const user=parsed?.user||parsed?.data||parsed;
   if(user&&typeof user==="object")return user;
  }catch{
   // Ignore bad auth cache values.
  }
 }

 return null;
};

const getStoredBookId=()=>{
 try{
  const raw=localStorage.getItem("activePlannerBook");
  if(!raw)return "";
  const parsed=JSON.parse(raw);
  return getObjectId(parsed?._id||parsed?.id||parsed);
 }catch{
  return "";
 }
};

const formatValue=value=>{
 if(value===null||value===undefined||value==="")return "";
 if(typeof value==="boolean")return value?"Yes":"No";
 if(typeof value==="number")return value.toLocaleString();
 if(typeof value==="string")return value;
 return "";
};

const cloneValue=value=>{
 if(value===undefined||value===null)return {};
 try{
  return JSON.parse(JSON.stringify(value));
 }catch{
  return value;
 }
};

const setNestedValue=(source,path,value)=>{
 if(!path.length)return cloneValue(value);
 const next=cloneValue(source);
 let target=next;

 path.forEach((part,index)=>{
  if(index===path.length-1){
   target[part]=value;
   return;
  }

  if(!target[part]||typeof target[part]!=="object")target[part]={};
  target=target[part];
 });

 return next;
};

const storyText=value=>value===null||value===undefined||value===""?"—":String(value);

function StoryDashboardView({data}){
 const stages=data.draftStages||[];
 const characters=data.mainCharactersOverview||[];

 return(
  <div className="story-dashboard-sheet">
   <div className="story-dashboard-summary">
    <div className="story-dashboard-title-row"><span>Title</span><strong>{storyText(data.title)}</strong></div>
    {[
     ["Working Title",data.workingTitle],
     ["Tagline",data.tagline],
     ["Additional Info",data.additionInfo],
     ["Genre",data.genre],
     ["Sub-Genre",data.subGenre],
     ["Word Count Goal",Number(data.wordCountGoal||0).toLocaleString()],
     ["Target Completion Date",data.targetCompletionDate?new Date(data.targetCompletionDate).toLocaleDateString():"—"]
    ].map(([label,value])=>(
     <div className="story-dashboard-summary-row" key={label}><span>{label}</span><strong>{value}</strong></div>
    ))}
    <div className="story-dashboard-summary-row">
     <span>Draft Stage</span>
     <strong className="story-dashboard-stage-list">
      {stages.length?stages.map((stage,index)=>{
       const checked=!!(stage?.status||stage?.selected||stage?.active);
       return <span className="story-dashboard-stage-item" key={stage?._id||stage?.stage||index}><span className={`story-dashboard-stage-box${checked?" is-checked":""}`} aria-hidden="true"></span>{stage?.stage||"Stage"}</span>;
      }):"—"}
     </strong>
    </div>
   </div>

   <h3 className="story-dashboard-divider">Theme &amp; Tone</h3>
   <div className="story-dashboard-pair">
    <section><h4>Central Theme(s)</h4><p>{storyText(data.themeTone?.centralThemes)}</p></section>
    <section><h4>Tone (Mood)</h4><p>{storyText(data.themeTone?.toneMood)}</p></section>
   </div>

   <div className="story-dashboard-pair story-dashboard-writing-pair">
    <section><h3>Target Audience</h3><p>{data.targetAudience?.length?data.targetAudience.join("\n"):"—"}</p></section>
    <section><h3>Collaboration</h3><p>{data.collaboration?.length?data.collaboration.join("\n"):"—"}</p></section>
   </div>

   <section className="story-dashboard-goal"><h3>Primary Goal</h3><p>{storyText(data.primaryGoal)}</p></section>

   <section className="story-dashboard-characters">
    <h3>Main Characters Overview</h3>
    <div className="story-dashboard-character-table">
     <div className="story-dashboard-character-head"><span>Character Name</span><span>Role</span><span>Arc Status (Start → End)</span></div>
     {Array.from({length:Math.max(6,characters.length)},(_,index)=>{
      const character=characters[index]||{};
      return <div className="story-dashboard-character-row" key={character._id||index}><span>{character.characterName||""}</span><span>{character.role||""}</span><span>{character.arcStatus||""}</span></div>;
     })}
    </div>
   </section>
  </div>
 );
}

function StoryDashboardEditor({value,onChange}){
 const update=(path,next)=>onChange(path,next);
 const stages=value.draftStages||[];
 const characters=value.mainCharactersOverview||[];
 const listValue=items=>(items||[]).join("\n");
 const updateList=(path,text)=>update(path,text.split(/\r?\n/).map(item=>item.trim()).filter(Boolean));
 const updateCharacter=(index,key,nextValue)=>{
  update(["mainCharactersOverview"],characters.map((character,characterIndex)=>characterIndex===index?{...character,[key]:nextValue}:character));
 };

 return(
  <div className="story-dashboard-form">
   <div className="story-dashboard-form-grid">
    {[
     ["Title","title","text"],["Working Title","workingTitle","text"],
     ["Tagline","tagline","text"],["Additional Info","additionInfo","text"],
     ["Genre","genre","text"],["Sub-Genre","subGenre","text"],
     ["Word Count Goal","wordCountGoal","number"],["Target Completion Date","targetCompletionDate","date"]
    ].map(([label,key,type])=><Form.Group key={key}><Form.Label>{label}</Form.Label><Form.Control type={type} value={type==="date"?String(value[key]||"").slice(0,10):value[key]??""} onChange={event=>update([key],type==="number"?Number(event.target.value||0):event.target.value)}/></Form.Group>)}
   </div>
   <fieldset className="story-dashboard-form-section"><legend>Draft Stage</legend><div className="story-dashboard-stage-grid">
    {stages.map((stage,index)=><Form.Check key={stage._id||stage.stage||index} type="checkbox" label={stage.stage||`Stage ${index+1}`} checked={!!(stage.status||stage.selected||stage.active)} onChange={event=>update(["draftStages",index,"status"],event.target.checked?"Active":"")}/>) }
   </div></fieldset>
   <fieldset className="story-dashboard-form-section"><legend>Theme &amp; Tone</legend><div className="story-dashboard-form-grid">
    <Form.Group><Form.Label>Central Theme(s)</Form.Label><Form.Control as="textarea" rows={3} value={value.themeTone?.centralThemes||""} onChange={event=>update(["themeTone","centralThemes"],event.target.value)}/></Form.Group>
    <Form.Group><Form.Label>Tone (Mood)</Form.Label><Form.Control as="textarea" rows={3} value={value.themeTone?.toneMood||""} onChange={event=>update(["themeTone","toneMood"],event.target.value)}/></Form.Group>
   </div></fieldset>
   <div className="story-dashboard-form-grid">
    <Form.Group><Form.Label>Target Audience</Form.Label><Form.Control as="textarea" rows={3} value={listValue(value.targetAudience)} onChange={event=>updateList(["targetAudience"],event.target.value)}/></Form.Group>
    <Form.Group><Form.Label>Collaboration</Form.Label><Form.Control as="textarea" rows={3} value={listValue(value.collaboration)} onChange={event=>updateList(["collaboration"],event.target.value)}/></Form.Group>
   </div>
   <Form.Group className="mt-3"><Form.Label>Primary Goal</Form.Label><Form.Control as="textarea" rows={3} value={value.primaryGoal||""} onChange={event=>update(["primaryGoal"],event.target.value)}/></Form.Group>
   <fieldset className="story-dashboard-form-section"><legend>Main Characters Overview</legend><div className="story-dashboard-character-actions"><Button type="button" variant="outline-primary" onClick={()=>update(["mainCharactersOverview"],[...characters,{characterName:"",role:"",arcStatus:""}])}>Add Character</Button></div><div className="story-dashboard-character-editor">
    {characters.map((character,index)=><div className="story-dashboard-character-edit-row" key={character._id||index}><Form.Control aria-label={`Character ${index+1} name`} placeholder="Character name" value={character.characterName||""} onChange={event=>updateCharacter(index,"characterName",event.target.value)}/><Form.Control aria-label={`Character ${index+1} role`} placeholder="Role" value={character.role||""} onChange={event=>updateCharacter(index,"role",event.target.value)}/><Form.Control aria-label={`Character ${index+1} arc status`} placeholder="Arc status (start → end)" value={character.arcStatus||""} onChange={event=>updateCharacter(index,"arcStatus",event.target.value)}/><Button type="button" variant="outline-danger" onClick={()=>update(["mainCharactersOverview"],characters.filter((_,characterIndex)=>characterIndex!==index))}>Remove</Button></div>)}
   </div></fieldset>
  </div>
 );
}

function NameYourStoryEditor({value,onChange}){
 const update=(path,next)=>onChange(path,next);
 const listValue=items=>(items||[]).join("\n");
 const updateList=(path,text)=>update(path,text.split(/\r?\n/).map(item=>item.trim()).filter(Boolean));
 const titleRows=(key)=>Array.from({length:Math.max(4,value[key]?.length||0)},(_,index)=>value[key]?.[index]||{});
 const updateTitleRow=(key,index,field,nextValue)=>{
  const rows=titleRows(key).map(row=>({...row}));
  rows[index][field]=nextValue;
  update([key],rows);
 };

 return(
  <div className="name-story-form">
   <div className="name-story-short-grid">
    <Form.Group><Form.Label>Main Title</Form.Label><Form.Control value={value.mainTitle||""} onChange={event=>update(["mainTitle"],event.target.value)}/></Form.Group>
    <Form.Group><Form.Label>Tagline</Form.Label><Form.Control value={value.tagline||""} onChange={event=>update(["tagline"],event.target.value)}/></Form.Group>
   </div>

   <Form.Group><Form.Label>Why This Title?</Form.Label><Form.Text>Describe its meaning, symbolism, or connection to the plot and themes.</Form.Text><Form.Control as="textarea" rows={4} value={value.whyThisTitle||""} onChange={event=>update(["whyThisTitle"],event.target.value)}/></Form.Group>

   <fieldset className="name-story-fieldset">
    <legend>Does It Fit Your Genre &amp; Audience?</legend>
    <div className="name-story-fit-grid">
     <Form.Group><Form.Label>Status</Form.Label><Form.Select value={value.doesItFitGenreAudience?.status||""} onChange={event=>update(["doesItFitGenreAudience","status"],event.target.value)}><option value="">Select status</option><option value="Yes">Yes</option><option value="No">No</option><option value="Not Sure">Not Sure</option><option value="Needs Improvement">Needs Improvement</option></Form.Select></Form.Group>
     <Form.Group><Form.Label>Notes</Form.Label><Form.Control as="textarea" rows={3} value={listValue(value.doesItFitGenreAudience?.notes)} onChange={event=>updateList(["doesItFitGenreAudience","notes"],event.target.value)}/></Form.Group>
    </div>
   </fieldset>

   <div className="name-story-title-columns">
    {[["workingTitles","Working Title(s)"],["futureTitleIdeas","Future Title Ideas"]].map(([key,label])=><fieldset className="name-story-fieldset" key={key}><legend>{label}</legend><div className="name-story-title-rows">{titleRows(key).map((row,index)=><div className="name-story-title-row" key={row._id||index}><Form.Control aria-label={`${label} ${index+1}`} placeholder={`${label.replace("(s)","")} ${index+1}`} value={row.title||""} onChange={event=>updateTitleRow(key,index,"title",event.target.value)}/><Form.Control aria-label={`${label} ${index+1} notes`} placeholder="Optional note" value={listValue(row.notes)} onChange={event=>updateTitleRow(key,index,"notes",event.target.value?[event.target.value]:[])}/></div>)}</div></fieldset>)}
   </div>

   <Form.Group><Form.Label>Compare With Other Titles in Your Genre</Form.Label><Form.Text>Note how the title stands out while still fitting reader expectations.</Form.Text><Form.Control as="textarea" rows={4} value={value.compareWithOtherTitles||""} onChange={event=>update(["compareWithOtherTitles"],event.target.value)}/></Form.Group>
   <Form.Group><Form.Label>Additional Notes</Form.Label><Form.Control as="textarea" rows={3} value={listValue(value.notes)} onChange={event=>updateList(["notes"],event.target.value)}/></Form.Group>
  </div>
 );
}

const blankDemographicProfile=()=>({
 fictionalName:"",
 ageRange:"",
 genderIdentity:"",
 location:"",
 lifestyleInterests:[],
 readingHabits:"",
 lookingForInBook:[],
 notes:[]
});

const genderIdentityOptions=["Female","Male","Non-binary","Genderqueer","Agender","Other","Prefer not to say"];

function TargetAudienceDemographicsEditor({value,onChange}){
 const profiles=value.demographics||[];
 const listValue=items=>(items||[]).join("\n");
 const updateProfiles=next=>onChange(["demographics"],next);
 const updateProfile=(index,key,nextValue)=>{
  const next=profiles.map(profile=>({...profile}));
  next[index]={...blankDemographicProfile(),...next[index],[key]:nextValue};
  updateProfiles(next);
 };
 const updateList=(index,key,nextValue)=>updateProfile(index,key,nextValue.split(/\r?\n/).map(item=>item.trim()).filter(Boolean));
 const listItems=(profile,key)=>profile[key]?.length?profile[key]:[""];
 const updateListItem=(index,key,itemIndex,nextValue)=>{
  const items=[...listItems(profiles[index],key)];
  items[itemIndex]=nextValue;
  updateProfile(index,key,items);
 };
 const addListItem=(index,key)=>updateProfile(index,key,[...listItems(profiles[index],key),""]);
 const removeListItem=(index,key,itemIndex)=>updateProfile(index,key,listItems(profiles[index],key).filter((_,indexToKeep)=>indexToKeep!==itemIndex));

 return <div className="demographic-form">
  <header className="demographic-form-toolbar">
   <div><h3>Individual Reader Profiles</h3><p>Add a separate profile for each intended audience or representative reader.</p></div>
   <Button className="demographic-add" type="button" onClick={()=>updateProfiles([...profiles,blankDemographicProfile()])}>Add Profile</Button>
  </header>
  {profiles.length?<div className="demographic-profile-list">{profiles.map((profile,index)=>{const profilePrefix=`reader-profile-${index}`;return <fieldset className="demographic-profile" key={profile._id||index}>
   <legend>Reader Profile {index+1}</legend>
   <div className="demographic-profile-actions"><Button className="demographic-remove" type="button" size="sm" variant="outline-danger" onClick={()=>updateProfiles(profiles.filter((_,profileIndex)=>profileIndex!==index))}>Remove</Button></div>
   <div className="demographic-identity-table">{[["fictionalName","Name (Fictional)"],["ageRange","Age Range"],["genderIdentity","Gender Identity"]].map(([key,label])=><div className={`demographic-identity-row demographic-identity-${key}`} key={key}><label htmlFor={`${profilePrefix}-${key}`}>{label}</label>{key==="genderIdentity"?<select id={`${profilePrefix}-${key}`} value={profile[key]||""} onChange={event=>updateProfile(index,key,event.target.value)}><option value="">Select Gender Identity</option>{profile[key]&&!genderIdentityOptions.includes(profile[key])?<option value={profile[key]}>{profile[key]}</option>:null}{genderIdentityOptions.map(option=><option value={option} key={option}>{option}</option>)}</select>:<input id={`${profilePrefix}-${key}`} value={profile[key]||""} onChange={event=>updateProfile(index,key,event.target.value)}/>}</div>)}</div>
   <div className="demographic-identity-location"><label htmlFor={`${profilePrefix}-location`}>Location</label><textarea id={`${profilePrefix}-location`} rows={2} value={profile.location||""} onChange={event=>updateProfile(index,"location",event.target.value)}/></div>
   <section className="demographic-list-section"><span className="demographic-list-label">Lifestyle / Interests</span><div className="demographic-line-editor">{listItems(profile,"lifestyleInterests").map((item,itemIndex)=><div className="demographic-line-row" key={itemIndex}><input aria-label={`Lifestyle or interest ${itemIndex+1}`} value={item} onChange={event=>updateListItem(index,"lifestyleInterests",itemIndex,event.target.value)}/><Button type="button" variant="outline-danger" onClick={()=>removeListItem(index,"lifestyleInterests",itemIndex)}>Remove</Button></div>)}<Button className="demographic-add-line" type="button" variant="outline-primary" onClick={()=>addListItem(index,"lifestyleInterests")}>Add Line</Button></div></section>
   <section className="demographic-reading-section"><label htmlFor={`${profilePrefix}-readingHabits`}>Reading Habits</label><textarea id={`${profilePrefix}-readingHabits`} rows={3} value={profile.readingHabits||""} onChange={event=>updateProfile(index,"readingHabits",event.target.value)}/></section>
   <section className="demographic-list-section"><span className="demographic-list-label">Looking For in a Book</span><div className="demographic-line-editor">{listItems(profile,"lookingForInBook").map((item,itemIndex)=><div className="demographic-line-row" key={itemIndex}><input aria-label={`Book preference ${itemIndex+1}`} value={item} onChange={event=>updateListItem(index,"lookingForInBook",itemIndex,event.target.value)}/><Button type="button" variant="outline-danger" onClick={()=>removeListItem(index,"lookingForInBook",itemIndex)}>Remove</Button></div>)}<Button className="demographic-add-line" type="button" variant="outline-primary" onClick={()=>addListItem(index,"lookingForInBook")}>Add Line</Button></div></section>
   <section className="demographic-notes-section"><label htmlFor={`${profilePrefix}-notes`}>Profile Notes</label><textarea id={`${profilePrefix}-notes`} rows={3} value={listValue(profile.notes)} onChange={event=>updateList(index,"notes",event.target.value)}/></section>
  </fieldset>;})}</div>:<div className="demographic-empty"><p>No reader profiles have been added.</p><Button className="demographic-add" type="button" variant="outline-primary" onClick={()=>updateProfiles([blankDemographicProfile()])}>Add First Profile</Button></div>}
  <section className="demographic-general-notes"><label htmlFor="demographic-general-notes">General Audience Notes</label><textarea id="demographic-general-notes" rows={3} value={listValue(value.notes)} onChange={event=>onChange(["notes"],event.target.value.split(/\r?\n/).map(item=>item.trim()).filter(Boolean))}/></section>
 </div>;
}

function WordCountGoalEditor({value,onChange}){
 const tracker=value.wordCountTracker||[];
 const formatCount=count=>Number(count||0).toLocaleString("en-US");
 const parseCount=count=>Number(String(count).replace(/[^\d]/g,""))||0;
 const update=(key,nextValue)=>onChange([key],nextValue);
 const updateTracker=(index,key,nextValue)=>update("wordCountTracker",tracker.map((row,rowIndex)=>rowIndex===index?{...row,[key]:nextValue}:row));
 const addTrackerRow=()=>update("wordCountTracker",[...tracker,{dateDay:"",wordsWritten:0,dailyNote:""}]);
 const removeTrackerRow=index=>update("wordCountTracker",tracker.filter((_,rowIndex)=>rowIndex!==index));
 const dateValue=value.targetDeadline?String(value.targetDeadline).slice(0,10):"";

 return <div className="word-count-form">
  <div className="word-count-goals">
   {[['totalWordCountGoal','Total Word Count Goal'],['dailyWordCountGoal','Daily Word Count Goal'],['weeklyWordCountGoal','Weekly Word Count Goal'],['monthlyWordCountGoal','Monthly Word Count Goal']].map(([key,label])=><div className="word-count-field" key={key}><label htmlFor={`word-count-${key}`}>{label}</label><input id={`word-count-${key}`} type="text" inputMode="numeric" value={formatCount(value[key])} onChange={event=>update(key,parseCount(event.target.value))}/></div>)}
   <div className="word-count-field word-count-deadline"><label htmlFor="word-count-deadline">Target Deadline</label><input id="word-count-deadline" type="date" value={dateValue} onChange={event=>update("targetDeadline",event.target.value||null)}/></div>
  </div>
  <section className="word-count-tracker-editor"><div className="word-count-section-heading"><div><h3>Word Count Tracker</h3><p>Add a row only when you need another tracking entry.</p></div><Button type="button" variant="outline-primary" onClick={addTrackerRow}>Add Row</Button></div>{tracker.length?<div className="word-count-tracker-rows">{tracker.map((row,index)=>{const actual=Number(value.dailyWordCountGoal||0)-Number(row.wordsWritten||0);return <fieldset className="word-count-tracker-entry" key={row._id||index}><legend>Entry {index+1}</legend><div className="word-count-tracker-head"><span>Date</span><span>Words Written</span><span>Actual</span><span></span></div><div className="word-count-tracker-values"><input aria-label={`Date ${index+1}`} type="date" value={row.dateDay?String(row.dateDay).slice(0,10):""} onChange={event=>updateTracker(index,"dateDay",event.target.value)}/><input aria-label={`Words written ${index+1}`} type="text" inputMode="numeric" value={formatCount(row.wordsWritten)} onChange={event=>updateTracker(index,"wordsWritten",parseCount(event.target.value))}/><output aria-label={`Actual ${index+1}`}>{actual.toLocaleString("en-US")}</output><Button type="button" variant="outline-danger" onClick={()=>removeTrackerRow(index)}>Remove</Button></div><div className="word-count-daily-note"><label htmlFor={`word-count-daily-note-${index}`}>Daily Note</label><textarea id={`word-count-daily-note-${index}`} rows={2} value={row.dailyNote||""} onChange={event=>updateTracker(index,"dailyNote",event.target.value)}/></div></fieldset>;})}</div>:<p className="word-count-empty">No tracker rows added.</p>}</section>
 </div>;
}

function ThemesMotifsEditor({value,onChange}){
 const themeShowOptions=["Through the Headman's growth","Through dialogue or internal thoughts","Through setting/environment","Through conflict and resolution","Through key decisions"];
 const reflectionOptions=["Yes","Needs adjusting later","Still exploring"];
 const [manualReflection,setManualReflection]=useState(()=>!!value.reflection&&!reflectionOptions.includes(value.reflection));
 const update=(path,nextValue)=>onChange(path,nextValue);
 const lineItems=key=>value[key]?.length?value[key]:[""];
 const updateLine=(key,index,nextValue)=>{const items=[...lineItems(key)];items[index]=nextValue;update([key],items);};
 const addLine=key=>update([key],[...lineItems(key),""]);
 const removeLine=(key,index)=>update([key],lineItems(key).filter((_,itemIndex)=>itemIndex!==index));
 const motifs=value.motifsSymbols||[];
 const updateMotif=(index,key,nextValue)=>update(["motifsSymbols"],motifs.map((motif,motifIndex)=>motifIndex===index?{...motif,[key]:nextValue}:motif));
 const addMotif=()=>update(["motifsSymbols"],[...motifs,{motifSymbol:"",represents:"",whereItAppearsInStory:""}]);
 const removeMotif=index=>update(["motifsSymbols"],motifs.filter((_,motifIndex)=>motifIndex!==index));
 const selectedShowMethods=value.themeShowMethods||[];
 const customShowMethods=selectedShowMethods.filter(method=>!themeShowOptions.includes(method));
 const toggleShowMethod=method=>update(["themeShowMethods"],selectedShowMethods.includes(method)?selectedShowMethods.filter(item=>item!==method):[...selectedShowMethods,method]);
 const updateCustomShowMethod=(index,nextValue)=>{const custom=[...customShowMethods];custom[index]=nextValue;update(["themeShowMethods"],[...selectedShowMethods.filter(method=>themeShowOptions.includes(method)),...custom]);};
 const addCustomShowMethod=()=>update(["themeShowMethods"],[...selectedShowMethods,""]);
 const removeCustomShowMethod=index=>update(["themeShowMethods"],[...selectedShowMethods.filter(method=>themeShowOptions.includes(method)),...customShowMethods.filter((_,itemIndex)=>itemIndex!==index)]);
 const reflectionSelection=manualReflection?"manual":reflectionOptions.includes(value.reflection)?value.reflection:"";
 const renderLines=(key,label)=><section className="themes-lines"><div className="project-form-section-heading"><h3>{label}</h3><Button type="button" variant="outline-primary" onClick={()=>addLine(key)}>Add Line</Button></div>{lineItems(key).map((item,index)=><div className="themes-line-row" key={index}><input aria-label={`${label} ${index+1}`} value={item} onChange={event=>updateLine(key,index,event.target.value)}/><Button type="button" variant="outline-danger" onClick={()=>removeLine(key,index)}>Remove</Button></div>)}</section>;
 return <div className="themes-motifs-form">{renderLines("mainThemes","Main Themes")}<section className="motifs-editor"><div className="project-form-section-heading"><h3>Motifs &amp; Symbols</h3><Button type="button" variant="outline-primary" onClick={addMotif}>Add Motif</Button></div>{motifs.length?<div className="motif-rows"><div className="motif-row-head"><span>Motif / Symbol</span><span>What It Represents</span><span>Where It Appears</span><span></span></div>{motifs.map((motif,index)=><div className="motif-row" key={motif._id||index}><input aria-label={`Motif or symbol ${index+1}`} value={motif.motifSymbol||""} onChange={event=>updateMotif(index,"motifSymbol",event.target.value)}/><input aria-label={`What motif ${index+1} represents`} value={motif.represents||""} onChange={event=>updateMotif(index,"represents",event.target.value)}/><input aria-label={`Where motif ${index+1} appears`} value={motif.whereItAppearsInStory||""} onChange={event=>updateMotif(index,"whereItAppearsInStory",event.target.value)}/><Button type="button" variant="outline-danger" onClick={()=>removeMotif(index)}>Remove</Button></div>)}</div>:<p>No motifs added.</p>}</section><section className="theme-show-editor"><div className="project-form-section-heading"><h3>How the Themes Will Show in the Story</h3><Button type="button" variant="outline-primary" onClick={addCustomShowMethod}>Add Custom</Button></div><div className="theme-show-options">{themeShowOptions.map(option=><label key={option}><input type="checkbox" checked={selectedShowMethods.includes(option)} onChange={()=>toggleShowMethod(option)}/><span>{option}</span></label>)}</div>{customShowMethods.map((method,index)=><div className="themes-line-row" key={index}><input aria-label={`Custom theme show method ${index+1}`} value={method} onChange={event=>updateCustomShowMethod(index,event.target.value)}/><Button type="button" variant="outline-danger" onClick={()=>removeCustomShowMethod(index)}>Remove</Button></div>)}</section><section className="theme-reflection-field"><label htmlFor="themes-reflection">Reflection</label><select id="themes-reflection" value={manualReflection?"":reflectionSelection} onChange={event=>{setManualReflection(false);update(["reflection"],event.target.value);}}><option value="">Select Reflection</option>{reflectionOptions.map(option=><option value={option} key={option}>{option}</option>)}</select><Button type="button" variant="outline-primary" onClick={()=>{setManualReflection(!manualReflection);update(["reflection"],"");}}>{manualReflection?"Cancel Custom":"Add Custom"}</Button>{manualReflection?<input className="theme-reflection-custom" aria-label="Manual reflection" placeholder="Enter custom reflection" value={value.reflection||""} onChange={event=>update(["reflection"],event.target.value)}/>:null}</section>{renderLines("notes","Notes")}</div>;
}

function LineListEditor({id,label,items=[],onChange,placeholder=""}){
 const update=(index,nextValue)=>onChange(items.map((item,itemIndex)=>itemIndex===index?nextValue:item));
 return <section className="project-line-list"><div className="project-form-section-heading"><h3>{label}</h3><Button type="button" variant="outline-primary" onClick={()=>onChange([...items,""])}>Add Line</Button></div>{items.map((item,index)=><div className="project-line-list-row" key={index}><input id={`${id}-${index}`} aria-label={`${label} ${index+1}`} placeholder={placeholder} value={item||""} onChange={event=>update(index,event.target.value)}/><Button type="button" variant="outline-danger" onClick={()=>onChange(items.filter((_,itemIndex)=>itemIndex!==index))}>Remove</Button></div>)}</section>;
}

function GenreSubGenreEditor({value,onChange}){
 return <div className="genre-subgenre-form"><div className="project-inline-field"><label htmlFor="primary-genre">Primary Genre</label><input id="primary-genre" value={value.primaryGenre||""} onChange={event=>onChange(["primaryGenre"],event.target.value)}/></div><LineListEditor id="subgenres" label="Sub-Genre(s)" items={value.subgenres||[]} onChange={items=>onChange(["subgenres"],items)} placeholder="Enter one sub-genre"/><div className="project-text-field"><label htmlFor="why-this-genre">Why This Genre?</label><textarea id="why-this-genre" rows={3} value={value.whyThisGenre||""} onChange={event=>onChange(["whyThisGenre"],event.target.value)}/></div><LineListEditor id="genre-expectations" label="Genre Expectations / Tropes" items={value.genreExpectationsTropes||[]} onChange={items=>onChange(["genreExpectationsTropes"],items)} placeholder="Enter one expectation or trope"/><LineListEditor id="genre-ideas" label="Genre-Specific Ideas to Include" items={value.genreSpecificIdeasToInclude||[]} onChange={items=>onChange(["genreSpecificIdeasToInclude"],items)} placeholder="Enter one idea"/><LineListEditor id="genre-notes" label="Notes" items={value.notes||[]} onChange={items=>onChange(["notes"],items)} placeholder="Enter one note"/></div>;
}

function ElevatorPitchEditor({value,onChange}){
 const pitch=value.pitchBuilder||{};
 const updatePitch=(key,nextValue)=>onChange(["pitchBuilder"],{...pitch,[key]:nextValue});
 return <div className="elevator-pitch-form"><fieldset><legend>Step-by-Step Pitch Builder</legend><div className="elevator-pitch-grid"><div><label htmlFor="pitch-protagonist">1. Who is the protagonist / main character?</label><textarea id="pitch-protagonist" rows={3} value={pitch.protagonistMainCharacters||""} onChange={event=>updatePitch("protagonistMainCharacters",event.target.value)}/></div><div><label htmlFor="pitch-want">2. What do they want?</label><textarea id="pitch-want" rows={3} value={pitch.whatDoTheyWant||""} onChange={event=>updatePitch("whatDoTheyWant",event.target.value)}/></div><div><label htmlFor="pitch-conflict">3. What is standing in their way?</label><textarea id="pitch-conflict" rows={3} value={pitch.standingInTheirWayConflict||""} onChange={event=>updatePitch("standingInTheirWayConflict",event.target.value)}/></div><div><label htmlFor="pitch-stakes">4. What is at stake if they fail?</label><textarea id="pitch-stakes" rows={3} value={pitch.stakesIfTheyFail||""} onChange={event=>updatePitch("stakesIfTheyFail",event.target.value)}/></div></div></fieldset><div className="project-text-field"><label htmlFor="elevator-pitch-draft">Elevator Pitch Draft</label><textarea id="elevator-pitch-draft" rows={5} value={value.elevatorPitchDraft||""} onChange={event=>onChange(["elevatorPitchDraft"],event.target.value)}/></div><LineListEditor id="pitch-consistency" label="Style Consistency" items={value.styleConsistency||[]} onChange={items=>onChange(["styleConsistency"],items)} placeholder="Enter one consistency check"/><LineListEditor id="pitch-notes" label="Notes" items={value.notes||[]} onChange={items=>onChange(["notes"],items)} placeholder="Enter one note"/></div>;
}

function WritingStyleEditor({value,onChange}){
 return <div className="writing-style-form"><LineListEditor id="style-cues" label="Describe Your Style" items={value.styleCues||[]} onChange={items=>onChange(["styleCues"],items)} placeholder="Enter one word or sentence"/><div className="writing-style-columns"><LineListEditor id="tone-mood" label="Tone / Mood" items={value.toneMood||[]} onChange={items=>onChange(["toneMood"],items)} placeholder="Enter one tone or mood"/><LineListEditor id="sentence-style" label="Sentence Style" items={value.sentenceStyle||[]} onChange={items=>onChange(["sentenceStyle"],items)} placeholder="Enter one sentence-style note"/></div><LineListEditor id="style-pitfalls" label="Style Pitfalls to Avoid" items={value.stylePitfallsToAvoid||[]} onChange={items=>onChange(["stylePitfallsToAvoid"],items)} placeholder="Enter one pitfall"/><LineListEditor id="style-reminders" label="Style Reminders to Self" items={value.styleRemindersToSelf||[]} onChange={items=>onChange(["styleRemindersToSelf"],items)} placeholder="Enter one reminder"/><LineListEditor id="writing-style-notes" label="Notes" items={value.notes||[]} onChange={items=>onChange(["notes"],items)} placeholder="Enter one note"/></div>;
}

function StoryTimelineEditor({value,onChange}){
 const timeline=value.timeline||[];
 const updateRow=(index,key,nextValue)=>onChange(["timeline"],timeline.map((row,rowIndex)=>rowIndex===index?{...row,[key]:nextValue}:row));
 return <div className="story-timeline-form"><div className="project-form-section-heading"><h3>Story Timeline</h3><Button type="button" variant="outline-primary" onClick={()=>onChange(["timeline"],[...timeline,{chapterAct:"",event:"",timeDateEra:"",notes:[]}])}>Add Timeline Row</Button></div><div className="story-timeline-head"><span>Chapter / Act</span><span>Event</span><span>Time / Date / Era</span><span>Notes</span><span/></div>{timeline.map((row,index)=><div className="story-timeline-row" key={row._id||index}><input aria-label={`Timeline ${index+1} chapter or act`} value={row.chapterAct||""} onChange={event=>updateRow(index,"chapterAct",event.target.value)}/><textarea aria-label={`Timeline ${index+1} event`} rows={2} value={row.event||""} onChange={event=>updateRow(index,"event",event.target.value)}/><input aria-label={`Timeline ${index+1} time date or era`} value={row.timeDateEra||""} onChange={event=>updateRow(index,"timeDateEra",event.target.value)}/><textarea aria-label={`Timeline ${index+1} notes`} rows={2} value={(row.notes||[]).join("\n")} onChange={event=>updateRow(index,"notes",event.target.value.split(/\r?\n/))}/><Button type="button" variant="outline-danger" onClick={()=>onChange(["timeline"],timeline.filter((_,rowIndex)=>rowIndex!==index))}>Remove</Button></div>)}<LineListEditor id="timeline-notes" label="Timeline Notes" items={value.notes||[]} onChange={items=>onChange(["notes"],items)} placeholder="Enter one note"/></div>;
}

function FuturePlanningNotesEditor({value,onChange}){
 return <div className="future-planning-form"><div className="future-planning-columns"><LineListEditor id="future-ideas" label="Future Ideas" items={value.futureIdeas||[]} onChange={items=>onChange(["futureIdeas"],items)} placeholder="Enter one future idea"/><LineListEditor id="sequel-ideas" label="Sequel Ideas" items={value.sequelIdeas||[]} onChange={items=>onChange(["sequelIdeas"],items)} placeholder="Enter one sequel idea"/><LineListEditor id="expansion-ideas" label="Expansion Ideas" items={value.expansionIdeas||[]} onChange={items=>onChange(["expansionIdeas"],items)} placeholder="Enter one expansion idea"/><LineListEditor id="revision-ideas" label="Revision Ideas" items={value.revisionIdeas||[]} onChange={items=>onChange(["revisionIdeas"],items)} placeholder="Enter one revision idea"/></div><LineListEditor id="marketing-ideas" label="Marketing Ideas" items={value.marketingIdeas||[]} onChange={items=>onChange(["marketingIdeas"],items)} placeholder="Enter one marketing idea"/><LineListEditor id="future-planning-notes" label="Notes or Sketch Ideas" items={value.notes||[]} onChange={items=>onChange(["notes"],items)} placeholder="Enter one note"/></div>;
}

const narrativeStyleOptions=["Light & conversational","Poetic & lyrical","Sparse & direct","Reflective & emotional","Experimental"];
const pointOfViewOptions=["First-person","Third-person limited","Third-person omniscient","Second-person","Mixed Point of View"];
const styleConsistencyOptions=["My scenes stay true to this tone","My dialogue reflects the style","I'm open to refining as the story develops"];

function ToneStyleEditor({value,onChange}){
 const update=(path,nextValue)=>onChange(path,nextValue);
 const selectedNarrative=value.narrativeStyles||[];
 const selectedPointOfViews=value.pointOfViews||[];
 const customNarrative=selectedNarrative.filter(item=>!narrativeStyleOptions.includes(item));
 const customPointOfViews=selectedPointOfViews.filter(item=>!pointOfViewOptions.includes(item));
 const toggle=(key,option,selected)=>update([key],selected.includes(option)?selected.filter(item=>item!==option):[...selected,option]);
 const updateCustom=(key,index,nextValue,selected,options)=>{
  const custom=selected.filter(item=>!options.includes(item));
  custom[index]=nextValue;
  update([key],[...selected.filter(item=>options.includes(item)),...custom]);
 };
 const addCustom=(key,selected)=>update([key],[...selected,""]);
 const removeCustom=(key,index,selected,options)=>update([key],[...selected.filter(item=>options.includes(item)),...selected.filter(item=>!options.includes(item)).filter((_,itemIndex)=>itemIndex!==index)]);
 const renderChoiceSection=(key,title,options,selected,custom)=><section className="tone-choice-section"><div className="project-form-section-heading"><h3>{title}</h3><Button type="button" variant="outline-primary" onClick={()=>addCustom(key,selected)}>Add Custom</Button></div><div className="tone-choice-grid">{options.map(option=><label key={option}><input type="checkbox" checked={selected.includes(option)} onChange={()=>toggle(key,option,selected)}/><span>{option}</span></label>)}</div>{custom.map((item,index)=><div className="tone-custom-row" key={index}><input aria-label={`Custom ${title} ${index+1}`} value={item} onChange={event=>updateCustom(key,index,event.target.value,selected,options)}/><Button type="button" variant="outline-danger" onClick={()=>removeCustom(key,index,selected,options)}>Remove</Button></div>)}</section>;
 return <div className="tone-style-form">
  <div className="tone-short-fields"><div><label htmlFor="primary-tone">Primary Tone</label><input id="primary-tone" value={value.primaryTone||""} onChange={event=>update(["primaryTone"],event.target.value)}/></div><div><label htmlFor="secondary-tone">Secondary Tone (if any)</label><input id="secondary-tone" value={value.secondaryTone||""} onChange={event=>update(["secondaryTone"],event.target.value)}/></div></div>
  <fieldset className="tone-mood-fields"><legend>Mood Snapshot</legend><div><label htmlFor="story-feels-like">This Story Feels Like</label><textarea id="story-feels-like" rows={2} value={value.moodSnapshot?.thisStoryFeelsLike||""} onChange={event=>update(["moodSnapshot","thisStoryFeelsLike"],event.target.value)}/></div><div><label htmlFor="reader-should-feel">I Want the Reader to Feel</label><textarea id="reader-should-feel" rows={2} value={value.moodSnapshot?.readerShouldFeel||""} onChange={event=>update(["moodSnapshot","readerShouldFeel"],event.target.value)}/></div></fieldset>
  {renderChoiceSection("narrativeStyles","Narrative Style",narrativeStyleOptions,selectedNarrative,customNarrative)}
  {renderChoiceSection("pointOfViews","Point of View",pointOfViewOptions,selectedPointOfViews,customPointOfViews)}
  <div className="tone-unique-field"><label htmlFor="unique-style">What Makes Your Style Unique?</label><textarea id="unique-style" rows={3} value={value.whatMakesYourStyleUnique||""} onChange={event=>update(["whatMakesYourStyleUnique"],event.target.value)}/></div>
  <section className="tone-consistency-section"><h3>Style Consistency Tracker</h3><div className="tone-choice-grid">{styleConsistencyOptions.map(option=><label key={option}><input type="checkbox" checked={(value.styleConsistency||[]).includes(option)} onChange={()=>toggle("styleConsistency",option,value.styleConsistency||[])}/><span>{option}</span></label>)}</div></section>
 </div>;
}

function ToneStyleView({data}){
 return <div className="tone-style-display"><div className="tone-display-pair"><section><h3>Primary Tone</h3><p>{data.primaryTone||"—"}</p></section><section><h3>Secondary Tone</h3><p>{data.secondaryTone||"—"}</p></section></div><section className="tone-display-mood"><h3>Mood Snapshot</h3><div><article><h4>This Story Feels Like</h4><p>{data.moodSnapshot?.thisStoryFeelsLike||"—"}</p></article><article><h4>I Want the Reader to Feel</h4><p>{data.moodSnapshot?.readerShouldFeel||"—"}</p></article></div></section><div className="tone-display-pair"><section><h3>Narrative Style</h3><ul>{(data.narrativeStyles||[]).filter(Boolean).map((item,index)=><li key={index}>{item}</li>)}</ul></section><section><h3>Point of View</h3><ul>{(data.pointOfViews||[]).filter(Boolean).map((item,index)=><li key={index}>{item}</li>)}</ul></section></div><section><h3>What Makes Your Style Unique?</h3><p>{data.whatMakesYourStyleUnique||"—"}</p></section><section><h3>Style Consistency Tracker</h3><ul>{(data.styleConsistency||[]).filter(Boolean).map((item,index)=><li key={index}>{item}</li>)}</ul></section></div>;
}

const bubbleShapeClass=shape=>{
 const candidate=shape?.cssClass||shape?.shapeKey||"";
 const storedClasses=String(candidate).split(/\s+/).filter(item=>/^[A-Za-z_-][A-Za-z0-9_-]*$/.test(item));
 const shapeId=getObjectId(shape);
 if(shapeId)storedClasses.push(`db-bubble-shape-${shapeId}`);
 return storedClasses.join(" ");
};

const shapeThemeTokens={bg:"--bg",bgAlt:"--bg-alt",surface:"--surface",surface2:"--surface-2",text:"--text",textSoft:"--text-soft",textInverse:"--text-inverse",heading:"--heading",primary:"--primary",primaryHover:"--primary-hover",secondary:"--secondary",secondaryHover:"--secondary-hover",accent:"--accent",accentHover:"--accent-hover",accent2:"--accent-2",success:"--success",warning:"--warning",danger:"--danger",info:"--info",border:"--border",borderStrong:"--border-strong",gradientMain:"--gradient-main",gradientSoft:"--gradient-soft",overlay:"--overlay",tableStripe:"--table-stripe",selectionBg:"--selection-bg",selectionText:"--selection-text"};
const shapeBackgroundTokens=["bg","bgAlt","surface","surface2","primary","primaryHover","secondary","secondaryHover","accent","accentHover","accent2","success","warning","danger","info","gradientMain","gradientSoft","tableStripe","selectionBg"];
const shapeTextTokens=["text","textSoft","textInverse","heading","primary","secondary","accent","success","warning","danger","info","selectionText"];
const shapeTokenLabel=token=>token.replace(/([a-z])([A-Z])/g,"$1 $2").replace(/^./,letter=>letter.toUpperCase());

function BubbleShapeStyleRules({shapes}){
 const rules=shapes.filter(shape=>getObjectId(shape)).map(shape=>{const selector=`.db-bubble-shape-${getObjectId(shape)}`;const background=`var(${shapeThemeTokens[shape.backgroundToken]||shapeThemeTokens.surface2})`;const color=/^#[0-9a-f]{6}$/i.test(shape.textColor||"")?shape.textColor:`var(${shapeThemeTokens[shape.textToken]||shapeThemeTokens.text})`;const fontSize=Math.max(8,Math.min(72,Number(shape.fontSize)||16));const surfaceBackground=shape.customCss?"transparent":background;return `${selector}{background:${surfaceBackground};color:${color};font-size:${fontSize}px}${selector} .random-thought-custom-svg polygon{fill:${background}}`;}).join("\n");
 return rules?<style>{rules}</style>:null;
}

function BubbleShapeSurface({shape,children,preview=false}){
 const className=`${preview?"random-thought-shape-preview":"random-thought-bubble"} ${bubbleShapeClass(shape)}`.trim();
 if(shape?.customCss){
  const points=parseShapePoints(shape.customCss);
  return <div className={className}><svg className="random-thought-custom-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points={points.map(point=>point.join(",")).join(" ")}/></svg><span>{children}</span></div>;
 }
 if(shape?.imageUrl)return <div className={className}><img className="random-thought-shape-image" src={shape.imageUrl} alt=""/><span>{children}</span></div>;
 if(shape?.svgPath)return <div className={className}><svg className="random-thought-shape-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d={shape.svgPath}/></svg><span>{children}</span></div>;
 return <div className={className}><span>{children}</span></div>;
}

const defaultShapePoints=[[18,12],[82,12],[94,42],[82,72],[60,78],[76,94],[48,80],[18,72],[6,42]];
const builtInShapePoints={
 circle:[[50,5],[75,12],[92,32],[95,50],[92,68],[75,88],[50,95],[25,88],[8,68],[5,50],[8,32],[25,12]],
 "long-oval":[[15,12],[85,12],[96,30],[98,50],[96,70],[85,88],[15,88],[4,70],[2,50],[4,30]],
 "soft-oval":[[20,10],[80,10],[94,24],[98,50],[94,76],[80,90],[20,90],[6,76],[2,50],[6,24]],
 "wide-organic":[[10,20],[38,8],[78,14],[96,38],[90,72],[58,92],[22,84],[4,58]],
 "organic-left":[[18,8],[74,12],[96,34],[88,72],[58,92],[20,82],[4,52]],
 "organic-right":[[8,28],[28,8],[76,14],[96,48],[82,84],[40,92],[10,70]],
 "rounded-rectangle":[[12,8],[88,8],[96,18],[96,82],[88,92],[12,92],[4,82],[4,18]],
 "soft-rectangle":[[8,12],[92,12],[98,24],[98,76],[92,88],[8,88],[2,76],[2,24]],
 "wide-arch":[[4,88],[4,48],[10,26],[24,12],[50,6],[76,12],[90,26],[96,48],[96,88]],
 cloud:[[8,58],[4,42],[14,28],[30,26],[38,10],[58,8],[70,20],[86,18],[96,34],[92,54],[98,68],[84,84],[62,82],[48,94],[32,82],[14,86],[4,72]],
 "bubble-call-out":[[12,12],[84,12],[96,28],[94,66],[82,78],[58,78],[76,94],[48,80],[14,78],[4,58],[4,28]]
};

const startingShapeCss=shape=>{
 if(shape?.customCss)return shape.customCss;
 const key=String(shape?.cssClass||shape?.shapeKey||"").split(/\s+/).map(item=>item.replace(/^thought-shape-/,"")).find(item=>builtInShapePoints[item]);
 return shapePointsCss(builtInShapePoints[key]||defaultShapePoints);
};

const parseShapePoints=css=>{
 const polygon=String(css||"").match(/clip-path\s*:\s*polygon\(([^)]+)\)/i)?.[1];
 if(!polygon)return defaultShapePoints;
 const points=polygon.split(",").map(pair=>pair.trim().match(/^([\d.]+)%?\s+([\d.]+)%?$/)).filter(Boolean).map(match=>[Number(match[1]),Number(match[2])]);
 return points.length>=3?points:defaultShapePoints;
};

const shapePointsCss=points=>`clip-path:polygon(${points.map(([x,y])=>`${x.toFixed(1)}% ${y.toFixed(1)}%`).join(",")});border-radius:8%;background-color:var(--surface-2)`;

function ShapePointEditor({initialCss,onChange}){
 const [points,setPoints]=useState(()=>parseShapePoints(initialCss));
 const [dragging,setDragging]=useState(null);
 useEffect(()=>{onChange(shapePointsCss(points));},[]);
 const updatePoints=next=>{setPoints(next);onChange(shapePointsCss(next));};
 const pointerPosition=event=>{
  const bounds=event.currentTarget.getBoundingClientRect();
  return [Math.max(0,Math.min(100,((event.clientX-bounds.left)/bounds.width)*100)),Math.max(0,Math.min(100,((event.clientY-bounds.top)/bounds.height)*100))];
 };
 const movePoint=event=>{
  if(dragging===null)return;
  const next=[...points];
  next[dragging]=pointerPosition(event);
  updatePoints(next);
 };
 const addPoint=()=>{
  const last=points[points.length-1];
  const first=points[0];
  updatePoints([...points,[(last[0]+first[0])/2,(last[1]+first[1])/2]]);
 };
 const removePoint=()=>{if(points.length>3)updatePoints(points.slice(0,-1));};
 return <div className="shape-point-editor"><p>Drag the numbered points to draw the shape. Move a point outward to create a speech-balloon tail.</p><svg viewBox="0 0 100 100" onPointerMove={movePoint} onPointerUp={()=>setDragging(null)} onPointerCancel={()=>setDragging(null)}><polygon points={points.map(point=>point.join(",")).join(" ")}/>{points.map(([x,y],index)=><g key={index} transform={`translate(${x} ${y})`} onPointerDown={event=>{event.currentTarget.setPointerCapture(event.pointerId);setDragging(index);}}><circle r="4"/><text textAnchor="middle" dominantBaseline="central">{index+1}</text></g>)}</svg><div className="shape-point-actions"><Button type="button" variant="outline-primary" onClick={addPoint}>Add Point</Button><Button type="button" variant="outline-danger" disabled={points.length<=3} onClick={removePoint}>Remove Point</Button><span>{points.length} points</span></div></div>;
}

function BubbleShapeManager({bubbleShapes,onSave,onDelete,editRequest,onUseSavedShape}){
 const [managerOpen,setManagerOpen]=useState(false);
 const [showEditor,setShowEditor]=useState(false);
 const [editingId,setEditingId]=useState("");
 const [name,setName]=useState("");
 const [customCss,setCustomCss]=useState("");
 const [backgroundToken,setBackgroundToken]=useState("surface2");
 const [textColor,setTextColor]=useState("#8f003e");
 const [fontSize,setFontSize]=useState(16);
 const [busy,setBusy]=useState(false);
 const [managerError,setManagerError]=useState("");
 const beginNew=()=>{
  setEditingId("");setName("");setCustomCss("");setBackgroundToken("surface2");setTextColor("#8f003e");setFontSize(16);setManagerError("");setShowEditor(true);
 };
 const beginEdit=shape=>{
  setEditingId(getObjectId(shape));setName(shape.name||"");setCustomCss(startingShapeCss(shape));setBackgroundToken(shape.backgroundToken||"surface2");setTextColor(shape.textColor||"#8f003e");setFontSize(Number(shape.fontSize)||16);setManagerError("");setShowEditor(true);
 };
 const editingShape=bubbleShapes.find(shape=>getObjectId(shape)===editingId);
 useEffect(()=>{if(!editRequest?.shape)return;setManagerOpen(true);beginEdit(editRequest.shape);},[editRequest?.requestId]);
 const save=async saveAsNew=>{
  if(!name.trim()||!customCss.trim()){setManagerError("Shape name and drawn shape are required.");return;}
  const nextName=saveAsNew&&name.trim()===editingShape?.name?`${name.trim()} Copy`:name.trim();
  try{
   setBusy(true);setManagerError("");
   const savedShape=await onSave({id:saveAsNew?"":editingId,name:nextName,customCss,backgroundToken,textColor,fontSize});
   if(editRequest?.thoughtIndex!==undefined&&getObjectId(editRequest.shape)===editingId)onUseSavedShape(editRequest.thoughtIndex,savedShape);
   setShowEditor(false);
  }catch(error){setManagerError(error.message);}finally{setBusy(false);}
 };
 const remove=async shape=>{
  try{setBusy(true);setManagerError("");await onDelete(shape);}catch(error){setManagerError(error.message);}finally{setBusy(false);}
 };
 const previewShape={...editingShape,name,customCss,backgroundToken,textColor,fontSize,_id:editingId||"live-preview"};
 const closeManager=()=>{if(busy)return;setManagerOpen(false);setShowEditor(false);setManagerError("");};
 return <section className="bubble-shape-manager">
  <div className="project-form-section-heading"><h3>Shape Library</h3><Button type="button" variant="outline-primary" onClick={()=>setManagerOpen(true)}>Manage Shapes</Button></div>
  <Modal className="shape-library-modal" show={managerOpen} onHide={closeManager} size="xl" centered backdrop="static">
   <Modal.Header closeButton={!busy}><Modal.Title>Shape Library</Modal.Title></Modal.Header>
   <Modal.Body>
    <div className="bubble-shape-manager-add"><Button type="button" variant="outline-primary" onClick={beginNew}>Add Custom Shape</Button></div>
    {managerError?<Alert variant="danger">{managerError}</Alert>:null}
    <div className="bubble-shape-manager-list">{bubbleShapes.map(shape=><div className="bubble-shape-manager-row" key={getObjectId(shape)}><BubbleShapeSurface shape={shape} preview>{shape.name}</BubbleShapeSurface><strong>{shape.name}</strong><Button type="button" variant="outline-primary" onClick={()=>beginEdit(shape)}>Edit</Button><Button type="button" variant="outline-danger" disabled={busy} onClick={()=>remove(shape)}>Delete</Button></div>)}</div>
    {showEditor?<fieldset className="bubble-shape-custom-editor">
     <legend>{editingId?"Customize Shape":"Add Custom Shape"}</legend>
     <label htmlFor="custom-shape-name">Shape Name</label><input id="custom-shape-name" value={name} onChange={event=>setName(event.target.value)}/>
     <div className="bubble-shape-color-fields"><label htmlFor="custom-shape-background">Background</label><select id="custom-shape-background" value={backgroundToken} onChange={event=>setBackgroundToken(event.target.value)}>{shapeBackgroundTokens.map(token=><option value={token} key={token}>{shapeTokenLabel(token)}</option>)}</select><label htmlFor="custom-shape-text">Text Color</label><input id="custom-shape-text" type="color" value={textColor} onChange={event=>setTextColor(event.target.value)}/><label htmlFor="custom-shape-font-size">Text Size</label><input id="custom-shape-font-size" type="number" min="8" max="72" value={fontSize} onChange={event=>setFontSize(Number(event.target.value))}/><span>px</span></div>
     <ShapePointEditor key={editingId||"new-shape"} initialCss={customCss} onChange={setCustomCss}/>
     <div className="bubble-shape-custom-preview"><BubbleShapeStyleRules shapes={[previewShape]}/><BubbleShapeSurface shape={previewShape} preview>{name||"Custom Shape"}</BubbleShapeSurface></div>
     <div className="bubble-shape-custom-actions"><Button type="button" variant="outline-secondary" onClick={()=>setShowEditor(false)}>Cancel</Button>{editingId?<Button type="button" variant="outline-primary" disabled={busy} onClick={()=>save(true)}>Save as New Shape</Button>:null}<Button type="button" disabled={busy} onClick={()=>save(false)}>{busy?"Saving...":editingId?"Replace Existing Shape":"Save Shape"}</Button></div>
    </fieldset>:null}
   </Modal.Body>
   <Modal.Footer><Button type="button" variant="outline-secondary" onClick={closeManager} disabled={busy}>Close</Button></Modal.Footer>
  </Modal>
 </section>;
}

function RandomThoughtsEditor({value,onChange,bubbleShapes,loadingShapes,onSaveShape,onDeleteShape}){
 const thoughts=value.thoughts||[];
 const [shapeEditRequest,setShapeEditRequest]=useState(null);
 const updateThought=(index,key,nextValue)=>onChange(["thoughts"],thoughts.map((thought,thoughtIndex)=>thoughtIndex===index?{...thought,[key]:nextValue}:thought));
 const addThought=()=>{
  onChange(["thoughts"],[...thoughts,{thought:"",bubble_shape_id:"",sortOrder:thoughts.length+1}]);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   const modalBody=document.querySelector(".planner-page-modal.show .modal-body");
   modalBody?.scrollTo({top:modalBody.scrollHeight,behavior:"smooth"});
  }));
 };
 const removeThought=index=>onChange(["thoughts"],thoughts.filter((_,thoughtIndex)=>thoughtIndex!==index).map((thought,thoughtIndex)=>({...thought,sortOrder:thoughtIndex+1})));
 const useSavedShape=(thoughtIndex,shape)=>updateThought(thoughtIndex,"bubble_shape_id",getObjectId(shape));
 return <div className="random-thoughts-form"><div className="project-form-section-heading"><h3>Thoughts</h3><Button type="button" variant="outline-primary" onClick={addThought}>Add Thought</Button></div>{loadingShapes?<p>Loading predefined shapes...</p>:null}<BubbleShapeManager bubbleShapes={bubbleShapes} onSave={onSaveShape} onDelete={onDeleteShape} editRequest={shapeEditRequest} onUseSavedShape={useSavedShape}/>{thoughts.length?<div className="random-thought-editor-grid">{thoughts.map((thought,index)=>{const selectedId=getObjectId(thought.bubble_shape_id);const selectedShape=bubbleShapes.find(shape=>getObjectId(shape)===selectedId);return <fieldset className="random-thought-editor" key={thought._id||index}><legend>Thought {index+1}</legend><label htmlFor={`random-thought-shape-${index}`}>Display Shape</label><select id={`random-thought-shape-${index}`} value={selectedId} onChange={event=>updateThought(index,"bubble_shape_id",event.target.value||null)}><option value="">Select a predefined shape</option>{bubbleShapes.map(shape=><option value={getObjectId(shape)} key={getObjectId(shape)}>{shape.name}</option>)}</select><Button className="random-thought-customize" type="button" variant="outline-primary" disabled={!selectedShape} onClick={()=>setShapeEditRequest({shape:selectedShape,thoughtIndex:index,requestId:Date.now()})}>Customize Shape</Button><label htmlFor={`random-thought-text-${index}`}>Thought</label><textarea id={`random-thought-text-${index}`} rows={4} value={thought.thought||""} onChange={event=>updateThought(index,"thought",event.target.value)}/><BubbleShapeSurface shape={selectedShape} preview>{thought.thought||selectedShape?.name||"Choose a shape"}</BubbleShapeSurface><Button type="button" variant="outline-danger" onClick={()=>removeThought(index)}>Remove</Button></fieldset>;})}</div>:<p className="planner-model-empty">No thoughts have been added.</p>}</div>;
}

function ProjectOverviewEditor({pageKey,value,onChange,bubbleShapes,loadingBubbleShapes,onSaveShape,onDeleteShape}){
 switch(pageKey){
  case "storyDashboard":return <StoryDashboardEditor value={value} onChange={onChange}/>;
  case "nameYourStory":return <NameYourStoryEditor value={value} onChange={onChange}/>;
  case "genreSubGenre":return <GenreSubGenreEditor value={value} onChange={onChange}/>;
  case "targetAudienceDemographics":return <TargetAudienceDemographicsEditor value={value} onChange={onChange}/>;
  case "wordCountGoalTracker":return <WordCountGoalEditor value={value} onChange={onChange}/>;
  case "themesMotifs":return <ThemesMotifsEditor value={value} onChange={onChange}/>;
  case "toneStyle":return <ToneStyleEditor value={value} onChange={onChange}/>;
  case "randomThoughts":return <RandomThoughtsEditor value={value} onChange={onChange} bubbleShapes={bubbleShapes} loadingShapes={loadingBubbleShapes} onSaveShape={onSaveShape} onDeleteShape={onDeleteShape}/>;
  case "elevatorPitch":return <ElevatorPitchEditor value={value} onChange={onChange}/>;
  case "writingStyle":return <WritingStyleEditor value={value} onChange={onChange}/>;
  case "storyTimeline":return <StoryTimelineEditor value={value} onChange={onChange}/>;
  case "futurePlanningNotes":return <FuturePlanningNotesEditor value={value} onChange={onChange}/>;
  default:return <p className="planner-model-empty">This Project Overview page does not have an editor.</p>;
 }
}

function RandomThoughtsView({data,bubbleShapes}){
 const thoughts=(data.thoughts||[]).filter(item=>item.thought).sort((left,right)=>Number(left.sortOrder||0)-Number(right.sortOrder||0));
 return <div className="planner-worksheet random-thought-sheet"><h3 className="planner-worksheet-heading">Random Thoughts</h3>{thoughts.length?<div className="random-thought-grid">{thoughts.map((thought,index)=>{const shape=bubbleShapes.find(item=>getObjectId(item)===getObjectId(thought.bubble_shape_id));return <BubbleShapeSurface shape={shape} key={thought._id||index}>{thought.thought}</BubbleShapeSurface>;})}</div>:<p className="planner-model-empty">No random thoughts have been saved.</p>}</div>;
}

function WorksheetArea({title,value,className=""}){
 const display=Array.isArray(value)?value.filter(Boolean).join("\n"):value;
 return <section className={`planner-worksheet-area ${className}`}><h3>{title}</h3><p>{storyText(display)}</p></section>;
}

function WorksheetTable({title,columns,rows,minRows=0}){
 const displayRows=Array.from({length:Math.max(minRows,rows?.length||0)},(_,index)=>rows?.[index]||{});
 return <section className="planner-worksheet-table-wrap"><h3>{title}</h3><div className={`planner-worksheet-table worksheet-columns-${columns.length}`}><div className="planner-worksheet-table-head">{columns.map(column=><span key={column.key}>{column.label}</span>)}</div>{displayRows.map((row,index)=><div className="planner-worksheet-table-row" key={row?._id||index}>{columns.map(column=><span key={column.key}>{Array.isArray(row?.[column.key])?row[column.key].join("; "):formatValue(row?.[column.key])}</span>)}</div>)}</div></section>;
}

function NameYourStoryView({data}){
 return <div className="planner-worksheet name-story-sheet"><div className="planner-worksheet-pair"><WorksheetArea title="Main Title" value={data.mainTitle}/><WorksheetArea title="Tagline" value={data.tagline}/></div><WorksheetArea title="Why This Title?" value={data.whyThisTitle} className="planner-worksheet-wide"/><WorksheetArea title="Does It Fit Your Genre & Audience?" value={[data.doesItFitGenreAudience?.status,...(data.doesItFitGenreAudience?.notes||[])]}/><div className="planner-worksheet-pair"><WorksheetTable title="Working Title(s)" columns={[{key:"title",label:"Title"},{key:"notes",label:"Notes"}]} rows={data.workingTitles} minRows={4}/><WorksheetTable title="Future Title Ideas" columns={[{key:"title",label:"Title"},{key:"notes",label:"Notes"}]} rows={data.futureTitleIdeas} minRows={4}/></div><WorksheetArea title="Compare With Other Titles in Your Genre" value={data.compareWithOtherTitles}/>{data.notes?.length?<WorksheetArea title="Additional Notes" value={data.notes}/>:null}</div>;
}

function TargetAudienceDemographicsView({data}){
 const profiles=data.demographics||[];
 return <div className="demographic-display">{profiles.length?profiles.map((profile,index)=><article className="demographic-display-profile" key={profile._id||index}>
  <header className="demographic-display-header"><div><p>Reader Profile {index+1}</p><h3>{profile.fictionalName||"Unnamed Reader"}</h3></div><dl><div><dt>Age Range</dt><dd>{profile.ageRange||"—"}</dd></div><div><dt>Gender Identity</dt><dd>{profile.genderIdentity||"—"}</dd></div></dl></header>
  <section className="demographic-display-location"><h4>Location</h4><p>{profile.location||"—"}</p></section>
  <div className="demographic-display-columns"><section><h4>Lifestyle / Interests</h4>{profile.lifestyleInterests?.filter(Boolean).length?<ul>{profile.lifestyleInterests.filter(Boolean).map((item,itemIndex)=><li key={itemIndex}>{item}</li>)}</ul>:<p>—</p>}</section><section><h4>Looking For in a Book</h4>{profile.lookingForInBook?.filter(Boolean).length?<ul>{profile.lookingForInBook.filter(Boolean).map((item,itemIndex)=><li key={itemIndex}>{item}</li>)}</ul>:<p>—</p>}</section></div>
  <section className="demographic-display-text"><h4>Reading Habits</h4><p>{profile.readingHabits||"—"}</p></section>
  {profile.notes?.filter(Boolean).length?<section className="demographic-display-text"><h4>Profile Notes</h4>{profile.notes.filter(Boolean).map((note,noteIndex)=><p key={noteIndex}>{note}</p>)}</section>:null}
 </article>):<p className="planner-model-empty">No reader profiles have been saved.</p>}{data.notes?.filter(Boolean).length?<section className="demographic-display-general"><h3>General Audience Notes</h3>{data.notes.filter(Boolean).map((note,index)=><p key={index}>{note}</p>)}</section>:null}</div>;
}

function WordCountGoalView({data}){
 const tracker=data.wordCountTracker||[];
 const metrics=[
  ["Total Word Count Goal",Number(data.totalWordCountGoal||0).toLocaleString()],
  ["Daily Goal",Number(data.dailyWordCountGoal||0).toLocaleString()],
  ["Weekly Goal",Number(data.weeklyWordCountGoal||0).toLocaleString()],
  ["Monthly Goal",Number(data.monthlyWordCountGoal||0).toLocaleString()],
  ["Target Deadline",data.targetDeadline?new Date(data.targetDeadline).toLocaleDateString():"—"]
 ];
 return <div className="word-count-display"><dl className="word-count-display-metrics">{metrics.map(([label,metric])=><div key={label}><dt>{label}</dt><dd>{metric}</dd></div>)}</dl><section className="word-count-display-tracker"><h3>Word Count Tracker</h3>{tracker.length?<div className="word-count-display-entries"><div className="word-count-display-entry-head"><span>Date</span><span>Words Written</span><span>Actual</span><span>Daily Note</span></div>{tracker.map((row,index)=>{const actual=Number(data.dailyWordCountGoal||0)-Number(row.wordsWritten||0);return <div className="word-count-display-entry" key={row._id||index}><span>{row.dateDay?new Date(`${String(row.dateDay).slice(0,10)}T00:00:00`).toLocaleDateString():"—"}</span><span>{Number(row.wordsWritten||0).toLocaleString()}</span><span>{actual.toLocaleString()}</span><span>{row.dailyNote||"—"}</span></div>;})}</div>:<p>No tracking entries have been saved.</p>}</section></div>;
}

function ProjectOverviewPageView({pageKey,data,bubbleShapes=[]}){
 switch(pageKey){
  case "nameYourStory":return <NameYourStoryView data={data}/>;
  case "genreSubGenre":return <div className="planner-worksheet"><WorksheetArea title="Primary Genre" value={data.primaryGenre}/><WorksheetArea title="Sub-Genre(s)" value={data.subgenres}/><WorksheetArea title="Why This Genre?" value={data.whyThisGenre}/><WorksheetArea title="Genre Expectations / Tropes" value={data.genreExpectationsTropes}/><WorksheetArea title="Genre-Specific Ideas to Include" value={data.genreSpecificIdeasToInclude}/></div>;
  case "targetAudienceDemographics":return <TargetAudienceDemographicsView data={data}/>;
  case "wordCountGoalTracker":return <WordCountGoalView data={data}/>;
  case "themesMotifs":return <div className="planner-worksheet"><WorksheetArea title="Main Theme(s)" value={data.mainThemes}/><WorksheetTable title="Motifs & Symbols" columns={[{key:"motifSymbol",label:"Motif / Symbol"},{key:"represents",label:"What It Represents"},{key:"whereItAppearsInStory",label:"Where It Appears",width:"1.4fr"}]} rows={data.motifsSymbols} minRows={4}/><WorksheetArea title="How the Theme Will Show" value={data.themeShowMethods}/><WorksheetArea title="Reflection" value={data.reflection}/></div>;
  case "toneStyle":return <ToneStyleView data={data}/>;
  case "randomThoughts":return <RandomThoughtsView data={data} bubbleShapes={bubbleShapes}/>;
  case "elevatorPitch":return <div className="planner-worksheet"><h3 className="planner-worksheet-heading">Step-by-Step Pitch Builder</h3><div className="planner-worksheet-pair"><WorksheetArea title="1. Who is the protagonist / main character?" value={data.pitchBuilder?.protagonistMainCharacters}/><WorksheetArea title="2. What do they want?" value={data.pitchBuilder?.whatDoTheyWant}/></div><WorksheetArea title="3. What is standing in their way?" value={data.pitchBuilder?.standingInTheirWayConflict}/><WorksheetArea title="4. What is at stake if they fail?" value={data.pitchBuilder?.stakesIfTheyFail}/><WorksheetArea title="Draft Area — Your Elevator Pitch" value={data.elevatorPitchDraft}/><WorksheetArea title="Style Consistency Tracker" value={data.styleConsistency}/></div>;
  case "writingStyle":return <div className="planner-worksheet"><WorksheetArea title="Describe Your Style in Three Words / Sentences" value={data.styleCues}/><div className="planner-worksheet-pair"><WorksheetArea title="Tone / Mood" value={data.toneMood}/><WorksheetArea title="Sentence Style" value={data.sentenceStyle}/></div><WorksheetArea title="Style Pitfalls to Avoid" value={data.stylePitfallsToAvoid}/><WorksheetArea title="Style Reminders to Self" value={data.styleRemindersToSelf}/></div>;
  case "storyTimeline":return <div className="planner-worksheet"><WorksheetTable title="Story Timeline" columns={[{key:"chapterAct",label:"Chapter / Act"},{key:"event",label:"Event",width:"1.35fr"},{key:"timeDateEra",label:"Time / Date / Era"},{key:"notes",label:"Notes",width:"1.25fr"}]} rows={data.timeline} minRows={20}/></div>;
  case "futurePlanningNotes":return <div className="planner-worksheet"><div className="planner-worksheet-pair"><WorksheetArea title="Future Ideas" value={data.futureIdeas}/><WorksheetArea title="Sequel Ideas" value={data.sequelIdeas}/><WorksheetArea title="Expansion Ideas" value={data.expansionIdeas}/><WorksheetArea title="Revision Ideas" value={data.revisionIdeas}/></div><WorksheetArea title="Marketing Ideas" value={data.marketingIdeas}/><WorksheetArea title="Notes or Sketch Area" value={data.notes}/></div>;
  default:return <p className="planner-model-empty">This Project Overview page has no configured display.</p>;
 }
}

function FindYourThemeGuide(){
 return(
  <div className="find-theme-guide">
   <p className="find-theme-intro">The theme of your story is its deeper meaning—the emotional, moral, or philosophical takeaway that remains after the final page. It anchors character decisions, plot development, and emotional arcs.</p>
   <section className="find-theme-exploration">
    <h3>Theme Exploration</h3>
    <p>Your theme is the “why” behind your story. Consider whether the story is about healing, redemption, ambition, belonging, freedom, survival, or another idea that resonates throughout the characters’ choices and the plot.</p>
    <strong>Examples of popular themes</strong>
    <ul><li>Love conquers all</li><li>Power corrupts</li><li>Grief changes people</li><li>Family is found, not born</li><li>Freedom versus control</li><li>Survival through unity</li><li>The illusion of perfection</li></ul>
   </section>
   <div className="find-theme-columns">
    <section><h3>Theme Selection</h3><p>Choose a theme that emotionally resonates with you, fits your characters’ arcs, and can evolve or be challenged over the course of the plot.</p><p>Define what it means in your own words. Then consider character reflection, conflict, symbolism, and the final message left with the reader.</p></section>
    <div className="find-theme-column-stack">
     <section><h3>Theme Brainstorm</h3><p>What core message or idea do you want to explore? What personal belief could be expressed through fiction? What emotional truth should the characters wrestle with?</p></section>
     <section><h3>Multiple Themes</h3><p>Several themes can work together, but they should complement each other and enrich the core message instead of competing for attention.</p></section>
    </div>
   </div>
  </div>
 );
}

function PlannerSectionPage({sectionPath}){
 const {bookId:routeBookId,pageSlug}=useParams();
 const [record,setRecord]=useState(null);
 const [formData,setFormData]=useState({});
 const [showForm,setShowForm]=useState(false);
 const [saving,setSaving]=useState(false);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 const [formError,setFormError]=useState("");
 const [bubbleShapes,setBubbleShapes]=useState([]);
 const [loadingBubbleShapes,setLoadingBubbleShapes]=useState(false);

 const section=plannerWorkflowSections.find(item=>item.path===sectionPath);
 const selectedPage=section?.items.find(([,path])=>slugFromPath(path)===pageSlug)||section?.items[0];
 const selectedBookId=routeBookId||getStoredBookId();
 const user=useMemo(()=>getStoredUser(),[]);
 const userId=getObjectId(user?._id||user?.id||user);
 const storedBusinessId=getObjectId(user?.currentBusiness)||getObjectId(user?.business)||getObjectId(user?.business_id)||getObjectId(user?.businessRef);
 const [businessId,setBusinessId]=useState(storedBusinessId);
 const selectedData=selectedPage?.[2]?record?.[selectedPage[2]]:null;
 const isGuidePage=selectedPage?.[2]==="findYourThemeGuide";
 const isCharacterProfilesPage=section?.path==="/planner/characters"&&selectedPage?.[2]==="characterProfiles";

 useEffect(()=>{
  if(selectedPage?.[2]!=="randomThoughts"||!businessId){
   setBubbleShapes([]);
   return;
  }
  let ignore=false;
  const loadBubbleShapes=async()=>{
   setLoadingBubbleShapes(true);
   try{
    const params=new URLSearchParams({business_id:businessId});
    const response=await fetch(`/api/planner/bubble-shapes?${params.toString()}`);
    const payload=await response.json();
    if(!response.ok)throw new Error(payload?.message||"Predefined thought shapes could not load.");
    if(!ignore)setBubbleShapes(payload?.data||[]);
   }catch(err){
    if(!ignore)setFormError(err.message||"Predefined thought shapes could not load.");
   }finally{
    if(!ignore)setLoadingBubbleShapes(false);
   }
  };
  loadBubbleShapes();
  return()=>{ignore=true;};
 },[selectedPage?.[2],businessId]);

 const saveBubbleShape=async shape=>{
  const shapeId=getObjectId(shape.id);
  const shapeKey=String(shape.name||"custom-shape").trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const payload={business_id:businessId,user_id:userId,name:shape.name,shapeKey,...(!shapeId?{cssClass:""}:{}),customCss:shape.customCss,backgroundToken:shape.backgroundToken,textColor:shape.textColor,fontSize:shape.fontSize,isActive:true,updatedBy:userId,...(!shapeId?{createdBy:userId}:{})};
  const response=await fetch(shapeId?`/api/planner/bubble-shapes/${shapeId}`:"/api/planner/bubble-shapes",{
   method:shapeId?"PUT":"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify(payload)
  });
  const result=await response.json();
  if(!response.ok)throw new Error(result?.message||"Shape could not save.");
  setBubbleShapes(current=>shapeId?current.map(item=>getObjectId(item)===shapeId?result.data:item):[...current,result.data].sort((left,right)=>left.name.localeCompare(right.name)));
  return result.data;
 };

 const deleteBubbleShape=async shape=>{
  const shapeId=getObjectId(shape);
  const response=await fetch(`/api/planner/bubble-shapes/${shapeId}`,{method:"DELETE"});
  const result=await response.json();
  if(!response.ok)throw new Error(result?.message||"Shape could not be deleted.");
  setBubbleShapes(current=>current.filter(item=>getObjectId(item)!==shapeId));
 };

 useEffect(()=>{
  if(businessId)return;

  let ignore=false;

  loadCurrentBusiness()
   .then(business=>{
    if(!ignore)setBusinessId(getObjectId(business));
   })
   .catch(err=>{
    if(!ignore)setError(err.message||"Current business could not load.");
   });

  return()=>{
   ignore=true;
  };
 },[businessId]);

 const loadRecord=async({createIfMissing=false}={})=>{
  if(!section?.endpoint||!selectedBookId||!businessId||!userId){
   setRecord(null);
   return null;
  }

  setLoading(true);
  setError("");

  try{
   const params=new URLSearchParams({
    business_id:businessId,
    user_id:userId,
    book_id:selectedBookId
   });
   const res=await fetch(`${section.endpoint}?${params.toString()}`);
   const payload=await res.json();

   if(!res.ok)throw new Error(payload?.message||"Planner data could not load.");

   if(payload?.data){
    setRecord(payload.data);
    return payload.data;
   }

   if(createIfMissing){
    const createPayload={
     business_id:businessId,
     user_id:userId,
     book_id:selectedBookId,
     createdBy:userId,
     updatedBy:userId
    };

    const createRes=await fetch(section.endpoint,{
     method:"POST",
     headers:{"Content-Type":"application/json"},
     body:JSON.stringify(createPayload)
    });
    const createData=await createRes.json();

    if(!createRes.ok)throw new Error(createData?.message||"Planner section could not be created.");
    setRecord(createData?.data||null);
    return createData?.data||null;
   }

   setRecord(null);
   return null;
  }catch(err){
   setError(err.message||"Planner data could not load.");
   return null;
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  let ignore=false;

  const load=async()=>{
   const loaded=await loadRecord();
   if(ignore)return;
   setRecord(loaded);
  };

  load();

  return()=>{
   ignore=true;
  };
 },[section?.endpoint,selectedBookId,businessId,userId]);

 const openSectionForm=async()=>{
  setFormError("");
  const latest=record||await loadRecord({createIfMissing:true});
  const sectionKey=selectedPage?.[2];
  setFormData(cloneValue(sectionKey?latest?.[sectionKey]:latest)||{});
  setShowForm(true);
 };

 const handleFormChange=(path,value)=>{
  setFormData(current=>setNestedValue(current,path,value));
 };

 const saveSectionForm=async event=>{
  event.preventDefault();

  if(!section?.endpoint||!selectedPage?.[2])return;

  try{
   setSaving(true);
   setFormError("");

   const payload={
    ...(record||{}),
    business_id:businessId,
    user_id:userId,
    book_id:selectedBookId,
    updatedBy:userId,
    [selectedPage[2]]:formData
   };

   delete payload._id;
   delete payload.id;
   delete payload.__v;
   delete payload.createdAt;
   delete payload.updatedAt;

   const targetId=getObjectId(record);
   const res=await fetch(targetId?`${section.endpoint}/${targetId}`:section.endpoint,{
    method:targetId?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });
   const data=await res.json();

   if(!res.ok)throw new Error(data?.message||"Planner section could not save.");

   setRecord(data?.data||null);
   setShowForm(false);
  }catch(err){
   setFormError(err.message||"Planner section could not save.");
  }finally{
   setSaving(false);
  }
 };

 if(!section)return <Alert variant="warning">Planner section not found.</Alert>;

 return(
  <main className="planner-page">
   <BubbleShapeStyleRules shapes={bubbleShapes}/>
   <section className="planner-page-header">
    <p className="planner-page-kicker">Planner Workflow</p>
    <h1 className="planner-page-title">{section.label}</h1>
    {!isGuidePage?<Button
      type="button"
      className="planner-section-form-button"
      onClick={openSectionForm}
      disabled={!selectedBookId||!businessId||!userId||loading}
     >
      {selectedData?"Edit Section":"Add Section"}
     </Button>:null}
   </section>

   {!selectedBookId?<Alert variant="warning">Select or create a book before opening planner pages.</Alert>:null}
   {!businessId||!userId?<Alert variant="warning">Sign in with a selected business before opening planner pages.</Alert>:null}
   {error?<Alert variant="warning">{error}</Alert>:null}

   <div className="row g-4">
    <aside className="col-lg-3">
     <Card>
      <Card.Body className="planner-model-nav">
       <p className="planner-page-kicker">Section Pages</p>
       {section.items.map(([label,path])=>(
        <Link
         className={`planner-model-nav-item${selectedPage?.[1]===path?" active":""}`}
         to={`${selectedBookId?`/books/${selectedBookId}`:""}${path}`}
         key={path}
        >
         {label}
        </Link>
       ))}
      </Card.Body>
     </Card>
    </aside>

    <section className="col-lg-9">
     <Card className={`planner-display-card${showForm&&isCharacterProfilesPage?" character-profile-edit-card":""}`}>
      <Card.Body>
       {showForm&&isCharacterProfilesPage?<Form className="character-profile-page-form" onSubmit={saveSectionForm}><CharacterProfilesEditor value={formData} onChange={handleFormChange}/>{formError?<Alert variant="danger">{formError}</Alert>:null}<footer className="character-profile-savebar"><Button type="button" variant="outline-secondary" onClick={()=>setShowForm(false)} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving?"Saving Character Profiles...":"Save Character Profiles"}</Button></footer></Form>:<>
       <p className="planner-page-kicker">{section.label}</p>
       <h2 className="planner-section-data-title">{selectedPage?.[0]||section.label}</h2>

       {isGuidePage?(
        <FindYourThemeGuide/>
       ):loading?(
        <div className="planner-pdf-loading">
         <Spinner animation="border" size="sm"/>
         Loading planner data...
        </div>
       ):selectedData?(
        selectedPage?.[2]==="storyDashboard"?<StoryDashboardView data={selectedData}/>:section.path==="/planner/project-overview"?<ProjectOverviewPageView pageKey={selectedPage?.[2]} data={selectedData} bubbleShapes={bubbleShapes}/>:section.path==="/planner/characters"?<CharacterDevelopmentView pageKey={selectedPage?.[2]} data={selectedData}/>:section.path==="/planner/world-building"?<WorldBuildingView pageKey={selectedPage?.[2]} data={selectedData}/>:section.path==="/planner/plot-structure"?<PlotStructureView pageKey={selectedPage?.[2]} data={selectedData}/>:section.path==="/planner/chapters-scenes"?<ChaptersScenesView pageKey={selectedPage?.[2]} data={selectedData}/>:section.path==="/planner/writing-progress"?<WritingProgressView pageKey={selectedPage?.[2]} data={selectedData}/>:section.path==="/planner/research-inspiration"?<ResearchInspirationView pageKey={selectedPage?.[2]} data={selectedData}/>:section.path==="/planner/revision-editing"?<RevisionEditingView pageKey={selectedPage?.[2]} data={selectedData}/>:section.path==="/planner/notes-extras"?<NotesExtrasView pageKey={selectedPage?.[2]} data={selectedData}/>:<p className="planner-model-empty">This planner page is not configured.</p>
       ):(
        <p className="planner-model-empty">No saved data for this page yet.</p>
       )}</>}
      </Card.Body>
     </Card>
   </section>
  </div>

  <Modal className="planner-page-modal" show={showForm&&!isCharacterProfilesPage} onHide={()=>!saving&&setShowForm(false)} size="xl" centered backdrop="static">
   <Form onSubmit={saveSectionForm}>
    <Modal.Header closeButton={!saving}>
     <Modal.Title>{selectedData?"Edit":"Add"} {selectedPage?.[0]||section.label}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     {formError?<Alert variant="danger">{formError}</Alert>:null}
     {formData!==null&&formData!==undefined?(
      section?.path==="/planner/project-overview"?<ProjectOverviewEditor pageKey={selectedPage?.[2]} value={formData} onChange={handleFormChange} bubbleShapes={bubbleShapes} loadingBubbleShapes={loadingBubbleShapes} onSaveShape={saveBubbleShape} onDeleteShape={deleteBubbleShape}/>:section?.path==="/planner/characters"?<CharacterDevelopmentEditor pageKey={selectedPage?.[2]} value={formData} onChange={handleFormChange}/>:section?.path==="/planner/world-building"?<WorldBuildingEditor pageKey={selectedPage?.[2]} value={formData} onChange={handleFormChange}/>:section?.path==="/planner/plot-structure"?<PlotStructureEditor pageKey={selectedPage?.[2]} value={formData} onChange={handleFormChange}/>:section?.path==="/planner/chapters-scenes"?<ChaptersScenesEditor pageKey={selectedPage?.[2]} value={formData} onChange={handleFormChange}/>:section?.path==="/planner/writing-progress"?<WritingProgressEditor pageKey={selectedPage?.[2]} value={formData} onChange={handleFormChange}/>:section?.path==="/planner/research-inspiration"?<ResearchInspirationEditor pageKey={selectedPage?.[2]} value={formData} onChange={handleFormChange}/>:section?.path==="/planner/revision-editing"?<RevisionEditingEditor pageKey={selectedPage?.[2]} value={formData} onChange={handleFormChange}/>:section?.path==="/planner/notes-extras"?<NotesExtrasEditor pageKey={selectedPage?.[2]} value={formData} onChange={handleFormChange}/>:<p className="planner-model-empty">This planner form is not configured.</p>
     ):(
      <p className="planner-model-empty">This section has no editable fields yet.</p>
     )}
    </Modal.Body>
    <Modal.Footer>
     <Button type="button" variant="outline-secondary" onClick={()=>setShowForm(false)} disabled={saving}>Cancel</Button>
     <Button type="submit" disabled={saving}>{saving?"Saving...":"Save Section"}</Button>
    </Modal.Footer>
   </Form>
  </Modal>
  </main>
 );
}

export default PlannerSectionPage;
