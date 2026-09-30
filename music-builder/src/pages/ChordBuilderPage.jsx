import {useMemo,useState} from "react";
import {RotateCcw,Volume2,Play} from "lucide-react";
import GrandStaff from "../components/GrandStaff.jsx";
import "../styles/ChordBuilderPage.css";

const NOTES=[
 {name:"C",pitch:0},{name:"C♯ / D♭",short:"C♯",pitch:1},{name:"D",pitch:2},{name:"D♯ / E♭",short:"D♯",pitch:3},
 {name:"E",pitch:4},{name:"F",pitch:5},{name:"F♯ / G♭",short:"F♯",pitch:6},{name:"G",pitch:7},
 {name:"G♯ / A♭",short:"G♯",pitch:8},{name:"A",pitch:9},{name:"A♯ / B♭",short:"A♯",pitch:10},{name:"B",pitch:11}
];

const CHORD_TYPES=[
 {suffix:"",label:"Major",intervals:[0,4,7]},{suffix:"m",label:"Minor",intervals:[0,3,7]},
 {suffix:"dim",label:"Diminished",intervals:[0,3,6]},{suffix:"aug",label:"Augmented",intervals:[0,4,8]},
 {suffix:"sus2",label:"Suspended 2nd",intervals:[0,2,7]},{suffix:"sus4",label:"Suspended 4th",intervals:[0,5,7]},
 {suffix:"6",label:"Major 6th",intervals:[0,4,7,9]},{suffix:"m6",label:"Minor 6th",intervals:[0,3,7,9]},
 {suffix:"7",label:"Dominant 7th",intervals:[0,4,7,10]},{suffix:"maj7",label:"Major 7th",intervals:[0,4,7,11]},
 {suffix:"m7",label:"Minor 7th",intervals:[0,3,7,10]},{suffix:"m(maj7)",label:"Minor-major 7th",intervals:[0,3,7,11]},
 {suffix:"m7♭5",label:"Half-diminished 7th",intervals:[0,3,6,10]},{suffix:"dim7",label:"Diminished 7th",intervals:[0,3,6,9]},
 {suffix:"aug7",label:"Augmented 7th",intervals:[0,4,8,10]},{suffix:"aug(maj7)",label:"Augmented major 7th",intervals:[0,4,8,11]},
 {suffix:"add9",label:"Added 9th",intervals:[0,2,4,7]},{suffix:"m(add9)",label:"Minor added 9th",intervals:[0,2,3,7]},
 {suffix:"maj9",label:"Major 9th",intervals:[0,2,4,7,11]},{suffix:"m9",label:"Minor 9th",intervals:[0,2,3,7,10]},
 {suffix:"9",label:"Dominant 9th",intervals:[0,2,4,7,10]},
 {suffix:"add11",label:"Added 11th",intervals:[0,4,5,7]},{suffix:"maj11",label:"Major 11th",intervals:[0,2,4,5,7,11]},
 {suffix:"m11",label:"Minor 11th",intervals:[0,2,3,5,7,10]},{suffix:"11",label:"Dominant 11th",intervals:[0,2,4,5,7,10]},
 {suffix:"add13",label:"Added 13th",intervals:[0,4,7,9]},{suffix:"maj13",label:"Major 13th",intervals:[0,2,4,5,7,9,11]},
 {suffix:"m13",label:"Minor 13th",intervals:[0,2,3,5,7,9,10]},{suffix:"13",label:"Dominant 13th",intervals:[0,2,4,5,7,9,10]}
];

const sameSet=(left,right)=>left.length===right.length&&left.every(value=>right.includes(value));
const noteName=pitch=>NOTES.find(note=>note.pitch===pitch)?.short||NOTES.find(note=>note.pitch===pitch)?.name;

function identifyChord(selected,preferredRoot=null){
 if(selected.length<2)return null;
 const matches=[];
 for(const root of selected){
  const intervals=selected.map(pitch=>(pitch-root+12)%12).sort((a,b)=>a-b);
  for(const type of CHORD_TYPES){
   if(sameSet(intervals,type.intervals))matches.push({root,type});
  }
 }
 if(!matches.length)return null;
 const match=matches.find(item=>item.root===preferredRoot)||matches[0];
 const bass=selected[0];
 const formatName=item=>`${noteName(item.root)}${item.type.suffix}${bass!==item.root?`/${noteName(bass)}`:""}`;
 return{
  name:formatName(match),
  quality:match.type.label,
  root:noteName(match.root),
  rootPitch:match.root,
  bass:noteName(bass),
  intervals:match.type.intervals,
  alternatives:matches.slice(1).map(formatName)
 };
}

export default function ChordBuilderPage(){
 const [selected,setSelected]=useState([]);
 const [preferredRoot,setPreferredRoot]=useState(null);
 const [quickRoot,setQuickRoot]=useState(0);
 const [quickCategory,setQuickCategory]=useState("Triads");
 const chord=useMemo(()=>identifyChord(selected,preferredRoot),[selected,preferredRoot]);
 const toggleNote=pitch=>setSelected(current=>{
  if(current.includes(pitch)){
   const next=current.filter(value=>value!==pitch);
   if(pitch===preferredRoot)setPreferredRoot(next[0]??null);
   return next;
  }
  if(!current.length)setPreferredRoot(pitch);
  return[...current,pitch];
 });
 const inversionNames=["Root position","1st inversion","2nd inversion","3rd inversion","4th inversion","5th inversion","6th inversion"];
 const getQuickCategory=type=>type.intervals.length===3?"Triads":type.suffix.includes("7")?"Sevenths":/[9]|11|13/.test(type.suffix)?"Extended":"Other";
 const quickCategories=["Triads","Sevenths","Extended","Other"];
 const startChord=type=>{setPreferredRoot(quickRoot);setSelected(type.intervals.map(interval=>(quickRoot+interval)%12));};
 const chooseInversion=index=>{
  if(!chord)return;
  const bass=(chord.rootPitch+chord.intervals[index])%12;
  setSelected([bass,...selected.filter(pitch=>pitch!==bass)]);
 };
 const playPitches=(pitches,arpeggiate=false)=>{
  if(!pitches.length)return;
  const AudioContextClass=window.AudioContext||window.webkitAudioContext;
  if(!AudioContextClass)return;
  const context=new AudioContextClass();
  let previousPitch=-1;
  const voicedPitches=pitches.map(pitch=>{
   let voicedPitch=pitch;
   while(voicedPitch<=previousPitch)voicedPitch+=12;
   previousPitch=voicedPitch;
   return voicedPitch;
  });
  voicedPitches.forEach((pitch,index)=>{
   const start=context.currentTime+(arpeggiate?index*.32:0);
   const oscillator=context.createOscillator();
   const gain=context.createGain();
   oscillator.type="triangle";
   oscillator.frequency.value=261.63*Math.pow(2,pitch/12);
   gain.gain.setValueAtTime(.0001,start);
   gain.gain.exponentialRampToValueAtTime(.16/Math.max(1,Math.sqrt(voicedPitches.length)),start+.025);
   gain.gain.exponentialRampToValueAtTime(.0001,start+.75);
   oscillator.connect(gain).connect(context.destination);
   oscillator.start(start);
   oscillator.stop(start+.8);
  });
  window.setTimeout(()=>context.close(),(arpeggiate?pitches.length*.32:0)*1000+1000);
 };

 return(
  <section className="chord-builder-page">
   <header className="chord-builder-hero"><p>Interactive Music Theory</p><h1>Chord Builder</h1><span>Select notes in the order you play them. The first selected note is treated as the bass note.</span></header>
   <div className="chord-builder-layout">
    <section className="chord-builder-workbench">
     <div className="chord-builder-result">
      <span>{selected.length?"Detected chord":"Choose some notes"}</span>
      <strong>{chord?.name||"—"}</strong>
      <p>{chord?`${chord.quality} · Root ${chord.root}${chord.bass!==chord.root?` · ${chord.bass} in the bass`:""}${chord.alternatives.length?` · Also: ${chord.alternatives.join(", ")}`:""}`:selected.length>1?"These notes do not match a supported chord yet.":"Start with any root, then add the other chord tones."}</p>
     </div>
     <GrandStaff pitches={selected} chordName={chord?.name||""} keyRoot={chord?.root||"C"} quality={chord?.quality||"Major"}/>
     <div className="chord-builder-selected" aria-label="Selected notes">
      {selected.length?selected.map((pitch,index)=><button type="button" onClick={()=>toggleNote(pitch)} key={pitch}><span>{index===0?"Bass":index+1}</span>{noteName(pitch)}</button>):<span>No notes selected</span>}
     </div>
     {chord&&<div className="chord-builder-inversions"><span>Choose inversion</span><div>{chord.intervals.map((interval,index)=>{const bass=(chord.rootPitch+interval)%12;return <button type="button" className={selected[0]===bass?"is-active":""} onClick={()=>chooseInversion(index)} key={interval}><strong>{inversionNames[index]}</strong><small>{noteName(bass)} in bass</small></button>;})}</div></div>}
     <div className="chord-builder-audio"><button type="button" onClick={()=>playPitches(selected)} disabled={!selected.length}><Volume2 size={17}/> Hear chord</button><button type="button" onClick={()=>playPitches(selected,true)} disabled={!selected.length}><Play size={17}/> Hear notes</button></div>
     <div className="chord-builder-notes">
      {NOTES.map(note=><button type="button" className={selected.includes(note.pitch)?"is-selected":""} aria-pressed={selected.includes(note.pitch)} onClick={()=>toggleNote(note.pitch)} key={note.pitch}><strong>{note.name}</strong><small>{selected.includes(note.pitch)?"Selected":"Add note"}</small></button>)}
     </div>
     <button type="button" className="chord-builder-reset" onClick={()=>{setSelected([]);setPreferredRoot(null);}} disabled={!selected.length}><RotateCcw size={17}/> Clear notes</button>
    </section>
    <aside className="chord-builder-help chord-builder-quick-start">
     <Volume2 size={28}/><h2>Quick Start</h2>
     <label>Root note<select value={quickRoot} onChange={event=>setQuickRoot(Number(event.target.value))}>{NOTES.map(note=><option value={note.pitch} key={note.pitch}>{note.name}</option>)}</select></label>
     <div className="quick-start-tabs" role="tablist" aria-label="Quick-start chord categories">{quickCategories.map(category=><button type="button" role="tab" aria-selected={quickCategory===category} className={quickCategory===category?"is-active":""} onClick={()=>setQuickCategory(category)} key={category}>{category}</button>)}</div>
     <div className="quick-start-list">{CHORD_TYPES.filter(type=>getQuickCategory(type)===quickCategory).map(type=><button type="button" onClick={()=>startChord(type)} key={`${type.suffix}-${type.label}`}><strong>{noteName(quickRoot)}{type.suffix}</strong><span>{type.label}</span><small>{type.intervals.map(interval=>noteName((quickRoot+interval)%12)).join(" · ")}</small></button>)}</div>
     <p>Choose a base chord, then use the inversion controls or add and remove notes in the builder.</p>
    </aside>
   </div>
  </section>
 );
}
