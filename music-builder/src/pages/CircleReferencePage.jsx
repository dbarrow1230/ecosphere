import {useMemo,useState} from "react";
import "../styles/CircleReferencePage.css";

const FIFTHS=[
 {major:"C",minor:"Am",key:"0"},{major:"G",minor:"Em",key:"1♯"},{major:"D",minor:"Bm",key:"2♯"},
 {major:"A",minor:"F♯m",key:"3♯"},{major:"E",minor:"C♯m",key:"4♯"},{major:"B",minor:"G♯m",key:"5♯"},
 {major:"F♯",minor:"D♯m",key:"6♯"},{major:"D♭",minor:"B♭m",key:"5♭"},{major:"A♭",minor:"Fm",key:"4♭"},
 {major:"E♭",minor:"Cm",key:"3♭"},{major:"B♭",minor:"Gm",key:"2♭"},{major:"F",minor:"Dm",key:"1♭"}
];

const KEY_CHORDS={
 C:["C","F","G","Dm","Em","Am","Bdim"],G:["G","C","D","Am","Bm","Em","F♯dim"],
 D:["D","G","A","Em","F♯m","Bm","C♯dim"],A:["A","D","E","Bm","C♯m","F♯m","G♯dim"],
 E:["E","A","B","F♯m","G♯m","C♯m","D♯dim"],B:["B","E","F♯","C♯m","D♯m","G♯m","A♯dim"],
 "F♯":["F♯","B","C♯","G♯m","A♯m","D♯m","E♯dim"],"G♭":["G♭","C♭","D♭","A♭m","B♭m","E♭m","Fdim"],
 "C♭":["C♭","F♭","G♭","D♭m","E♭m","A♭m","B♭dim"],"D♭":["D♭","G♭","A♭","E♭m","Fm","B♭m","Cdim"],
 "A♭":["A♭","D♭","E♭","B♭m","Cm","Fm","Gdim"],"E♭":["E♭","A♭","B♭","Fm","Gm","Cm","Ddim"],
 "B♭":["B♭","E♭","F","Cm","Dm","Gm","Adim"],F:["F","B♭","C","Gm","Am","Dm","Edim"]
};

const KEY_SCALES={
 C:["C","D","E","F","G","A","B"],G:["G","A","B","C","D","E","F♯"],D:["D","E","F♯","G","A","B","C♯"],
 A:["A","B","C♯","D","E","F♯","G♯"],E:["E","F♯","G♯","A","B","C♯","D♯"],B:["B","C♯","D♯","E","F♯","G♯","A♯"],
 "F♯":["F♯","G♯","A♯","B","C♯","D♯","E♯"],"G♭":["G♭","A♭","B♭","C♭","D♭","E♭","F"],
 "C♭":["C♭","D♭","E♭","F♭","G♭","A♭","B♭"],"D♭":["D♭","E♭","F","G♭","A♭","B♭","C"],
 "A♭":["A♭","B♭","C","D♭","E♭","F","G"],"E♭":["E♭","F","G","A♭","B♭","C","D"],
 "B♭":["B♭","C","D","E♭","F","G","A"],F:["F","G","A","B♭","C","D","E"]
};

const MAJOR_DEGREES=[
 {roman:"I",number:"1",role:"Tonic"},{roman:"IV",number:"4",role:"Subdominant"},{roman:"V",number:"5",role:"Dominant"},
 {roman:"ii",number:"2",role:"Supertonic"},{roman:"iii",number:"3",role:"Mediant"},{roman:"vi",number:"6",role:"Relative minor"},
 {roman:"vii°",number:"7°",role:"Leading tone"}
];

const MINOR_DEGREES=[
 {roman:"i",number:"1",role:"Tonic"},{roman:"iv",number:"4",role:"Subdominant"},{roman:"v",number:"5",role:"Dominant"},
 {roman:"ii°",number:"2°",role:"Supertonic"},{roman:"III",number:"3",role:"Relative major"},{roman:"VI",number:"6",role:"Submediant"},
 {roman:"VII",number:"7",role:"Subtonic"}
];

const MODES=[
 {name:"Ionian",degree:"I",quality:"Major",character:"Bright and resolved"},
 {name:"Dorian",degree:"ii",quality:"Minor",character:"Minor with a raised 6th"},
 {name:"Phrygian",degree:"iii",quality:"Minor",character:"Dark with a lowered 2nd"},
 {name:"Lydian",degree:"IV",quality:"Major",character:"Bright with a raised 4th"},
 {name:"Mixolydian",degree:"V",quality:"Major",character:"Major with a lowered 7th"},
 {name:"Aeolian",degree:"vi",quality:"Minor",character:"Natural minor"},
 {name:"Locrian",degree:"vii°",quality:"Diminished",character:"Unstable lowered 2nd and 5th"}
];

const chordDegreeOrder=[0,3,4,1,2,5,6];
const equivalentKey={"C♯":"D♭","D♯":"E♭","F♭":"E","G♯":"A♭","A♯":"B♭","E♯":"F"};
const getChordRoot=chord=>chord.replace(/dim$|m$/u,"");

export default function CircleReferencePage(){
 const notes=FIFTHS;
 const [selectedKey,setSelectedKey]=useState("C");
 const [selectedMode,setSelectedMode]=useState(0);
 const [keyQuality,setKeyQuality]=useState("major");
 const selectedNote=notes.find(note=>note.major===selectedKey)||notes[0];
 const parentScale=KEY_SCALES[selectedNote.major];
 const isMinor=keyQuality==="minor";
 const scale=isMinor?[...parentScale.slice(5),...parentScale.slice(0,5)]:parentScale;
 const minorByDegree=scale.map((note,index)=>note+(index===0||index===3||index===4?"m":index===1?"dim":""));
 const chords=isMinor?chordDegreeOrder.map(index=>minorByDegree[index]):KEY_CHORDS[selectedNote.major];
 const degrees=isMinor?MINOR_DEGREES:MAJOR_DEGREES;
 const activeMode=MODES[selectedMode];
 const modeTonic=isMinor?scale[0]:parentScale[selectedMode];
 const modalScale=isMinor?scale:[...parentScale.slice(selectedMode),...parentScale.slice(0,selectedMode)];
 const selectedTonic=isMinor?getChordRoot(selectedNote.minor):selectedNote.major;
 const relatedTonic=isMinor?selectedNote.major:selectedNote.minor;
 const circleModeKey=equivalentKey[modeTonic]||modeTonic;
 const getTriadNotes=degree=>[scale[degree],scale[(degree+2)%7],scale[(degree+4)%7]];
 const points=useMemo(()=>notes.map((note,index)=>{
  const angle=index*30-90;
  const radians=angle*Math.PI/180;
  return {...note,x:350+250*Math.cos(radians),y:350+250*Math.sin(radians)};
 }),[notes]);
 const chordPoints=degrees.map((degree,index)=>{
  const chord=chords[index];
  const root=getChordRoot(chord);
  const outerKey=equivalentKey[root]||root;
  const matchingPoint=points.find(point=>point.major===outerKey);
  const x=matchingPoint?350+(matchingPoint.x-350)*(158/250):350;
  const y=matchingPoint?350+(matchingPoint.y-350)*(158/250):350;
  return{degree,chord,tones:getTriadNotes(chordDegreeOrder[index]),x,y,index};
 });

 return(
  <section className="circle-reference-page">
   <header className="circle-reference-hero">
    <p>Interactive Music Theory Reference</p>
    <h1>Circle of {isMinor?"Fourths":"Fifths"}</h1>
    <div className="circle-quality-switch" role="group" aria-label="Key quality">
     <button type="button" className={!isMinor?"is-selected":""} onClick={()=>{setKeyQuality("major");setSelectedMode(0);}}>Major</button>
     <button type="button" className={isMinor?"is-selected":""} onClick={()=>{setKeyQuality("minor");setSelectedMode(5);}}>Minor</button>
    </div>
    <span>Select a key on the circle to see its 1–4–5 and 2–3–6–7 chord family.</span>
   </header>

   <div className="circle-reference-layout">
    <div className="circle-reference-wheel-wrap">
     <svg className="circle-reference-svg" viewBox="0 0 700 700" role="img" aria-label={`Interactive Circle of ${isMinor?"Fourths":"Fifths"}`}>
      <circle className="circle-ring circle-ring-outer" cx="350" cy="350" r="315"/>
      <circle className="circle-ring circle-ring-middle" cx="350" cy="350" r="210"/>
      <circle className="circle-ring circle-ring-inner" cx="350" cy="350" r="105"/>
      {points.map((point,index)=>{
       const next=points[(index+1)%points.length];
       return <line className="circle-spoke" key={`spoke-${point.major}`} x1="350" y1="350" x2={(point.x+next.x)/2} y2={(point.y+next.y)/2}/>;
      })}
      <text className="circle-center-title" x="350" y="338">{selectedTonic} {isMinor?"Minor":activeMode.name}</text>
      <text className="circle-center-minor" x="350" y="368">{isMinor?`Relative major: ${selectedNote.major}`:`Relative minor: ${selectedNote.minor}`}</text>
      <text className="circle-center-hint" x="350" y="394">{modalScale.join("  ·  ")}</text>
      {chordPoints.map(item=>(
       <g className={`circle-diatonic-chord chord-degree-${item.index}`} key={`chord-${item.degree.number}`} transform={`translate(${item.x} ${item.y})`}>
        <circle r="38"/>
        <text className="circle-chord-degree" y="-15">{item.degree.number} · {item.degree.roman}</text>
        <text className="circle-chord-name" y="5">{item.chord}</text>
        <text className="circle-chord-tones" y="23">{item.tones.join("·")}</text>
       </g>
      ))}
      {points.map(point=>(
       <g
        className={`circle-key${selectedNote.major===point.major?" is-selected":""}${!isMinor&&selectedMode>0&&circleModeKey===point.major?" is-mode-tonic":""}`}
        key={point.major}
        transform={`translate(${point.x} ${point.y})`}
        role="button"
        tabIndex="0"
        aria-label={`${isMinor?point.minor:point.major} ${isMinor?"minor":"major"}, ${point.key}`}
        onClick={()=>{setSelectedKey(point.major);setSelectedMode(isMinor?5:0);}}
        onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();setSelectedKey(point.major);setSelectedMode(isMinor?5:0);}}}
       >
        <circle r="62"/>
        <text className="circle-key-major" y="-12">{isMinor?point.minor:point.major}</text>
        <text className="circle-key-minor" y="13">{isMinor?point.major:point.minor}</text>
        <text className="circle-key-signature" y="34">{point.key}</text>
       </g>
      ))}
     </svg>
    </div>

    <aside className="circle-reference-guide">
     <div className="circle-selected-heading">
      <p>Selected key</p><h2>{selectedTonic} {isMinor?"Minor":"Major"}</h2><span>{relatedTonic} is the relative {isMinor?"major":"minor"} · {selectedNote.key} signature</span>
     </div>
     <div className="circle-chord-groups">
      <section><h3>Primary chords · 1–4–5</h3><div className="circle-chord-grid circle-chord-grid-primary">{degrees.slice(0,3).map((degree,index)=><article key={degree.roman}><span>{degree.number}</span><strong>{degree.roman}</strong><b>{chords[index]}</b><em>{getTriadNotes(chordDegreeOrder[index]).join(" · ")}</em><small>{degree.role}</small></article>)}</div></section>
      <section><h3>Remaining chords · 2–3–6–7</h3><div className="circle-chord-grid">{degrees.slice(3).map((degree,index)=><article key={degree.roman}><span>{degree.number}</span><strong>{degree.roman}</strong><b>{chords[index+3]}</b><em>{getTriadNotes(chordDegreeOrder[index+3]).join(" · ")}</em><small>{degree.role}</small></article>)}</div></section>
     </div>
     <section className="circle-modes">
      <div className="circle-modes-heading"><p>Modes of {selectedNote.major} major</p><h3>Seven modal starting points</h3></div>
      <div className="circle-mode-grid">
       {MODES.map((mode,index)=><button type="button" className={selectedMode===index?"is-selected":""} onClick={()=>{setSelectedMode(index);setKeyQuality(index===5?"minor":"major");}} key={mode.name}>
        <span>{mode.degree}</span>
        <div><strong>{scale[index]} {mode.name}</strong><small>{mode.quality} · {mode.character}</small></div>
       </button>)}
      </div>
     </section>
    </aside>
   </div>
  </section>
 );
}
