import User from "../models/users/userModel.js";
import ChordIdea from "../models/chordIdeaModel.js";
import ChordProgression from "../models/chordProgressionModel.js";

const chordSeeds=[
 {title:"B Major — Tonic",chord:"B",key:"B Major",voicing:"B–D♯–F♯",tags:["accepted","B major","tonic"]},
 {title:"F♯ Major — Dominant",chord:"F♯",key:"B Major",voicing:"F♯–A♯–C♯",tags:["accepted","B major","dominant"]},
 {title:"E Major — Subdominant",chord:"E",key:"B Major",voicing:"E–G♯–B",tags:["accepted","B major","subdominant"]},
 {title:"Badd9 — Ballad Intro",chord:"Badd9",key:"B Major",voicing:"Right hand: C♯4–D♯4–F♯4–B4",tags:["accepted","ballad intro","add9"]},
 {title:"F♯sus4 — Ballad Intro",chord:"F♯sus4",key:"B Major",voicing:"Right hand: B3–C♯4–F♯4, resolving B to A♯",tags:["accepted","ballad intro","sus4"]}
];

export const seedAcceptedSongMaterial=async(username="dbarrow1230")=>{
 const user=await User.findOne({username});
 if(!user)return{seeded:false,reason:`User ${username} was not found`};

 const chords={};
 for(const seed of chordSeeds){
  const chord=await ChordIdea.findOneAndUpdate(
   {userId:user._id,title:seed.title},
   {$setOnInsert:{...seed,userId:user._id}},
   {upsert:true,returnDocument:"after",setDefaultsOnInsert:true}
  );
  chords[seed.chord]=chord._id;
 }

 const progressionSeeds=[
  {
   title:"B Major I–V–IV Loop",
   key:"B Major",
   mode:"Ionian",
   chords:["B","F♯","E"],
   romanNumerals:["I","V","IV"],
   timeSignature:"4/4",
   tempo:null,
   notes:"Confirmed main harmony: B → F♯ major → E. The E leaves the phrase open so it can cycle back to B.",
   relatedChordIds:[chords.B,chords["F♯"],chords.E],
   tags:["accepted","main loop","B major"]
  },
  {
   title:"B Major Ballad Piano Intro",
   key:"B Major",
   mode:"Ionian",
   chords:["Badd9","F♯sus4 → F♯","E","F♯sus4 → F♯"],
   romanNumerals:["I(add9)","Vsus4 → V","IV","Vsus4 → V"],
   timeSignature:"4/4",
   tempo:null,
   notes:"Four-measure piano intro at 68–76 BPM. Bar 1 Badd9: right hand C♯4–D♯4–F♯4–B4, left hand B1–F♯1. Bar 2 F♯sus4 resolving to F♯: right hand B3–C♯4–F♯4–A♯4, left hand F♯1–C♯2. Bar 3 E: right hand E4–G♯4–B4, left hand E2–B2. Bar 4 F♯sus4 resolving to F♯ returns the harmony toward B.",
   relatedChordIds:[chords.Badd9,chords["F♯sus4"],chords["F♯"]],
   tags:["accepted","four-measure intro","ballad","B major"]
  }
 ];

 for(const seed of progressionSeeds){
  if(seed.title==="B Major Ballad Piano Intro"){
   await ChordProgression.updateOne(
    {userId:user._id,title:seed.title,chords:{$size:2}},
    {$set:{...seed,userId:user._id}}
   );
  }
  await ChordProgression.findOneAndUpdate(
   {userId:user._id,title:seed.title},
   {$setOnInsert:{...seed,userId:user._id}},
   {upsert:true,setDefaultsOnInsert:true}
  );
 }

 return{seeded:true,chords:chordSeeds.length,progressions:progressionSeeds.length};
};
