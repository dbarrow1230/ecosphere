import {useEffect,useMemo,useRef,useState} from "react";
import {ChevronLeft,ChevronRight,Headphones,Keyboard,Pause,Play,RotateCcw} from "lucide-react";
import {createMorseKeyer,MORSE_CODES,playMorseText} from "../utils/morseAudio.js";
import "../styles/MorseLearning.css";

const STUDY_CLASSES=[
 {value:"technician",label:"Technician Class",track:"0-5",wpm:5,copyFormat:"Beginning character recognition and plain-language QSO copy",reviewTitle:"Random code with spoken answers",testTitle:"5 WPM beginning QSO copy"},
 {value:"general",label:"General Class",track:"5-16",wpm:13,copyFormat:"Plain-language HF QSO copy at the traditional General pace",reviewTitle:"13 WPM plain-language and QSO review",testTitle:"13 WPM General copy test"},
 {value:"extra",label:"Amateur Extra Class",track:"10-28",wpm:20,copyFormat:"Fast plain-language, call-sign, and operating-signal copy",reviewTitle:"20 WPM operating-text review",testTitle:"20 WPM Extra copy test"},
 {value:"grol-radar",label:"Commercial / GROL + Radar",track:"10-28",wpm:20,copyFormat:"Plain language plus five-character groups used in commercial radiotelegraph practice",reviewTitle:"Five-character commercial code groups",testTitle:"Commercial mixed-copy test"},
 {value:"morse",label:"Standalone Morse Code",track:"0-5",wpm:5,copyFormat:"Character recognition, sending practice, and progressive copy",reviewTitle:"Random code with spoken answers",testTitle:"Progressive Morse copy test"}
];
const MORSE_TRACKS=[
 {value:"0-5",label:"0–5 WPM — Beginning Morse",wpm:[1,2,3,4,5],description:"Character recognition, basic timing, and beginning copy."},
 {value:"5-16",label:"5–16 WPM — Intermediate Morse",wpm:[5,8,10,12,13,15,16],description:"Build reliable copy speed with mixed characters and operating text."},
 {value:"10-28",label:"10–28 WPM — Advanced Morse",wpm:[10,15,20,25,28],description:"Faster copy and keying practice for on-air operating."}
];
const LESSON_1=["E","T","M","A","N","I","S","O","SK","."];
const LESSON_2=["R","U","D","C","5","0","AR","?"];
const LESSON_3=["K","P","B","G","W","F","H","BT",","];
const LESSON_4=["Q","L","Y","J","X","V","Z","DN","1","2","3","4","6","7","8","9"];
const ALL_SYMBOLS=[...LESSON_1,...LESSON_2,...LESSON_3,...LESSON_4];
const getLessons=studyClass=>[
 {id:1,title:"E T M A N I S O - SK - Period",characters:LESSON_1,focus:"Learn this first character, prosign, and punctuation set by sound."},
 {id:2,title:"R U D C 5 0 - AR - Question Mark",characters:LESSON_2,focus:"Add the second character set, two numbers, the AR prosign, and question mark."},
 {id:3,title:"K P B G W F H - BT - Comma",characters:LESSON_3,focus:"Add the third character set, the BT prosign, and comma."},
 {id:4,title:"Q L Y J X V Z - DN - 1 2 3 4 6 7 8 9",characters:LESSON_4,focus:"Complete the remaining letters, DN prosign, and remaining numbers."},
 {id:5,title:studyClass.reviewTitle,characters:ALL_SYMBOLS,focus:`Class review format: ${studyClass.copyFormat}.`},
 {id:6,title:studyClass.testTitle,characters:ALL_SYMBOLS,focus:`Class test format at ${studyClass.wpm} WPM: ${studyClass.copyFormat}.`}
];

export default function MorseLearningPage(){
 const [studyClass,setStudyClass]=useState(()=>localStorage.getItem("hamRadioStudyClass")||"technician");
 const [morseTrack,setMorseTrack]=useState(()=>localStorage.getItem("morseTrainingTrack")||"0-5");
 const [lessonId,setLessonId]=useState(1);
 const [selectedIndex,setSelectedIndex]=useState(0);
 const [wpm,setWpm]=useState(()=>{const track=MORSE_TRACKS.find(item=>item.value===(localStorage.getItem("morseTrainingTrack")||"0-5"))||MORSE_TRACKS[0];return track.wpm[track.wpm.length-1];});
 const [isPlaying,setIsPlaying]=useState(false);
 const [isKeying,setIsKeying]=useState(false);
 const [keyedCode,setKeyedCode]=useState("");
 const [keyingResult,setKeyingResult]=useState(null);
 const [error,setError]=useState("");
 const playbackRef=useRef(null);
 const keyerRef=useRef(null);
 const keyStartRef=useRef(0);
 const selectedClass=STUDY_CLASSES.find(item=>item.value===studyClass)||STUDY_CLASSES[0];
 const lessons=useMemo(()=>getLessons(selectedClass),[selectedClass]);
 const lesson=lessons.find(item=>item.id===Number(lessonId))||lessons[0];
 const selectedTrack=MORSE_TRACKS.find(item=>item.value===morseTrack)||MORSE_TRACKS[0];
 const characters=useMemo(()=>lesson.characters,[lesson]);
 const selected=characters[selectedIndex]||characters[0];
 const expectedCode=MORSE_CODES[selected]||"";

 const stopExample=async()=>{
  await playbackRef.current?.stop();
  playbackRef.current=null;
  setIsPlaying(false);
 };

 const playExample=async()=>{
  await stopExample();
  setError("");
  setIsPlaying(true);
  try{
   const playback=playMorseText(selected,{wpm:Number(wpm)});
   playbackRef.current=playback;
   await playback.finished;
  }catch(playError){setError(playError.message||"The Morse example could not be played.");}
  finally{playbackRef.current=null;setIsPlaying(false);}
 };

 const resetKeying=()=>{setKeyedCode("");setKeyingResult(null);};

 useEffect(()=>{
  const ignoreTarget=target=>["INPUT","SELECT","TEXTAREA","BUTTON"].includes(target?.tagName)||target?.isContentEditable;
  const keyDown=event=>{
   if(event.code!=="Space"||event.repeat||ignoreTarget(event.target))return;
   event.preventDefault();
   if(keyedCode.length>=expectedCode.length)return;
   try{
    keyerRef.current??=createMorseKeyer();
    keyStartRef.current=performance.now();
    keyerRef.current.keyDown();
    setIsKeying(true);
   }catch(keyError){setError(keyError.message||"The practice key could not start.");}
  };
  const keyUp=event=>{
   if(event.code!=="Space"||ignoreTarget(event.target))return;
   event.preventDefault();
   keyerRef.current?.keyUp();
   setIsKeying(false);
   if(!keyStartRef.current)return;
   const duration=performance.now()-keyStartRef.current;
   keyStartRef.current=0;
   const dotMilliseconds=1200/Math.max(1,Number(wpm)||5);
   const symbol=duration<dotMilliseconds*2?".":"-";
   setKeyedCode(current=>{
    const next=(current+symbol).slice(0,expectedCode.length);
    if(next.length===expectedCode.length)setKeyingResult(next===expectedCode?"correct":"incorrect");
    return next;
   });
  };
  window.addEventListener("keydown",keyDown);
  window.addEventListener("keyup",keyUp);
  return()=>{window.removeEventListener("keydown",keyDown);window.removeEventListener("keyup",keyUp);};
 },[expectedCode,keyedCode.length,wpm]);

 useEffect(()=>()=>{playbackRef.current?.stop();keyerRef.current?.close();},[]);

 const chooseStudyClass=value=>{const nextClass=STUDY_CLASSES.find(item=>item.value===value)||STUDY_CLASSES[0];const nextTrack=MORSE_TRACKS.find(item=>item.value===nextClass.track)||MORSE_TRACKS[0];stopExample();setStudyClass(nextClass.value);setMorseTrack(nextTrack.value);setWpm(nextClass.wpm);setLessonId(1);setSelectedIndex(0);resetKeying();localStorage.setItem("hamRadioStudyClass",nextClass.value);localStorage.setItem("morseTrainingTrack",nextTrack.value);};
 const chooseMorseTrack=value=>{const track=MORSE_TRACKS.find(item=>item.value===value)||MORSE_TRACKS[0];stopExample();setMorseTrack(track.value);setWpm(track.wpm[track.wpm.length-1]);localStorage.setItem("morseTrainingTrack",track.value);resetKeying();};
 const chooseLesson=value=>{stopExample();setLessonId(Number(value));setSelectedIndex(0);resetKeying();};
 const chooseCharacter=index=>{stopExample();setSelectedIndex(index);resetKeying();};
 const move=direction=>chooseCharacter((selectedIndex+direction+characters.length)%characters.length);

 return <main className="morse-learning-page">
  <header className="morse-learning-hero"><div className="morse-learning-hero-icon"><Headphones size={34}/></div><div><span className="morse-learning-kicker">Class-based sight, sound, keying, and copy</span><h1>Morse Learning</h1><p>Select the class being studied. Speeds, review drills, and test practice adjust to that class.</p></div></header>

  <section className="morse-learning-controls" aria-label="Learning controls">
   <label>Class being studied<select value={studyClass} onChange={event=>chooseStudyClass(event.target.value)}>{STUDY_CLASSES.map(item=><option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
   <label>Morse training track<select value={morseTrack} onChange={event=>chooseMorseTrack(event.target.value)}>{MORSE_TRACKS.map(item=><option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
   <label>Lesson<select value={lessonId} onChange={event=>chooseLesson(event.target.value)}>{lessons.map(item=><option value={item.id} key={item.id}>Lesson {item.id}: {item.title}</option>)}</select></label>
   <label>Keying speed<select value={wpm} onChange={event=>{setWpm(event.target.value);resetKeying();}}>{selectedTrack.wpm.map(speed=><option value={speed} key={speed}>{speed} WPM</option>)}</select></label>
  </section>
  <div className="morse-learning-course-note"><strong>{selectedClass.label}:</strong> {selectedClass.copyFormat}. <strong>{selectedTrack.label}:</strong> {selectedTrack.description}</div>
  <div className="morse-learning-focus"><strong>Lesson focus:</strong> {lesson.focus}</div>
  {error?<div className="morse-learning-error" role="alert">{error}</div>:null}

  <section className="morse-learning-study-card" aria-live="polite">
   <button type="button" className="morse-learning-step" onClick={()=>move(-1)} aria-label="Previous character"><ChevronLeft/></button>
   <div className="morse-learning-character"><span>{/\d/.test(selected)?"Number":selected.length>1?"Prosign":[".",",","?"].includes(selected)?"Punctuation":"Letter"}</span><strong>{selected}</strong></div>
   <div className="morse-learning-code"><span>Morse code</span><strong>{expectedCode}</strong></div>
   <div className="morse-learning-audio"><button type="button" onClick={isPlaying?stopExample:playExample}>{isPlaying?<><Pause size={20}/> Stop Example</>:<><Play size={20}/> Hear Example</>}</button><button type="button" onClick={playExample} disabled={isPlaying}><RotateCcw size={20}/> Repeat Example</button></div>
   <button type="button" className="morse-learning-step" onClick={()=>move(1)} aria-label="Next character"><ChevronRight/></button>
  </section>

  <section className={`morse-keyer-panel${isKeying?" is-keying":""}`}>
   <div className="morse-keyer-icon"><Keyboard size={30}/></div>
   <div className="morse-keyer-copy"><h2>Your turn: key {selected}</h2><p>Click outside the controls, then hold the <kbd>Space bar</kbd> for a dash or tap it for a dot. Release between each element.</p></div>
   <div className="morse-keyer-output"><span>Your keying</span><strong>{keyedCode||"Waiting…"}</strong><small>{keyedCode.length} of {expectedCode.length} elements</small></div>
   <button type="button" className="morse-keyer-reset" onClick={resetKeying}><RotateCcw size={18}/> Try Again</button>
   {keyingResult?<div className={`morse-keyer-result ${keyingResult}`}>{keyingResult==="correct"?`Correct — you keyed ${selected} (${expectedCode}).`:`Not quite — ${selected} is ${expectedCode}. Listen and try again.`}</div>:null}
  </section>

  <section className="morse-learning-picker" aria-label="Character selector">{characters.map((character,index)=><button type="button" key={character} className={index===selectedIndex?"active":""} onClick={()=>chooseCharacter(index)}><strong>{character}</strong><span>{MORSE_CODES[character]}</span></button>)}</section>
 </main>;
}
