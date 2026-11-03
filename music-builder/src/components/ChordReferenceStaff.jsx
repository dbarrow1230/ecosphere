const LETTERS="CDEFGAB";
const NATURALS={C:0,D:2,E:4,F:5,G:7,A:9,B:11};

// Preserve the displayed enharmonic spelling and ascending compound intervals.
export default function ChordReferenceStaff({notes,intervals,rootPitch=0,name}){
 const positions=notes.reduce((result,note,index)=>{
  const accidental=note.includes("♯")?1:note.includes("♭")?-1:0;
  let pitch=intervals?rootPitch+intervals[index]:NATURALS[note[0]]+accidental;
  const previous=result.at(-1)?.pitch??-1;
  while(pitch<=previous)pitch+=12;
  const octave=Math.floor((pitch-accidental)/12);
  return [...result,{note,pitch,step:octave*7+LETTERS.indexOf(note[0]),accidental}];
 },[]);
 const maxStep=Math.max(...positions.map(note=>note.step));
 const top=Math.max(40,24+(maxStep-10)*5);
 const bassTop=top+100;
 const height=bassTop+80;
 return <figure className="chord-reference-staff">
  <figcaption>Treble & bass clef · same chord, two octaves apart</figcaption>
  <svg viewBox={`0 0 320 ${height}`} role="img" aria-label={`${name}: ${notes.join(", ")} in treble and bass clefs`}>
   {[{top,bottomStep:2,clef:"𝄞",label:"Treble"},{top:bassTop,bottomStep:4,clef:"𝄢",label:"Bass"}].map(staff=>{
    const bottom=staff.top+40;
    const ys=positions.map(note=>bottom-(note.step-staff.bottomStep)*5);
    return <g key={staff.label}>
     <text x="10" y={staff.top-12} className="chord-reference-clef-label">{staff.label}</text>
     {[0,1,2,3,4].map(line=><line key={line} x1="10" x2="310" y1={staff.top+line*10} y2={staff.top+line*10}/>)}
     <text x="18" y={bottom-2} className="chord-reference-clef">{staff.clef}</text>
     {positions.map((note,index)=>{
      const y=ys[index];
      const ledger=[];
      for(let ly=bottom+10;ly<=y;ly+=10)ledger.push(ly);
      for(let ly=staff.top-10;ly>=y;ly-=10)ledger.push(ly);
      const adjacent=index>0&&note.step-positions[index-1].step===1;
      const x=205+(adjacent&&index%2?12:0);
      return <g key={index}>
       {ledger.map(ly=><line key={ly} x1="190" x2="231" y1={ly} y2={ly}/>)}
       {note.accidental!==0&&<text className="chord-reference-accidental" x={180-(index%3)*16} y={y+6}>{note.accidental>0?"♯":"♭"}</text>}
       <ellipse cx={x} cy={y} rx="7" ry="5" transform={`rotate(-18 ${x} ${y})`}/>
      </g>;
     })}
     <line className="chord-reference-stem" x1="212" x2="212" y1={Math.max(...ys)} y2={Math.min(...ys)-28}/>
    </g>;
   })}
  </svg>
 </figure>;
}
