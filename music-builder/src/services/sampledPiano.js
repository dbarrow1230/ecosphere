import { Soundfont, SplendidGrandPiano } from "smplr";

let context;
let piano;
const instruments=new Map();
export const INSTRUMENT_AUDIO={
 piano:{label:"Recorded grand piano"},
 guitar:{soundfont:"acoustic_guitar_steel",label:"Sampled acoustic guitar"},
 bass:{soundfont:"electric_bass_finger",label:"Sampled bass guitar",transpose:-24},
 ukulele:{soundfont:"acoustic_guitar_nylon",label:"Ukulele preview · nylon guitar samples"},
 mandolin:{soundfont:"acoustic_guitar_steel",label:"Mandolin preview · steel guitar samples"},
 violin:{soundfont:"violin",label:"Sampled violin"},
 viola:{soundfont:"viola",label:"Sampled viola",transpose:-12},
 cello:{soundfont:"cello",label:"Sampled cello",transpose:-24},
 flute:{soundfont:"flute",label:"Sampled flute",transpose:12},
 trumpet:{soundfont:"trumpet",label:"Sampled trumpet"}
};

function getContext(){
 if(!context){
  const AudioContextClass=window.AudioContext||window.webkitAudioContext;
  context=new AudioContextClass();
 }
 return context;
}

export async function getSampledPiano() {
  getContext();
  if(!piano)piano=SplendidGrandPiano(context);
  await context.resume();
  await piano.ready;
  return { context, piano };
}

export async function playSampledNotes(
  midis,
  { arpeggio = false, sustain = false, instrument: instrumentId="piano" } = {},
) {
  let instrument;
  try {
    if(instrumentId==="piano")instrument = await getSampledPiano();
    else{
     getContext();
     await context.resume();
     const config=INSTRUMENT_AUDIO[instrumentId];
     if(!instruments.has(instrumentId))instruments.set(instrumentId,Soundfont(context,{instrument:config.soundfont}));
     const sampler=instruments.get(instrumentId);
     await sampler.ready;
     instrument={context,piano:sampler};
    }
  } catch {
    instruments.delete(instrumentId);
    if(instrumentId==="piano")piano=undefined;
    window.alert("The selected instrument samples could not be loaded. Please try again.");
    return;
  }
  const start = instrument.context.currentTime + 0.05;
  const duration = sustain ? 3.2 : 1.15;
  midis.forEach((midi, index) =>
    instrument.piano.start({
      note: midi+(INSTRUMENT_AUDIO[instrumentId]?.transpose||0),
      velocity: 88,
      time: start + (arpeggio ? index * 0.22 : 0),
      duration,
    }),
  );
}
