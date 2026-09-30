import {useState} from "react";
import "../styles/ChordTypesReferencePage.css";

const ROOTS=[
 {sharp:"C",flat:"C",pitch:0},{sharp:"C♯",flat:"D♭",pitch:1},{sharp:"D",flat:"D",pitch:2},{sharp:"D♯",flat:"E♭",pitch:3},
 {sharp:"E",flat:"E",pitch:4},{sharp:"F",flat:"F",pitch:5},{sharp:"F♯",flat:"G♭",pitch:6},{sharp:"G",flat:"G",pitch:7},
 {sharp:"G♯",flat:"A♭",pitch:8},{sharp:"A",flat:"A",pitch:9},{sharp:"A♯",flat:"B♭",pitch:10},{sharp:"B",flat:"B",pitch:11}
];

const CHORDS=[
 {group:"Triads",name:"Major",suffix:"",formula:"1 · 3 · 5",intervals:[0,4,7],definition:"Stable major triad."},
 {group:"Triads",name:"Minor",suffix:"m",formula:"1 · ♭3 · 5",intervals:[0,3,7],definition:"Minor triad with a lowered third."},
 {group:"Triads",name:"Diminished",suffix:"dim",formula:"1 · ♭3 · ♭5",intervals:[0,3,6],definition:"Tense triad built from two minor thirds."},
 {group:"Triads",name:"Augmented",suffix:"aug",formula:"1 · 3 · ♯5",intervals:[0,4,8],definition:"Symmetrical triad with a raised fifth."},
 {group:"Suspended",name:"Suspended 2nd",suffix:"sus2",formula:"1 · 2 · 5",intervals:[0,2,7],definition:"Replaces the third with the second."},
 {group:"Suspended",name:"Suspended 4th",suffix:"sus4",formula:"1 · 4 · 5",intervals:[0,5,7],definition:"Replaces the third with the fourth."},
 {group:"Sixth & added",name:"Major 6th",suffix:"6",formula:"1 · 3 · 5 · 6",intervals:[0,4,7,9],definition:"Major triad with an added sixth."},
 {group:"Sixth & added",name:"Minor 6th",suffix:"m6",formula:"1 · ♭3 · 5 · 6",intervals:[0,3,7,9],definition:"Minor triad with a natural sixth."},
 {group:"Sixth & added",name:"Added 9th",suffix:"add9",formula:"1 · 3 · 5 · 9",intervals:[0,4,7,2],definition:"Major triad with an added ninth and no seventh."},
 {group:"Sixth & added",name:"Minor added 9th",suffix:"m(add9)",formula:"1 · ♭3 · 5 · 9",intervals:[0,3,7,2],definition:"Minor triad with an added ninth and no seventh."},
 {group:"Seventh",name:"Major 7th",suffix:"maj7",formula:"1 · 3 · 5 · 7",intervals:[0,4,7,11],definition:"Major triad with a major seventh."},
 {group:"Seventh",name:"Minor 7th",suffix:"m7",formula:"1 · ♭3 · 5 · ♭7",intervals:[0,3,7,10],definition:"Minor triad with a minor seventh."},
 {group:"Seventh",name:"Dominant 7th",suffix:"7",formula:"1 · 3 · 5 · ♭7",intervals:[0,4,7,10],definition:"Major triad with a minor seventh."},
 {group:"Seventh",name:"Minor-major 7th",suffix:"m(maj7)",formula:"1 · ♭3 · 5 · 7",intervals:[0,3,7,11],definition:"Minor triad with a major seventh."},
 {group:"Seventh",name:"Half-diminished 7th",suffix:"m7♭5",formula:"1 · ♭3 · ♭5 · ♭7",intervals:[0,3,6,10],definition:"Diminished triad with a minor seventh."},
 {group:"Seventh",name:"Diminished 7th",suffix:"dim7",formula:"1 · ♭3 · ♭5 · 𝄫7",intervals:[0,3,6,9],definition:"Diminished triad with a diminished seventh."},
 {group:"Seventh",name:"Augmented major 7th",suffix:"aug(maj7)",formula:"1 · 3 · ♯5 · 7",intervals:[0,4,8,11],definition:"Augmented triad with a major seventh."},
 {group:"Seventh",name:"Augmented 7th",suffix:"aug7",formula:"1 · 3 · ♯5 · ♭7",intervals:[0,4,8,10],definition:"Augmented triad with a minor seventh."},
 {group:"Extended",name:"Major 9th",suffix:"maj9",formula:"1 · 3 · 5 · 7 · 9",intervals:[0,4,7,11,2],definition:"Major seventh chord with a ninth."},
 {group:"Extended",name:"Minor 9th",suffix:"m9",formula:"1 · ♭3 · 5 · ♭7 · 9",intervals:[0,3,7,10,2],definition:"Minor seventh chord with a ninth."},
 {group:"Extended",name:"Dominant 9th",suffix:"9",formula:"1 · 3 · 5 · ♭7 · 9",intervals:[0,4,7,10,2],definition:"Dominant seventh chord with a ninth."},
 {group:"Extended",name:"Added 11th",suffix:"add11",formula:"1 · 3 · 5 · 11",intervals:[0,4,7,5],definition:"Major triad with an added eleventh."},
 {group:"Extended",name:"Major 11th",suffix:"maj11",formula:"1 · 3 · 5 · 7 · 9 · 11",intervals:[0,4,7,11,2,5],definition:"Major chord extended through the eleventh."},
 {group:"Extended",name:"Minor 11th",suffix:"m11",formula:"1 · ♭3 · 5 · ♭7 · 9 · 11",intervals:[0,3,7,10,2,5],definition:"Minor chord extended through the eleventh."},
 {group:"Extended",name:"Dominant 11th",suffix:"11",formula:"1 · 3 · 5 · ♭7 · 9 · 11",intervals:[0,4,7,10,2,5],definition:"Dominant chord extended through the eleventh."},
 {group:"Extended",name:"Added 13th",suffix:"add13",formula:"1 · 3 · 5 · 13",intervals:[0,4,7,9],definition:"Major triad with an added thirteenth."},
 {group:"Extended",name:"Major 13th",suffix:"maj13",formula:"1 · 3 · 5 · 7 · 9 · 11 · 13",intervals:[0,4,7,11,2,5,9],definition:"Major chord extended through the thirteenth."},
 {group:"Extended",name:"Minor 13th",suffix:"m13",formula:"1 · ♭3 · 5 · ♭7 · 9 · 11 · 13",intervals:[0,3,7,10,2,5,9],definition:"Minor chord extended through the thirteenth."},
 {group:"Extended",name:"Dominant 13th",suffix:"13",formula:"1 · 3 · 5 · ♭7 · 9 · 11 · 13",intervals:[0,4,7,10,2,5,9],definition:"Dominant chord extended through the thirteenth."},
 {group:"Open voicings",name:"Open C major",symbol:"C",formula:"x · 3 · 2 · 0 · 1 · 0",voicing:"C · E · G · C · E",definition:"Common five-string open C shape."},
 {group:"Open voicings",name:"Open A major",symbol:"A",formula:"x · 0 · 2 · 2 · 2 · 0",voicing:"A · E · A · C♯ · E",definition:"Common five-string open A shape."},
 {group:"Open voicings",name:"Open G major",symbol:"G",formula:"3 · 2 · 0 · 0 · 0 · 3",voicing:"G · B · D · G · B · G",definition:"Full six-string open G shape."},
 {group:"Open voicings",name:"Open E major",symbol:"E",formula:"0 · 2 · 2 · 1 · 0 · 0",voicing:"E · B · E · G♯ · B · E",definition:"Full six-string open E shape."},
 {group:"Open voicings",name:"Open D major",symbol:"D",formula:"x · x · 0 · 2 · 3 · 2",voicing:"D · A · D · F♯",definition:"Four-string open D shape."},
 {group:"Open voicings",name:"Open A minor",symbol:"Am",formula:"x · 0 · 2 · 2 · 1 · 0",voicing:"A · E · A · C · E",definition:"Common five-string open A minor shape."},
 {group:"Open voicings",name:"Open E minor",symbol:"Em",formula:"0 · 2 · 2 · 0 · 0 · 0",voicing:"E · B · E · G · B · E",definition:"Full six-string open E minor shape."},
 {group:"Open voicings",name:"Open D minor",symbol:"Dm",formula:"x · x · 0 · 2 · 3 · 1",voicing:"D · A · D · F",definition:"Four-string open D minor shape."},
 {group:"Open voicings",name:"Open A7",symbol:"A7",formula:"x · 0 · 2 · 0 · 2 · 0",voicing:"A · E · G · C♯ · E",definition:"Open dominant seventh based on A."},
 {group:"Open voicings",name:"Open D7",symbol:"D7",formula:"x · x · 0 · 2 · 1 · 2",voicing:"D · A · C · F♯",definition:"Open dominant seventh based on D."},
 {group:"Open voicings",name:"Open E7",symbol:"E7",formula:"0 · 2 · 0 · 1 · 0 · 0",voicing:"E · B · D · G♯ · B · E",definition:"Open dominant seventh based on E."}
];

export default function ChordTypesReferencePage(){
 const [rootPitch,setRootPitch]=useState(0);
 const [spelling,setSpelling]=useState("sharp");
 const [activeGroup,setActiveGroup]=useState("Triads");
 const root=ROOTS.find(note=>note.pitch===rootPitch);
 const noteName=pitch=>ROOTS.find(note=>note.pitch===(pitch+12)%12)?.[spelling];
 const groups=[...new Set(CHORDS.map(chord=>chord.group))];
 return(
  <section className="chord-types-page">
   <header className="chord-types-hero"><p>Music Theory Reference</p><h1>Chord Types & Formulas</h1><span>Choose a root and accidental spelling to see every chord formula with its notes.</span></header>
   <div className="chord-types-controls">
    <label>Root<select value={rootPitch} onChange={event=>setRootPitch(Number(event.target.value))}>{ROOTS.map(note=><option value={note.pitch} key={note.pitch}>{note.sharp===note.flat?note.sharp:`${note.sharp} / ${note.flat}`}</option>)}</select></label>
    <div><span>Spell accidentals as</span><button type="button" className={spelling==="sharp"?"is-active":""} onClick={()=>setSpelling("sharp")}>Sharps ♯</button><button type="button" className={spelling==="flat"?"is-active":""} onClick={()=>setSpelling("flat")}>Flats ♭</button></div>
   </div>
   <aside className="chord-types-theory-note"><strong>Why there is no separate 12th chord</strong><span>The 12th is a compound perfect fifth—a fifth plus an octave—so it repeats the fifth already in the chord. Standard extensions continue from 11th to 13th.</span></aside>
   <nav className="chord-types-tabs" role="tablist" aria-label="Chord type categories">{groups.map(group=><button type="button" role="tab" aria-selected={activeGroup===group} className={activeGroup===group?"is-active":""} onClick={()=>setActiveGroup(group)} key={group}>{group}</button>)}</nav>
   <section className="chord-types-group" role="tabpanel"><h2>{activeGroup}</h2><div className="chord-types-grid">{CHORDS.filter(chord=>chord.group===activeGroup).map(chord=><article key={chord.name}><header><span>{chord.symbol||`${root[spelling]}${chord.suffix}`}</span><div><h3>{chord.name}</h3><small>{chord.formula}</small></div></header><p className="chord-type-notes">{chord.voicing||chord.intervals.map(interval=>noteName(rootPitch+interval)).join(" · ")}</p><p>{chord.definition}</p></article>)}</div></section>
  </section>
 );
}
