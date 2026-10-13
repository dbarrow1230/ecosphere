const LETTERS="CDEFGAB";
const NATURALS=[0,2,4,5,7,9,11];

function intervalRole(interval,quality){
 const extended=/9th|11th|13th/.test(quality);
 const roles={0:[1,"Root"],2:[extended?9:2,extended?"Major ninth":"Major second"],3:[3,"Minor third"],4:[3,"Major third"],5:[extended?11:4,extended?"Perfect eleventh":"Perfect fourth"],6:[5,"Diminished fifth"],7:[5,"Perfect fifth"],8:[5,"Augmented fifth"],9:[/13th/.test(quality)?13:6,/13th/.test(quality)?"Major thirteenth":"Major sixth"],10:[7,"Minor seventh"],11:[7,"Major seventh"]};
 if(interval===9&&quality==="Diminished 7th")return [7,"Diminished seventh"];
 return roles[interval];
}

export default function ChordBreakdown({chord}){
 const rootLetter=LETTERS.indexOf(chord.root[0]);
 const tones=chord.intervals.map(interval=>{
  const [degree,role]=intervalRole(interval,chord.quality);
  const letter=(rootLetter+degree-1)%7;
  const pitch=(chord.rootPitch+interval)%12;
  const alteration=((pitch-NATURALS[letter]+18)%12)-6;
  const accidental=alteration>0?"♯".repeat(alteration):"♭".repeat(-alteration);
  const naturalInterval=[0,2,4,5,7,9,11][(degree-1)%7];
  const difference=interval-naturalInterval;
  const formula=`${difference<0?"♭".repeat(-difference):"♯".repeat(difference)}${degree}`;
  return {pitch,note:LETTERS[letter]+accidental,formula,role};
 });
 const bassIndex=tones.findIndex(tone=>tone.pitch===chord.bassPitch);
 const bass=tones[bassIndex];
 const voicedTones=[...tones.slice(bassIndex),...tones.slice(0,bassIndex)];
 const inversion=bassIndex===0?"Root position":`${bassIndex}${bassIndex===1?"st":bassIndex===2?"nd":bassIndex===3?"rd":"th"} inversion`;
 return <section className="chord-builder-breakdown" aria-label="Chord breakdown" aria-live="polite">
  <h3>Chord breakdown <span>{chord.quality}</span></h3>
  <p><strong>{inversion} · {bass?.note||chord.bass} in the bass</strong></p>
  <p className="chord-breakdown-formula">Chord degrees, bass to top: <strong>{voicedTones.map(tone=>tone.formula).join(" · ")}</strong></p>
  <dl>{voicedTones.map((tone,index)=><div key={tone.formula}><dt>{tone.note}{index===0?" · Bass":""}</dt><dd>{tone.formula} · {tone.role}</dd></div>)}</dl>
  <p>Root: <strong>{chord.root}</strong>. {bassIndex===0?"Root position places the root lowest.":`${bass?.role} is lowest; the root and chord quality stay the same.`}</p>
 </section>;
}

