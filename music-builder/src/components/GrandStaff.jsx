import {useState} from "react";

const LETTERS=["C","D","E","F","G","A","B"];
const NATURAL_PITCHES=[0,2,4,5,7,9,11];
const SHARP_SIGNATURE_ORDER=[6,1,8,3,10,5,0];
const FLAT_SIGNATURE_ORDER=[10,3,8,1,6,11,4];
const NOTE_NAMES=["C","C♯","D","D♯","E","F","F♯","G","G♯","A","A♯","B"];
const STRING_INSTRUMENTS={
 guitar:{label:"Guitar",positions:5,strings:[{name:"E",pitch:4},{name:"A",pitch:9},{name:"D",pitch:2},{name:"G",pitch:7},{name:"B",pitch:11},{name:"e",pitch:4}]},
 bass:{label:"Bass guitar",positions:7,strings:[{name:"E",pitch:4},{name:"A",pitch:9},{name:"D",pitch:2},{name:"G",pitch:7}]},
 ukulele:{label:"Ukulele",positions:7,strings:[{name:"G",pitch:7},{name:"C",pitch:0},{name:"E",pitch:4},{name:"A",pitch:9}]},
 mandolin:{label:"Mandolin",positions:7,strings:[{name:"G",pitch:7},{name:"D",pitch:2},{name:"A",pitch:9},{name:"E",pitch:4}]},
 violin:{label:"Violin",positions:7,strings:[{name:"G",pitch:7},{name:"D",pitch:2},{name:"A",pitch:9},{name:"E",pitch:4}]},
 viola:{label:"Viola",positions:7,strings:[{name:"C",pitch:0},{name:"G",pitch:7},{name:"D",pitch:2},{name:"A",pitch:9}]},
 cello:{label:"Cello",positions:7,strings:[{name:"C",pitch:0},{name:"G",pitch:7},{name:"D",pitch:2},{name:"A",pitch:9}]}
};
const FLUTE_FINGERINGS={
 0:["L1","Eb"],1:["Eb"],2:["T","L1","L2","L3","R1","R2","R3"],3:["T","L1","L2","L3","R1","R2","R3","Eb"],
 4:["T","L1","L2","L3","R1","R2","Eb"],5:["T","L1","L2","L3","R1","Eb"],6:["T","L1","L2","L3","R2","Eb"],
 7:["T","L1","L2","L3","Eb"],8:["T","L1","L2","L3","G♯","Eb"],9:["T","L1","L2","Eb"],10:["T","L1","B♭","Eb"],11:["T","L1","Eb"]
};
const TRUMPET_VALVES={0:[],1:[1,2,3],2:[1,3],3:[2,3],4:[1,2],5:[1],6:[2],7:[],8:[2,3],9:[1,2],10:[1],11:[2]};
const MAJOR_SIGNATURES={C:0,G:1,D:2,A:3,E:4,B:5,"F♯":6,"D♭":-5,"A♭":-4,"E♭":-3,"B♭":-2,F:-1};
const MINOR_SIGNATURES={A:0,E:1,B:2,"F♯":3,"C♯":4,"G♯":5,"D♯":6,D:-1,G:-2,C:-3,F:-4,"B♭":-5,"E♭":-6};

const signatureAlterations=count=>{
 const alterations=new Map();
 const order=count>0?SHARP_SIGNATURE_ORDER:FLAT_SIGNATURE_ORDER;
 order.slice(0,Math.abs(count)).forEach(pitch=>{
  const letterIndex=NATURAL_PITCHES.findIndex(natural=>((natural+(count>0?1:-1)+12)%12)===pitch);
  if(letterIndex>=0)alterations.set(letterIndex,count>0?1:-1);
 });
 return alterations;
};
const spellPitch=(pitch,signature)=>{
 const alterations=signatureAlterations(signature);
 for(let letterIndex=0;letterIndex<LETTERS.length;letterIndex+=1){
  const alteration=alterations.get(letterIndex)||0;
  if((NATURAL_PITCHES[letterIndex]+alteration+12)%12===pitch)return{letterIndex,alteration,showAccidental:false};
 }
 const preferFlats=signature<0;
 for(let letterIndex=0;letterIndex<LETTERS.length;letterIndex+=1){
  const alteration=pitch-NATURAL_PITCHES[letterIndex];
  const normalized=((alteration+6)%12)-6;
  if(normalized===(preferFlats?-1:1))return{letterIndex,alteration:normalized,showAccidental:(alterations.get(letterIndex)||0)!==normalized};
 }
 return{letterIndex:0,alteration:0,showAccidental:false};
};
const noteData=(midi,signature)=>{const pitch=((midi%12)+12)%12;const octave=Math.floor(midi/12)-1;const spelling=spellPitch(pitch,signature);return{pitch,octave,diatonic:octave*7+spelling.letterIndex,...spelling};};
const voiceFrom=(pitches,startMidi)=>{let previous=startMidi-1;return pitches.map(pitch=>{let midi=startMidi+pitch;while(midi<=previous)midi+=12;previous=midi;return midi;});};
const ledgerLines=(diatonic,staff)=>{const bounds=staff==="treble"?{bottom:30,top:38,yBottom:112}:{bottom:18,top:26,yBottom:212};const lines=[];if(diatonic<bounds.bottom){for(let value=bounds.bottom-2;value>=diatonic;value-=2)lines.push(bounds.yBottom-(value-bounds.bottom)*6);}if(diatonic>bounds.top){for(let value=bounds.top+2;value<=diatonic;value+=2)lines.push(bounds.yBottom-(value-bounds.bottom)*6);}return lines;};

function StaffNotes({midis,staff,x=390,signature=0}){
 const notes=midis.map(midi=>noteData(midi,signature)).sort((a,b)=>a.diatonic-b.diatonic);
 const stemUp=staff==="treble";
 const positioned=notes.map((note,index)=>{
  const adjacent=index>0&&note.diatonic-notes[index-1].diatonic===1;
  const noteX=x+(adjacent?(stemUp?11:-11):0);
  const y=staff==="treble"?112-(note.diatonic-30)*6:212-(note.diatonic-18)*6;
  return{...note,noteX,y,index};
 });
 const ys=positioned.map(note=>note.y);
 const stemX=x+(stemUp?8:-8);
 const stemStart=stemUp?Math.max(...ys):Math.min(...ys);
 const stemEnd=stemUp?Math.min(...ys)-38:Math.max(...ys)+38;
 return <g className={`grand-staff-chord ${stemUp?"stems-up":"stems-down"}`}>
  {positioned.map(note=>{
   const accidental=note.alteration>0?"♯":note.alteration<0?"♭":"♮";
   return <g className="grand-staff-note" key={`${staff}-${note.pitch}-${note.octave}-${note.index}`}>
   {ledgerLines(note.diatonic,staff).map(lineY=><line className="grand-staff-ledger" key={lineY} x1={x-18} x2={x+29} y1={lineY} y2={lineY}/>)}
   {note.showAccidental&&<text className="grand-staff-accidental" x={x-28} y={note.y+7}>{accidental}</text>}
   <ellipse cx={note.noteX} cy={note.y} rx="9" ry="6.5" transform={`rotate(-18 ${note.noteX} ${note.y})`}/>
  </g>;
  })}
  <line className="grand-staff-stem" x1={stemX} x2={stemX} y1={stemStart} y2={stemEnd}/>
 </g>;
}

function KeySignature({count,staff}){if(!count)return null;const symbol=count>0?"♯":"♭";const amount=Math.abs(count);const sharpTreble=[76,94,70,88,106,82,100];const flatTreble=[100,82,106,88,112,94,118];const treble=staff==="treble";const ys=count>0?sharpTreble:flatTreble;return Array.from({length:amount},(_,index)=><text className="grand-staff-key-signature" x={150+index*12} y={(treble?0:108)+ys[index]} key={`${staff}-${index}`}>{symbol}</text>);}

function findStringVoicing(strings,pitches,maxPosition){
 const lowToHigh=strings.map((string,index)=>({...string,index}));
 const required=new Set(pitches);
 const candidates=[];

 const visit=(stringIndex,shape,started,covered)=>{
  if(stringIndex===lowToHigh.length){
   const sounding=shape.filter(item=>item.fret!==null);
   if(sounding.length<Math.min(3,pitches.length))return;
   if([...required].some(pitch=>!covered.has(pitch)))return;
   const fretted=sounding.filter(item=>item.fret>0).map(item=>item.fret);
   const span=fretted.length?Math.max(...fretted)-Math.min(...fretted):0;
   if(span>4)return;
   const muteCount=shape.length-sounding.length;
   const score=muteCount*12+span*6+fretted.reduce((sum,fret)=>sum+fret,0)-sounding.filter(item=>item.fret===0).length*2;
   candidates.push({shape:[...shape],score});
   return;
  }

  const string=lowToHigh[stringIndex];
  if(!started)visit(stringIndex+1,[...shape,{...string,fret:null,pitch:null}],false,new Set(covered));

  for(let fret=0;fret<=maxPosition;fret+=1){
   const pitch=(string.pitch+fret)%12;
   if(!required.has(pitch))continue;
   if(!started&&pitch!==pitches[0])continue;
   const nextCovered=new Set(covered);
   nextCovered.add(pitch);
   visit(stringIndex+1,[...shape,{...string,fret,pitch}],true,nextCovered);
  }
 };

 visit(0,[],false,new Set());
 candidates.sort((a,b)=>a.score-b.score);
 const best=candidates[0]?.shape||lowToHigh.map(string=>({...string,fret:null,pitch:null}));
 const chosen=Array(strings.length).fill(null);
 let bassStringIndex=-1;
 for(const item of best){
  chosen[item.index]=item.fret;
  if(item.fret!==null&&bassStringIndex===-1)bassStringIndex=item.index;
 }
 return{chosen,bassStringIndex};
}

function StringFingering({strings,pitches,maxPosition}){
 const {chosen,bassStringIndex}=findStringVoicing(strings,pitches,maxPosition);
 const columns=`42px repeat(${strings.length},minmax(28px,1fr))`;
 const frets=[...new Set(chosen.filter(fret=>fret>0))].sort((a,b)=>a-b);
 const fingerForFret=new Map(frets.map((fret,index)=>[fret,Math.min(index+1,4)]));
 return <div className="instrument-string-chart is-vertical"><div className="instrument-string-header" style={{gridTemplateColumns:columns}}><span>Fret</span>{strings.map((string,index)=><strong key={`${string.name}-${index}`}>{string.name}<small>{chosen[index]===null?"×":chosen[index]===0?"○":chosen[index]}</small></strong>)}</div>{Array.from({length:maxPosition+1},(_,fret)=><div className={`instrument-fret-row${fret===0?" is-nut":""}`} style={{gridTemplateColumns:columns}} key={fret}><strong>{fret===0?"Nut":fret}</strong>{strings.map((string,index)=>{const isChosen=chosen[index]===fret;const isOpen=isChosen&&fret===0;const pitch=(string.pitch+fret)%12;const isBass=isChosen&&index===bassStringIndex;return <span className={`${isChosen&&!isOpen?"is-chord-tone":""}${isBass&&!isOpen?" is-bass-tone":""}`.trim()} title={isChosen?`${NOTE_NAMES[pitch]} on ${string.name} string, ${isOpen?"open":`fret ${fret}`}`:""} key={`${string.name}-${index}`}><i>{isChosen&&!isOpen?fingerForFret.get(fret):""}</i></span>;})}</div>)}</div>;
}

function BassFingering({pitches,maxPosition}){
 const strings=STRING_INSTRUMENTS.bass.strings;
 const selected=[];
 let minimumFret=0;
 for(const pitch of pitches){
  const options=[];
  strings.forEach((string,stringIndex)=>{
   for(let fret=minimumFret;fret<=maxPosition;fret+=1){
    if((string.pitch+fret)%12===pitch)options.push({stringIndex,fret,pitch});
   }
  });
  options.sort((a,b)=>a.fret-b.fret||a.stringIndex-b.stringIndex);
  const unused=options.find(option=>!selected.some(item=>item.stringIndex===option.stringIndex));
  const choice=unused||options[0];
  if(choice){selected.push(choice);minimumFret=Math.max(0,choice.fret-1);}
 }
 const columns=`42px repeat(${strings.length},minmax(38px,1fr))`;
 return <div className="instrument-string-chart is-vertical"><div className="instrument-string-header" style={{gridTemplateColumns:columns}}><span>Fret</span>{strings.map(string=><strong key={string.name}>{string.name}</strong>)}</div>{Array.from({length:maxPosition+1},(_,fret)=><div className={`instrument-fret-row${fret===0?" is-nut":""}`} style={{gridTemplateColumns:columns}} key={fret}><strong>{fret}</strong>{strings.map((string,stringIndex)=>{const toneIndex=selected.findIndex(item=>item.stringIndex===stringIndex&&item.fret===fret);const tone=toneIndex>=0?selected[toneIndex]:null;return <span className={tone?`is-chord-tone${toneIndex===0?" is-bass-tone":""}`:""} key={`${string.name}-${fret}`}><i>{tone?`${toneIndex+1} · ${NOTE_NAMES[tone.pitch]}`:""}</i></span>;})}</div>)}</div>;
}

function BowedStringFingering({instrument,strings,pitch}){
 const celloFamily=instrument==="cello";
 const positions=celloFamily?
  [{offset:0,finger:"0",label:"Open"},{offset:1,finger:"X1",label:"Back extension"},{offset:2,finger:"1",label:"First finger"},{offset:3,finger:"2",label:"Second finger"},{offset:4,finger:"3",label:"Third finger"},{offset:5,finger:"4",label:"Fourth finger"}]:
  [{offset:0,finger:"0",label:"Open"},{offset:1,finger:"L1",label:"Low first"},{offset:2,finger:"1",label:"First finger"},{offset:3,finger:"L2",label:"Low second"},{offset:4,finger:"2",label:"Second finger"},{offset:5,finger:"3",label:"Third finger"},{offset:6,finger:"H3",label:"High third"},{offset:7,finger:"4",label:"Fourth finger"}];
 const options=[];
 strings.forEach((string,stringIndex)=>positions.forEach(position=>{if((string.pitch+position.offset)%12===pitch)options.push({...position,stringIndex});}));
 options.sort((a,b)=>a.offset-b.offset||a.stringIndex-b.stringIndex);
 const selected=options[0];
 return <div className="bowed-fingering"><div className="bowed-fingerboard">{strings.map((string,stringIndex)=><div className="bowed-string" key={`${string.name}-${stringIndex}`}><strong>{string.name}</strong><span className="bowed-string-line"/>{selected?.stringIndex===stringIndex&&<i className="bowed-note-marker" style={{top:`${48+selected.offset*34}px`}}><b>{selected.finger}</b><small>{NOTE_NAMES[pitch]}</small></i>}</div>)}</div><p>{selected?`${selected.label} on the ${strings[selected.stringIndex].name} string · first position`:"This pitch is outside the displayed first-position range."}</p></div>;
}

function FlutePad({x,y,pressed,r=17,className=""}){return <circle className={`${pressed?"is-pressed":""} ${className}`.trim()} cx={x} cy={y} r={r}/>;}

function FluteFingering({pitch}){
 const pressed=FLUTE_FINGERINGS[pitch]||[];
 return <svg className="flute-fingering-svg flute-chart-glyph" viewBox="0 0 210 470" role="img" aria-label={`${NOTE_NAMES[pitch]}5 standard Boehm flute fingering diagram`}>
  <text className="flute-diagram-note" x="105" y="28">{NOTE_NAMES[pitch]}5</text>
  <text className="flute-hand-label" x="18" y="135">LEFT</text>
  <path className={pressed.includes("T")?"flute-lever is-pressed":"flute-lever"} d="M61 51c-11 3-15 13-9 22l13 2c8-4 10-14 4-21z"/>
  <path className={pressed.includes("B♭")?"flute-lever is-pressed":"flute-lever"} d="M77 40c9-8 19-4 20 5l-3 12-14-2z"/>
  <FlutePad x={107} y={82} pressed={pressed.includes("L1")}/>
  <FlutePad x={107} y={127} pressed={pressed.includes("L2")}/>
  <FlutePad x={107} y={172} pressed={pressed.includes("L3")}/>
  <FlutePad x={145} y={181} r={9} pressed={pressed.includes("G♯")}/>
  <line className="flute-chart-divider" x1="28" x2="182" y1="210" y2="210"/>
  <text className="flute-hand-label" x="18" y="315">RIGHT</text>
  {[244,289,334].map((y,index)=><g key={y}><FlutePad x={107} y={y} pressed={pressed.includes(`R${index+1}`)}/><rect className="flute-side-key" x="65" y={y-5} width="19" height="10" rx="4"/><line className="flute-side-arm" x1="84" x2="90" y1={y} y2={y}/></g>)}
  <path className={pressed.includes("Eb")?"flute-pinky is-pressed":"flute-pinky"} d="M88 365h38l9 14H79z"/>
  <g className="flute-foot-cluster"><rect className={pressed.includes("Eb")?"is-pressed":""} x="72" y="383" width="20" height="31" rx="8"/><rect className={pressed.includes("C♯")?"is-pressed":""} x="96" y="383" width="20" height="31" rx="8"/><rect className={pressed.includes("C")?"is-pressed":""} x="120" y="383" width="20" height="31" rx="8"/></g>
  <text className="flute-open-key" x="105" y="448">Filled = pressed · Outline = open</text>
 </svg>;
}

function TrumpetFingering({pitch}){const pressed=TRUMPET_VALVES[pitch]||[];return <div className="trumpet-fingering"><p>{NOTE_NAMES[pitch]} · valves {pressed.length?pressed.join("–"):"open"}</p><div>{[1,2,3].map(valve=><span className={pressed.includes(valve)?"is-pressed":""} key={valve}><i>{valve}</i></span>)}</div></div>;}

function InstrumentPanel({pitches,chordName}){const [instrument,setInstrument]=useState("guitar");const [melodyPitch,setMelodyPitch]=useState(pitches[0]??0);const selectedPitch=pitches.includes(melodyPitch)?melodyPitch:(pitches[0]??0);const diagramKey=`${instrument}-${pitches.join("-")}-${selectedPitch}`;const stringInstrument=STRING_INSTRUMENTS[instrument];const instrumentName=instrument==="flute"?"Flute":instrument==="trumpet"?"Trumpet":instrument==="piano"?"Piano":stringInstrument?.label;const melodicStrings=["violin","viola","cello"].includes(instrument);const chordalStrings=["guitar","ukulele","mandolin"].includes(instrument);const lowestLabel=instrument==="bass"?"Root note":melodicStrings||instrument==="flute"||instrument==="trumpet"?"Selected note":"Lowest note";return <section className="instrument-fingering-panel"><header><span>Instrument fingering</span><strong>{instrumentName}</strong></header><div className="instrument-voicing-summary"><strong>{chordName||"Selected chord"}</strong><span>{lowestLabel}: {NOTE_NAMES[melodicStrings||instrument==="flute"||instrument==="trumpet"?selectedPitch:pitches[0]]}</span><small>Chord tones: {pitches.map(pitch=>NOTE_NAMES[pitch]).join(" · ")}</small></div><label className="instrument-selector">Instrument<select value={instrument} onChange={event=>setInstrument(event.target.value)}><optgroup label="Strings">{Object.entries(STRING_INSTRUMENTS).map(([value,item])=><option value={value} key={value}>{item.label}</option>)}</optgroup><optgroup label="Woodwinds"><option value="flute">Flute</option></optgroup><optgroup label="Brass"><option value="trumpet">Trumpet</option></optgroup><optgroup label="Keyboard"><option value="piano">Piano grand staff</option></optgroup></select></label>{chordalStrings&&<><p>One chord voicing is shown. The orange-ringed marker is the lowest note; × means mute.</p><StringFingering key={diagramKey} strings={stringInstrument.strings} pitches={pitches} maxPosition={stringInstrument.positions}/></>}{melodicStrings&&<div className="flute-note-guide"><p>Select one chord tone to see its first-position fingering on the fretless fingerboard.</p><div>{pitches.map(pitch=><button type="button" className={selectedPitch===pitch?"is-active":""} onClick={()=>setMelodyPitch(pitch)} key={pitch}>{NOTE_NAMES[pitch]}</button>)}</div><BowedStringFingering key={diagramKey} instrument={instrument} strings={stringInstrument.strings} pitch={selectedPitch}/><span>0 = open, L = low finger, H = high finger, X1 = cello backward extension.</span></div>}{instrument==="bass"&&<><p>Bass pattern: play the numbered chord tones one at a time, beginning with the root.</p><BassFingering key={diagramKey} pitches={pitches} maxPosition={stringInstrument.positions}/></>}{instrument==="flute"&&<div className="flute-note-guide"><p>Middle register (C5–B5), standard Boehm system. Play one chord tone at a time.</p><div>{pitches.map(pitch=><button type="button" className={selectedPitch===pitch?"is-active":""} onClick={()=>setMelodyPitch(pitch)} key={pitch}>{NOTE_NAMES[pitch]}5</button>)}</div><strong>{NOTE_NAMES[selectedPitch]}5 fingering</strong><FluteFingering key={diagramKey} pitch={selectedPitch}/><span>Filled keys are pressed. Alternate fingerings may be used for intonation, trills, and register changes.</span></div>}{instrument==="trumpet"&&<div className="flute-note-guide"><p>Play the selected chord tones one at a time.</p><div>{pitches.map(pitch=><button type="button" className={selectedPitch===pitch?"is-active":""} onClick={()=>setMelodyPitch(pitch)} key={pitch}>{NOTE_NAMES[pitch]}</button>)}</div><TrumpetFingering key={diagramKey} pitch={selectedPitch}/></div>}{instrument==="piano"&&<p>The complete two-hand piano voicing and key signature are displayed in the grand-staff column.</p>}</section>;}

export default function GrandStaff({pitches=[],chordName="",keyRoot="C",quality="Major",showInstrumentPanel=true}){
 if(!pitches.length)return <div className="grand-staff-empty">Select notes to display the chord on the staff and instrument diagrams.</div>;
 const leftHand=voiceFrom(pitches,36);
 const rightHand=voiceFrom(pitches,60);
 const isMinor=quality.toLowerCase().includes("minor");
 const signature=(isMinor?MINOR_SIGNATURES:MAJOR_SIGNATURES)[keyRoot]??0;
 return(
  <section className={`chord-notation-layout${showInstrumentPanel?"":" is-staff-only"}`}>
   <section className="grand-staff-panel">
    <header><span>Piano · both hands</span><strong>{chordName||"Selected notes"}</strong></header>
    <svg className="grand-staff" viewBox="0 0 760 285" role="img" aria-label={`${chordName||"Selected chord"} for both hands`}>
     {[64,76,88,100,112].map(y=><line key={`t-${y}`} x1="75" x2="725" y1={y} y2={y}/>)}
     {[164,176,188,200,212].map(y=><line key={`b-${y}`} x1="75" x2="725" y1={y} y2={y}/>)}
     <line className="grand-staff-brace" x1="75" x2="75" y1="64" y2="212"/>
     <text className="grand-staff-clef grand-staff-treble" x="90" y="111">𝄞</text>
     <text className="grand-staff-clef grand-staff-bass" x="92" y="208">𝄢</text>
     <KeySignature count={signature} staff="treble"/><KeySignature count={signature} staff="bass"/>
     <StaffNotes midis={rightHand} staff="treble" x={400} signature={signature}/><StaffNotes midis={leftHand} staff="bass" x={400} signature={signature}/>
     <text className="grand-staff-hand-label" x="675" y="52">Right hand</text>
     <text className="grand-staff-hand-label" x="675" y="232">Left hand</text>
     <text className="grand-staff-note-label" x="390" y="264">Key signature: {keyRoot} {isMinor?"minor":"major"} · {signature===0?"no sharps or flats":`${Math.abs(signature)} ${signature>0?"sharp":"flat"}${Math.abs(signature)===1?"":"s"}`}</text>
    </svg>
   </section>
   {showInstrumentPanel?<InstrumentPanel pitches={pitches} chordName={chordName}/>:null}
  </section>
 );
}
