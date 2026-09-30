import {useState} from "react";
import "../styles/ModesReferencePage.css";

const MODES=[
 {name:"Ionian",degree:"I",family:"Major",formula:"1  2  3  4  5  6  7",steps:"W–W–H–W–W–W–H",notes:"C · D · E · F · G · A · B",characteristic:"Natural major 3rd and major 7th",definition:"The standard major scale. Ionian sounds stable, bright, and fully resolved.",uses:"Pop, classical, folk, hymns, and music with a clear major-key center."},
 {name:"Dorian",degree:"ii",family:"Minor",formula:"1  2  ♭3  4  5  6  ♭7",steps:"W–H–W–W–W–H–W",notes:"D · E · F · G · A · B · C",characteristic:"Raised 6th above a minor tonic",definition:"A minor mode with a natural 6th. Dorian is darker than major but more open and hopeful than natural minor.",uses:"Funk, jazz, soul, rock, Celtic music, and minor-key grooves."},
 {name:"Phrygian",degree:"iii",family:"Minor",formula:"1  ♭2  ♭3  4  5  ♭6  ♭7",steps:"H–W–W–W–H–W–W",notes:"E · F · G · A · B · C · D",characteristic:"Lowered 2nd",definition:"A minor mode distinguished by the half step above its tonic. It has a tense, dark, and strongly exotic sound.",uses:"Flamenco, metal, film scoring, and music requiring tension or menace."},
 {name:"Lydian",degree:"IV",family:"Major",formula:"1  2  3  ♯4  5  6  7",steps:"W–W–W–H–W–W–H",notes:"F · G · A · B · C · D · E",characteristic:"Raised 4th",definition:"A major mode with a raised 4th. Lydian sounds spacious, floating, bright, and slightly unresolved.",uses:"Film scores, progressive music, jazz, and dreamy or expansive passages."},
 {name:"Mixolydian",degree:"V",family:"Major",formula:"1  2  3  4  5  6  ♭7",steps:"W–W–H–W–W–H–W",notes:"G · A · B · C · D · E · F",characteristic:"Lowered 7th",definition:"A major mode with a lowered 7th. Mixolydian keeps a strong major sound while adding bluesy, open-ended movement.",uses:"Blues, rock, country, funk, jam music, and dominant-chord vamps."},
 {name:"Aeolian",degree:"vi",family:"Minor",formula:"1  2  ♭3  4  5  ♭6  ♭7",steps:"W–H–W–W–H–W–W",notes:"A · B · C · D · E · F · G",characteristic:"Lowered 3rd, 6th, and 7th",definition:"The natural minor scale. Aeolian sounds dark, emotional, familiar, and less resolved than harmonic minor.",uses:"Rock, pop, folk, classical music, ballads, and most natural-minor writing."},
 {name:"Locrian",degree:"vii°",family:"Diminished",formula:"1  ♭2  ♭3  4  ♭5  ♭6  ♭7",steps:"H–W–W–H–W–W–W",notes:"B · C · D · E · F · G · A",characteristic:"Lowered 2nd and diminished 5th",definition:"A diminished mode whose tonic chord is unstable. Locrian has the darkest and most unresolved sound of the diatonic modes.",uses:"Experimental music, metal, tension passages, and harmony over half-diminished chords."}
];

export default function ModesReferencePage(){
 const [family,setFamily]=useState("All");
 const visibleModes=family==="All"?MODES:MODES.filter(mode=>mode.family===family);
 return(
  <section className="modes-reference-page">
   <header className="modes-reference-hero"><p>Music Theory Reference</p><h1>The Seven Diatonic Modes</h1><span>Definitions, formulas, characteristic tones, examples, and common uses. Examples use the notes of C major.</span></header>
   <nav className="modes-reference-filters" aria-label="Filter modes by family">{["All","Major","Minor","Diminished"].map(item=><button type="button" className={family===item?"is-active":""} aria-pressed={family===item} onClick={()=>setFamily(item)} key={item}>{item}</button>)}</nav>
   <div className="modes-reference-grid">
    {visibleModes.map(mode=><article className={`mode-reference-card mode-family-${mode.family.toLowerCase()}`} key={mode.name}>
     <header><span>{mode.degree}</span><div><p>Mode {MODES.indexOf(mode)+1}</p><h2>{mode.name}</h2><small>{mode.family} family</small></div></header>
     <p className="mode-definition">{mode.definition}</p>
     <dl>
      <div><dt>Scale formula</dt><dd>{mode.formula}</dd></div>
      <div><dt>Step pattern</dt><dd>{mode.steps}</dd></div>
      <div><dt>White-key example</dt><dd>{mode.notes}</dd></div>
      <div><dt>Characteristic sound</dt><dd>{mode.characteristic}</dd></div>
      <div><dt>Common uses</dt><dd>{mode.uses}</dd></div>
     </dl>
    </article>)}
   </div>
  </section>
 );
}
