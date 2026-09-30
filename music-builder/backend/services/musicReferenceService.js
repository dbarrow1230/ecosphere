import MusicInstrument from "../models/musicInstrumentModel.js";
import ChordInversion from "../models/chordInversionModel.js";

const instrumentNames=["Piano","Keyboard","Acoustic Guitar","Electric Guitar","Bass Guitar","Ukulele","Violin","Viola","Cello","Double Bass","Trumpet","Trombone","Saxophone","Flute","Clarinet","Drums","Percussion","Voice","Synthesizer"];
const inversionNames=["Root position","First inversion","Second inversion","Third inversion"];

export const seedMusicReferences=async()=>{
 await Promise.all([
  MusicInstrument.bulkWrite(instrumentNames.map(name=>({
   updateOne:{filter:{name},update:{$setOnInsert:{name,isActive:true}},upsert:true}
  }))),
  ChordInversion.bulkWrite(inversionNames.map((name,sortOrder)=>({
   updateOne:{filter:{name},update:{$setOnInsert:{name,sortOrder,isActive:true}},upsert:true}
  })))
 ]);
};
